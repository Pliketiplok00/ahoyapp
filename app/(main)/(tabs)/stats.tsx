/**
 * Stats Screen (Season Insights) - Brutalist Design
 *
 * Overview of season statistics: total APA, expenses,
 * tips, top merchants, booking comparisons, score card.
 */

import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { Screen } from '../../../src/components/layout';
import { ProgressBar } from '../../../src/components/ui/ProgressBar';
import { useSeasonStats } from '../../../src/features/stats';
import { useSeason } from '../../../src/features/season/hooks/useSeason';
import {
  COLORS,
  SHADOWS,
  BORDERS,
  SPACING,
  FONTS,
  TYPOGRAPHY,
  BORDER_RADIUS,
  ANIMATION,
} from '../../../src/config/theme';

export default function StatsScreen() {
  const { stats, isLoading, error, refresh } = useSeasonStats();
  const { currentSeason, crewMembers } = useSeason();

  // Loading state
  if (isLoading) {
    return (
      <Screen noPadding edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>STATISTIKA</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
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
          <Text style={styles.headerTitle}>STATISTIKA</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
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
      </Screen>
    );
  }

  // No season state
  if (!currentSeason || !stats) {
    return (
      <Screen noPadding edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>STATISTIKA</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📊</Text>
          <Text style={styles.emptyTitle}>NEMA SEZONE</Text>
          <Text style={styles.emptyText}>
            Kreiraj ili se pridruži sezoni da vidiš statistiku.
          </Text>
        </View>
      </Screen>
    );
  }

  // Season name
  const seasonName = currentSeason.name?.toUpperCase() || 'SEZONA 2026';

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
    <Screen noPadding edges={['top']}>
      {/* Hero Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>STATISTIKA</Text>
        <Text style={styles.headerSubtitle}>{seasonName}</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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

        {/* Totals Row */}
        <View style={styles.totalsRow}>
          {/* Revenue (Total APA) - Pink */}
          <View style={[styles.totalCard, styles.totalCardPink]}>
            <Text style={styles.totalLabel}>PRIHOD</Text>
            <Text style={styles.totalValue}>{stats.formattedTotalApa}</Text>
            <Text style={styles.totalMeta}>{stats.totalBookings} BOOKINGA</Text>
          </View>

          {/* Tips - Accent */}
          <View style={[styles.totalCard, styles.totalCardAccent]}>
            <Text style={[styles.totalLabel, styles.totalLabelDark]}>NAPOJNICE</Text>
            <Text style={[styles.totalValue, styles.totalValueDark]}>{stats.formattedTotalTips}</Text>
            <Text style={[styles.totalMeta, styles.totalMetaDark]}>Ø {stats.formattedAverageTip}</Text>
          </View>

          {/* Expenses - Card (dark text on white) */}
          <View style={[styles.totalCard, styles.totalCardWhite]}>
            <Text style={[styles.totalLabel, styles.totalLabelDark]}>TROŠKOVI</Text>
            <Text style={[styles.totalValue, styles.totalValueDark]}>{stats.formattedTotalExpenses}</Text>
            <Text style={[styles.totalMeta, styles.totalMetaDark]}>{stats.topMerchants.reduce((sum, m) => sum + m.count, 0)} RAČUNA</Text>
          </View>
        </View>

        {/* Highlights Card */}
        {(stats.bestTipBooking || stats.lowestSpendBooking) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>HIGHLIGHTS</Text>
            <View style={styles.highlightsGrid}>
              {stats.bestTipBooking && (
                <View style={styles.highlightItem}>
                  <Text style={styles.highlightIcon}>🏆</Text>
                  <Text style={styles.highlightLabel}>BEST TIP</Text>
                  <Text style={styles.highlightValue}>{stats.bestTipBooking.formattedValue}</Text>
                  <Text style={styles.highlightDates}>{stats.bestTipBooking.dates}</Text>
                </View>
              )}
              {stats.lowestSpendBooking && (
                <View style={styles.highlightItem}>
                  <Text style={styles.highlightIcon}>💎</Text>
                  <Text style={styles.highlightLabel}>LOWEST SPEND</Text>
                  <Text style={styles.highlightValue}>{stats.lowestSpendBooking.formattedValue}</Text>
                  <Text style={styles.highlightDates}>{stats.lowestSpendBooking.dates}</Text>
                </View>
              )}
              <View style={styles.highlightItem}>
                <Text style={styles.highlightIcon}>📅</Text>
                <Text style={styles.highlightLabel}>COMPLETED</Text>
                <Text style={styles.highlightValue}>{stats.completedBookings}</Text>
                <Text style={styles.highlightDates}>OD {stats.totalBookings} UKUPNO</Text>
              </View>
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
                    <Text style={styles.holderIcon}>🏆</Text>
                    <Text style={styles.holderLabel}>TROPHY</Text>
                    <Text style={styles.holderName}>
                      {crewMembers.find((c) => c.id === stats.scoreStats?.trophyHolder)?.name || 'Unknown'}
                    </Text>
                  </View>
                )}
                {stats.scoreStats?.hornsHolder && (
                  <View style={styles.holderCard}>
                    <Text style={styles.holderIcon}>😈</Text>
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
    </Screen>
  );
}

const styles = StyleSheet.create({
  // Hero Header (matches Home/Bookings pattern)
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
    opacity: 0.7,
    textTransform: 'uppercase',
    letterSpacing: TYPOGRAPHY.letterSpacing.widest,
    marginTop: SPACING.xs,
  },
  content: {
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

  // Totals Row
  totalsRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  totalCard: {
    flex: 1,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    padding: SPACING.sm,
    alignItems: 'center',
    ...SHADOWS.brutSm,
  },
  totalCardPink: {
    backgroundColor: COLORS.pink,
  },
  totalCardAccent: {
    backgroundColor: COLORS.accent,
  },
  totalCardWhite: {
    backgroundColor: COLORS.card,
  },
  totalLabel: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.meta,
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  totalLabelDark: {
    color: COLORS.foreground,
  },
  totalValue: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.white,
    marginTop: SPACING.xs,
  },
  totalValueDark: {
    color: COLORS.foreground,
  },
  totalMeta: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.meta,
    color: COLORS.white,
    opacity: 0.8,
    marginTop: SPACING.xxs,
  },
  totalMetaDark: {
    color: COLORS.foreground,
    opacity: 0.7,
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
