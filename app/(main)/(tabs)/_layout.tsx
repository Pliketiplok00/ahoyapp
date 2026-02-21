/**
 * Tabs Layout
 *
 * Bottom tab navigation for main app screens.
 * Uses custom brutalist TabBar component.
 *
 * @see src/components/layout/TabBar.tsx
 * @see docs/Ahoy_DESIGN_RULES.md Section 7 - Tab Bar
 */

import { Tabs } from 'expo-router';
import { TabBar } from '@/components/layout';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: 'Bookings',
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Stats',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
        }}
      />
    </Tabs>
  );
}
