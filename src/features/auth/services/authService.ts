/**
 * Auth Service
 *
 * Firebase Authentication service for magic link login.
 * Handles sending magic links and signing in with email links.
 */

import { logger } from '../../../utils/logger';
import {
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInAnonymously,
  type User as FirebaseUser,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../../config/firebase';
import { USER_COLORS } from '../../../config/theme';
import { useSeasonStore } from '../../../stores/seasonStore';
import { useAuthStore } from '../../../stores/authStore';
import type {
  SendMagicLinkResult,
  SignInResult,
  FirebaseUserData,
} from '../types';

// Storage key for email (needed to complete sign-in)
const EMAIL_STORAGE_KEY = '@ahoy/auth_email';

/**
 * Action code settings for magic link.
 * The URL must be whitelisted in Firebase Console.
 */
const getActionCodeSettings = () => ({
  // URL to redirect to after clicking the link
  url: 'https://ahoyapp-24b36.firebaseapp.com/auth/callback',
  handleCodeInApp: true,
  iOS: {
    bundleId: 'com.ahoyapp.crew',
  },
  android: {
    packageName: 'com.ahoyapp.crew',
    installApp: true,
    minimumVersion: '12',
  },
  // Use dynamic link for better mobile experience
  dynamicLinkDomain: undefined, // Will use default if configured
});

// Dev bypass emails (only work in development)
// These use .test TLD which doesn't exist in production
const DEV_BYPASS_EMAILS = [
  'dev1@ahoy.test',
  'dev2@ahoy.test',
  'dev3@ahoy.test',
];

// Dev season ID - must match seed script
const DEV_SEASON_ID = 'dev-season-2026';

/**
 * Auto-join dev season for dev users.
 * Creates crew membership if not exists.
 * DEV ONLY - never runs in production.
 */
async function autoJoinDevSeason(userId: string, email: string): Promise<void> {
  // Triple safety check
  if (process.env.NODE_ENV === 'production') return;
  if (!email.endsWith('@ahoy.test')) return;

  try {
    // Check if user already in season
    const userRef = doc(db, 'seasons', DEV_SEASON_ID, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      logger.log('[DEV] User already in dev season');
      return;
    }

    // Check if season exists
    const seasonRef = doc(db, 'seasons', DEV_SEASON_ID);
    const seasonSnap = await getDoc(seasonRef);

    if (!seasonSnap.exists()) {
      logger.log('[DEV] Dev season not found - run npm run seed:dev first');
      return;
    }

    // Add user to season as crew (roles assigned later in app)
    const colorIndex = Math.floor(Math.random() * USER_COLORS.length);
    await setDoc(userRef, {
      name: email.split('@')[0], // dev1, dev2, dev3
      email: email,
      roles: ['crew'],
      color: USER_COLORS[colorIndex],
      joinedAt: serverTimestamp(),
    });

    logger.log('[DEV] Auto-joined user to dev season:', userId);
  } catch (error) {
    logger.error('[DEV] Auto-join failed:', error);
    // Don't throw - auto-join is best-effort
  }
}

/**
 * Send magic link to email address.
 *
 * @param email - User's email address
 * @returns Result with success status
 */
export async function sendMagicLink(email: string): Promise<SendMagicLinkResult> {
  try {
    const normalizedEmail = email.toLowerCase().trim();

    // Validate email format
    if (!isValidEmail(normalizedEmail)) {
      return { success: false, error: 'Invalid email address' };
    }

    // Dev bypass: auto sign-in for test emails in development
    if (process.env.NODE_ENV !== 'production' && DEV_BYPASS_EMAILS.includes(normalizedEmail)) {
      // FIRST: Check if user already has an active session
      const existingUser = auth.currentUser;
      if (existingUser) {
        logger.log('[DEV] Reusing existing session:', existingUser.uid);
        // Ensure user is in dev season
        await autoJoinDevSeason(existingUser.uid, normalizedEmail);
        // FIX: Set season ID AND auth status to override race condition
        useSeasonStore.getState().setCurrentSeasonId(DEV_SEASON_ID);
        useAuthStore.getState().setStatus('authenticated');
        logger.log('[DEV] Set currentSeasonId to:', DEV_SEASON_ID, '+ authenticated');
        return { success: true, devBypassed: true };
      }

      // ONLY create new anonymous user if no existing session
      logger.log('[DEV] No existing session, creating anonymous user');
      const result = await signInAnonymously(auth);
      if (result.user) {
        logger.log('[DEV] Created new anonymous user:', result.user.uid);
        // Auto-join new user to dev season
        await autoJoinDevSeason(result.user.uid, normalizedEmail);
        // FIX: Set season ID AND auth status to override race condition
        useSeasonStore.getState().setCurrentSeasonId(DEV_SEASON_ID);
        useAuthStore.getState().setStatus('authenticated');
        logger.log('[DEV] Set currentSeasonId to:', DEV_SEASON_ID, '+ authenticated');
        return { success: true, devBypassed: true };
      }
      return { success: false, error: 'Dev sign-in failed' };
    }

    // Send the magic link
    await sendSignInLinkToEmail(auth, normalizedEmail, getActionCodeSettings());

    // Store email for completing sign-in later
    await AsyncStorage.setItem(EMAIL_STORAGE_KEY, normalizedEmail);

    return { success: true };
  } catch (error) {
    logger.error('Error sending magic link:', error);
    return {
      success: false,
      error: getAuthErrorMessage(error),
    };
  }
}

/**
 * Complete sign-in with magic link.
 *
 * @param url - The deep link URL containing the sign-in code
 * @returns Result with success status and whether user is new
 */
export async function signInWithMagicLink(url: string): Promise<SignInResult> {
  try {
    // Check if this is a valid sign-in link
    if (!isSignInWithEmailLink(auth, url)) {
      return { success: false, isNewUser: false, error: 'Invalid sign-in link' };
    }

    // Get the stored email
    const email = await AsyncStorage.getItem(EMAIL_STORAGE_KEY);
    if (!email) {
      return {
        success: false,
        isNewUser: false,
        error: 'Email not found. Please try signing in again.',
      };
    }

    // Complete sign-in
    const result = await signInWithEmailLink(auth, email, url);

    // Clear stored email
    await AsyncStorage.removeItem(EMAIL_STORAGE_KEY);

    // Check if this is a new user (no previous sign-in)
    const isNewUser = result.user.metadata.creationTime === result.user.metadata.lastSignInTime;

    return { success: true, isNewUser };
  } catch (error) {
    logger.error('Error signing in with magic link:', error);
    return {
      success: false,
      isNewUser: false,
      error: getAuthErrorMessage(error),
    };
  }
}

/**
 * Sign out the current user.
 */
export async function signOut(): Promise<void> {
  try {
    await firebaseSignOut(auth);
    await AsyncStorage.removeItem(EMAIL_STORAGE_KEY);
  } catch (error) {
    logger.error('Error signing out:', error);
    throw error;
  }
}

/**
 * Get the stored email (for showing in UI while waiting for link click).
 */
export async function getStoredEmail(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(EMAIL_STORAGE_KEY);
  } catch (error) {
    logger.error('[Auth] getStoredEmail error:', error);
    return null;
  }
}

