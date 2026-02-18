/**
 * Entry Redirect
 *
 * Initial entry point that redirects based on auth state.
 * AuthGuard in _layout.tsx handles the actual routing logic.
 */

import { Redirect } from 'expo-router';
import { useAuth } from '../src/features/auth/hooks/useAuth';

export default function Index() {
  const { status, isAuthenticated, needsOnboarding } = useAuth();

  // Redirect based on auth state
  // AuthGuard will handle further redirects if needed
  if (needsOnboarding) {
    return <Redirect href="/(auth)/onboarding" />;
  }

  if (isAuthenticated) {
    return <Redirect href="/(main)/(tabs)" />;
  }

  return <Redirect href="/(auth)/login" />;
}
