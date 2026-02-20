/**
 * ScoreHistory Component
 *
 * Displays chronological list of score entries.
 */

import { View, Text, StyleSheet, SectionList } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../../config/theme';
import { formatDate, formatTime } from '../../../utils/formatting';
import type { ScoreEntry, User } from '../../../types/models';

interface ScoreHistoryProps {
  entries: ScoreEntry[];
  crewMembers: User[];
  testID?: string;
}

interface HistorySection {
  title: string;
  data: ScoreEntry[];
}

/**
 * Get user info by ID
 */
function getUserInfo(
  userId: string,
  crewMembers: User[]
): { name: string; color: string } {
  const user = crewMembers.find((m) => m.id === userId);
  return {
    name: user?.name || 'Unknown',
    color: user?.color || COLORS.textMuted,
  };
}

/**
 * Group entries by date
 */
export function groupEntriesByDate(entries: ScoreEntry[]): HistorySection[] {
  const groups = new Map<string, ScoreEntry[]>();
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  for (const entry of entries) {
    const entryDate = entry.createdAt.toDate();
    let dateKey: string;

    if (isSameDay(entryDate, today)) {
      dateKey = 'Today';
    } else if (isSameDay(entryDate, yesterday)) {
      dateKey = 'Yesterday';
    } else {
      dateKey = formatDate(entryDate);
    }

    const current = groups.get(dateKey) || [];
    current.push(entry);
    groups.set(dateKey, current);
  }

  return Array.from(groups.entries()).map(([title, data]) => ({
    title,
    data,
  }));
}

/**
 * Check if two dates are the same day
 */
function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Format points with sign and color
 */
export function formatPointsDisplay(points: number): {
  text: string;
  color: string;
} {
  if (points > 0) {
    return { text: `+${points}`, color: COLORS.success };
  }
  return { text: String(points), color: COLORS.error };
}

export function ScoreHistory({
  entries,
  crewMembers,
  testID,
}: ScoreHistoryProps) {
  if (entries.length === 0) {
    return (
      <View style={styles.emptyContainer} testID={testID}>
        <Text style={styles.emptyText}>No score history yet</Text>
      </View>
    );
  }

  const sections = groupEntriesByDate(entries);

  const renderItem = ({ item }: { item: ScoreEntry }) => {
    const user = getUserInfo(item.toUserId, crewMembers);
    const pointsDisplay = formatPointsDisplay(item.points);
    const time = formatTime(item.createdAt.toDate());

    return (
      <View style={styles.entryRow}>
        <View style={styles.entryMain}>
          <View style={[styles.colorDot, { backgroundColor: user.color }]} />
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={[styles.points, { color: pointsDisplay.color }]}>
            {pointsDisplay.text}
          </Text>
        </View>

        {item.reason ? (
          <Text style={styles.reason} numberOfLines={2}>
            "{item.reason}"
          </Text>
        ) : null}

        <Text style={styles.time}>{time}</Text>
      </View>
    );
  };

  const renderSectionHeader = ({
    section,
  }: {
    section: HistorySection;
  }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
    </View>
  );

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      renderSectionHeader={renderSectionHeader}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      testID={testID}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING.xs,
  },
  emptyContainer: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  sectionHeader: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    marginTop: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  entryRow: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  entryMain: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: SPACING.sm,
  },
  userName: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  points: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
  },
  reason: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginTop: SPACING.xs,
    marginLeft: SPACING.lg,
  },
  time: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
    marginLeft: SPACING.lg,
  },
});
