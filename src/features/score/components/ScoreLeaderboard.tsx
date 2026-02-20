/**
 * ScoreLeaderboard Component
 *
 * Displays ranked list of crew members by score for a booking.
 */

import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../../config/theme';
import type { BookingScoreSummary } from '../../../types/models';

interface ScoreLeaderboardProps {
  leaderboard: BookingScoreSummary[];
  compact?: boolean;
  testID?: string;
}

/**
 * Get rank icon based on position
 */
export function getRankIcon(index: number, totalPoints: number): string {
  if (index === 0 && totalPoints > 0) return '\u{1F3C6}'; // Trophy
  if (index === 1) return '\u{1F948}'; // Silver medal
  if (index === 2) return '\u{1F949}'; // Bronze medal
  // Last place with negative points gets horns
  return '';
}

/**
 * Get rank icon for last place (horns)
 */
export function getLastPlaceIcon(
  index: number,
  leaderboardLength: number,
  totalPoints: number
): string {
  if (index === leaderboardLength - 1 && totalPoints < 0) {
    return '\u{1F608}'; // Horns/devil
  }
  return '';
}

/**
 * Format points with sign
 */
export function formatPoints(points: number): string {
  if (points > 0) return `+${points}`;
  return String(points);
}

/**
 * Get points color based on value
 */
export function getPointsColor(points: number): string {
  if (points > 0) return COLORS.success;
  if (points < 0) return COLORS.error;
  return COLORS.textMuted;
}

export function ScoreLeaderboard({
  leaderboard,
  compact = false,
  testID,
}: ScoreLeaderboardProps) {
  if (leaderboard.length === 0) {
    return (
      <View style={styles.emptyContainer} testID={testID}>
        <Text style={styles.emptyText}>No scores yet</Text>
      </View>
    );
  }

  const displayItems = compact ? leaderboard.slice(0, 4) : leaderboard;

  return (
    <View style={styles.container} testID={testID}>
      {displayItems.map((item, index) => {
        const rankIcon = getRankIcon(index, item.totalPoints);
        const lastPlaceIcon = getLastPlaceIcon(
          index,
          leaderboard.length,
          item.totalPoints
        );
        const displayIcon = rankIcon || lastPlaceIcon;

        return (
          <View
            key={item.userId}
            style={[styles.row, compact && styles.compactRow]}
          >
            <View style={styles.rankSection}>
              {displayIcon ? (
                <Text style={styles.rankIcon}>{displayIcon}</Text>
              ) : (
                <Text style={styles.rankNumber}>{index + 1}.</Text>
              )}
            </View>

            <View
              style={[styles.colorDot, { backgroundColor: item.userColor }]}
            />

            <Text
              style={[styles.userName, compact && styles.compactUserName]}
              numberOfLines={1}
            >
              {item.userName}
            </Text>

            <Text
              style={[
                styles.points,
                { color: getPointsColor(item.totalPoints) },
              ]}
            >
              {formatPoints(item.totalPoints)}
              {!compact && ' pts'}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING.xs,
  },
  emptyContainer: {
    padding: SPACING.md,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
  },
  compactRow: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.xs,
    backgroundColor: 'transparent',
  },
  rankSection: {
    width: 28,
    alignItems: 'center',
  },
  rankIcon: {
    fontSize: FONT_SIZES.lg,
  },
  rankNumber: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SPACING.sm,
  },
  userName: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  compactUserName: {
    fontSize: FONT_SIZES.sm,
  },
  points: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
});
