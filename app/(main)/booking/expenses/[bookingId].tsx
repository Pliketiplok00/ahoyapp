/**
 * APA Overview Screen
 *
 * Shows expense list, APA summary, and quick actions
 * for adding new expenses.
 */

import { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../../../src/config/theme';
import { Screen } from '../../../../src/components/layout';
import { useBooking } from '../../../../src/features/booking/hooks/useBooking';
import { useExpenses } from '../../../../src/features/expense/hooks/useExpenses';
import { ExpenseItem, ExpenseSummary } from '../../../../src/features/expense/components';
import { formatDate } from '../../../../src/utils/formatting';
import type { Expense } from '../../../../src/types/models';

/**
 * Get date label for expense grouping
 * Returns "Today", "Yesterday", or formatted date
 */
function getDateLabel(date: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const dateStr = date.toDateString();
  const todayStr = today.toDateString();
  const yesterdayStr = yesterday.toDateString();

  if (dateStr === todayStr) return 'Today';
  if (dateStr === yesterdayStr) return 'Yesterday';
  return formatDate(date);
}

/**
 * Group expenses by date label
 */
function groupExpensesByDate(expenses: Expense[]): Map<string, Expense[]> {
  const groups = new Map<string, Expense[]>();

  expenses.forEach((expense) => {
    const date = expense.date.toDate();
    const label = getDateLabel(date);

    if (!groups.has(label)) {
      groups.set(label, []);
    }
    groups.get(label)!.push(expense);
  });

  return groups;
}

export default function APAOverviewScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const router = useRouter();
  const { booking, isLoading: bookingLoading } = useBooking(bookingId || '');
  const {
    expenses,
    totalAmount,
    byCategory,
    isLoading: expensesLoading,
    refresh,
  } = useExpenses(bookingId || '', booking?.seasonId || '');

  const isLoading = bookingLoading || expensesLoading;

  // Group expenses by date
  const groupedExpenses = useMemo(() => groupExpensesByDate(expenses), [expenses]);

  // TODO POST-MVP: Add expense detail/edit screen
  // const handleExpensePress = (expense: Expense) => {
  //   router.push(`/booking/expenses/detail/${expense.id}`);
  // };

  const handleAddReceipt = () => {
    router.push(`/booking/expenses/capture/${bookingId}`);
  };

  const handleAddManual = () => {
    router.push(`/booking/expenses/manual/${bookingId}`);
  };

  const handleReconciliation = () => {
    router.push(`/booking/reconciliation/${bookingId}`);
  };

  if (!booking && !isLoading) {
    return (
      <Screen>
        <Stack.Screen options={{ title: 'APA Overview' }} />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Booking not found</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen noPadding>
      <Stack.Screen
        options={{
          title: 'APA Overview',
          headerRight: () => (
            <Pressable onPress={handleAddReceipt} style={styles.headerButton}>
              <Text style={styles.headerButtonText}>+ Add</Text>
            </Pressable>
          ),
        }}
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refresh}
            tintColor={COLORS.coral}
          />
        }
      >
        {/* APA Summary */}
        <ExpenseSummary
          totalExpenses={totalAmount}
          apaTotal={booking?.apaTotal || 0}
          byCategory={byCategory}
          testID="expense-summary"
        />

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Pressable
            style={[styles.actionButton, styles.receiptButton]}
            onPress={handleAddReceipt}
          >
            <Text style={styles.actionIcon}>{'\u{1F4F7}'}</Text>
            <Text style={styles.actionLabel}>Scan Receipt</Text>
          </Pressable>
          <Pressable
            style={[styles.actionButton, styles.manualButton]}
            onPress={handleAddManual}
          >
            <Text style={styles.actionIcon}>{'\u{270F}'}</Text>
            <Text style={styles.actionLabel}>Manual Entry</Text>
          </Pressable>
        </View>

        {/* Reconciliation Button */}
        <Pressable
          style={styles.reconciliationButton}
          onPress={handleReconciliation}
        >
          <Text style={styles.reconciliationIcon}>{'\u{1F4B0}'}</Text>
          <Text style={styles.reconciliationLabel}>Reconciliation</Text>
        </Pressable>

        {/* Expense List */}
        <View style={styles.listSection}>
          {expenses.length === 0 && !isLoading ? (
            <View style={styles.emptyList}>
              <Text style={styles.emptyIcon}>{'\u{1F4B3}'}</Text>
              <Text style={styles.emptyTitle}>No expenses yet</Text>
              <Text style={styles.emptySubtitle}>
                Scan a receipt or add a manual entry to get started
              </Text>
            </View>
          ) : (
            Array.from(groupedExpenses.entries()).map(([dateLabel, dateExpenses]) => (
              <View key={dateLabel} style={styles.dateGroup}>
                <Text style={styles.dateGroupLabel}>{dateLabel}</Text>
                {dateExpenses.map((expense) => (
                  <ExpenseItem
                    key={expense.id}
                    expense={expense}
                    /* TODO POST-MVP: Add onPress for expense detail
                    onPress={handleExpensePress}
                    */
                    testID={`expense-${expense.id}`}
                  />
                ))}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  headerButton: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  headerButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.coral,
  },
  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.xs,
  },
  receiptButton: {
    backgroundColor: COLORS.coral,
  },
  manualButton: {
    backgroundColor: COLORS.steelBlue,
  },
  actionIcon: {
    fontSize: 20,
  },
  actionLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.white,
  },
  // Reconciliation Button
  reconciliationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.xs,
  },
  reconciliationIcon: {
    fontSize: 20,
  },
  reconciliationLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  // List Section
  listSection: {
    marginBottom: SPACING.xl,
  },
  // Date Group
  dateGroup: {
    marginBottom: SPACING.md,
  },
  dateGroupLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  // Empty States
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
  },
  emptyList: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});
