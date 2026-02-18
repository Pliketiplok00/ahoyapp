/**
 * Booking Layout
 *
 * Stack navigation for booking-related screens.
 */

import { Stack } from 'expo-router';

export default function BookingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="[id]" />
      <Stack.Screen name="new" />
      <Stack.Screen name="expenses" />
    </Stack>
  );
}
