/**
 * Main Layout
 *
 * Layout for authenticated screens.
 * Contains stack navigation for main app flow.
 */

import { Stack } from 'expo-router';

export default function MainLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="booking" />
      <Stack.Screen name="expense" />
      <Stack.Screen name="insights" />
    </Stack>
  );
}
