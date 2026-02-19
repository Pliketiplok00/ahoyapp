/**
 * Root Layout
 *
 * Main entry point for the app's navigation structure.
 * Handles auth state and routing between auth and main flows.
 */

import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuth } from '../src/features/auth/hooks/useAuth';
import { useDeepLinkAuth } from '../src/features/auth/hooks/useDeepLinkAuth';

// Note: index.tsx shows a loading spinner while auth navigation happens

/**
 * Hook that handles auth-based navigation.
 * Only navigates after the navigator is mounted.
 */
function useAuthNavigation() {
  const { status, isLoading, isAuthenticated, needsOnboarding } = useAuth();
  const { isProcessing: isProcessingDeepLink } = useDeepLinkAuth();
  const segments = useSegments();
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();
  const [hasMounted, setHasMounted] = useState(false);

  // Track when component has mounted
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Check if navigation is ready
  const navigationReady = rootNavigationState?.key != null;

  useEffect(() => {
    // Wait for mount and navigation to be ready
    if (!hasMounted || !navigationReady) {
      return;
    }

    // Don't redirect while loading or processing deep link
    if (isLoading || isProcessingDeepLink) {
      return;
    }

    const firstSegment = segments[0] as string | undefined;
    const secondSegment = segments[1] as string | undefined;
    const inAuthGroup = firstSegment === '(auth)';
    const onIndexScreen = (segments.length as number) === 0 || firstSegment === 'index';
    const onLoginScreen = secondSegment === 'login';

    if (status === 'unauthenticated') {
      // Not signed in - redirect to login
      if (!inAuthGroup || !onLoginScreen) {
        router.replace('/(auth)/login');
      }
    } else if (needsOnboarding) {
      // Signed in but needs onboarding
      if (!inAuthGroup || onLoginScreen) {
        router.replace('/(auth)/onboarding');
      }
    } else if (isAuthenticated) {
      // Fully authenticated with a season
      if (inAuthGroup || onIndexScreen) {
        router.replace('/(main)/(tabs)');
      }
    }
  }, [status, isLoading, isProcessingDeepLink, isAuthenticated, needsOnboarding, segments, router, navigationReady, hasMounted]);
}

export default function RootLayout() {
  // Handle auth navigation
  useAuthNavigation();

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(main)" />
      </Stack>
    </SafeAreaProvider>
  );
}
