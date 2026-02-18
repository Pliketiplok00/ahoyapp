/**
 * Expenses Layout
 *
 * Stack navigation for expense-related screens.
 */

import { Stack } from 'expo-router';

export default function ExpensesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="[bookingId]" />
    </Stack>
  );
}
