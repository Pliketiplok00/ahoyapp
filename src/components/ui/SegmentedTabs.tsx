/**
 * SegmentedTabs Component
 *
 * Neo-brutalist segmented tab bar for switching between views.
 * Equal-width segments with active state highlighting.
 *
 * @example
 * <SegmentedTabs
 *   tabs={[
 *     { key: 'active', label: t('tabs.active') },
 *     { key: 'archived', label: t('tabs.archived') },
 *   ]}
 *   activeTab="active"
 *   onTabChange={(key) => setActiveTab(key)}
 * />
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle } from 'react-native';
import {
  COLORS,
  SPACING,
  FONTS,
  TYPOGRAPHY,
  BORDERS,
  BORDER_RADIUS,
  ANIMATION,
} from '../../config/theme';

export interface Tab {
  /** Unique identifier for the tab */
  key: string;
  /** Display label for the tab */
  label: string;
}

export interface SegmentedTabsProps {
  /** Array of tab definitions */
  tabs: Tab[];
  /** Currently active tab key */
  activeTab: string;
  /** Callback when tab changes */
  onTabChange: (key: string) => void;
  /** Active tab background color */
  activeColor?: string;
  /** Inactive tab background color */
  inactiveColor?: string;
  /** Custom container style */
  style?: ViewStyle;
  /** Test ID prefix for testing */
  testID?: string;
}

/**
 * Segmented tab bar component.
 * Equal-width segments with brutalist styling.
 */
export function SegmentedTabs({
  tabs,
  activeTab,
  onTabChange,
  activeColor = COLORS.primary,
  inactiveColor = COLORS.card,
  style,
  testID,
}: SegmentedTabsProps) {
  return (
    <View style={[styles.container, style]} testID={testID}>
      {tabs.map((tab, index) => {
        const isActive = tab.key === activeTab;
        const isLast = index === tabs.length - 1;

        return (
          <Pressable
            key={tab.key}
            style={({ pressed }) => [
              styles.tab,
              { backgroundColor: isActive ? activeColor : inactiveColor },
              !isLast && styles.tabBorderRight,
              pressed && styles.pressed,
            ]}
            onPress={() => onTabChange(tab.key)}
            testID={testID ? `${testID}-${tab.key}` : undefined}
          >
            <Text
              style={[
                styles.tabText,
                isActive && styles.tabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderBottomWidth: BORDERS.normal,
    borderBottomColor: COLORS.foreground,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBorderRight: {
    borderRightWidth: BORDERS.thin,
    borderRightColor: COLORS.foreground,
  },
  tabText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: TYPOGRAPHY.letterSpacing.wide,
  },
  tabTextActive: {
    color: COLORS.foreground,
  },
  pressed: {
    transform: ANIMATION.pressedTransform,
  },
});
