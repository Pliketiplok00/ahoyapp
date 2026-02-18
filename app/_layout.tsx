/**
 * Root Layout
 *
 * Main entry point for the app's navigation structure.
 * Handles auth state and routing between auth and main flows.
 */

import { useEffect } from 'react';
import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../src/features/auth/hooks/useAuth';
import { useDeepLinkAuth } from '../src/features/auth/hooks/useDeepLinkAuth';
import { COLORS } from '../src/config/theme';

/**
 * Auth guard component that handles routing based on auth state.
 */
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { status, isLoading, isAuthenticated, needsOnboarding } = useAuth();
  const { isProcessing: isProcessingDeepLink } = useDeepLinkAuth();
  const segments = useSegments();
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();

  // Check if navigation is ready
  const navigationReady = rootNavigationState?.key != null;

  useEffect(() => {
    // Don't redirect until navigation is ready
    if (!navigationReady) {
      return;
    }

    // Don't redirect while loading or processing deep link
    if (isLoading || isProcessingDeepLink) {
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';
    const onIndexScreen = segments.length === 0 || segments[0] === 'index';
    const onLoginScreen = segments[1] === 'login';

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
  }, [status, isLoading, isProcessingDeepLink, isAuthenticated, needsOnboarding, segments, router, navigationReady]);

  // Show loading spinner while checking auth or waiting for navigation
  if (isLoading || isProcessingDeepLink || !navigationReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.coral} />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <AuthGuard>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(main)" />
        </Stack>
      </AuthGuard>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
