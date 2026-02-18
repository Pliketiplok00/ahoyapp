/**
 * Auth Store
 *
 * Zustand store for authentication state.
 * Persists auth status across app restarts.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  AuthState,
  AuthStatus,
  FirebaseUserData,
} from '../features/auth/types';
import type { User } from '../types/models';

/**
 * Initial auth state
 */
const initialState: AuthState = {
  status: 'idle',
  user: null,
  firebaseUser: null,
  isLoading: true,
  error: null,
};

/**
 * Auth store interface
 */
interface AuthStore extends AuthState {
  // Actions
  setStatus: (status: AuthStatus) => void;
  setUser: (user: User | null) => void;
  setFirebaseUser: (user: FirebaseUserData | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;

  // Computed helpers
  isAuthenticated: () => boolean;
  needsOnboarding: () => boolean;
}

/**
 * Auth store with persistence
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Actions
      setStatus: (status) => set({ status }),

      setUser: (user) => set({ user }),

      setFirebaseUser: (firebaseUser) => {
        set({ firebaseUser });
        // Update status based on Firebase user
        if (!firebaseUser) {
          set({ status: 'unauthenticated', user: null });
        }
      },

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      reset: () => set(initialState),

      // Computed helpers
      isAuthenticated: () => {
        const state = get();
        return state.status === 'authenticated' && state.firebaseUser !== null;
      },

      needsOnboarding: () => {
        const state = get();
        return state.status === 'needs_onboarding';
      },
    }),
    {
      name: 'ahoy-auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist certain fields
      partialize: (state) => ({
        status: state.status,
        firebaseUser: state.firebaseUser,
        // Don't persist: user (fetch fresh), isLoading, error
      }),
    }
  )
);

/**
 * Selector hooks for specific state slices
 */
export const useAuthStatus = () => useAuthStore((state) => state.status);
export const useAuthUser = () => useAuthStore((state) => state.user);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthError = () => useAuthStore((state) => state.error);