/**
 * Clear the stored email.
 */
export async function clearStoredEmail(): Promise<void> {
  try {
    await AsyncStorage.removeItem(EMAIL_STORAGE_KEY);
  } catch (error) {
    logger.error('[Auth] clearStoredEmail error:', error);
    // Don't throw - clearing email is best-effort
  }
}

/**
 * Subscribe to auth state changes.
 *
 * @param callback - Function to call when auth state changes
 * @returns Unsubscribe function
 */
export function subscribeToAuthChanges(
  callback: (user: FirebaseUserData | null) => void
): () => void {
  return onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
    if (firebaseUser) {
      callback({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        emailVerified: firebaseUser.emailVerified,
        isAnonymous: firebaseUser.isAnonymous,
      });
    } else {
      callback(null);
    }
  });
}

/**
 * Get current Firebase user.
 */
export function getCurrentUser(): FirebaseUserData | null {
  const user = auth.currentUser;
  if (!user) return null;

  return {
    uid: user.uid,
    email: user.email,
    emailVerified: user.emailVerified,
    isAnonymous: user.isAnonymous,
  };
}

/**
 * Check if a URL is a magic link sign-in URL.
 */
export function isMagicLink(url: string): boolean {
  return isSignInWithEmailLink(auth, url);
}

// ============ Helpers ============

/**
 * Validate email format.
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Get user-friendly error message from Firebase error.
 */
function getAuthErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as { code: string }).code;

    switch (code) {
      case 'auth/invalid-email':
        return 'Invalid email address.';
      case 'auth/user-disabled':
        return 'This account has been disabled.';
      case 'auth/user-not-found':
        return 'No account found with this email.';
      case 'auth/expired-action-code':
        return 'This link has expired. Please request a new one.';
      case 'auth/invalid-action-code':
        return 'This link is invalid. Please request a new one.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please try again later.';
      default:
        return 'An error occurred. Please try again.';
    }
  }

  return 'An unexpected error occurred.';
}

// ============ Dev Mode ============

/**
 * Development-only sign in using anonymous auth.
 * Only use for testing - bypasses email verification.
 */
export async function devSignIn(): Promise<SignInResult> {
  if (process.env.NODE_ENV === 'production') {
    return { success: false, isNewUser: false, error: 'Dev sign-in not available in production' };
  }

  try {
    const result = await signInAnonymously(auth);
    const isNewUser = result.user.metadata.creationTime === result.user.metadata.lastSignInTime;
    return { success: true, isNewUser };
  } catch (error) {
    logger.error('Dev sign-in error:', error);
    return { success: false, isNewUser: false, error: getAuthErrorMessage(error) };
  }
}
