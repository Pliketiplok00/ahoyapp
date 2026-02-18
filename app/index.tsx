/**
 * Entry Redirect
 *
 * Redirects to the appropriate screen based on auth state.
 * For now, redirects to auth flow. Will be updated when auth is implemented.
 */

import { Redirect } from 'expo-router';

export default function Index() {
  // TODO: Check auth state and redirect accordingly
  // For now, redirect to main tabs (will change to auth when implemented)
  return <Redirect href="/(main)/(tabs)" />;
}
