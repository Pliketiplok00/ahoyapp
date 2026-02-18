/**
 * Auth Types
 *
 * Types specific to authentication flow.
 */

import type { User } from '../../types/models';

/**
 * Authentication state
 */
export type AuthStatus =
  | 'idle' // Initial state, checking auth
  | 'unauthenticated' // No user logged in
  | 'authenticated' // User logged in
  | 'needs_onboarding'; // User logged in but no season/boat

/**
 * Auth state for the store
 */
export interface AuthState {
  status: AuthStatus;
  user: User | null;
  firebaseUser: FirebaseUserData | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Minimal Firebase user data we need to store
 */
export interface FirebaseUserData {
  uid: string;
  email: string | null;
  emailVerified: boolean;
}

/**
 * Magic link send result
 */
export interface SendMagicLinkResult {
  success: boolean;
  error?: string;
  devBypassed?: boolean; // True if dev bypass was used (auto sign-in)
}

/**
 * Sign in with magic link result
 */
export interface SignInResult {
  success: boolean;
  isNewUser: boolean;
  error?: string;
}

/**
 * Auth actions for the store
 */
export interface AuthActions {
  setStatus: (status: AuthStatus) => void;
  setUser: (user: User | null) => void;
  setFirebaseUser: (user: FirebaseUserData | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}
