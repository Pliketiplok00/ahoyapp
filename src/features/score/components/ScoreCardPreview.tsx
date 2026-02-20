/**
 * ScoreCardPreview Component
 *
 * Compact preview of score card for booking detail screen.
 * Shows top scorer, lowest scorer, and link to full view.
 */

import { View, Text, StyleSheet, Pressable } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../../config/theme';
import type { BookingScoreSummary } from '../../../types/models';

interface ScoreCardPreviewProps {
  leaderboard: BookingScoreSummary[];
  onViewAll: () => void;
  onAddScore?: () => void;
  canAddScore?: boolean;
  testID?: string;
}

/**
 * Format points with sign
 */
function formatPoints(points: number): string {
  if (points > 0) return `+${points}`;
  return String(points);
}

export function ScoreCardPreview({
  leaderboard,
  onViewAll,
  onAddScore,
  canAddScore = false,
  testID,
}: ScoreCardPreviewProps) {
  if (leaderboard.length === 0) {
    return (
      <Pressable style={styles.container} onPress={onViewAll} testID={testID}>
        <Text style={styles.title}>Crew Score Card</Text>
        <Text style={styles.emptyText}>No scores yet</Text>
        {canAddScore && onAddScore && (
          <Pressable style={styles.addButton} onPress={onAddScore}>
            <Text style={styles.addButtonText}>+ Add Score</Text>
          </Pressable>
        )}
      </Pressable>
    );
  }

  // Get top 4 crew members to display
  const displayMembers = leaderboard.slice(0, 4);

  // Identify trophy holder (top) and horns holder (bottom with negative)
  const topScorer = leaderboard[0];
  const lowestScorer = leaderboard[leaderboard.length - 1];
  const showHorns = lowestScorer.totalPoints < 0;

  return (
    <Pressable style={styles.container} onPress={onViewAll} testID={testID}>
      <View style={styles.header}>
        <Text style={styles.title}>Crew Score Card</Text>
        {canAddScore && onAddScore && (
          <Pressable style={styles.addButtonSmall} onPress={onAddScore}>
            <Text style={styles.addButtonSmallText}>+ Add</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.previewGrid}>
        {displayMembers.map((member, index) => {
          const isTrophy =
            index === 0 && member.totalPoints > 0;
          const isHorns =
            showHorns &&
            member.userId === lowestScorer.userId &&
            member.totalPoints < 0;

          let icon = '';
          if (isTrophy) icon = '\u{1F3C6}';
          else if (isHorns) icon = '\u{1F608}';

          return (
            <View key={member.userId} style={styles.memberRow}>
              <Text style={styles.memberIcon}>
                {icon || '\u{1F464}'}
              </Text>
              <Text style={styles.memberName} numberOfLines={1}>
                {member.userName}
              </Text>
              <Text
                style={[
                  styles.memberPoints,
                  {
                    color:
                      member.totalPoints > 0
                        ? COLORS.success
                        : member.totalPoints < 0
                        ? COLORS.error
                        : COLORS.textMuted,
                  },
                ]}
              >
                {formatPoints(member.totalPoints)}
              </Text>
            </View>
          );
        })}
      </View>

      <Pressable style={styles.viewAllButton} onPress={onViewAll}>
        <Text style={styles.viewAllText}>View All →</Text>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    marginVertical: SPACING.sm,
  },
  previewGrid: {
    gap: SPACING.xs,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  memberIcon: {
    fontSize: FONT_SIZES.md,
    width: 24,
    textAlign: 'center',
  },
  memberName: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
    marginLeft: SPACING.xs,
  },
  memberPoints: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  addButton: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.coral,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.sm,
  },
  addButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.white,
  },
  addButtonSmall: {
    backgroundColor: `${COLORS.coral}15`,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
  },
  addButtonSmallText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.coral,
  },
  viewAllButton: {
    alignSelf: 'center',
    paddingVertical: SPACING.sm,
    marginTop: SPACING.xs,
  },
  viewAllText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.coral,
    fontWeight: '500',
  },
});
