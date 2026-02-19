/**
 * Booking Detail Screen
 *
 * View and manage a specific booking.
 * Shows booking info, APA, expenses summary, and actions.
 */

import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen, Header, HeaderAction } from '../../../src/components/layout';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../../src/config/theme';
import { formatDate, formatCurrency } from '../../../src/utils/formatting';
import { useBooking } from '../../../src/features/booking';
import { BOOKING_STATUS, getStatusConfig, canEditBooking, canDeleteBooking } from '../../../src/constants/bookingStatus';

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { booking, isLoading, error, cancel, refresh } = useBooking(id || null);

  // Handle delete
  const handleDelete = () => {
    if (!booking) return;

    Alert.alert(
      'Delete Booking',
      'Are you sure you want to delete this booking? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            // Note: We'd need to add delete to useBooking or use bookingService directly
            router.back();
          },
        },
      ]
    );
  };

  // Handle cancel booking
  const handleCancel = () => {
    if (!booking) return;

    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            const result = await cancel();
            if (!result.success) {
              Alert.alert('Error', result.error || 'Failed to cancel booking');
            }
          },
        },
      ]
    );
  };

  // Navigate to expenses
  const handleViewExpenses = () => {
    if (!booking) return;
    router.push(`/booking/expenses/${booking.id}`);
  };

  // Loading state
  if (isLoading) {
    return (
      <Screen edges={['top']}>
        <Header title="Booking" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.coral} />
        </View>
      </Screen>
    );
  }

  // Error state
  if (error || !booking) {
    return (
      <Screen edges={['top']}>
        <Header title="Booking" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error || 'Booking not found'}</Text>
          <Pressable style={styles.retryButton} onPress={refresh}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  const arrivalDate = booking.arrivalDate.toDate();
  const departureDate = booking.departureDate.toDate();
  const statusConfig = getStatusConfig(booking.status);
  const canEdit = canEditBooking(booking.status);
  const canDelete = canDeleteBooking(booking.status);

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

  return (
    <Screen noPadding edges={['top']}>
      <Header
        title="Booking Details"
        rightAction={
          canEdit && <HeaderAction icon="✏️" onPress={() => {}} />
        }
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Badge */}
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.statusBadgeText}>{statusConfig.labelHR}</Text>
        </View>

        {/* Dates Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>📅</Text>
            <Text style={styles.cardTitle}>Dates</Text>
          </View>
          <Text style={styles.dateRange}>
            {formatDate(arrivalDate)} - {formatDate(departureDate)}
          </Text>
          <Text style={styles.marinaRoute}>
            {booking.departureMarina} → {booking.arrivalMarina}
          </Text>
        </View>

        {/* Guests Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>👥</Text>
            <Text style={styles.cardTitle}>Guests</Text>
          </View>
          <Text style={styles.guestCount}>{booking.guestCount}</Text>
        </View>

        {/* APA Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>💰</Text>
            <Text style={styles.cardTitle}>APA</Text>
          </View>
          <Text style={styles.apaAmount}>{formatCurrency(booking.apaTotal)}</Text>
          {statusConfig.canEditAPA && (
            <Pressable style={styles.cardAction}>
              <Text style={styles.cardActionText}>+ Add APA</Text>
            </Pressable>
          )}
        </View>

        {/* Expenses Card */}
        <Pressable style={styles.card} onPress={handleViewExpenses}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>🧾</Text>
            <Text style={styles.cardTitle}>Expenses</Text>
            <Text style={styles.cardArrow}>→</Text>
          </View>
          <Text style={styles.expenseInfo}>Tap to view and add expenses</Text>
        </Pressable>

        {/* Tip Card (if completed) */}
        {(booking.status === BOOKING_STATUS.COMPLETED ||
          booking.status === BOOKING_STATUS.ARCHIVED) &&
          booking.tip !== undefined &&
          booking.tip !== null && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardIcon}>💵</Text>
                <Text style={styles.cardTitle}>Tip</Text>
              </View>
              <Text style={styles.tipAmount}>{formatCurrency(booking.tip)}</Text>
            </View>
          )}

        {/* Notes */}
        {booking.notes && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>📝</Text>
              <Text style={styles.cardTitle}>Crew Notes</Text>
            </View>
            <Text style={styles.notesText}>{booking.notes}</Text>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionsSection}>
          {booking.status === BOOKING_STATUS.UPCOMING && (
            <Pressable style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>Cancel Booking</Text>
            </Pressable>
          )}

          {canDelete && (
            <Pressable style={styles.deleteButton} onPress={handleDelete}>
              <Text style={styles.deleteButtonText}>Delete Booking</Text>
            </Pressable>
          )}
        </View>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  errorText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  retryButton: {
    backgroundColor: COLORS.coral,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
  },
  retryButtonText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    marginBottom: SPACING.md,
  },
  statusBadgeText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  cardIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  cardTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textSecondary,
    flex: 1,
  },
  cardArrow: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textMuted,
  },
  dateRange: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  marinaRoute: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
  },
  guestCount: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  apaAmount: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  cardAction: {
    backgroundColor: `${COLORS.coral}15`,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    alignSelf: 'flex-start',
  },
  cardActionText: {
    color: COLORS.coral,
    fontWeight: '600',
    fontSize: FONT_SIZES.md,
  },
  expenseInfo: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
  },
  tipAmount: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.sageGreen,
  },
  notesText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  actionsSection: {
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
  cancelButton: {
    backgroundColor: `${COLORS.warning}15`,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: COLORS.warning,
    fontWeight: '600',
    fontSize: FONT_SIZES.lg,
  },
  deleteButton: {
    backgroundColor: `${COLORS.error}15`,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: COLORS.error,
    fontWeight: '600',
    fontSize: FONT_SIZES.lg,
  },
  bottomSpacer: {
    height: SPACING.xxl,
  },
});
