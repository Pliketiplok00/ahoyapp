/**
 * Auth Layout
 *
 * Layout for authentication screens (login, onboarding).
 */

import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="create-boat" />
      <Stack.Screen name="join-boat" />
      <Stack.Screen name="invite-crew" />
    </Stack>
  );
}
