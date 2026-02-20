/**
 * StatusBadge Component (Brutalist)
 *
 * Neo-brutalist inline status badge.
 * Used for status indicators like "LIVE NOW", "IN 7 DAYS", etc.
 *
 * @example
 * <StatusBadge label="LIVE NOW" variant="accent" />
 * <StatusBadge label="IN 7 DAYS" variant="pink" />
 * <StatusBadge label="COMPLETED" variant="muted" />
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  COLORS,
  SHADOWS,
  BORDERS,
  SPACING,
  TYPOGRAPHY,
  FONTS,
  BORDER_RADIUS,
} from '../../config/theme';

export type StatusBadgeVariant = 'accent' | 'pink' | 'primary' | 'muted';

export interface StatusBadgeProps {
  /** Badge label text */
  label: string;
  /** Color variant */
  variant?: StatusBadgeVariant;
  /** Test ID for testing */
  testID?: string;
}

/**
 * Get background color for status variant.
 */
export function getStatusColor(variant: StatusBadgeVariant): string {
  switch (variant) {
    case 'accent':
      return COLORS.accent;
    case 'pink':
      return COLORS.pink;
    case 'primary':
      return COLORS.primary;
    case 'muted':
      return COLORS.muted;
    default:
      return COLORS.accent;
  }
}

/**
 * Brutalist inline status badge.
 * Sharp corners, offset shadow, bold text.
 */
export function StatusBadge({
  label,
  variant = 'accent',
  testID,
}: StatusBadgeProps) {
  const bgColor = getStatusColor(variant);

  return (
    <View
      style={[styles.badge, { backgroundColor: bgColor }]}
      testID={testID}
    >
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    ...SHADOWS.brutSm,
  },
  text: {
    fontFamily: FONTS.monoBold,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.foreground,
    textTransform: 'uppercase',
    letterSpacing: TYPOGRAPHY.letterSpacing.wide,
  },
});
