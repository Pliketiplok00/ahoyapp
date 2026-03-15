/**
 * Stats Screen (Season Insights) - Brutalist Design
 *
 * Overview of season statistics: total APA, expenses,
 * tips, top merchants, booking comparisons, score card.
 * Includes calendar view with tab switcher.
 */

import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useSeasonStats, SeasonCalendar } from '@/features/stats';
import { useSeason } from '@/features/season/hooks/useSeason';
import { useBookings } from '@/features/booking/hooks/useBookings';
import { useIncome } from '@/features/income';
import { useAuthStore } from '@/stores/authStore';
import { formatCurrency } from '@/utils/formatting';
import {
  COLORS,
  SHADOWS,
  BORDERS,
  SPACING,
  FONTS,
  TYPOGRAPHY,
  BORDER_RADIUS,
  ANIMATION,
  SIZES,
} from '@/config/theme';
import { Warning, Trophy, Diamond, CalendarCheck, SmileyXEyes } from 'phosphor-react-native';
import { CategoryIcon, type ExpenseCategory } from '@/config/expenses';
import { AhoyLogo } from '@/components/ui';

type TabType = 'stats' | 'cal';

export default function StatsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('stats');
  const { stats, isLoading, error, refresh } = useSeasonStats();
  const { currentSeason, crewMembers } = useSeason();
  const { bookings, refresh: refreshBookings } = useBookings();
  const { firebaseUser } = useAuthStore();
  const { settings: incomeSettings } = useIncome(
    firebaseUser?.uid,
    currentSeason?.id
  );

  // Refresh bookings when tab gains focus (fixes calendar not updating after new booking)
  useFocusEffect(
    useCallback(() => {
      refreshBookings();
    }, [refreshBookings])
  );

  // Calculate income stats
  const hasIncomeSettings = incomeSettings &&
    (incomeSettings.guestDayRate > 0 || incomeSettings.nonGuestDayRate > 0);

  // Earned income (past only)
  const earnedIncome = hasIncomeSettings && stats
    ? (stats.pastBookingDays * incomeSettings.guestDayRate) +
      (stats.pastNonBookingDays * incomeSettings.nonGuestDayRate)
    : 0;

  // Expected income (full season projection)
  const expectedIncome = hasIncomeSettings && stats
    ? (stats.totalBookingDays * incomeSettings.guestDayRate) +
      (stats.totalNonBookingDays * incomeSettings.nonGuestDayRate)
    : 0;

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <AhoyLogo />
          <Text style={styles.headerSubtitle}>
            {currentSeason?.boatName || 'S/Y CREW SEASON'}
          </Text>
          {currentSeason?.name ? (
            <Text style={styles.headerSeasonName}>{currentSeason.name}</Text>
          ) : null}
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Učitavam statistiku...</Text>
        </View>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <AhoyLogo />
          <Text style={styles.headerSubtitle}>
            {currentSeason?.boatName || 'S/Y CREW SEASON'}
          </Text>
          {currentSeason?.name ? (
            <Text style={styles.headerSeasonName}>{currentSeason.name}</Text>
          ) : null}
        </View>
        <View style={styles.errorContainer}>
          <Warning size={SIZES.icon.xl} color={COLORS.destructive} weight="fill" />
          <Text style={styles.errorText}>{error}</Text>
          <Pressable
            style={({ pressed }) => [
              styles.retryButton,
              pressed && styles.pressed,
            ]}
            onPress={refresh}
          >
            <Text style={styles.retryButtonText}>POKUŠAJ PONOVNO</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // No season state
  if (!currentSeason || !stats) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <AhoyLogo />
          <Text style={styles.headerSubtitle}>
            {currentSeason?.boatName || 'S/Y CREW SEASON'}
          </Text>
          {currentSeason?.name ? (
            <Text style={styles.headerSeasonName}>{currentSeason.name}</Text>
          ) : null}
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📊</Text>
          <Text style={styles.emptyTitle}>NEMA SEZONE</Text>
          <Text style={styles.emptyText}>
            Kreiraj ili se pridruži sezoni da vidiš statistiku.
          </Text>
        </View>
      </View>
    );
  }

  // Sort crew by points for leaderboard
  const sortedCrew = stats.scoreStats?.crewTotals
    ? [...stats.scoreStats.crewTotals].sort((a, b) => b.totalPoints - a.totalPoints)
    : [];

  // Get medal for leaderboard position
  const getMedal = (index: number): string => {
    switch (index) {
      case 0:
        return '🥇';
      case 1:
        return '🥈';
      case 2:
        return '🥉';
      default:
        return `${index + 1}.`;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header - matches BookingsScreen pattern */}
      <View style={styles.header}>
        <AhoyLogo />
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerBoatName}>
              {currentSeason?.boatName || 'S/Y CREW SEASON'}
            </Text>
            {currentSeason?.name ? (
              <Text style={styles.headerSeasonName}>{currentSeason.name}</Text>
            ) : null}
          </View>

          {/* Tab Switcher */}
          <View style={styles.tabSwitcher}>
            <Pressable
              style={[
                styles.tab,
                activeTab === 'stats' && styles.tabActive,
              ]}
              onPress={() => setActiveTab('stats')}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'stats' && styles.tabTextActive,
                ]}
              >
                STATS
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.tab,
                activeTab === 'cal' && styles.tabActive,
              ]}
              onPress={() => setActiveTab('cal')}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'cal' && styles.tabTextActive,
                ]}
              >
                CAL
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Calendar View */}
      {activeTab === 'cal' && currentSeason && (
        <SeasonCalendar
          season={currentSeason}
          bookings={bookings}
          testID="season-calendar"
        />
      )}

      {/* Stats View */}
      {activeTab === 'stats' && (
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Season Progress Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>SEZONA</Text>
            <Text style={styles.progressValue}>{stats.seasonProgress}%</Text>
          </View>
          <ProgressBar
            progress={stats.seasonProgress}
            height={12}
            trackColor={COLORS.foreground}
            fillColor={COLORS.accent}
          />
          <View style={styles.progressFooter}>
            <Text style={styles.progressDays}>{stats.workDays} RADNIH DANA</Text>
            <Text style={styles.progressRemaining}>{stats.daysRemaining} DANA OSTALO</Text>
          </View>
        </View>

        {/* Tips Card - Full Width */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsLabel}>NAPOJNICE</Text>
          <Text style={styles.tipsValue}>{stats.formattedTotalTips}</Text>
          <Text style={styles.tipsMeta}>Ø {stats.formattedAverageTip} po charteru</Text>
        </View>

        {/* Income Stats Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PRIHOD</Text>

          {/* Work Days Counter */}
          <View style={styles.incomeStatsRow}>
            <View style={styles.incomeStatBox}>
              <Text style={styles.incomeStatLabel}>RADNI DANI</Text>
              <Text style={styles.incomeStatValue}>{stats.totalBookingDays}</Text>
              <Text style={styles.incomeStatMeta}>s gostima</Text>
              {hasIncomeSettings ? (
                <Text style={styles.incomeStatBreakdown}>
                  {stats.totalBookingDays} × {formatCurrency(incomeSettings.guestDayRate)} = {formatCurrency(stats.totalBookingDays * incomeSettings.guestDayRate)}
                </Text>
              ) : (
                <Text style={styles.incomeStatBreakdownHint}>Postavi dnevnice</Text>
              )}
            </View>
            <View style={styles.incomeStatBox}>
              <Text style={styles.incomeStatLabel}>NERADNI DANI</Text>
              <Text style={styles.incomeStatValue}>{stats.totalNonBookingDays}</Text>
              <Text style={styles.incomeStatMeta}>bez gostiju</Text>
              {hasIncomeSettings ? (
                <Text style={styles.incomeStatBreakdown}>
                  {stats.totalNonBookingDays} × {formatCurrency(incomeSettings.nonGuestDayRate)} = {formatCurrency(stats.totalNonBookingDays * incomeSettings.nonGuestDayRate)}
                </Text>
              ) : (
                <Text style={styles.incomeStatBreakdownHint}>Postavi dnevnice</Text>
              )}
            </View>
          </View>

          {/* Income Boxes */}
          {hasIncomeSettings ? (
            <View style={styles.incomeCardsRow}>
              {/* Earned Income (Past Only) */}
              <View style={[styles.incomeCard, styles.incomeCardEarned]}>
                <Text style={styles.incomeCardLabel}>OSTVARENI PRIHOD</Text>
                <Text style={styles.incomeCardValue}>{formatCurrency(earnedIncome)}</Text>
                <Text style={styles.incomeCardMeta}>
                  {stats.pastBookingDays}d + {stats.pastNonBookingDays}d
                </Text>
              </View>

              {/* Expected Income (Full Season) */}
              <View style={[styles.incomeCard, styles.incomeCardExpected]}>
                <Text style={styles.incomeCardLabel}>OČEKIVANI PRIHOD</Text>
                <Text style={styles.incomeCardValue}>{formatCurrency(expectedIncome)}</Text>
                <Text style={styles.incomeCardMeta}>cijela sezona</Text>
              </View>
            </View>
          ) : (
            <Pressable
              style={({ pressed }) => [
                styles.setIncomeButton,
                pressed && styles.pressed,
              ]}
              onPress={() => router.push('/settings/income')}
            >
              <Text style={styles.setIncomeButtonText}>POSTAVI DNEVNICE →</Text>
              <Text style={styles.setIncomeHint}>Za izračun prihoda</Text>
            </Pressable>
          )}
        </View>

        {/* Highlights Card */}
        {(stats.bestTipBooking || stats.lowestSpendBooking) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>HIGHLIGHTS</Text>
            <View style={styles.highlightsGrid}>
              {stats.bestTipBooking && (
                <View style={styles.highlightItem}>
                  <Trophy size={24} color={COLORS.foreground} weight="fill" />
                  <Text style={styles.highlightLabel}>BEST TIP</Text>
                  <Text style={styles.highlightValue}>{stats.bestTipBooking.formattedValue}</Text>
                  <Text style={styles.highlightDates}>{stats.bestTipBooking.dates}</Text>
                </View>
              )}
              {stats.lowestSpendBooking && (
                <View style={styles.highlightItem}>
                  <Diamond size={24} color={COLORS.foreground} weight="fill" />
                  <Text style={styles.highlightLabel}>LOWEST SPEND</Text>
                  <Text style={styles.highlightValue}>{stats.lowestSpendBooking.formattedValue}</Text>
                  <Text style={styles.highlightDates}>{stats.lowestSpendBooking.dates}</Text>
                </View>
              )}
              <View style={styles.highlightItem}>
                <CalendarCheck size={24} color={COLORS.foreground} weight="fill" />
                <Text style={styles.highlightLabel}>ZAVRŠENO</Text>
                <Text style={styles.highlightValue}>{stats.completedBookings}</Text>
                <Text style={styles.highlightDates}>OD {stats.totalBookings} UKUPNO</Text>
              </View>
            </View>
          </View>
        )}

        {/* Category Breakdown */}
        {stats.categoryBreakdown.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>KATEGORIJE TROŠKOVA</Text>
            <View style={styles.categoryList}>
              {stats.categoryBreakdown.map((cat) => (
                <View key={cat.id} style={styles.categoryRow}>
                  <View style={styles.categoryHeader}>
                    <CategoryIcon category={cat.id as ExpenseCategory} size={18} color={COLORS.foreground} />
                    <Text style={styles.categoryName}>{cat.label}</Text>
                    <Text style={styles.categoryPercent}>{cat.percentage}%</Text>
                  </View>
                  <View style={styles.categoryBarContainer}>
                    <View
                      style={[
                        styles.categoryBar,
                        { width: `${cat.percentage}%` },
                        cat.id === 'food' && styles.categoryBarFood,
                        cat.id === 'fuel' && styles.categoryBarFuel,
                        cat.id === 'mooring' && styles.categoryBarMooring,
                        cat.id === 'other' && styles.categoryBarOther,
                      ]}
                    />
                  </View>
                  <Text style={styles.categoryTotal}>{cat.formattedTotal}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Top Merchants */}
        {stats.topMerchants.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>TOP MERCHANTS</Text>
            <View style={styles.merchantList}>
              {stats.topMerchants.slice(0, 5).map((merchant, index) => (
                <View key={merchant.name} style={styles.merchantRow}>
                  <View style={styles.merchantRank}>
                    <Text style={styles.merchantRankText}>{index + 1}</Text>
                  </View>
                  <View style={styles.merchantInfo}>
                    <Text style={styles.merchantName}>{merchant.name}</Text>
                    <Text style={styles.merchantCount}>
                      {merchant.count} {merchant.count === 1 ? 'račun' : 'računa'}
                    </Text>
                  </View>
                  <Text style={styles.merchantTotal}>{merchant.formattedTotal}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Crew Leaderboard */}
        {sortedCrew.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>CREW LEADERBOARD</Text>

            {/* Trophy & Horns Holders */}
            {(stats.scoreStats?.trophyHolder || stats.scoreStats?.hornsHolder) && (
              <View style={styles.holdersRow}>
                {stats.scoreStats?.trophyHolder && (
                  <View style={styles.holderCard}>
                    <Trophy size={28} color={COLORS.foreground} weight="fill" />
                    <Text style={styles.holderLabel}>TROPHY</Text>
                    <Text style={styles.holderName}>
                      {crewMembers.find((c) => c.id === stats.scoreStats?.trophyHolder)?.name || 'Unknown'}
                    </Text>
                  </View>
                )}
                {stats.scoreStats?.hornsHolder && (
                  <View style={styles.holderCard}>
                    <SmileyXEyes size={28} color={COLORS.destructive} weight="fill" />
                    <Text style={styles.holderLabel}>HORNS</Text>
                    <Text style={styles.holderName}>
                      {crewMembers.find((c) => c.id === stats.scoreStats?.hornsHolder)?.name || 'Unknown'}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Leaderboard List */}
            <View style={styles.leaderboardList}>
              {sortedCrew.map((crew, index) => (
                <View key={crew.userId} style={styles.leaderboardRow}>
                  <Text style={styles.leaderboardMedal}>{getMedal(index)}</Text>
                  <View style={[styles.crewDot, { backgroundColor: crew.userColor }]} />
                  <Text style={styles.leaderboardName}>{crew.userName}</Text>
                  <Text
                    style={[
                      styles.leaderboardPoints,
                      crew.totalPoints > 0
                        ? styles.positivePoints
                        : crew.totalPoints < 0
                        ? styles.negativePoints
                        : null,
                    ]}
                  >
                    {crew.totalPoints > 0 ? '+' : ''}
                    {crew.totalPoints}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Full Season Report Button - Placeholder */}
        <View style={styles.reportSection}>
          <Pressable
            style={({ pressed }) => [
              styles.reportButton,
              pressed && styles.pressed,
            ]}
            onPress={() => {
              // TODO: Implement full season report export
            }}
          >
            <Text style={styles.reportButtonText}>📄 FULL SEASON REPORT</Text>
          </Pressable>
          <Text style={styles.reportHint}>Export PDF dolazi uskoro</Text>
        </View>

        {/* Empty state when no bookings */}
        {stats.totalBookings === 0 && (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>
              Statistika sezone pojavit će se kada imaš završene bookinge.
            </Text>
          </View>
        )}

        {/* Bottom spacing */}
        <View style={{ height: SPACING.xxl }} />
      </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Container (matches BookingsScreen)
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Header (matches BookingsScreen pattern exactly)
  header: {
    backgroundColor: COLORS.primary,
    borderBottomWidth: BORDERS.heavy,
    borderBottomColor: COLORS.foreground,
    paddingTop: SPACING.xxl + SPACING.md, // Safe area + padding
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  headerTitle: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.sectionTitle,
    color: COLORS.foreground,
    textTransform: 'uppercase',
  },
  headerSubtitle: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
    opacity: 0.8,
    marginTop: SPACING.xs,
  },
  headerBoatName: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
    opacity: 0.8,
  },
  headerSeasonName: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.foreground,
    opacity: 0.6,
    textTransform: 'uppercase',
    letterSpacing: TYPOGRAPHY.letterSpacing.wide,
    marginTop: SPACING.xxs,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: SPACING.xs,
  },

  // Tab Switcher
  tabSwitcher: {
    flexDirection: 'row',
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    backgroundColor: COLORS.card,
    ...SHADOWS.brutSm,
  },
  tab: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.none,
  },
  tabActive: {
    backgroundColor: COLORS.accent,
  },
  tabText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.foreground,
    letterSpacing: TYPOGRAPHY.letterSpacing.wide,
  },
  tabTextActive: {
    color: COLORS.foreground,
  },

  scrollView: {
    flex: 1,
  },

  // Loading, Error, Empty States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  loadingText: {
    fontFamily: FONTS.mono,
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.mutedForeground,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  errorIcon: {
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
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    ...SHADOWS.brut,
  },
  retryButtonText: {
    fontFamily: FONTS.display,
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sizes.body,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.cardTitle,
    color: COLORS.foreground,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.mutedForeground,
    textAlign: 'center',
  },

  // Season Progress Card
  progressCard: {
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    margin: SPACING.md,
    padding: SPACING.md,
    ...SHADOWS.brut,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  progressLabel: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
    letterSpacing: 1,
  },
  progressValue: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.cardTitle,
    color: COLORS.foreground,
  },
  progressFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
  progressDays: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.meta,
    color: COLORS.mutedForeground,
  },
  progressRemaining: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.meta,
    color: COLORS.mutedForeground,
  },

  // Tips Card (Full Width)
  tipsCard: {
    backgroundColor: COLORS.accent,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    marginHorizontal: SPACING.md,
    padding: SPACING.md,
    alignItems: 'center',
    ...SHADOWS.brut,
  },
  tipsLabel: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.foreground,
    letterSpacing: 1,
  },
  tipsValue: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.sectionTitle,
    color: COLORS.foreground,
    marginTop: SPACING.xs,
  },
  tipsMeta: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.meta,
    color: COLORS.foreground,
    opacity: 0.7,
    marginTop: SPACING.xs,
  },

  // Section
  section: {
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    margin: SPACING.md,
    marginTop: SPACING.md,
    padding: SPACING.md,
    ...SHADOWS.brut,
  },
  sectionTitle: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
    letterSpacing: 1,
    marginBottom: SPACING.md,
  },

  // Income Stats
  incomeStatsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  incomeStatBox: {
    flex: 1,
    backgroundColor: COLORS.muted,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    padding: SPACING.sm,
    alignItems: 'center',
  },
  incomeStatLabel: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.meta,
    color: COLORS.mutedForeground,
    letterSpacing: 0.5,
  },
  incomeStatValue: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.cardTitle,
    color: COLORS.foreground,
    marginTop: SPACING.xs,
  },
  incomeStatMeta: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.meta,
    color: COLORS.mutedForeground,
    marginTop: SPACING.xxs,
  },
  incomeStatBreakdown: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.meta,
    color: COLORS.foreground,
    opacity: 0.6,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  incomeStatBreakdownHint: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.meta,
    color: COLORS.mutedForeground,
    fontStyle: 'italic',
    marginTop: SPACING.sm,
  },
  incomeCardsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  incomeCard: {
    flex: 1,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    padding: SPACING.sm,
    alignItems: 'center',
    ...SHADOWS.brutSm,
  },
  incomeCardEarned: {
    backgroundColor: COLORS.secondary,
  },
  incomeCardExpected: {
    backgroundColor: COLORS.primary,
  },
  incomeCardLabel: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.meta,
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  incomeCardValue: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.white,
    marginTop: SPACING.xs,
  },
  incomeCardMeta: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.meta,
    color: COLORS.white,
    opacity: 0.8,
    marginTop: SPACING.xxs,
  },
  setIncomeButton: {
    backgroundColor: COLORS.muted,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    padding: SPACING.md,
    alignItems: 'center',
    ...SHADOWS.brutSm,
  },
  setIncomeButtonText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
  },
  setIncomeHint: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.meta,
    color: COLORS.mutedForeground,
    marginTop: SPACING.xs,
  },

  // Highlights Grid
  highlightsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  highlightItem: {
    flex: 1,
    minWidth: 80,
    backgroundColor: COLORS.muted,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    padding: SPACING.sm,
    alignItems: 'center',
  },
  highlightIcon: {
    fontSize: 24,
    marginBottom: SPACING.xs,
  },
  highlightLabel: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.meta,
    color: COLORS.mutedForeground,
    letterSpacing: 0.5,
  },
  highlightValue: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
    marginTop: SPACING.xs,
  },
  highlightDates: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.meta,
    color: COLORS.mutedForeground,
    marginTop: SPACING.xxs,
  },

  // Category Breakdown
  categoryList: {
    gap: SPACING.md,
  },
  categoryRow: {
    gap: SPACING.xs,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xxs,
  },
  categoryEmoji: {
    fontSize: 18,
    marginRight: SPACING.sm,
  },
  categoryName: {
    flex: 1,
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
  },
  categoryPercent: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
    minWidth: 40,
    textAlign: 'right',
  },
  categoryBarContainer: {
    height: 16,
    backgroundColor: COLORS.muted,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    overflow: 'hidden',
  },
  categoryBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  categoryBarFood: {
    backgroundColor: COLORS.accent,
  },
  categoryBarFuel: {
    backgroundColor: COLORS.pink,
  },
  categoryBarMooring: {
    backgroundColor: COLORS.secondary,
  },
  categoryBarOther: {
    backgroundColor: COLORS.primary,
  },
  categoryTotal: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.foreground,
    textAlign: 'right',
    marginTop: SPACING.xxs,
  },

  // Merchants
  merchantList: {
    gap: SPACING.xs,
  },
  merchantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: BORDERS.thin,
    borderBottomColor: COLORS.muted,
  },
  merchantRank: {
    width: 24,
    height: 24,
    backgroundColor: COLORS.primary,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  merchantRankText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.meta,
    color: COLORS.white,
  },
  merchantInfo: {
    flex: 1,
  },
  merchantName: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
  },
  merchantCount: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.meta,
    color: COLORS.mutedForeground,
  },
  merchantTotal: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
  },

  // Crew Leaderboard
  holdersRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  holderCard: {
    flex: 1,
    backgroundColor: COLORS.muted,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    padding: SPACING.sm,
    alignItems: 'center',
  },
  holderIcon: {
    fontSize: 28,
    marginBottom: SPACING.xs,
  },
  holderLabel: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.meta,
    color: COLORS.mutedForeground,
    letterSpacing: 0.5,
  },
  holderName: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  leaderboardList: {
    gap: SPACING.xs,
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: BORDERS.thin,
    borderBottomColor: COLORS.muted,
  },
  leaderboardMedal: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.large,
    width: 32,
    textAlign: 'center',
  },
  crewDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.foreground,
  },
  leaderboardName: {
    flex: 1,
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
  },
  leaderboardPoints: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.mutedForeground,
  },
  positivePoints: {
    color: COLORS.score.positive,
  },
  negativePoints: {
    color: COLORS.score.negative,
  },

  // Report Button
  reportSection: {
    padding: SPACING.md,
    alignItems: 'center',
  },
  reportButton: {
    backgroundColor: COLORS.secondary,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    ...SHADOWS.brut,
  },
  reportButtonText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.white,
    textTransform: 'uppercase',
  },
  reportHint: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.meta,
    color: COLORS.mutedForeground,
    marginTop: SPACING.sm,
  },

  // Placeholder
  placeholder: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  placeholderText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.mutedForeground,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Pressed state
  pressed: {
    transform: ANIMATION.pressedTransform,
  },
});
