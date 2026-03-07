/**
 * Income Layout
 *
 * Stack navigation for income-related screens.
 * PRIVATE: Only shows current user's income data.
 */

import { Stack } from 'expo-router';

export default function IncomeLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="add-day" />
    </Stack>
  );
}
