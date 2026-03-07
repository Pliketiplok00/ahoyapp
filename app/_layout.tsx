/**
 * Root Layout
 *
 * Main entry point for the app's navigation structure.
 * Handles auth state and routing between auth and main flows.
 * Loads custom fonts before rendering.
 */

import { useEffect, useState, useCallback } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import * as Sentry from '@sentry/react-native';
import { useAuth } from '../src/features/auth/hooks/useAuth';
import { useDeepLinkAuth } from '../src/features/auth/hooks/useDeepLinkAuth';
import { useBrutFonts } from '../src/hooks/useBrutFonts';
import { COLORS } from '../src/config/theme';
import { ErrorBoundary } from '../src/components/common/ErrorBoundary';

// Initialize Sentry for crash reporting
// DSN should be set via EAS secrets: eas secret:create --scope project --name SENTRY_DSN --value "YOUR_DSN"
Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN || '',
  debug: __DEV__,
  // Disable in development unless DSN is set
  enabled: !__DEV__ || !!process.env.EXPO_PUBLIC_SENTRY_DSN,
  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring
  tracesSampleRate: __DEV__ ? 0 : 0.2,
});

// Keep splash screen visible while loading fonts
SplashScreen.preventAutoHideAsync();

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
      // Don't redirect away from invite-crew (part of onboarding flow)
      const onInviteCrewScreen = secondSegment === 'invite-crew';
      if ((inAuthGroup && !onInviteCrewScreen) || onIndexScreen) {
        router.replace('/(main)/(tabs)');
      }
    }
  }, [status, isLoading, isProcessingDeepLink, isAuthenticated, needsOnboarding, segments, router, navigationReady, hasMounted]);
}

export default function RootLayout() {
  // Load custom fonts
  const { fontsLoaded, fontError } = useBrutFonts();

  // Handle auth navigation
  useAuthNavigation();

  // Hide splash screen when fonts are loaded
  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Show loading state while fonts are loading
  if (!fontsLoaded && !fontError) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <SafeAreaProvider onLayout={onLayoutRootView}>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(main)" />
        </Stack>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
});
