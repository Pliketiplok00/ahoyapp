/**
 * Stats Screen (Season Insights)
 *
 * Overview of season statistics: total APA, expenses,
 * tips, top merchants, booking comparisons, score card.
 */

import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { Screen } from '../../../src/components/layout';
import { useSeasonStats } from '../../../src/features/stats';
import { useSeason } from '../../../src/features/season/hooks/useSeason';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../../src/config/theme';

export default function StatsScreen() {
  const { stats, isLoading, error, refresh } = useSeasonStats();
  const { currentSeason, crewMembers } = useSeason();

  // Loading state
  if (isLoading) {
    return (
      <Screen noPadding edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Stats</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.coral} />
          <Text style={styles.loadingText}>Učitavam statistiku...</Text>
        </View>
      </Screen>
    );
  }

  // Error state
  if (error) {
    return (
      <Screen noPadding edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Stats</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={refresh}>
            <Text style={styles.retryButtonText}>Pokušaj ponovno</Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  // No season state
  if (!currentSeason || !stats) {
    return (
      <Screen noPadding edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Stats</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📊</Text>
          <Text style={styles.emptyTitle}>Nema sezone</Text>
          <Text style={styles.emptyText}>
            Kreiraj ili se pridruži sezoni da vidiš statistiku.
          </Text>
        </View>
      </Screen>
    );
  }

  // Season name
  const seasonName = currentSeason.name?.toUpperCase() || 'SEZONA 2026';

  return (
    <Screen noPadding edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Stats</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Season Overview */}
        <View style={styles.seasonCard}>
          <Text style={styles.seasonTitle}>{seasonName}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.workDays}</Text>
              <Text style={styles.statLabel}>Radni dani</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.formattedAverageTip}</Text>
              <Text style={styles.statLabel}>Prosječna napojnica</Text>
            </View>
          </View>

          {/* Season Progress */}
          <View style={styles.progressSection}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${stats.seasonProgress}%` },
                ]}
              />
            </View>
            <View style={styles.progressLabels}>
              <Text style={styles.progressText}>
                {stats.seasonProgress}% sezone
              </Text>
              <Text style={styles.progressText}>
                {stats.daysRemaining} dana ostalo
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Stats Grid */}
        <View style={styles.quickStats}>
          <View style={styles.quickStatCard}>
            <Text style={styles.quickStatIcon}>📋</Text>
            <Text style={styles.quickStatValue}>{stats.totalBookings}</Text>
            <Text style={styles.quickStatLabel}>Bookings</Text>
          </View>
          <View style={styles.quickStatCard}>
            <Text style={styles.quickStatIcon}>🧾</Text>
            <Text style={styles.quickStatValue}>{stats.topMerchants.reduce((sum, m) => sum + m.count, 0)}</Text>
            <Text style={styles.quickStatLabel}>Expenses</Text>
          </View>
          <View style={styles.quickStatCard}>
            <Text style={styles.quickStatIcon}>💰</Text>
            <Text style={styles.quickStatValue}>{stats.formattedTotalApa}</Text>
            <Text style={styles.quickStatLabel}>Total APA</Text>
          </View>
          <View style={styles.quickStatCard}>
            <Text style={styles.quickStatIcon}>💵</Text>
            <Text style={styles.quickStatValue}>{stats.formattedTotalTips}</Text>
            <Text style={styles.quickStatLabel}>Total Tips</Text>
          </View>
        </View>

        {/* Top Bookings */}
        {(stats.bestTipBooking || stats.lowestSpendBooking) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>TOP BOOKINGS</Text>
            <View style={styles.topBookingsRow}>
              {stats.bestTipBooking && (
                <View style={styles.topBookingCard}>
                  <Text style={styles.topBookingIcon}>🏆</Text>
                  <Text style={styles.topBookingLabel}>{stats.bestTipBooking.label}</Text>
                  <Text style={styles.topBookingValue}>{stats.bestTipBooking.formattedValue}</Text>
                  <Text style={styles.topBookingDates}>{stats.bestTipBooking.dates}</Text>
                </View>
              )}
              {stats.lowestSpendBooking && (
                <View style={styles.topBookingCard}>
                  <Text style={styles.topBookingIcon}>💎</Text>
                  <Text style={styles.topBookingLabel}>{stats.lowestSpendBooking.label}</Text>
                  <Text style={styles.topBookingValue}>{stats.lowestSpendBooking.formattedValue}</Text>
                  <Text style={styles.topBookingDates}>{stats.lowestSpendBooking.dates}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Top Merchants */}
        {stats.topMerchants.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>TOP MERCHANTS</Text>
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
        )}

        {/* Score Card Summary */}
        {stats.scoreStats && stats.scoreStats.crewTotals.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>CREW SCORE CARD</Text>

            {/* Trophy & Horns */}
            {(stats.scoreStats.trophyHolder || stats.scoreStats.hornsHolder) && (
              <View style={styles.holdersRow}>
                {stats.scoreStats.trophyHolder && (
                  <View style={styles.holderCard}>
                    <Text style={styles.holderIcon}>🏆</Text>
                    <Text style={styles.holderLabel}>Trophy Holder</Text>
                    <Text style={styles.holderName}>
                      {crewMembers.find((c) => c.id === stats.scoreStats?.trophyHolder)?.name || 'Unknown'}
                    </Text>
                  </View>
                )}
                {stats.scoreStats.hornsHolder && (
                  <View style={styles.holderCard}>
                    <Text style={styles.holderIcon}>😈</Text>
                    <Text style={styles.holderLabel}>Horns Holder</Text>
                    <Text style={styles.holderName}>
                      {crewMembers.find((c) => c.id === stats.scoreStats?.hornsHolder)?.name || 'Unknown'}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Leaderboard */}
            <View style={styles.scoreLeaderboard}>
              {stats.scoreStats.crewTotals.map((crew) => (
                <View key={crew.userId} style={styles.scoreRow}>
                  <View style={[styles.crewDot, { backgroundColor: crew.userColor }]} />
                  <Text style={styles.scoreName}>{crew.userName}</Text>
                  <Text
                    style={[
                      styles.scorePoints,
                      crew.totalPoints > 0 ? styles.positivePoints : crew.totalPoints < 0 ? styles.negativePoints : null,
                    ]}
                  >
                    {crew.totalPoints > 0 ? '+' : ''}{crew.totalPoints}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Empty state when no data */}
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
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.coral,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    paddingTop: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  content: {
    flex: 1,
  },

  // Loading & Error & Empty
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    borderRadius: BORDER_RADIUS.md,
  },
  retryButtonText: {
    color: COLORS.white,
    fontWeight: '600',
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
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
    textAlign: 'center',
  },

  // Season Card
  seasonCard: {
    backgroundColor: COLORS.warmYellow,
    padding: SPACING.lg,
  },
  seasonTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
    letterSpacing: 0.5,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  statValue: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },

  // Progress
  progressSection: {
    marginTop: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.sageGreen,
    borderRadius: 4,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.xs,
  },
  progressText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },

  // Quick Stats
  quickStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  quickStatCard: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
  },
  quickStatIcon: {
    fontSize: 28,
    marginBottom: SPACING.xs,
  },
  quickStatValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  quickStatLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },

  // Section
  section: {
    marginTop: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    marginBottom: SPACING.md,
  },

  // Top Bookings
  topBookingsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  topBookingCard: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
  },
  topBookingIcon: {
    fontSize: 24,
    marginBottom: SPACING.xs,
  },
  topBookingLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  topBookingValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: SPACING.xs,
  },
  topBookingDates: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },

  // Merchants
  merchantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  merchantRank: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(232, 93, 59, 0.15)', // coral with opacity
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  merchantRankText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.coral,
  },
  merchantInfo: {
    flex: 1,
  },
  merchantName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  merchantCount: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  merchantTotal: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },

  // Score Card
  holdersRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  holderCard: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
  },
  holderIcon: {
    fontSize: 32,
    marginBottom: SPACING.xs,
  },
  holderLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  holderName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: SPACING.xs,
  },
  scoreLeaderboard: {
    gap: SPACING.xs,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  crewDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SPACING.sm,
  },
  scoreName: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
  },
  scorePoints: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  positivePoints: {
    color: COLORS.success,
  },
  negativePoints: {
    color: COLORS.error,
  },

  // Placeholder
  placeholder: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
