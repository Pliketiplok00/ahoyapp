/**
 * Pantry Layout
 *
 * Stack navigation for pantry-related screens.
 * Crew inventory management - wine, spirits, beer, etc.
 */

import { Stack } from 'expo-router';

export default function PantryLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="add" />
      <Stack.Screen name="[id]" />
    </Stack>
  );
}
