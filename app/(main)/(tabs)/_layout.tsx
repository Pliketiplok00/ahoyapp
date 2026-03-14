/**
 * Tabs Layout
 *
 * Bottom tab navigation for main app screens.
 * Uses custom brutalist TabBar component.
 *
 * 5 tabs: Popis (Bookings), Pantry, Statistika (Stats), Zapisnici (Logs), Postavke (Settings)
 * Home screen is accessible via header, not in bottom nav.
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
      {/* Home screen - accessible via header navigation, not in tab bar */}
      <Tabs.Screen
        name="index"
        options={{
          href: null, // Exclude from tab bar but keep as valid route
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: 'Bookings',
        }}
      />
      <Tabs.Screen
        name="pantry"
        options={{
          title: 'Pantry',
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Stats',
        }}
      />
      <Tabs.Screen
        name="logs"
        options={{
          title: 'Logs',
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
