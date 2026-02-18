/**
 * useAuth Hook
 *
 * Main authentication hook that combines auth store and service.
 * Provides login, logout, and auth state management.
 */

import { useEffect, useCallback } from 'react';
import { useAuthStore } from '../../../stores/authStore';
import { useSeasonStore } from '../../../stores/seasonStore';
import * as authService from '../services/authService';
import { seasonService } from '../../season/services/seasonService';
import type { SendMagicLinkResult, SignInResult } from '../types';

/**
 * Hook for authentication operations and state.
 */
export function useAuth() {
  const {
    status,
    user,
    firebaseUser,
    isLoading,
    error,
    setStatus,
    setUser,
    setFirebaseUser,
    setLoading,
    setError,
    reset,
  } = useAuthStore();

  const { setCurrentSeasonId, currentSeasonId } = useSeasonStore();

  /**
   * Initialize auth state on mount.
   * Subscribes to Firebase auth changes.
   */
  useEffect(() => {
    setLoading(true);

    const unsubscribe = authService.subscribeToAuthChanges(async (fbUser) => {
      setFirebaseUser(fbUser);

      if (fbUser) {
        // User is signed in - check if they belong to any season
        try {
          const seasons = await seasonService.getUserSeasons();

          if (seasons.length > 0) {
            // User has seasons - set first one as current and mark as authenticated
            if (!currentSeasonId) {
              setCurrentSeasonId(seasons[0].id);
            }
            setStatus('authenticated');
          } else {
            // No seasons - needs onboarding
            setStatus('needs_onboarding');
          }
        } catch (err) {
          console.error('Error checking user seasons:', err);
          // Assume needs onboarding on error
          setStatus('needs_onboarding');
        }
      } else {
        // User is signed out
        setStatus('unauthenticated');
        setUser(null);
        setCurrentSeasonId(null);
      }

      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [setFirebaseUser, setLoading, setStatus, setUser, setCurrentSeasonId, currentSeasonId]);

  /**
   * Send magic link to email.
   */
  const sendMagicLink = useCallback(
    async (email: string): Promise<SendMagicLinkResult> => {
      setLoading(true);
      setError(null);

      const result = await authService.sendMagicLink(email);

      if (!result.success && result.error) {
        setError(result.error);
      }

      setLoading(false);
      return result;
    },
    [setError, setLoading]
  );

  /**
   * Complete sign-in with magic link URL.
   */
  const signInWithMagicLink = useCallback(
    async (url: string): Promise<SignInResult> => {
      setLoading(true);
      setError(null);

      const result = await authService.signInWithMagicLink(url);

      if (!result.success && result.error) {
        setError(result.error);
      }

      setLoading(false);
      return result;
    },
    [setError, setLoading]
  );

  /**
   * Sign out the current user.
   */
  const signOut = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      await authService.signOut();
      reset();
    } catch (err) {
      setError('Failed to sign out. Please try again.');
    }

    setLoading(false);
  }, [reset, setError, setLoading]);

  /**
   * Check if a URL is a magic link.
   */
  const isMagicLink = useCallback((url: string): boolean => {
    return authService.isMagicLink(url);
  }, []);

  /**
   * Get the stored email (for UI display).
   */
  const getStoredEmail = useCallback(async (): Promise<string | null> => {
    return authService.getStoredEmail();
  }, []);

  /**
   * Clear any stored email.
   */
  const clearStoredEmail = useCallback(async (): Promise<void> => {
    return authService.clearStoredEmail();
  }, []);

  return {
    // State
    status,
    user,
    firebaseUser,
    isLoading,
    error,
    isAuthenticated: status === 'authenticated' || status === 'needs_onboarding',
    needsOnboarding: status === 'needs_onboarding',

    // Actions
    sendMagicLink,
    signInWithMagicLink,
    signOut,
    isMagicLink,
    getStoredEmail,
    clearStoredEmail,
  };
}
