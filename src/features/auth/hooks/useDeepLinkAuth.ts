/**
 * useDeepLinkAuth Hook
 *
 * Handles magic link deep links for authentication.
 * Listens for incoming URLs and completes sign-in when a magic link is detected.
 */

import { useEffect, useCallback, useState } from 'react';
import * as Linking from 'expo-linking';
import { useAuth } from './useAuth';

interface DeepLinkAuthState {
  isProcessing: boolean;
  error: string | null;
}

/**
 * Hook for handling magic link deep links.
 * Should be used at the app root level.
 */
export function useDeepLinkAuth() {
  const { signInWithMagicLink, isMagicLink } = useAuth();
  const [state, setState] = useState<DeepLinkAuthState>({
    isProcessing: false,
    error: null,
  });

  /**
   * Process a URL to check if it's a magic link and sign in.
   */
  const processUrl = useCallback(
    async (url: string | null) => {
      if (!url) return;

      // Check if this is a magic link
      if (!isMagicLink(url)) {
        return;
      }

      setState({ isProcessing: true, error: null });

      try {
        const result = await signInWithMagicLink(url);

        if (!result.success) {
          setState({
            isProcessing: false,
            error: result.error || 'Failed to sign in',
          });
        } else {
          setState({ isProcessing: false, error: null });
          // Navigation will be handled by auth state change
        }
      } catch (err) {
        setState({
          isProcessing: false,
          error: 'An unexpected error occurred',
        });
      }
    },
    [isMagicLink, signInWithMagicLink]
  );

  /**
   * Check for initial URL on app launch.
   */
  useEffect(() => {
    const checkInitialUrl = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        await processUrl(initialUrl);
      }
    };

    checkInitialUrl();
  }, [processUrl]);

  /**
   * Listen for URL events while app is running.
   */
  useEffect(() => {
    const subscription = Linking.addEventListener('url', (event) => {
      processUrl(event.url);
    });

    return () => {
      subscription.remove();
    };
  }, [processUrl]);

  return {
    isProcessing: state.isProcessing,
    error: state.error,
    clearError: () => setState((prev) => ({ ...prev, error: null })),
  };
}
