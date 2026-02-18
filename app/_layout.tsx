/**
 * Root Layout
 *
 * Main entry point for the app's navigation structure.
 * Handles auth state and routing between auth and main flows.
 */

import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
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
  const { status, isLoading, isAuthenticated } = useAuth();
  const { isProcessing: isProcessingDeepLink } = useDeepLinkAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Don't redirect while loading or processing deep link
    if (isLoading || isProcessingDeepLink || status === 'idle') {
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';
    const inMainGroup = segments[0] === '(main)';

    if (isAuthenticated && inAuthGroup) {
      // User is signed in but on auth screen, redirect to main
      router.replace('/(main)/(tabs)');
    } else if (!isAuthenticated && inMainGroup) {
      // User is not signed in but on main screen, redirect to login
      router.replace('/(auth)/login');
    }
  }, [status, isLoading, isProcessingDeepLink, isAuthenticated, segments, router]);

  // Show loading spinner while checking auth
  if (isLoading || isProcessingDeepLink || status === 'idle') {
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
