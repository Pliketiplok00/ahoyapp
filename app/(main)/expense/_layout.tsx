/**
 * Expense Layout
 *
 * Stack navigation for expense capture screens.
 */

import { Stack } from 'expo-router';

export default function ExpenseLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="capture" />
      <Stack.Screen name="manual" />
    </Stack>
  );
}
