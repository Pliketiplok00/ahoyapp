/**
 * ExpenseItem Component
 *
 * Row item for displaying a single expense in a list.
 * Shows category, merchant, amount, and sync status.
 */

import { View, Text, StyleSheet, Pressable } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../../config/theme';
import { formatCurrency, formatDate } from '../../../utils/formatting';
import { getCategoryEmoji } from '../../../config/expenses';
import type { Expense } from '../../../types/models';

interface ExpenseItemProps {
  expense: Expense;
  onPress?: (expense: Expense) => void;
  testID?: string;
}

/**
 * Get sync status indicator
 */
export function getSyncIndicator(
  syncStatus: Expense['syncStatus']
): { icon: string; color: string } {
  switch (syncStatus) {
    case 'synced':
      return { icon: '\u{2705}', color: COLORS.success }; // Green check
    case 'pending':
      return { icon: '\u{1F504}', color: COLORS.warning }; // Sync icon
    case 'error':
      return { icon: '\u{26A0}', color: COLORS.error }; // Warning
    default:
      return { icon: '', color: COLORS.textMuted };
  }
}

/**
 * Format expense type badge
 */
export function getTypeBadge(type: Expense['type']): {
  label: string;
  color: string;
} {
  switch (type) {
    case 'receipt':
      return { label: 'Receipt', color: COLORS.sageGreen };
    case 'no-receipt':
      return { label: 'Manual', color: COLORS.steelBlue };
    default:
      return { label: '', color: COLORS.textMuted };
  }
}

export function ExpenseItem({ expense, onPress, testID }: ExpenseItemProps) {
  const categoryEmoji = getCategoryEmoji(expense.category);
  const syncIndicator = getSyncIndicator(expense.syncStatus);
  const typeBadge = getTypeBadge(expense.type);
  const date = expense.date.toDate();

  const handlePress = () => {
    if (onPress) {
      onPress(expense);
    }
  };

  return (
    <Pressable
      style={styles.container}
      onPress={handlePress}
      disabled={!onPress}
      testID={testID}
    >
      {/* Category Icon */}
      <View style={styles.iconContainer}>
        <Text style={styles.categoryIcon}>{categoryEmoji}</Text>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.merchant} numberOfLines={1}>
            {expense.merchant || 'Unknown merchant'}
          </Text>
          <Text style={styles.amount}>{formatCurrency(expense.amount)}</Text>
        </View>

        <View style={styles.bottomRow}>
          <Text style={styles.date}>{formatDate(date)}</Text>
          {expense.note && (
            <Text style={styles.note} numberOfLines={1}>
              {expense.note}
            </Text>
          )}
        </View>
      </View>

      {/* Status Indicators */}
      <View style={styles.statusContainer}>
        {/* Type Badge */}
        <View style={[styles.typeBadge, { backgroundColor: `${typeBadge.color}20` }]}>
          <Text style={[styles.typeBadgeText, { color: typeBadge.color }]}>
            {typeBadge.label}
          </Text>
        </View>

        {/* Sync Status */}
        {expense.syncStatus !== 'synced' && (
          <Text style={styles.syncIcon}>{syncIndicator.icon}</Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  categoryIcon: {
    fontSize: 20,
  },
  content: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  merchant: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: SPACING.sm,
  },
  amount: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginRight: SPACING.sm,
  },
  note: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    flex: 1,
  },
  statusContainer: {
    alignItems: 'flex-end',
    gap: 4,
  },
  typeBadge: {
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  typeBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
  syncIcon: {
    fontSize: FONT_SIZES.sm,
  },
});
