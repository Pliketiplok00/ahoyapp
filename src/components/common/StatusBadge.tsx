/**
 * StatusBadge Component
 *
 * Displays booking status with color coding.
 */

import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../config/theme';
import {
  BOOKING_STATUS,
  BOOKING_STATUS_CONFIG,
  type BookingStatus,
} from '../../constants/bookingStatus';

export type BadgeSize = 'sm' | 'md' | 'lg';

interface StatusBadgeProps {
  status: BookingStatus;
  /** Optional days until booking (for upcoming) */
  daysUntil?: number;
  size?: BadgeSize;
  /** Use Croatian labels */
  useCroatian?: boolean;
  style?: ViewStyle;
  testID?: string;
}

/**
 * Status color mapping - type-safe access to status colors
 */
const STATUS_COLOR_MAP: Record<BookingStatus, string> = {
  upcoming: COLORS.statusUpcoming,
  active: COLORS.statusActive,
  completed: COLORS.statusCompleted,
  archived: COLORS.statusCompleted,
  cancelled: COLORS.statusCancelled,
};

/**
 * Get badge background color based on status
 */
export function getStatusBadgeColor(status: BookingStatus): string {
  return STATUS_COLOR_MAP[status] || COLORS.textMuted;
}

/**
 * Get badge label based on status
 */
export function getStatusLabel(
  status: BookingStatus,
  useCroatian: boolean,
  daysUntil?: number
): string {
  const config = BOOKING_STATUS_CONFIG[status];

  if (status === BOOKING_STATUS.UPCOMING && daysUntil !== undefined) {
    if (useCroatian) {
      return `za ${daysUntil} d.`;
    }
    return `in ${daysUntil}d`;
  }

  return useCroatian ? config.labelHR : config.label;
}

/**
 * Get badge size styles
 */
export function getBadgeSizeStyles(size: BadgeSize): { container: ViewStyle; text: TextStyle } {
  switch (size) {
    case 'sm':
      return {
        container: {
          paddingHorizontal: SPACING.xs,
          paddingVertical: 2,
          borderRadius: BORDER_RADIUS.sm,
        },
        text: {
          fontSize: FONT_SIZES.xs,
        },
      };
    case 'md':
      return {
        container: {
          paddingHorizontal: SPACING.sm,
          paddingVertical: SPACING.xs,
          borderRadius: BORDER_RADIUS.md,
        },
        text: {
          fontSize: FONT_SIZES.sm,
        },
      };
    case 'lg':
      return {
        container: {
          paddingHorizontal: SPACING.md,
          paddingVertical: SPACING.sm,
          borderRadius: BORDER_RADIUS.md,
        },
        text: {
          fontSize: FONT_SIZES.md,
        },
      };
    default:
      return {
        container: {},
        text: {},
      };
  }
}

export function StatusBadge({
  status,
  daysUntil,
  size = 'md',
  useCroatian = true,
  style,
  testID,
}: StatusBadgeProps) {
  const backgroundColor = getStatusBadgeColor(status);
  const label = getStatusLabel(status, useCroatian, daysUntil);
  const sizeStyles = getBadgeSizeStyles(size);

  return (
    <View
      style={[
        styles.container,
        sizeStyles.container,
        { backgroundColor },
        style,
      ]}
      testID={testID}
    >
      <Text style={[styles.text, sizeStyles.text]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
  },
  text: {
    color: COLORS.white,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});
