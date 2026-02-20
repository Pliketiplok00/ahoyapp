/**
 * ExpenseSummary Component
 *
 * Shows expense totals and APA progress for a booking.
 */

import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../../config/theme';
import { formatCurrency } from '../../../utils/formatting';
import { EXPENSE_CATEGORIES, type ExpenseCategory } from '../../../config/expenses';

interface ExpenseSummaryProps {
  totalExpenses: number;
  apaTotal: number;
  byCategory: Record<string, number>;
  testID?: string;
}

/**
 * Calculate APA usage percentage
 */
export function calculateApaUsage(spent: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(100, Math.max(0, (spent / total) * 100));
}

/**
 * Get progress bar color based on usage
 */
export function getProgressColor(percentage: number): string {
  if (percentage >= 90) return COLORS.error;
  if (percentage >= 75) return COLORS.warning;
  return COLORS.sageGreen;
}

export function ExpenseSummary({
  totalExpenses,
  apaTotal,
  byCategory,
  testID,
}: ExpenseSummaryProps) {
  const apaUsage = calculateApaUsage(totalExpenses, apaTotal);
  const progressColor = getProgressColor(apaUsage);
  const remaining = Math.max(0, apaTotal - totalExpenses);

  return (
    <View style={styles.container} testID={testID}>
      {/* APA Progress */}
      <View style={styles.apaSection}>
        <View style={styles.apaHeader}>
          <Text style={styles.apaLabel}>APA Budget</Text>
          <Text style={styles.apaTotal}>{formatCurrency(apaTotal)}</Text>
        </View>

        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${apaUsage}%`, backgroundColor: progressColor },
            ]}
          />
        </View>

        <View style={styles.apaStats}>
          <View style={styles.apaStat}>
            <Text style={styles.apaStatLabel}>Spent</Text>
            <Text style={[styles.apaStatValue, { color: progressColor }]}>
              {formatCurrency(totalExpenses)}
            </Text>
          </View>
          <View style={styles.apaStat}>
            <Text style={styles.apaStatLabel}>Remaining</Text>
            <Text style={styles.apaStatValue}>{formatCurrency(remaining)}</Text>
          </View>
          <View style={styles.apaStat}>
            <Text style={styles.apaStatLabel}>Used</Text>
            <Text style={styles.apaStatValue}>{apaUsage.toFixed(0)}%</Text>
          </View>
        </View>
      </View>

      {/* Category Breakdown */}
      {Object.keys(byCategory).length > 0 && (
        <View style={styles.categorySection}>
          <Text style={styles.categoryTitle}>By Category</Text>
          <View style={styles.categoryList}>
            {EXPENSE_CATEGORIES.map((cat) => {
              const amount = byCategory[cat.id] || 0;
              if (amount === 0) return null;

              const percentage =
                totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;

              return (
                <View key={cat.id} style={styles.categoryRow}>
                  <View style={styles.categoryInfo}>
                    <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                    <Text style={styles.categoryName}>{cat.label}</Text>
                  </View>
                  <View style={styles.categoryStats}>
                    <Text style={styles.categoryAmount}>
                      {formatCurrency(amount)}
                    </Text>
                    <Text style={styles.categoryPercent}>
                      {percentage.toFixed(0)}%
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  // APA Section
  apaSection: {
    marginBottom: SPACING.md,
  },
  apaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  apaLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  apaTotal: {
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
  apaStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  apaStat: {
    alignItems: 'center',
  },
  apaStatLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  apaStatValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  // Category Section
  categorySection: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.md,
  },
  categoryTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
  },
  categoryList: {
    gap: SPACING.xs,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryEmoji: {
    fontSize: FONT_SIZES.md,
    marginRight: SPACING.xs,
  },
  categoryName: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  categoryStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  categoryAmount: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  categoryPercent: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    minWidth: 35,
    textAlign: 'right',
  },
});
