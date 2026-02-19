/**
 * BookingCard Component
 *
 * Displays a booking summary with status badge, dates, and key info.
 * Used in booking lists and on the home screen.
 */

import { View, Text, Pressable, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../../config/theme';
import { BOOKING_STATUS, getStatusConfig } from '../../../constants/bookingStatus';
import { formatDate, formatCurrency } from '../../../utils/formatting';
import type { Booking } from '../../../types/models';

interface BookingCardProps {
  booking: Booking;
  onPress?: () => void;
  variant?: 'default' | 'compact' | 'expanded';
}

export function BookingCard({ booking, onPress, variant = 'default' }: BookingCardProps) {
  const statusConfig = getStatusConfig(booking.status);
  const arrivalDate = booking.arrivalDate.toDate();
  const departureDate = booking.departureDate.toDate();

  // Calculate days until arrival or days remaining
  const today = new Date();
  const daysUntil = Math.ceil((arrivalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.ceil((departureDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  // Status badge text
  const getBadgeText = () => {
    switch (booking.status) {
      case BOOKING_STATUS.UPCOMING:
        return daysUntil === 0 ? 'Danas' : daysUntil === 1 ? 'Sutra' : `za ${daysUntil} d.`;
      case BOOKING_STATUS.ACTIVE:
        return daysRemaining === 0 ? 'Zadnji dan' : `${daysRemaining} d. preostalo`;
      case BOOKING_STATUS.COMPLETED:
        return 'Završen';
      case BOOKING_STATUS.CANCELLED:
        return 'Otkazan';
      case BOOKING_STATUS.ARCHIVED:
        return 'Arhiviran';
      default:
        return '';
    }
  };

  // Status color
  const getStatusColor = () => {
    switch (booking.status) {
      case BOOKING_STATUS.UPCOMING:
        return COLORS.statusUpcoming;
      case BOOKING_STATUS.ACTIVE:
        return COLORS.statusActive;
      case BOOKING_STATUS.COMPLETED:
      case BOOKING_STATUS.ARCHIVED:
        return COLORS.statusCompleted;
      case BOOKING_STATUS.CANCELLED:
        return COLORS.statusCancelled;
      default:
        return COLORS.textMuted;
    }
  };

  if (variant === 'compact') {
    return (
      <Pressable
        style={[styles.compactContainer, onPress && styles.pressable]}
        onPress={onPress}
      >
        <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
        <View style={styles.compactContent}>
          <Text style={styles.compactDates}>
            {formatDate(arrivalDate)} - {formatDate(departureDate)}
          </Text>
          <Text style={styles.compactGuests}>{booking.guestCount} gostiju</Text>
        </View>
        <Text style={[styles.compactBadge, { color: getStatusColor() }]}>
          {getBadgeText()}
        </Text>
      </Pressable>
    );
  }

  if (variant === 'expanded') {
    return (
      <Pressable
        style={[styles.expandedContainer, onPress && styles.pressable]}
        onPress={onPress}
      >
        {/* Status Badge */}
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.statusBadgeText}>{getBadgeText()}</Text>
        </View>

        {/* Main Content */}
        <View style={styles.expandedHeader}>
          <Text style={styles.expandedDates}>
            {formatDate(arrivalDate)} - {formatDate(departureDate)}
          </Text>
          <Text style={styles.expandedMarina}>
            {booking.departureMarina} → {booking.arrivalMarina}
          </Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>👥</Text>
            <Text style={styles.statValue}>{booking.guestCount}</Text>
            <Text style={styles.statLabel}>Gostiju</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>💰</Text>
            <Text style={styles.statValue}>{formatCurrency(booking.apaTotal)}</Text>
            <Text style={styles.statLabel}>APA</Text>
          </View>
          {booking.tip !== undefined && booking.tip !== null && (
            <>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statIcon}>💵</Text>
                <Text style={styles.statValue}>{formatCurrency(booking.tip)}</Text>
                <Text style={styles.statLabel}>Napojnica</Text>
              </View>
            </>
          )}
        </View>

        {/* Notes */}
        {booking.notes && (
          <View style={styles.notesContainer}>
            <Text style={styles.notesText} numberOfLines={2}>
              📝 {booking.notes}
            </Text>
          </View>
        )}
      </Pressable>
    );
  }

  // Default variant
  return (
    <Pressable
      style={[styles.container, onPress && styles.pressable]}
      onPress={onPress}
    >
      {/* Header Row */}
      <View style={styles.header}>
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>
            {formatDate(arrivalDate)} - {formatDate(departureDate)}
          </Text>
          <Text style={styles.marinaText}>
            {booking.departureMarina} → {booking.arrivalMarina}
          </Text>
        </View>
        <View style={[styles.badge, { backgroundColor: `${getStatusColor()}20` }]}>
          <Text style={[styles.badgeText, { color: getStatusColor() }]}>
            {getBadgeText()}
          </Text>
        </View>
      </View>

      {/* Info Row */}
      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Text style={styles.infoIcon}>👥</Text>
          <Text style={styles.infoValue}>{booking.guestCount}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoIcon}>💰</Text>
          <Text style={styles.infoValue}>{formatCurrency(booking.apaTotal)}</Text>
        </View>
        {booking.tip !== undefined && booking.tip !== null && (
          <View style={styles.infoItem}>
            <Text style={styles.infoIcon}>💵</Text>
            <Text style={styles.infoValue}>{formatCurrency(booking.tip)}</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // Default variant
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  pressable: {
    opacity: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  dateContainer: {
    flex: 1,
  },
  dateText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  marinaText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
  },
  badgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoIcon: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },

  // Compact variant
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  statusIndicator: {
    width: 4,
    height: 32,
    borderRadius: 2,
    marginRight: SPACING.sm,
  },
  compactContent: {
    flex: 1,
  },
  compactDates: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  compactGuests: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
  compactBadge: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },

  // Expanded variant
  expandedContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    marginBottom: SPACING.md,
  },
  statusBadgeText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  expandedHeader: {
    marginBottom: SPACING.md,
  },
  expandedDates: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  expandedMarina: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  statItem: {
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 20,
    marginBottom: SPACING.xs,
  },
  statValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.border,
  },
  notesContainer: {
    marginTop: SPACING.md,
    padding: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
  },
  notesText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
});
