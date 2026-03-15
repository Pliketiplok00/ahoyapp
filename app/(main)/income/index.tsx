/**
 * Income Dashboard Screen (Brutalist)
 *
 * Personal earnings overview and work day management.
 * PRIVATE: Only shows current user's income data.
 */

import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import {
  COLORS,
  SHADOWS,
  BORDERS,
  SPACING,
  TYPOGRAPHY,
  FONTS,
  BORDER_RADIUS,
  ANIMATION,
  SIZES,
} from '@/config/theme';
import { Lock, Gear, Warning, CalendarCheck } from 'phosphor-react-native';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useSeason } from '@/features/season/hooks/useSeason';
import { useIncome, getSuggestedWorkDays, type WorkDay, type SuggestedWorkDay } from '@/features/income';
import { useBookings } from '@/features/booking/hooks/useBookings';
import { formatCurrency, formatDate } from '@/utils/formatting';
import { EmptyState } from '@/components/ui/EmptyState';

// ============================================
// COMPONENTS
// ============================================

interface WorkDayCardProps {
  workDay: WorkDay;
  onDelete: () => void;
}

function WorkDayCard({ workDay, onDelete }: WorkDayCardProps) {
  const date = workDay.date.toDate();
  const isGuestDay = workDay.type === 'guest';

  const handleDelete = () => {
    Alert.alert(
      'Obriši radni dan',
      `Jesi li siguran da želiš obrisati radni dan ${formatDate(date)}?`,
      [
        { text: 'Odustani', style: 'cancel' },
        { text: 'Obriši', style: 'destructive', onPress: onDelete },
      ]
    );
  };

  return (
    <View style={styles.workDayCard}>
      <View style={styles.workDayMain}>
        <View style={styles.workDayInfo}>
          <Text style={styles.workDayDate}>{formatDate(date)}</Text>
          <View style={[
            styles.typeBadge,
            isGuestDay ? styles.typeBadgeGuest : styles.typeBadgeNonGuest,
          ]}>
            <Text style={styles.typeBadgeText}>
              {isGuestDay ? 'S GOSTIMA' : 'BEZ GOSTIJU'}
            </Text>
          </View>
        </View>
        <Text style={styles.workDayEarnings}>{formatCurrency(workDay.earnings)}</Text>
      </View>
      {workDay.note && (
        <Text style={styles.workDayNote}>{workDay.note}</Text>
      )}
      <Pressable
        style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}
        onPress={handleDelete}
      >
        <Text style={styles.deleteButtonText}>×</Text>
      </Pressable>
    </View>
  );
}

interface SuggestedDayCardProps {
  suggestion: SuggestedWorkDay;
  rate: number;
  onAdd: () => void;
}

function SuggestedDayCard({ suggestion, rate, onAdd }: SuggestedDayCardProps) {
  return (
    <View style={styles.suggestedCard}>
      <View style={styles.suggestedMain}>
        <View style={styles.suggestedInfo}>
          <Text style={styles.suggestedDate}>{formatDate(suggestion.date)}</Text>
          <Text style={styles.suggestedBooking}>{suggestion.bookingName}</Text>
        </View>
        <Text style={styles.suggestedEarnings}>+{formatCurrency(rate)}</Text>
      </View>
      <Pressable
        style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
        onPress={onAdd}
      >
        <Text style={styles.addButtonText}>DODAJ</Text>
      </Pressable>
    </View>
  );
}

// ============================================
// MAIN SCREEN
// ============================================

