/**
 * Firebase Configuration
 *
 * Firebase app initialization and configuration.
 * Uses environment variables for sensitive data.
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getAuth, Auth, Persistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { getReactNativePersistence } = require('firebase/auth');

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

/**
 * Initialize Firebase app (singleton pattern)
 */
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

/**
 * Get or initialize Firebase Auth with React Native persistence.
 * Handles hot reload scenarios where auth may already be initialized.
 */
function getAuthInstance(): Auth {
  try {
    // Try to initialize auth with persistence
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage) as Persistence,
    });
  } catch (error) {
    // Auth already initialized - get the existing instance
    if ((error as { code?: string }).code === 'auth/already-initialized') {
      return getAuth(app);
    }
    throw error;
  }
}

export const auth = getAuthInstance();

/**
 * Firestore database instance
 */
export const db = getFirestore(app);

/**
 * Firebase Storage instance
 */
export const storage = getStorage(app);

export default app;
