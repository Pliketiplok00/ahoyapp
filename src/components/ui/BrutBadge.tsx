/**
 * BrutBadge Component
 *
 * Neo-brutalist badge/pill with thin border, small shadow, and uppercase text.
 * Used for status indicators, tags, and labels.
 *
 * @see docs/Ahoy_DESIGN_RULES.md Section 6 - Component Patterns
 */

import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import {
  COLORS,
  SHADOWS,
  BORDERS,
  BORDER_RADIUS,
  SPACING,
  TYPOGRAPHY,
  FONTS,
} from '../../config/theme';

export type BrutBadgeVariant =
  | 'default'      // White background, dark text
  | 'primary'      // Sky blue background
  | 'accent'       // Lime green background
  | 'pink'         // Hot pink background
  | 'amber'        // Amber background
  | 'muted'        // Muted background for subtle badges
  | 'active'       // Blue for active status
  | 'upcoming'     // Lime for upcoming status
  | 'completed'    // Grey for completed status
  | 'error';       // Red for errors/cancelled

export type BrutBadgeSize =
  | 'sm'           // Extra small
  | 'md';          // Normal

interface BrutBadgeProps {
  /** Badge text */
  children: React.ReactNode;
  /** Visual variant */
  variant?: BrutBadgeVariant;
  /** Badge size */
  size?: BrutBadgeSize;
  /** Additional container styles */
  style?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
}

/**
 * Get badge colors for variant
 */
export function getVariantStyles(variant: BrutBadgeVariant): {
  bg: string;
  text: string;
} {
  switch (variant) {
    case 'primary':
      return { bg: COLORS.primary, text: COLORS.foreground };
    case 'accent':
      return { bg: COLORS.accent, text: COLORS.foreground };
    case 'pink':
      return { bg: COLORS.pink, text: COLORS.foreground };
    case 'amber':
      return { bg: COLORS.heroAmber, text: COLORS.foreground };
    case 'muted':
      return { bg: COLORS.muted, text: COLORS.foreground };
    case 'active':
      return { bg: COLORS.status.activeBg, text: COLORS.status.active };
    case 'upcoming':
      return { bg: COLORS.status.upcomingBg, text: COLORS.foreground };
    case 'completed':
      return { bg: COLORS.status.completedBg, text: COLORS.status.completed };
    case 'error':
      return { bg: COLORS.status.cancelledBg, text: COLORS.destructive };
    case 'default':
    default:
      return { bg: COLORS.card, text: COLORS.foreground };
  }
}

/**
 * Get size styles for badge
 */
export function getSizeStyles(size: BrutBadgeSize): {
  container: ViewStyle;
  text: TextStyle;
} {
  switch (size) {
    case 'sm':
      return {
        container: {
          paddingHorizontal: SPACING.xs,
          paddingVertical: SPACING.xxs,
        },
        text: {
          fontSize: TYPOGRAPHY.sizes.meta,
        },
      };
    case 'md':
    default:
      return {
        container: {
          paddingHorizontal: SPACING.sm,
          paddingVertical: SPACING.xs,
        },
        text: {
          fontSize: TYPOGRAPHY.sizes.label,
        },
      };
  }
}

/**
 * Base badge styles (exported for testing)
 */
export const BASE_STYLES = {
  borderWidth: BORDERS.thin,
  borderColor: COLORS.foreground,
  borderRadius: BORDER_RADIUS.none,
} as const;

/**
 * BrutBadge - Neo-brutalist badge/pill component
 *
 * @example
 * // Default badge
 * <BrutBadge>Default</BrutBadge>
 *
 * @example
 * // Status badge
 * <BrutBadge variant="active">Active</BrutBadge>
 *
 * @example
 * // Small badge
 * <BrutBadge variant="accent" size="sm">New</BrutBadge>
 */
export function BrutBadge({
  children,
  variant = 'default',
  size = 'md',
  style,
  testID,
}: BrutBadgeProps) {
  const variantStyles = getVariantStyles(variant);
  const sizeStyles = getSizeStyles(size);

  return (
    <View
      style={[
        styles.base,
        SHADOWS.brutSm,
        sizeStyles.container,
        { backgroundColor: variantStyles.bg },
        style,
      ]}
      testID={testID}
    >
      <Text
        style={[
          styles.text,
          sizeStyles.text,
          { color: variantStyles.text },
        ]}
      >
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    ...BASE_STYLES,
    alignSelf: 'flex-start',
  },
  text: {
    fontFamily: FONTS.mono,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: TYPOGRAPHY.letterSpacing.wide,
  },
});
