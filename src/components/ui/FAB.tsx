/**
 * FAB (Floating Action Button) Component
 *
 * Neo-brutalist floating action button.
 * Used for primary actions like adding bookings.
 *
 * @example
 * <FAB onPress={handleAdd} />
 * <FAB onPress={handleAdd} size="sm" color={COLORS.primary} />
 */

import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle } from 'react-native';
import {
  COLORS,
  SHADOWS,
  BORDERS,
  SPACING,
  TYPOGRAPHY,
  FONTS,
  BORDER_RADIUS,
  ANIMATION,
} from '../../config/theme';

export type FABSize = 'sm' | 'md';

export interface FABProps {
  /** Press handler */
  onPress: () => void;
  /** Button icon/label */
  icon?: string;
  /** Size variant */
  size?: FABSize;
  /** Background color */
  color?: string;
  /** Position absolutely (for floating) */
  floating?: boolean;
  /** Custom container style */
  style?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
}

/**
 * Get size styles for FAB.
 */
export function getFABSizeStyles(size: FABSize) {
  switch (size) {
    case 'sm':
      return {
        container: {
          width: 40,
          height: 40,
        },
        text: {
          fontSize: TYPOGRAPHY.sizes.cardTitle,
        },
        shadow: SHADOWS.brutSm,
      };
    case 'md':
    default:
      return {
        container: {
          width: 56,
          height: 56,
        },
        text: {
          fontSize: TYPOGRAPHY.sizes.sectionTitle,
        },
        shadow: SHADOWS.brut,
      };
  }
}

/**
 * Brutalist floating action button.
 * Sharp corners, offset shadow, press animation.
 */
export function FAB({
  onPress,
  icon = '+',
  size = 'md',
  color = COLORS.accent,
  floating = false,
  style,
  testID,
}: FABProps) {
  const sizeStyles = getFABSizeStyles(size);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.fab,
        sizeStyles.container,
        sizeStyles.shadow,
        { backgroundColor: color },
        floating && styles.floating,
        pressed && styles.pressed,
        style,
      ]}
      onPress={onPress}
      testID={testID}
    >
      <Text style={[styles.icon, sizeStyles.text]}>{icon}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floating: {
    position: 'absolute',
    bottom: SPACING.xxl + SPACING.lg, // Above tab bar
    right: SPACING.md,
  },
  icon: {
    fontFamily: FONTS.display,
    color: COLORS.foreground,
  },
  pressed: {
    transform: ANIMATION.pressedTransform,
  },
});
