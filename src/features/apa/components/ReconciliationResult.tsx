/**
 * ReconciliationResult Component
 *
 * Displays reconciliation calculation results.
 * Shows APA total, expenses, expected cash, and difference.
 *
 * @example
 * <ReconciliationResult
 *   apaTotal={1500}
 *   expenseTotal={800}
 *   expectedCash={700}
 *   actualCash={700}
 *   difference={0}
 *   isBalanced={true}
 * />
 */

import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../../config/theme';
import { formatCurrency } from '../../../utils/formatting';

/**
 * Get the color for the difference based on balance status
 */
export function getDifferenceColor(isBalanced: boolean, difference: number): string {
  if (isBalanced) return COLORS.success;
  return difference > 0 ? COLORS.success : COLORS.error;
}

/**
 * Get the label for the difference
 */
export function getDifferenceLabel(isBalanced: boolean, difference: number): string {
  if (isBalanced) return 'Balanced';
  return difference > 0 ? 'Surplus' : 'Shortage';
}

/**
 * Check if a difference is considered balanced (near zero)
 */
export function isAmountBalanced(difference: number): boolean {
  return Math.abs(difference) < 0.01;
}

interface ReconciliationResultProps {
  apaTotal: number;
  expenseTotal: number;
  expectedCash: number;
  actualCash: number;
  difference: number;
  isBalanced: boolean;
}

export function ReconciliationResult({
  apaTotal,
  expenseTotal,
  expectedCash,
  actualCash,
  difference,
  isBalanced,
}: ReconciliationResultProps) {
  const differenceColor = isBalanced
    ? COLORS.success
    : difference > 0
    ? COLORS.success
    : COLORS.error;

  const differenceLabel = isBalanced
    ? 'Balanced'
    : difference > 0
    ? 'Surplus'
    : 'Shortage';

  return (
    <View style={styles.container}>
      {/* Summary Header */}
      <View style={[styles.statusBanner, { backgroundColor: isBalanced ? COLORS.success : COLORS.warning }]}>
        <Text style={styles.statusEmoji}>{isBalanced ? '✓' : '!'}</Text>
        <Text style={styles.statusText}>
          {isBalanced ? 'Cash Reconciled' : 'Difference Found'}
        </Text>
      </View>

      {/* Calculation Breakdown */}
      <View style={styles.breakdown}>
        {/* APA Total */}
        <View style={styles.row}>
          <Text style={styles.label}>APA Received</Text>
          <Text style={styles.value}>{formatCurrency(apaTotal)}</Text>
        </View>

        {/* Expenses */}
        <View style={styles.row}>
          <Text style={styles.label}>Expenses</Text>
          <Text style={[styles.value, styles.negative]}>- {formatCurrency(expenseTotal)}</Text>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Expected Cash */}
        <View style={styles.row}>
          <Text style={styles.label}>Expected Cash</Text>
          <Text style={[styles.value, styles.expected]}>{formatCurrency(expectedCash)}</Text>
        </View>

        {/* Actual Cash */}
        <View style={styles.row}>
          <Text style={styles.label}>Actual Cash</Text>
          <Text style={[styles.value, styles.actual]}>{formatCurrency(actualCash)}</Text>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Difference */}
        <View style={styles.row}>
          <Text style={styles.differenceLabel}>{differenceLabel}</Text>
          <Text style={[styles.differenceValue, { color: differenceColor }]}>
            {difference >= 0 ? '+' : ''}{formatCurrency(difference)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    gap: SPACING.xs,
  },
  statusEmoji: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.white,
    fontWeight: '700',
  },
  statusText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.white,
  },
  breakdown: {
    padding: SPACING.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  label: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  value: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  negative: {
    color: COLORS.error,
  },
  expected: {
    fontWeight: '600',
  },
  actual: {
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.xs,
  },
  differenceLabel: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  differenceValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
  },
});