export default function IncomeDashboardScreen() {
  const router = useRouter();
  const { firebaseUser } = useAuth();
  const { currentSeasonId } = useSeason();
  const {
    settings,
    workDays,
    summary,
    isLoading,
    error,
    refresh,
    deleteWorkDay,
    addWorkDay,
  } = useIncome(firebaseUser?.uid, currentSeasonId || undefined);

  // Get bookings for suggestions
  const { bookings } = useBookings();

  const [refreshing, setRefreshing] = React.useState(false);
  const [addingSuggestion, setAddingSuggestion] = React.useState<string | null>(null);

  // Compute suggestions
  const suggestions = useMemo(() => {
    if (!bookings.length) return [];
    return getSuggestedWorkDays(bookings, workDays);
  }, [bookings, workDays]);

  // Refresh on focus
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  // Pull to refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  // Navigate to add day
  const handleAddDay = () => {
    router.push('/(main)/income/add-day');
  };

  // Navigate to settings
  const handleSettings = () => {
    router.push('/(main)/settings/income');
  };

  // Delete work day
  const handleDeleteWorkDay = async (workDayId: string) => {
    const result = await deleteWorkDay(workDayId);
    if (!result.success) {
      Alert.alert('Greška', result.error || 'Nije moguće obrisati radni dan');
    }
  };

  // Add suggested work day
  const handleAddSuggested = async (suggestion: SuggestedWorkDay) => {
    const key = `${suggestion.date.getTime()}-${suggestion.bookingId}`;
    setAddingSuggestion(key);

    const result = await addWorkDay({
      date: suggestion.date,
      type: suggestion.type,
      bookingId: suggestion.bookingId,
      note: suggestion.bookingName,
    });

    setAddingSuggestion(null);

    if (!result.success) {
      Alert.alert('Greška', result.error || 'Nije moguće dodati radni dan');
    }
  };

  // Check if rates are configured
  const hasRates = settings && (settings.guestDayRate > 0 || settings.nonGuestDayRate > 0);

  // Get rate for suggestions (guest days)
  const suggestionRate = settings?.guestDayRate || 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>MOJA ZARADA</Text>
        <Pressable
          style={({ pressed }) => [styles.settingsButton, pressed && styles.pressed]}
          onPress={handleSettings}
        >
          <Gear size={20} color={COLORS.foreground} weight="regular" />
        </Pressable>
      </View>

      {isLoading && workDays.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.accent} />
          <Text style={styles.loadingText}>Učitavanje...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {/* Privacy Notice */}
          <View style={styles.privacyNotice}>
            <Lock size={14} color={COLORS.mutedForeground} weight="fill" />
            <Text style={styles.privacyText}>Privatni podaci</Text>
          </View>

          {/* Total Earnings Card */}
          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>UKUPNA ZARADA</Text>
            <Text style={styles.totalAmount}>{formatCurrency(summary.totalEarnings)}</Text>
            <Text style={styles.totalDays}>{summary.totalDays} radnih dana</Text>
          </View>

          {/* Breakdown */}
          <View style={styles.breakdownSection}>
            <Text style={styles.sectionTitle}>PREGLED</Text>

            <View style={styles.breakdownCard}>
              <View style={styles.breakdownRow}>
                <View style={styles.breakdownLabel}>
                  <View style={[styles.breakdownDot, styles.breakdownDotGuest]} />
                  <Text style={styles.breakdownText}>Dani s gostima</Text>
                </View>
                <Text style={styles.breakdownValue}>
                  {summary.guestDays} × {formatCurrency(settings?.guestDayRate || 0)}
                </Text>
              </View>
              <Text style={styles.breakdownTotal}>{formatCurrency(summary.guestEarnings)}</Text>
            </View>

            <View style={styles.breakdownCard}>
              <View style={styles.breakdownRow}>
                <View style={styles.breakdownLabel}>
                  <View style={[styles.breakdownDot, styles.breakdownDotNonGuest]} />
                  <Text style={styles.breakdownText}>Dani bez gostiju</Text>
                </View>
                <Text style={styles.breakdownValue}>
                  {summary.nonGuestDays} × {formatCurrency(settings?.nonGuestDayRate || 0)}
                </Text>
              </View>
              <Text style={styles.breakdownTotal}>{formatCurrency(summary.nonGuestEarnings)}</Text>
            </View>
          </View>

          {/* Configure Rates CTA */}
          {!hasRates && (
            <Pressable
              style={({ pressed }) => [styles.configureButton, pressed && styles.pressed]}
              onPress={handleSettings}
            >
              <Warning size={SIZES.icon.md} color={COLORS.foreground} weight="fill" />
              <View style={styles.configureButtonContent}>
                <Text style={styles.configureButtonTitle}>POSTAVI DNEVNICE</Text>
                <Text style={styles.configureButtonSubtitle}>
                  Konfiguriraj svoje dnevne tarife
                </Text>
              </View>
            </Pressable>
          )}

          {/* Suggested Days Section */}
          {suggestions.length > 0 && (
            <View style={styles.suggestionsSection}>
              <Text style={styles.sectionTitle}>PREDLOŽENI DANI</Text>
              <Text style={styles.suggestionsSubtitle}>
                Bazirano na završenim bookingima
              </Text>
              <View style={styles.suggestionsList}>
                {suggestions.slice(0, 5).map((suggestion) => {
                  const key = `${suggestion.date.getTime()}-${suggestion.bookingId}`;
                  return (
                    <SuggestedDayCard
                      key={key}
                      suggestion={suggestion}
                      rate={suggestionRate}
                      onAdd={() => handleAddSuggested(suggestion)}
                    />
                  );
                })}
              </View>
              {suggestions.length > 5 && (
                <Text style={styles.suggestionsMore}>
                  +{suggestions.length - 5} više dana dostupno
                </Text>
              )}
            </View>
          )}

          {/* Work Days Section */}
          <View style={styles.workDaysSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>RADNI DANI</Text>
              <Text style={styles.sectionCount}>{workDays.length}</Text>
            </View>

            {workDays.length === 0 ? (
              <EmptyState
                icon={<CalendarCheck size={64} color={COLORS.foreground} weight="regular" />}
                title="Nema radnih dana"
                subtitle="Dodaj prvi radni dan za praćenje zarade"
                actionLabel="+ Dodaj radni dan"
                onAction={handleAddDay}
              />
            ) : (
              <View style={styles.workDaysList}>
                {workDays.map((workDay) => (
                  <WorkDayCard
                    key={workDay.id}
                    workDay={workDay}
                    onDelete={() => handleDeleteWorkDay(workDay.id)}
                  />
                ))}
              </View>
            )}
          </View>

          {/* Bottom spacing */}
          <View style={{ height: SPACING.xxl * 3 }} />
        </ScrollView>
      )}

      {/* FAB - Add Work Day */}
      <Pressable
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        onPress={handleAddDay}
      >
        <Text style={styles.fabText}>+</Text>
      </Pressable>
    </View>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.secondary,
    borderBottomWidth: BORDERS.heavy,
    borderBottomColor: COLORS.foreground,
    paddingTop: SPACING.xxl + SPACING.md,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  headerTitle: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.cardTitle,
    color: COLORS.white,
  },
  backButton: {
    width: 40,
    height: 40,
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
    fontSize: TYPOGRAPHY.sizes.cardTitle,
    color: COLORS.foreground,
  },
  settingsButton: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.brutSm,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xxl,
  },
  loadingText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.mutedForeground,
    marginTop: SPACING.md,
  },

  // ScrollView
  scrollView: {
    flex: 1,
    padding: SPACING.md,
  },

  // Privacy Notice
  privacyNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.xs,
  },
  privacyText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.meta,
    color: COLORS.mutedForeground,
  },

  // Total Card
  totalCard: {
    backgroundColor: COLORS.primary,
    borderWidth: BORDERS.heavy,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    alignItems: 'center',
    ...SHADOWS.brut,
  },
  totalLabel: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.foreground,
    letterSpacing: 1,
    marginBottom: SPACING.xs,
  },
  totalAmount: {
    fontFamily: FONTS.display,
    fontSize: 48,
    color: COLORS.foreground,
    marginVertical: SPACING.sm,
  },
  totalDays: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
    opacity: 0.8,
  },

  // Breakdown
  breakdownSection: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  breakdownCard: {
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.brutSm,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  breakdownLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breakdownDot: {
    width: 12,
    height: 12,
    borderRadius: BORDER_RADIUS.none,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.foreground,
    marginRight: SPACING.sm,
  },
  breakdownDotGuest: {
    backgroundColor: COLORS.accent,
  },
  breakdownDotNonGuest: {
    backgroundColor: COLORS.muted,
  },
  breakdownText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
  },
  breakdownValue: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
  },
  breakdownTotal: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.large,
    color: COLORS.foreground,
    textAlign: 'right',
  },

  // Configure Button
  configureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    ...SHADOWS.brut,
  },
  configureButtonIcon: {
    marginRight: SPACING.md,
  },
  configureButtonContent: {
    flex: 1,
  },
  configureButtonTitle: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
  },
  configureButtonSubtitle: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.foreground,
    opacity: 0.8,
  },

  // Work Days Section
  workDaysSection: {
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sectionCount: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
  },
  workDaysList: {
    gap: SPACING.sm,
  },

  // Work Day Card
  workDayCard: {
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    padding: SPACING.md,
    ...SHADOWS.brutSm,
  },
  workDayMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  workDayInfo: {
    flex: 1,
  },
  workDayDate: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
    marginBottom: SPACING.xs,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xxs,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
  },
  typeBadgeGuest: {
    backgroundColor: COLORS.accent,
  },
  typeBadgeNonGuest: {
    backgroundColor: COLORS.muted,
  },
  typeBadgeText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.meta,
    color: COLORS.foreground,
  },
  workDayEarnings: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.large,
    color: COLORS.foreground,
  },
  workDayNote: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
    marginTop: SPACING.sm,
  },
  deleteButton: {
    position: 'absolute',
    top: SPACING.xs,
    right: SPACING.xs,
    width: 28,
    height: 28,
    backgroundColor: COLORS.muted,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.cardTitle,
    color: COLORS.destructive,
  },

  // Suggestions Section
  suggestionsSection: {
    marginBottom: SPACING.lg,
  },
  suggestionsSubtitle: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
    marginBottom: SPACING.sm,
  },
  suggestionsList: {
    gap: SPACING.sm,
  },
  suggestionsMore: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },

  // Suggested Card
  suggestedCard: {
    backgroundColor: COLORS.accent,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOWS.brutSm,
  },
  suggestedMain: {
    flex: 1,
  },
  suggestedInfo: {
    marginBottom: SPACING.xs,
  },
  suggestedDate: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
  },
  suggestedBooking: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.foreground,
    opacity: 0.8,
  },
  suggestedEarnings: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
  },
  addButton: {
    backgroundColor: COLORS.secondary,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginLeft: SPACING.md,
  },
  addButtonText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.white,
    letterSpacing: 0.5,
  },

  // FAB
  fab: {
    position: 'absolute',
    right: SPACING.md,
    bottom: SPACING.xl,
    width: 60,
    height: 60,
    backgroundColor: COLORS.secondary,
    borderWidth: BORDERS.heavy,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.brut,
  },
  fabPressed: {
    transform: ANIMATION.pressedTransform,
  },
  fabText: {
    fontFamily: FONTS.display,
    fontSize: 32,
    color: COLORS.white,
    marginTop: -2,
  },

  // Pressed
  pressed: {
    transform: ANIMATION.pressedTransform,
  },
});
