/**
 * SeasonProgress Component
 *
 * Displays season progress as a visual progress bar with stats.
 */

import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../../config/theme';

interface SeasonProgressProps {
  completedBookings: number;
  totalBookings: number;
  testID?: string;
}

/**
 * Calculate season progress percentage
 */
export function calculateSeasonProgress(
  completed: number,
  total: number
): number {
  if (total <= 0) return 0;
  return Math.min(100, Math.max(0, (completed / total) * 100));
}

/**
 * Get progress bar color based on percentage
 */
export function getProgressColor(percentage: number): string {
  if (percentage >= 90) return COLORS.success;
  if (percentage >= 50) return COLORS.sageGreen;
  return COLORS.steelBlue;
}

export function SeasonProgress({
  completedBookings,
  totalBookings,
  testID,
}: SeasonProgressProps) {
  const progress = calculateSeasonProgress(completedBookings, totalBookings);
  const progressColor = getProgressColor(progress);
  const bookingsLeft = Math.max(0, totalBookings - completedBookings);

  if (totalBookings === 0) {
    return null;
  }

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.header}>
        <Text style={styles.title}>Season Progress</Text>
        <Text style={styles.percentage}>{progress.toFixed(0)}%</Text>
      </View>

      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${progress}%`,
              backgroundColor: progressColor,
            },
          ]}
        />
      </View>

      <View style={styles.stats}>
        <Text style={styles.statText}>
          {completedBookings} completed
        </Text>
        <Text style={styles.statText}>
          {bookingsLeft} remaining
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  percentage: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  progressBar: {
    height: 12,
    backgroundColor: COLORS.border,
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: BORDER_RADIUS.full,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
});
