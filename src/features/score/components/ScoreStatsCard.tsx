/**
 * ScoreStatsCard Component
 *
 * Displays season-wide score statistics.
 * Shows pie chart of crew scores, trophy holder, and horns holder.
 */

import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../../config/theme';
import type { SeasonScoreStats } from '../../../types/models';

interface ScoreStatsCardProps {
  stats: SeasonScoreStats | null;
  loading?: boolean;
  testID?: string;
}

/**
 * Simple bar representation of crew scores
 * (React Native doesn't have native pie charts without external libs)
 */
function ScoreBar({
  name,
  color,
  percentage,
}: {
  name: string;
  color: string;
  percentage: number;
}) {
  return (
    <View style={styles.barRow}>
      <View style={[styles.barColorDot, { backgroundColor: color }]} />
      <Text style={styles.barName} numberOfLines={1}>
        {name}
      </Text>
      <View style={styles.barTrack}>
        <View
          style={[
            styles.barFill,
            { backgroundColor: color, width: `${Math.max(percentage, 5)}%` },
          ]}
        />
      </View>
      <Text style={styles.barPercent}>{percentage.toFixed(0)}%</Text>
    </View>
  );
}

export function ScoreStatsCard({ stats, loading, testID }: ScoreStatsCardProps) {
  if (loading) {
    return (
      <View style={styles.container} testID={testID}>
        <Text style={styles.title}>CREW SCORE CARD</Text>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!stats || stats.crewTotals.length === 0) {
    return (
      <View style={styles.container} testID={testID}>
        <Text style={styles.title}>CREW SCORE CARD</Text>
        <Text style={styles.emptyText}>No scores recorded this season</Text>
      </View>
    );
  }

  // Calculate total points (absolute values for percentages)
  const totalAbsPoints = stats.crewTotals.reduce(
    (sum, c) => sum + Math.abs(c.totalPoints),
    0
  );

  // Find trophy and horns holders
  const trophyHolder = stats.crewTotals.find(
    (c) => c.userId === stats.trophyHolder
  );
  const hornsHolder = stats.crewTotals.find(
    (c) => c.userId === stats.hornsHolder
  );

  return (
    <View style={styles.container} testID={testID}>
      <Text style={styles.title}>CREW SCORE CARD</Text>

      {/* Season Totals - Bar Chart */}
      <View style={styles.chartSection}>
        <Text style={styles.sectionTitle}>Season Totals</Text>
        <View style={styles.barChart}>
          {stats.crewTotals.map((crew) => {
            const percentage =
              totalAbsPoints > 0
                ? (Math.abs(crew.totalPoints) / totalAbsPoints) * 100
                : 0;
            return (
              <ScoreBar
                key={crew.userId}
                name={crew.userName}
                color={crew.userColor}
                percentage={percentage}
              />
            );
          })}
        </View>
      </View>

      {/* Trophy and Horns Holders */}
      <View style={styles.holdersSection}>
        {trophyHolder && trophyHolder.bookingWins > 0 && (
          <View style={styles.holderCard}>
            <Text style={styles.holderIcon}>{'\u{1F3C6}'}</Text>
            <Text style={styles.holderLabel}>Most Wins</Text>
            <Text style={styles.holderName}>{trophyHolder.userName}</Text>
            <Text style={styles.holderStat}>({trophyHolder.bookingWins})</Text>
          </View>
        )}

        {hornsHolder && hornsHolder.bookingLosses > 0 && (
          <View style={styles.holderCard}>
            <Text style={styles.holderIcon}>{'\u{1F608}'}</Text>
            <Text style={styles.holderLabel}>Most Losses</Text>
            <Text style={styles.holderName}>{hornsHolder.userName}</Text>
            <Text style={styles.holderStat}>({hornsHolder.bookingLosses})</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    marginBottom: SPACING.md,
  },
  loadingText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  emptyText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: SPACING.md,
  },
  chartSection: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  barChart: {
    gap: SPACING.sm,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  barColorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: SPACING.xs,
  },
  barName: {
    width: 70,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
  },
  barTrack: {
    flex: 1,
    height: 12,
    backgroundColor: COLORS.border,
    borderRadius: BORDER_RADIUS.sm,
    marginHorizontal: SPACING.xs,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: BORDER_RADIUS.sm,
  },
  barPercent: {
    width: 35,
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    textAlign: 'right',
  },
  holdersSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  holderCard: {
    alignItems: 'center',
  },
  holderIcon: {
    fontSize: FONT_SIZES.xxl,
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
  },
  holderStat: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
});
