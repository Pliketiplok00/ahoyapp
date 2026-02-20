/**
 * NextBookingCard Component
 *
 * Compact card for upcoming bookings in the "Next Up" section.
 */

import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../../config/theme';
import { formatDate } from '../../../utils/formatting';
import { getMarinaBadge } from '../../../config/marinas';
import type { Booking } from '../../../types/models';

interface NextBookingCardProps {
  booking: Booking;
  testID?: string;
}

/**
 * Calculate days until booking starts
 */
export function calculateDaysUntil(arrivalDate: Date): number {
  const now = new Date();
  const arrival = new Date(arrivalDate);

  // Reset times to compare dates only
  now.setHours(0, 0, 0, 0);
  arrival.setHours(0, 0, 0, 0);

  const diffTime = arrival.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return Math.max(0, diffDays);
}

/**
 * Format days until text (Croatian)
 */
export function formatDaysUntilHR(days: number): string {
  if (days === 0) return 'danas';
  if (days === 1) return 'sutra';
  return `za ${days} d.`;
}

/**
 * Format days until text (English)
 */
export function formatDaysUntilEN(days: number): string {
  if (days === 0) return 'today';
  if (days === 1) return 'tomorrow';
  return `in ${days}d`;
}

export function NextBookingCard({ booking, testID }: NextBookingCardProps) {
  const router = useRouter();
  const arrivalDate = booking.arrivalDate.toDate();
  const departureDate = booking.departureDate.toDate();

  const daysUntil = calculateDaysUntil(arrivalDate);
  const daysUntilText = formatDaysUntilHR(daysUntil);

  const marinaBadge = getMarinaBadge(
    booking.departureMarina,
    booking.arrivalMarina
  );

  const handlePress = () => {
    router.push(`/booking/${booking.id}`);
  };

  return (
    <Pressable style={styles.container} onPress={handlePress} testID={testID}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{daysUntilText}</Text>
        </View>
        <Text style={styles.guestCount}>{booking.guestCount} guests</Text>
        {marinaBadge && (
          <View style={styles.marinaBadge}>
            <Text style={styles.marinaBadgeText}>{marinaBadge}</Text>
          </View>
        )}
        {booking.preferenceFileUrl && <Text style={styles.prefIcon}>📎</Text>}
        {!booking.preferenceFileUrl && <Text style={styles.prefIconMissing}>⚠️</Text>}
      </View>

      {/* Dates */}
      <Text style={styles.dates}>
        {formatDate(arrivalDate)} → {formatDate(departureDate)}
      </Text>

      {/* Notes Preview */}
      {booking.notes && (
        <Text style={styles.notes} numberOfLines={1}>
          {booking.notes}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  statusBadge: {
    backgroundColor: COLORS.statusUpcoming,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  statusText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.white,
  },
  guestCount: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  marinaBadge: {
    backgroundColor: COLORS.steelBlue,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  marinaBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.white,
  },
  prefIcon: {
    fontSize: FONT_SIZES.md,
  },
  prefIconMissing: {
    fontSize: FONT_SIZES.md,
  },
  dates: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  notes: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
});
