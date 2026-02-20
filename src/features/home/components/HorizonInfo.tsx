/**
 * HorizonInfo Component
 *
 * Displays horizon information: days off after current booking,
 * back-to-back indicator, and season progress.
 */

import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../../config/theme';
import type { Booking } from '../../../types/models';

interface HorizonInfoProps {
  activeBooking: Booking | null;
  nextBooking: Booking | null;
  seasonProgress: number; // 0-100
  bookingsRemaining: number;
  testID?: string;
}

/**
 * Calculate days between two dates
 */
export function calculateDaysBetween(date1: Date, date2: Date): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);

  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);

  const diffTime = d2.getTime() - d1.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Get horizon status based on gap between bookings
 */
export function getHorizonStatus(
  activeBooking: Booking | null,
  nextBooking: Booking | null
): {
  type: 'days-off' | 'back-to-back' | 'no-upcoming' | 'season-start';
  daysOff: number;
} {
  if (!activeBooking && !nextBooking) {
    return { type: 'season-start', daysOff: 0 };
  }

  if (!activeBooking && nextBooking) {
    return { type: 'season-start', daysOff: 0 };
  }

  if (activeBooking && !nextBooking) {
    return { type: 'no-upcoming', daysOff: 0 };
  }

  // Both active and next booking exist
  const activeEnd = activeBooking!.departureDate.toDate();
  const nextStart = nextBooking!.arrivalDate.toDate();

  const gap = calculateDaysBetween(activeEnd, nextStart);

  if (gap <= 1) {
    return { type: 'back-to-back', daysOff: 0 };
  }

  return { type: 'days-off', daysOff: gap - 1 };
}

/**
 * Get horizon message based on status
 */
export function getHorizonMessage(
  status: ReturnType<typeof getHorizonStatus>,
  useCroatian = true
): string {
  switch (status.type) {
    case 'days-off':
      if (useCroatian) {
        return status.daysOff === 1
          ? '1 dan pauze nakon ovog bookinga'
          : `${status.daysOff} dana pauze nakon ovog bookinga`;
      }
      return status.daysOff === 1
        ? '1 day off after this booking'
        : `${status.daysOff} days off after this booking`;

    case 'back-to-back':
      return useCroatian ? 'Back-to-back bookings!' : 'Back-to-back bookings!';

    case 'no-upcoming':
      return useCroatian
        ? 'Nema nadolazećih bookinga'
        : 'No upcoming bookings';

    case 'season-start':
      return useCroatian ? 'Sezona spremna za početak' : 'Season ready to start';
  }
}

/**
 * Get horizon icon based on status
 */
export function getHorizonIcon(status: ReturnType<typeof getHorizonStatus>): string {
  switch (status.type) {
    case 'days-off':
      return '\u{1F7E2}'; // Green circle
    case 'back-to-back':
      return '\u{1F534}'; // Red circle
    case 'no-upcoming':
      return '\u{1F4CA}'; // Chart
    case 'season-start':
      return '\u{1F4CA}'; // Chart
  }
}

export function HorizonInfo({
  activeBooking,
  nextBooking,
  seasonProgress,
  bookingsRemaining,
  testID,
}: HorizonInfoProps) {
  const status = getHorizonStatus(activeBooking, nextBooking);
  const message = getHorizonMessage(status, true);
  const icon = getHorizonIcon(status);

  const getBackgroundColor = () => {
    switch (status.type) {
      case 'days-off':
        return `${COLORS.success}15`;
      case 'back-to-back':
        return `${COLORS.warning}15`;
      default:
        return `${COLORS.info}15`;
    }
  };

  return (
    <View
      style={[styles.container, { backgroundColor: getBackgroundColor() }]}
      testID={testID}
    >
      <View style={styles.row}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.message}>{message}</Text>
      </View>

      {seasonProgress > 0 && (
        <View style={styles.seasonRow}>
          <Text style={styles.seasonIcon}>{'\u{1F4CA}'}</Text>
          <Text style={styles.seasonText}>
            Season {seasonProgress.toFixed(0)}%
            {bookingsRemaining > 0 && ` · ${bookingsRemaining} bookings left`}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    gap: SPACING.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: FONT_SIZES.md,
    marginRight: SPACING.xs,
  },
  message: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    flex: 1,
  },
  seasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seasonIcon: {
    fontSize: FONT_SIZES.md,
    marginRight: SPACING.xs,
  },
  seasonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
});
