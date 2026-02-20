/**
 * Booking Detail Screen
 *
 * View and manage a specific booking.
 * Shows booking info, APA preview, action buttons, score card, and actions.
 * Layout follows Screen Map spec 3.2.
 */

import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen, Header, HeaderAction } from '../../../src/components/layout';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../../src/config/theme';
import { formatDate, formatCurrency } from '../../../src/utils/formatting';
import { useBooking } from '../../../src/features/booking';
import { BOOKING_STATUS, getStatusConfig, canEditBooking, canDeleteBooking } from '../../../src/constants/bookingStatus';
import { useScoreCard } from '../../../src/features/score/hooks/useScoreCard';
import { ScoreCardPreview } from '../../../src/features/score/components/ScoreCardPreview';
import { AddApaModal, useApa } from '../../../src/features/apa';
import { useExpenses } from '../../../src/features/expense/hooks/useExpenses';
import { useSeasonStore } from '../../../src/stores/seasonStore';
import { useAuthStore } from '../../../src/stores/authStore';
import { USER_ROLES } from '../../../src/constants/userRoles';

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { booking, isLoading, error, cancel, refresh } = useBooking(id || null);

  // Get crew members and current user for score card
  const { crewMembers } = useSeasonStore();
  const { firebaseUser } = useAuthStore();
  const currentUserId = firebaseUser?.uid || '';
  const currentCrewMember = crewMembers.find((m) => m.id === currentUserId);
  const isCaptain = currentCrewMember?.roles?.includes(USER_ROLES.CAPTAIN) || false;

  // Score card hook
  const {
    leaderboard,
    canAddScore,
  } = useScoreCard({
    bookingId: id || '',
    crewMembers,
    currentUserId,
    isCaptain,
  });

  // APA hook and modal state
  const { total: apaReceived, addEntry: addApaEntry, refresh: refreshApa } = useApa(id || '', currentUserId);
  const [showApaModal, setShowApaModal] = useState(false);

  // Expenses hook for spent amount
  const { totalAmount: apaSpent } = useExpenses(id || '', booking?.seasonId || '');

  // Calculate APA left
  const apaLeft = apaReceived - apaSpent;
  const apaProgress = apaReceived > 0 ? Math.min(apaSpent / apaReceived, 1) : 0;

  // Handle add APA
  const handleAddApa = async (amount: number, note?: string) => {
    const result = await addApaEntry(amount, note);
    if (result.success) {
      // Refresh booking to get updated apaTotal
      refresh();
      refreshApa();
    }
    return result;
  };

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

  // Navigate to APA Overview (expenses)
  const handleViewApa = () => {
    if (!booking) return;
    router.push(`/booking/expenses/${booking.id}`);
  };

  // Navigate to Shopping List (placeholder)
  const handleViewShopping = () => {
    if (!booking) return;
    router.push(`/booking/shopping/${booking.id}`);
  };

  // Navigate to score card
  const handleViewScoreCard = () => {
    if (!booking) return;
    router.push(`/booking/score/${booking.id}`);
  };

  // Navigate to add score
  const handleAddScore = () => {
    if (!booking) return;
    router.push(`/booking/score/add/${booking.id}`);
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

  // Calculate day X of Y for active bookings
  const today = new Date();
  const totalDays = Math.ceil((departureDate.getTime() - arrivalDate.getTime()) / (1000 * 60 * 60 * 24));
  const currentDay = Math.ceil((today.getTime() - arrivalDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysLeft = Math.ceil((departureDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const isActiveBooking = booking.status === BOOKING_STATUS.ACTIVE;

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
          canEdit && <HeaderAction icon="✏️" onPress={() => router.push(`/booking/edit/${booking.id}`)} />
        }
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Info Bar: Status + Guests + Route */}
        <View style={styles.infoBar}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
            <Text style={styles.statusBadgeText}>{statusConfig.labelHR}</Text>
          </View>
          <Text style={styles.infoItem}>👥 {booking.guestCount}</Text>
          <Text style={styles.infoItem}>{booking.departureMarina} → {booking.arrivalMarina}</Text>
        </View>

        {/* Date Range */}
        <View style={styles.dateSection}>
          <Text style={styles.dateRange}>
            {formatDate(arrivalDate)} - {formatDate(departureDate)}
          </Text>
          {isActiveBooking && currentDay > 0 && currentDay <= totalDays && (
            <Text style={styles.dayIndicator}>
              Day {currentDay} of {totalDays} · {daysLeft} days left
            </Text>
          )}
        </View>

        <View style={styles.divider} />

        {/* Notes (if exists) */}
        {booking.notes && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Notes</Text>
              <Text style={styles.notesText}>{booking.notes}</Text>
            </View>
            <View style={styles.divider} />
          </>
        )}

        {/* Preference List (placeholder) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preference List</Text>
          <View style={styles.prefListPlaceholder}>
            <Text style={styles.prefListIcon}>📎</Text>
            <Text style={styles.prefListText}>Upload PDF</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* APA Preview Card */}
        <View style={styles.apaPreviewCard}>
          <Text style={styles.apaPreviewTitle}>APA</Text>
          <Text style={styles.apaReceived}>{formatCurrency(apaReceived)} received</Text>
          <Text style={styles.apaSpentLeft}>
            {formatCurrency(apaSpent)} spent · {formatCurrency(apaLeft)} left
          </Text>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${apaProgress * 100}%` }]} />
          </View>
        </View>

        {/* Action Buttons: APA + SHOPPING */}
        <View style={styles.actionButtonsRow}>
          <Pressable style={styles.actionButton} onPress={handleViewApa}>
            <Text style={styles.actionButtonText}>APA</Text>
          </Pressable>
          <Pressable style={styles.actionButton} onPress={handleViewShopping}>
            <Text style={styles.actionButtonText}>SHOPPING</Text>
          </Pressable>
        </View>

        <View style={styles.divider} />

        {/* Score Card Preview */}
        <View style={styles.scoreCardSection}>
          <ScoreCardPreview
            leaderboard={leaderboard}
            onViewAll={handleViewScoreCard}
            onAddScore={handleAddScore}
            canAddScore={canAddScore}
            testID="score-card-preview"
          />
        </View>

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

      {/* Add APA Modal */}
      <AddApaModal
        visible={showApaModal}
        onClose={() => setShowApaModal(false)}
        onSubmit={handleAddApa}
      />
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
  // Info Bar
  infoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  statusBadgeText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  infoItem: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  // Date Section
  dateSection: {
    marginBottom: SPACING.md,
  },
  dateRange: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  dayIndicator: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  // Divider
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
  },
  // Section
  section: {
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  notesText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  // Preference List Placeholder
  prefListPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  prefListIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  prefListText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
  },
  // APA Preview Card
  apaPreviewCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  apaPreviewTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  apaReceived: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  apaSpentLeft: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.coral,
    borderRadius: BORDER_RADIUS.full,
  },
  // Action Buttons Row
  actionButtonsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  actionButton: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  // Score Card
  scoreCardSection: {
    marginBottom: SPACING.sm,
  },
  // Tip Card (legacy support)
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
  tipAmount: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.sageGreen,
  },
  // Actions Section
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
