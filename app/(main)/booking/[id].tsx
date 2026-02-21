/**
 * Booking Detail Screen (Brutalist)
 *
 * Neo-brutalist view of a specific booking.
 * Shows hero block, notes, APA overview, and action buttons.
 *
 * @see docs/Ahoy_Screen_Map.md §3.2
 * @see docs/Ahoy_UI_ELEMENTS.md → BookingDetailScreen
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

// Theme imports - SVE vrijednosti odavde!
import {
  COLORS,
  SHADOWS,
  BORDERS,
  SPACING,
  TYPOGRAPHY,
  FONTS,
  BORDER_RADIUS,
  ANIMATION,
} from '@/config/theme';

// Hooks
import { useBooking } from '@/features/booking';
import { useScoreCard } from '@/features/score/hooks/useScoreCard';
import { useApa, AddApaModal } from '@/features/apa';
import { useExpenses } from '@/features/expense/hooks/useExpenses';
import { useSeasonStore } from '@/stores/seasonStore';
import { useAuthStore } from '@/stores/authStore';

// Utils
import { formatDateShort, formatCurrency } from '@/utils/formatting';

// Constants
import { BOOKING_STATUS, canEditBooking } from '@/constants/bookingStatus';
import { USER_ROLES } from '@/constants/userRoles';

// Components
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ScoreCardPreview } from '@/features/score/components/ScoreCardPreview';

// ============================================
// HELPER FUNCTIONS
// ============================================

function getStatusColor(status: string): string {
  switch (status) {
    case 'active':
      return COLORS.primary;
    case 'upcoming':
      return COLORS.accent;
    case 'completed':
    case 'archived':
      return COLORS.muted;
    case 'cancelled':
      return COLORS.destructive;
    default:
      return COLORS.muted;
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'active':
      return 'ACTIVE';
    case 'upcoming':
      return 'UPCOMING';
    case 'completed':
      return 'COMPLETED';
    case 'archived':
      return 'ARCHIVED';
    case 'cancelled':
      return 'CANCELLED';
    default:
      return status.toUpperCase();
  }
}

function getDayOfBooking(arrivalDate: Date): number {
  const now = new Date();
  const diff = now.getTime() - arrivalDate.getTime();
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1);
}

function getBookingDuration(arrivalDate: Date, departureDate: Date): number {
  return Math.ceil(
    (departureDate.getTime() - arrivalDate.getTime()) / (1000 * 60 * 60 * 24)
  );
}

function getDaysLeft(departureDate: Date): number {
  const now = new Date();
  return Math.ceil((departureDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

// ============================================
// MAIN SCREEN
// ============================================

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
  const { leaderboard, canAddScore } = useScoreCard({
    bookingId: id || '',
    crewMembers,
    currentUserId,
    isCaptain,
  });

  // APA hook and modal state
  const {
    total: apaReceived,
    entries: apaEntries,
    addEntry: addApaEntry,
    refresh: refreshApa,
  } = useApa(id || '', currentUserId);
  const [showApaModal, setShowApaModal] = useState(false);
  const [showApaHistory, setShowApaHistory] = useState(false);

  // Expenses hook for spent amount
  const { totalAmount: apaSpent } = useExpenses(id || '', booking?.seasonId || '');

  // Calculate APA left
  const apaLeft = apaReceived - apaSpent;
  const apaProgress = apaReceived > 0 ? Math.min((apaSpent / apaReceived) * 100, 100) : 0;

  // Handle add APA
  const handleAddApa = async (amount: number, note?: string) => {
    const result = await addApaEntry(amount, note);
    if (result.success) {
      refresh();
      refreshApa();
    }
    return result;
  };

  // Handle cancel booking
  const handleCancel = () => {
    if (!booking) return;

    Alert.alert('Cancel Booking', 'Are you sure you want to cancel this booking?', [
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
    ]);
  };

  // Navigation handlers
  const handleBack = () => router.back();
  const handleEdit = () => router.push(`/booking/edit/${booking?.id}`);
  const handleViewApa = () => router.push(`/booking/expenses/${booking?.id}`);
  const handleViewShopping = () => router.push(`/booking/shopping/${booking?.id}`);
  const handleViewScoreCard = () => router.push(`/booking/score/${booking?.id}`);
  const handleAddScore = () => router.push(`/booking/score/add/${booking?.id}`);

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [styles.backButton, pressed && styles.buttonPressed]}
            onPress={handleBack}
          >
            <Text style={styles.backButtonText}>←</Text>
          </Pressable>
          <Text style={styles.headerTitle}>BOOKING</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.foreground} />
          <Text style={styles.loadingText}>Loading booking...</Text>
        </View>
      </View>
    );
  }

  // Error state
  if (error || !booking) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [styles.backButton, pressed && styles.buttonPressed]}
            onPress={handleBack}
          >
            <Text style={styles.backButtonText}>←</Text>
          </Pressable>
          <Text style={styles.headerTitle}>BOOKING</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error || 'Booking not found'}</Text>
          <Pressable
            style={({ pressed }) => [styles.retryButton, pressed && styles.buttonPressed]}
            onPress={refresh}
          >
            <Text style={styles.retryButtonText}>RETRY</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const arrivalDate = booking.arrivalDate.toDate();
  const departureDate = booking.departureDate.toDate();
  const canEdit = canEditBooking(booking.status);
  const isActive = booking.status === BOOKING_STATUS.ACTIVE;
  const isCompleted =
    booking.status === BOOKING_STATUS.COMPLETED || booking.status === BOOKING_STATUS.ARCHIVED;

  const statusColor = getStatusColor(booking.status);
  const duration = getBookingDuration(arrivalDate, departureDate);
  const dayOf = getDayOfBooking(arrivalDate);
  const daysLeft = getDaysLeft(departureDate);

  // Display name
  const displayName = booking.notes?.split('\n')[0]?.slice(0, 30) || 'Charter';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backButton, pressed && styles.buttonPressed]}
          onPress={handleBack}
        >
          <Text style={styles.backButtonText}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>BOOKING</Text>
        {canEdit ? (
          <Pressable
            style={({ pressed }) => [styles.editButton, pressed && styles.buttonPressed]}
            onPress={handleEdit}
          >
            <Text style={styles.editButtonText}>EDIT</Text>
          </Pressable>
        ) : (
          <View style={styles.headerSpacer} />
        )}
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Block */}
        <View style={[styles.heroBlock, { backgroundColor: statusColor }]}>
          {/* Status + Guests row */}
          <View style={styles.heroRow}>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>{getStatusLabel(booking.status)}</Text>
            </View>
            <Text style={styles.heroGuests}>👥 {booking.guestCount} guests</Text>
          </View>

          {/* Marina route */}
          <Text style={styles.heroMarina}>
            ⚓ {booking.departureMarina || 'Kaštela'} → {booking.arrivalMarina || 'Kaštela'}
          </Text>

          {/* Client name */}
          <Text style={styles.heroName}>{displayName}</Text>

          {/* Dates + duration */}
          <Text style={styles.heroDates}>
            📅 {formatDateShort(arrivalDate)} → {formatDateShort(departureDate)} · {duration} nights
          </Text>

          {/* Day X of Y (active only) */}
          {isActive && dayOf > 0 && dayOf <= duration && (
            <Text style={styles.heroDayOf}>
              Day {dayOf} of {duration} · {daysLeft} days left
            </Text>
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Notes Card */}
          {booking.notes && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>NOTES (CREW-PRIVATE)</Text>
              <View style={styles.card}>
                <Text style={styles.notesText}>{booking.notes}</Text>
              </View>
            </View>
          )}

          {/* Preference List Card */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>PREFERENCE LIST</Text>
            <View style={styles.card}>
              <View style={styles.prefListRow}>
                <View style={styles.prefListIconBox}>
                  <Text style={styles.prefListIcon}>📄</Text>
                </View>
                <Text style={styles.prefListText}>No preference list</Text>
                <Pressable
                  style={({ pressed }) => [styles.uploadButton, pressed && styles.buttonPressed]}
                >
                  <Text style={styles.uploadButtonText}>UPLOAD</Text>
                </Pressable>
              </View>
            </View>
          </View>

          {/* APA Overview Card */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>APA OVERVIEW</Text>
            <View style={styles.card}>
              {/* APA values row */}
              <View style={styles.apaValuesRow}>
                <View style={styles.apaValueCol}>
                  <Text style={styles.apaValueAmount}>{formatCurrency(apaReceived)}</Text>
                  <Text style={styles.apaValueLabel}>RECEIVED</Text>
                </View>
                <View style={styles.apaValueCol}>
                  <Text style={styles.apaValueAmount}>{formatCurrency(apaSpent)}</Text>
                  <Text style={styles.apaValueLabel}>SPENT</Text>
                </View>
                <View style={styles.apaValueCol}>
                  <Text style={[styles.apaValueAmount, styles.apaLeftValue]}>
                    {formatCurrency(apaLeft)}
                  </Text>
                  <Text style={styles.apaValueLabel}>LEFT</Text>
                </View>
              </View>

              {/* Progress bar */}
              <ProgressBar progress={apaProgress} style={styles.apaProgressBar} />

              {/* APA History toggle */}
              <Pressable
                style={({ pressed }) => [styles.apaHistoryToggle, pressed && styles.buttonPressed]}
                onPress={() => setShowApaHistory(!showApaHistory)}
              >
                <Text style={styles.apaHistoryText}>
                  {showApaHistory ? '▲' : '▼'} Show APA history ({apaEntries.length})
                </Text>
              </Pressable>

              {/* APA History (expanded) */}
              {showApaHistory && apaEntries.length > 0 && (
                <View style={styles.apaHistoryList}>
                  {apaEntries.map((entry, index) => (
                    <View key={entry.id || index} style={styles.apaHistoryItem}>
                      <Text style={styles.apaHistoryAmount}>{formatCurrency(entry.amount)}</Text>
                      <Text style={styles.apaHistoryNote}>{entry.note || 'APA received'}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Add APA button */}
              <Pressable
                style={({ pressed }) => [styles.addApaButton, pressed && styles.buttonPressed]}
                onPress={() => setShowApaModal(true)}
              >
                <Text style={styles.addApaButtonText}>+ ADD APA</Text>
              </Pressable>
            </View>
          </View>

          {/* Tip Card */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>TIP</Text>
            <View style={styles.card}>
              {booking.tip !== undefined && booking.tip !== null && booking.tip > 0 ? (
                <View style={styles.tipDisplay}>
                  <Text style={styles.tipAmount}>{formatCurrency(booking.tip)}</Text>
                  <Pressable style={styles.tipEditButton}>
                    <Text style={styles.tipEditText}>EDIT</Text>
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  style={({ pressed }) => [styles.recordTipButton, pressed && styles.buttonPressed]}
                >
                  <View style={styles.tipIconBox}>
                    <Text style={styles.tipIcon}>+</Text>
                  </View>
                  <Text style={styles.recordTipText}>Record tip amount...</Text>
                </Pressable>
              )}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtonsRow}>
            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                styles.actionButtonPrimary,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleViewApa}
            >
              <Text style={styles.actionButtonIcon}>💰</Text>
              <Text style={styles.actionButtonText}>APA &</Text>
              <Text style={styles.actionButtonText}>EXPENSES</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                styles.actionButtonSecondary,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleViewShopping}
            >
              <Text style={styles.actionButtonIcon}>🛒</Text>
              <Text style={styles.actionButtonText}>SHOPPING</Text>
            </Pressable>
          </View>

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

          {/* Cancel Button (upcoming only) */}
          {booking.status === BOOKING_STATUS.UPCOMING && (
            <Pressable
              style={({ pressed }) => [styles.cancelButton, pressed && styles.buttonPressed]}
              onPress={handleCancel}
            >
              <Text style={styles.cancelButtonText}>CANCEL BOOKING</Text>
            </Pressable>
          )}

          {/* Bottom spacing */}
          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>

      {/* Add APA Modal */}
      <AddApaModal
        visible={showApaModal}
        onClose={() => setShowApaModal(false)}
        onSubmit={handleAddApa}
      />
    </View>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  // Container
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Header
  header: {
    backgroundColor: COLORS.background,
    borderBottomWidth: BORDERS.heavy,
    borderBottomColor: COLORS.foreground,
    paddingTop: SPACING.xxl + SPACING.md,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.large,
    color: COLORS.foreground,
    textTransform: 'uppercase',
  },
  backButton: {
    width: 36,
    height: 36,
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.brutSm,
  },
  backButtonText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.large,
    color: COLORS.foreground,
  },
  editButton: {
    backgroundColor: COLORS.accent,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    ...SHADOWS.brutSm,
  },
  editButtonText: {
    fontFamily: FONTS.monoBold,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.foreground,
    textTransform: 'uppercase',
  },
  headerSpacer: {
    width: 36,
  },

  // ScrollView
  scrollView: {
    flex: 1,
  },

  // Hero Block
  heroBlock: {
    borderBottomWidth: BORDERS.heavy,
    borderBottomColor: COLORS.foreground,
    padding: SPACING.lg,
    gap: SPACING.xs,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  heroBadge: {
    backgroundColor: COLORS.overlayLight,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    paddingVertical: SPACING.xxs,
    paddingHorizontal: SPACING.sm,
  },
  heroBadgeText: {
    fontFamily: FONTS.monoBold,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.foreground,
    textTransform: 'uppercase',
  },
  heroGuests: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
  },
  heroMarina: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
    opacity: 0.8,
    marginTop: SPACING.xs,
  },
  heroName: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.sectionTitle,
    color: COLORS.foreground,
    textTransform: 'uppercase',
    marginTop: SPACING.sm,
  },
  heroDates: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
    opacity: 0.8,
  },
  heroDayOf: {
    fontFamily: FONTS.monoBold,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
    marginTop: SPACING.xs,
  },

  // Content
  content: {
    padding: SPACING.md,
  },

  // Section
  section: {
    marginBottom: SPACING.lg,
  },
  sectionLabel: {
    fontFamily: FONTS.monoBold,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: TYPOGRAPHY.letterSpacing.widest,
    marginBottom: SPACING.sm,
  },

  // Card
  card: {
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    padding: SPACING.md,
    ...SHADOWS.brut,
  },

  // Notes
  notesText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
    lineHeight: TYPOGRAPHY.sizes.body * TYPOGRAPHY.lineHeights.relaxed,
  },

  // Preference List
  prefListRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  prefListIconBox: {
    width: 36,
    height: 36,
    backgroundColor: COLORS.primaryLight,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prefListIcon: {
    fontSize: TYPOGRAPHY.sizes.large,
  },
  prefListText: {
    flex: 1,
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.mutedForeground,
  },
  uploadButton: {
    backgroundColor: COLORS.muted,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    ...SHADOWS.brutSm,
  },
  uploadButtonText: {
    fontFamily: FONTS.monoBold,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.foreground,
    textTransform: 'uppercase',
  },

  // APA Values
  apaValuesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  apaValueCol: {
    alignItems: 'center',
  },
  apaValueAmount: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.cardTitle,
    color: COLORS.foreground,
  },
  apaValueLabel: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.meta,
    color: COLORS.mutedForeground,
    textTransform: 'uppercase',
    marginTop: SPACING.xxs,
  },
  apaLeftValue: {
    color: COLORS.accent,
  },
  apaProgressBar: {
    marginBottom: SPACING.sm,
  },

  // APA History
  apaHistoryToggle: {
    paddingVertical: SPACING.sm,
    borderTopWidth: BORDERS.thin,
    borderTopColor: COLORS.foreground,
  },
  apaHistoryText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
    textAlign: 'center',
  },
  apaHistoryList: {
    borderTopWidth: BORDERS.thin,
    borderTopColor: COLORS.foreground,
    paddingTop: SPACING.sm,
    gap: SPACING.sm,
  },
  apaHistoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  apaHistoryAmount: {
    fontFamily: FONTS.monoBold,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
  },
  apaHistoryNote: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
  },

  // Add APA Button
  addApaButton: {
    backgroundColor: COLORS.secondary,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    marginTop: SPACING.sm,
    ...SHADOWS.brutSm,
  },
  addApaButtonText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.white,
    textTransform: 'uppercase',
  },

  // Tip
  tipDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tipAmount: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.sectionTitle,
    color: COLORS.accent,
  },
  tipEditButton: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  tipEditText: {
    fontFamily: FONTS.monoBold,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.primary,
    textTransform: 'uppercase',
  },
  recordTipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  tipIconBox: {
    width: 36,
    height: 36,
    backgroundColor: COLORS.muted,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipIcon: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.large,
    color: COLORS.foreground,
  },
  recordTipText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.mutedForeground,
  },

  // Action Buttons
  actionButtonsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  actionButton: {
    flex: 1,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.brut,
  },
  actionButtonPrimary: {
    backgroundColor: COLORS.primary,
  },
  actionButtonSecondary: {
    backgroundColor: COLORS.card,
  },
  actionButtonIcon: {
    fontSize: TYPOGRAPHY.sizes.cardTitle,
    marginBottom: SPACING.xs,
  },
  actionButtonText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.foreground,
    textTransform: 'uppercase',
  },

  // Score Card
  scoreCardSection: {
    marginBottom: SPACING.lg,
  },

  // Cancel Button
  cancelButton: {
    backgroundColor: COLORS.muted,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.destructive,
    borderRadius: BORDER_RADIUS.none,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    ...SHADOWS.brutSm,
  },
  cancelButtonText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.destructive,
    textTransform: 'uppercase',
  },

  // Loading
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  loadingText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.mutedForeground,
    marginTop: SPACING.md,
  },

  // Error
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
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.destructive,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    ...SHADOWS.brut,
  },
  retryButtonText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
    textTransform: 'uppercase',
  },

  // Press state
  buttonPressed: {
    transform: ANIMATION.pressedTransform,
  },

  // Bottom spacer
  bottomSpacer: {
    height: SPACING.xxl,
  },
});
