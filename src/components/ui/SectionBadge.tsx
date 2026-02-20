/**
 * SectionBadge Component
 *
 * Neo-brutalist section label badge.
 * Used for section headers like "ACTIVE CHARTER", "UP NEXT".
 *
 * @example
 * <SectionBadge label="ACTIVE CHARTER" variant="accent" />
 * <SectionBadge label="UP NEXT" variant="pink" />
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

export type SectionBadgeVariant = 'accent' | 'pink';

export interface SectionBadgeProps {
  /** Badge label text */
  label: string;
  /** Color variant - 'accent' (lime) or 'pink' */
  variant?: SectionBadgeVariant;
  /** Test ID for testing */
  testID?: string;
}

/**
 * Get background color for badge variant.
 */
export function getBadgeColor(variant: SectionBadgeVariant): string {
  return variant === 'pink' ? COLORS.pink : COLORS.accent;
}

/**
 * Section badge for labeling content sections.
 * Uses brutalist styling with offset shadow.
 */
export function SectionBadge({
  label,
  variant = 'accent',
  testID,
}: SectionBadgeProps) {
  const bgColor = getBadgeColor(variant);

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
    borderWidth: BORDERS.normal,
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
