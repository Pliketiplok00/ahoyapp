/**
 * ScoreCardPreview Component (Brutalist)
 *
 * Compact preview of score card for booking detail screen.
 * Shows top scorers and link to full view.
 *
 * @see docs/Ahoy_Screen_Map.md
 */

import { View, Text, StyleSheet, Pressable } from 'react-native';
import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
  FONTS,
  BORDERS,
  BORDER_RADIUS,
  SHADOWS,
  ANIMATION,
} from '../../../config/theme';
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

/**
 * Get initials from name
 */
function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function ScoreCardPreview({
  leaderboard,
  onViewAll,
  onAddScore,
  canAddScore = false,
  testID,
}: ScoreCardPreviewProps) {
  // Empty state
  if (leaderboard.length === 0) {
    return (
      <Pressable
        style={({ pressed }) => [styles.container, pressed && styles.pressed]}
        onPress={onViewAll}
        testID={testID}
      >
        <View style={styles.header}>
          <Text style={styles.title}>CREW SCORE CARD</Text>
          {canAddScore && onAddScore && (
            <Pressable
              style={({ pressed }) => [styles.addButtonSmall, pressed && styles.pressed]}
              onPress={(e) => {
                e.stopPropagation();
                onAddScore();
              }}
            >
              <Text style={styles.addButtonSmallText}>+ ADD</Text>
            </Pressable>
          )}
        </View>
        <Text style={styles.emptyText}>No scores yet</Text>
        <Text style={styles.viewAllText}>View All →</Text>
      </Pressable>
    );
  }

  // Get top 4 crew members to display
  const displayMembers = leaderboard.slice(0, 4);

  // Identify trophy holder (top) and horns holder (bottom with negative)
  const lowestScorer = leaderboard[leaderboard.length - 1];
  const showHorns = lowestScorer.totalPoints < 0;

  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={onViewAll}
      testID={testID}
    >
      <View style={styles.header}>
        <Text style={styles.title}>CREW SCORE CARD</Text>
        {canAddScore && onAddScore && (
          <Pressable
            style={({ pressed }) => [styles.addButtonSmall, pressed && styles.pressed]}
            onPress={(e) => {
              e.stopPropagation();
              onAddScore();
            }}
          >
            <Text style={styles.addButtonSmallText}>+ ADD</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.previewCard}>
        {displayMembers.map((member, index) => {
          const isTrophy = index === 0 && member.totalPoints > 0;
          const isHorns =
            showHorns &&
            member.userId === lowestScorer.userId &&
            member.totalPoints < 0;

          const icon = isTrophy ? '🏆' : isHorns ? '😈' : '';
          const initials = getInitials(member.userName);

          const pointsColor =
            member.totalPoints > 0
              ? COLORS.success
              : member.totalPoints < 0
                ? COLORS.destructive
                : COLORS.mutedForeground;

          return (
            <View key={member.userId}>
              <View style={styles.memberRow}>
                {/* SQUARE Avatar */}
                <View style={[styles.avatar, { backgroundColor: member.userColor }]}>
                  <Text style={styles.avatarText}>{initials}</Text>
                </View>

                {/* Name + Icon */}
                <Text style={styles.memberName} numberOfLines={1}>
                  {member.userName}
                  {icon ? ` ${icon}` : ''}
                </Text>

                {/* Points */}
                <Text style={[styles.memberPoints, { color: pointsColor }]}>
                  {formatPoints(member.totalPoints)}
                </Text>
              </View>
              {index < displayMembers.length - 1 && <View style={styles.divider} />}
            </View>
          );
        })}
      </View>

      <Text style={styles.viewAllText}>View All →</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // Container
  container: {
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    padding: SPACING.md,
    ...SHADOWS.brut,
  },
  pressed: {
    transform: ANIMATION.pressedTransform,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  title: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: TYPOGRAPHY.letterSpacing.widest,
  },

  // Empty state
  emptyText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.mutedForeground,
    fontStyle: 'italic',
    marginVertical: SPACING.sm,
  },

  // Preview Card
  previewCard: {
    backgroundColor: COLORS.muted,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    marginBottom: SPACING.sm,
  },

  // Member Row
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    gap: SPACING.sm,
  },
  divider: {
    height: BORDERS.thin,
    backgroundColor: COLORS.foreground,
    opacity: 0.2,
  },

  // SQUARE Avatar
  avatar: {
    width: 28,
    height: 28,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none, // SQUARE!
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.card,
    fontWeight: '700',
  },

  // Member info
  memberName: {
    flex: 1,
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.foreground,
  },
  memberPoints: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: '700',
  },

  // Add button
  addButtonSmall: {
    backgroundColor: COLORS.accent,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  addButtonSmallText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.foreground,
  },

  // View All
  viewAllText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.primary,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
});
