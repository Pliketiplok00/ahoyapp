/**
 * ActiveBookingCard Component
 *
 * Expanded card for the currently active booking.
 * Shows dates, guests, APA progress, and quick actions.
 */

import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../../config/theme';
import { formatDate, formatCurrency } from '../../../utils/formatting';
import { getMarinaBadge } from '../../../config/marinas';
import type { Booking } from '../../../types/models';

interface ActiveBookingCardProps {
  booking: Booking;
  totalSpent?: number;
  testID?: string;
}

/**
 * Calculate booking day progress
 */
export function calculateDayProgress(
  arrivalDate: Date,
  departureDate: Date
): { currentDay: number; totalDays: number; daysLeft: number } {
  const now = new Date();
  const arrival = new Date(arrivalDate);
  const departure = new Date(departureDate);

  // Reset times to compare dates only
  now.setHours(0, 0, 0, 0);
  arrival.setHours(0, 0, 0, 0);
  departure.setHours(0, 0, 0, 0);

  const totalDays =
    Math.ceil((departure.getTime() - arrival.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const daysPassed =
    Math.ceil((now.getTime() - arrival.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const currentDay = Math.max(1, Math.min(daysPassed, totalDays));
  const daysLeft = Math.max(0, totalDays - currentDay);

  return { currentDay, totalDays, daysLeft };
}

/**
 * Calculate APA progress percentage
 */
export function calculateApaProgress(spent: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(100, Math.max(0, (spent / total) * 100));
}

export function ActiveBookingCard({
  booking,
  totalSpent = 0,
  testID,
}: ActiveBookingCardProps) {
  const router = useRouter();
  const arrivalDate = booking.arrivalDate.toDate();
  const departureDate = booking.departureDate.toDate();

  const { currentDay, totalDays, daysLeft } = calculateDayProgress(
    arrivalDate,
    departureDate
  );

  const marinaBadge = getMarinaBadge(
    booking.departureMarina,
    booking.arrivalMarina
  );

  const apaLeft = booking.apaTotal - totalSpent;
  const apaProgress = calculateApaProgress(totalSpent, booking.apaTotal);

  const handlePress = () => {
    router.push(`/booking/${booking.id}`);
  };

  const handleApaPress = () => {
    router.push(`/booking/expenses/${booking.id}`);
  };

  return (
    <Pressable style={styles.container} onPress={handlePress} testID={testID}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>u toku</Text>
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

      {/* Day Progress */}
      <Text style={styles.dayProgress}>
        Day {currentDay} of {totalDays}
        {daysLeft > 0 && ` · ${daysLeft} days left`}
      </Text>

      {/* Dates */}
      <Text style={styles.dates}>
        {formatDate(arrivalDate)} → {formatDate(departureDate)}
      </Text>

      {/* Notes Preview */}
      {booking.notes && (
        <Text style={styles.notes} numberOfLines={2}>
          {booking.notes}
        </Text>
      )}

      {/* APA Section */}
      {booking.apaTotal > 0 && (
        <Pressable style={styles.apaSection} onPress={handleApaPress}>
          <View style={styles.apaHeader}>
            <Text style={styles.apaLabel}>APA: {formatCurrency(booking.apaTotal)}</Text>
          </View>
          <View style={styles.apaStats}>
            <Text style={styles.apaSpent}>
              Spent: {formatCurrency(totalSpent)}
            </Text>
            <Text style={styles.apaLeft}>Left: {formatCurrency(apaLeft)}</Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${apaProgress}%`,
                  backgroundColor:
                    apaProgress > 90 ? COLORS.error : COLORS.sageGreen,
                },
              ]}
            />
          </View>
        </Pressable>
      )}

      {/* Action Buttons */}
      <View style={styles.actions}>
        <Pressable style={styles.actionButton} onPress={handleApaPress}>
          <Text style={styles.actionButtonText}>APA</Text>
        </Pressable>
        <Pressable style={styles.actionButton}>
          <Text style={styles.actionButtonText}>SHOPPING</Text>
        </Pressable>
        <Pressable style={styles.actionButton} onPress={handlePress}>
          <Text style={styles.actionButtonText}>EDIT</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  statusBadge: {
    backgroundColor: COLORS.statusActive,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  statusText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.white,
    textTransform: 'uppercase',
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
  dayProgress: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  dates: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  notes: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    marginBottom: SPACING.md,
  },
  apaSection: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
  },
  apaHeader: {
    marginBottom: SPACING.xs,
  },
  apaLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  apaStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  apaSpent: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  apaLeft: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: BORDER_RADIUS.full,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionButton: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
});
