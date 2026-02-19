/**
 * TabBar Component
 *
 * Custom bottom tab bar with styled icons and labels.
 * Used by the main tab navigation.
 */

import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { COLORS, SPACING, FONT_SIZES } from '../../config/theme';

/**
 * Tab icon configuration
 */
const TAB_ICONS: Record<string, { icon: string; label: string }> = {
  index: { icon: '⛵', label: 'Home' },
  bookings: { icon: '📋', label: 'Bookings' },
  stats: { icon: '📊', label: 'Stats' },
  settings: { icon: '⚙️', label: 'Settings' },
};

/**
 * Custom TabBar component for bottom navigation
 */
export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View style={styles.container}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const tabConfig = TAB_ICONS[route.name] || { icon: '📱', label: route.name };

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tab}
          >
            <View style={[styles.iconContainer, isFocused && styles.iconContainerFocused]}>
              <Text style={[styles.icon, isFocused && styles.iconFocused]}>
                {tabConfig.icon}
              </Text>
            </View>
            <Text style={[styles.label, isFocused && styles.labelFocused]}>
              {tabConfig.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/**
 * Individual tab icon component (for use in Tabs.Screen)
 */
interface TabIconProps {
  name: string;
  focused: boolean;
}

export function TabIcon({ name, focused }: TabIconProps) {
  const config = TAB_ICONS[name] || { icon: '📱', label: name };

  return (
    <View style={styles.standaloneIconContainer}>
      <Text style={[styles.standaloneIcon, focused && styles.standaloneIconFocused]}>
        {config.icon}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingBottom: 20, // Safe area for home indicator
    paddingTop: SPACING.sm,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  iconContainer: {
    width: 48,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    marginBottom: 2,
  },
  iconContainerFocused: {
    backgroundColor: `${COLORS.coral}15`,
  },
  icon: {
    fontSize: 22,
    opacity: 0.6,
  },
  iconFocused: {
    opacity: 1,
  },
  label: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  labelFocused: {
    color: COLORS.coral,
    fontWeight: '600',
  },
  // Standalone icon styles (for Tabs.Screen tabBarIcon)
  standaloneIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  standaloneIcon: {
    fontSize: 24,
    opacity: 0.5,
  },
  standaloneIconFocused: {
    opacity: 1,
  },
});
