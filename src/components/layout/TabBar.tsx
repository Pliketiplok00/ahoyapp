/**
 * TabBar Component
 *
 * Neo-brutalist bottom tab bar with hard edges and no border radius.
 * Uses lucide-react-native icons per design spec.
 *
 * @see docs/Ahoy_DESIGN_RULES.md Section 7 - Tab Bar
 * @see docs/Ahoy_UI_ELEMENTS.md - Global Shell → Tab Bar
 */

import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Anchor, Calendar, BarChart2, User } from 'lucide-react-native';
import {
  COLORS,
  BORDERS,
  SPACING,
  TYPOGRAPHY,
  FONTS,
  LAYOUT,
  BORDER_RADIUS,
} from '../../config/theme';

/**
 * Tab configuration with lucide icons
 */
interface TabConfig {
  icon: typeof Anchor;
  label: string;
}

const TAB_CONFIG: Record<string, TabConfig> = {
  index: { icon: Anchor, label: 'HOME' },
  bookings: { icon: Calendar, label: 'LIST' },
  stats: { icon: BarChart2, label: 'DATA' },
  settings: { icon: User, label: 'USER' },
};

/**
 * Get tab icon color based on focus state
 */
export function getTabColor(isFocused: boolean): string {
  return isFocused ? COLORS.primary : COLORS.mutedForeground;
}

/**
 * TabBar - Neo-brutalist bottom navigation
 *
 * @example
 * <Tabs tabBar={(props) => <TabBar {...props} />}>
 *   ...
 * </Tabs>
 */
export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View style={styles.container} testID="tab-bar">
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const tabConfig = TAB_CONFIG[route.name];

        if (!tabConfig) {
          return null;
        }

        const IconComponent = tabConfig.icon;
        const color = getTabColor(isFocused);

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
            testID={`tab-${route.name}`}
          >
            <IconComponent
              size={24}
              color={color}
              strokeWidth={2}
            />
            <Text style={[styles.label, { color }]}>
              {tabConfig.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/**
 * Base styles (exported for testing)
 */
export const TAB_BAR_STYLES = {
  height: LAYOUT.tabBarHeight,
  backgroundColor: COLORS.card,
  borderTopWidth: BORDERS.heavy,
  borderTopColor: COLORS.foreground,
  borderRadius: BORDER_RADIUS.none,
} as const;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: TAB_BAR_STYLES.height,
    backgroundColor: TAB_BAR_STYLES.backgroundColor,
    borderTopWidth: TAB_BAR_STYLES.borderTopWidth,
    borderTopColor: TAB_BAR_STYLES.borderTopColor,
    borderRadius: TAB_BAR_STYLES.borderRadius,
    paddingBottom: SPACING.md, // Safe area for home indicator
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  label: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.meta,
    textTransform: 'uppercase',
    letterSpacing: TYPOGRAPHY.letterSpacing.wide,
  },
});
