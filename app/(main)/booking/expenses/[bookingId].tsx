/**
 * APA Overview Screen (Brutalist)
 *
 * Neo-brutalist expense management screen.
 * Shows APA summary, expense list grouped by date, and quick actions.
 *
 * @see docs/Ahoy_Screen_Map.md §4.1
 * @see docs/Ahoy_UI_ELEMENTS.md → APAScreen
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

// Theme imports - SVE vrijednosti odavde!
import {
  COLORS,
  SHADOWS,
  BORDERS,
  SPACING,
  TYPOGRAPHY,
  FONTS,
  BORDER_RADIUS,
  ANIMATION,
  LAYOUT,
} from '../../../../src/config/theme';

// Hooks
import { useBooking } from '../../../../src/features/booking/hooks/useBooking';
import { useExpenses } from '../../../../src/features/expense/hooks/useExpenses';
import { useApa, AddApaModal } from '../../../../src/features/apa';
import { useAuthStore } from '../../../../src/stores/authStore';
import { ExportModal } from '../../../../src/features/export';

// Utils
import { formatCurrency, formatDateShort } from '../../../../src/utils/formatting';
import { getCategoryEmoji } from '../../../../src/config/expenses';

// Components
import { ProgressBar } from '../../../../src/components/ui/ProgressBar';
import { EmptyState } from '../../../../src/components/ui/EmptyState';

// Types
import type { Expense } from '../../../../src/types/models';

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get date label for expense grouping
 */
function getDateLabel(date: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const dateStr = date.toDateString();
  const todayStr = today.toDateString();
  const yesterdayStr = yesterday.toDateString();

  if (dateStr === todayStr) return 'TODAY';
  if (dateStr === yesterdayStr) return 'YESTERDAY';
  return formatDateShort(date);
}

/**
 * Get time string (HH:MM)
 */
function getTimeString(date: Date): string {
  return date.toLocaleTimeString('hr-HR', { hour: '2-digit', minute: '2-digit' });
}

/**
 * Group expenses by date label
 */
function groupExpensesByDate(expenses: Expense[]): Map<string, Expense[]> {
  const groups = new Map<string, Expense[]>();

  // Sort by date descending first
  const sorted = [...expenses].sort((a, b) =>
    b.date.toDate().getTime() - a.date.toDate().getTime()
  );

  sorted.forEach((expense) => {
    const date = expense.date.toDate();
    const label = getDateLabel(date);

    if (!groups.has(label)) {
      groups.set(label, []);
    }
    groups.get(label)!.push(expense);
  });

  return groups;
}

/**
 * Get category color for icon box
 */
function getCategoryColor(category: string): string {
  switch (category) {
    case 'FD': // Food
    case 'FL': // Fuel
      return COLORS.accent;
    case 'PT': // Port
      return COLORS.heroAmber;
    default:
      return COLORS.muted;
  }
}

// ============================================
// COMPONENTS
// ============================================

// --------------------------------------------
// Expense Row (Brutalist)
// --------------------------------------------
interface ExpenseRowProps {
  expense: Expense;
}

function BrutalistExpenseRow({ expense }: ExpenseRowProps) {
  const date = expense.date.toDate();
  const categoryEmoji = getCategoryEmoji(expense.category);
  const categoryColor = getCategoryColor(expense.category);

  return (
    <View style={styles.expenseRow}>
      {/* Category icon box */}
      <View style={[styles.expenseIconBox, { backgroundColor: categoryColor }]}>
        <Text style={styles.expenseIcon}>{categoryEmoji}</Text>
      </View>

      {/* Content */}
      <View style={styles.expenseContent}>
        <Text style={styles.expenseMerchant} numberOfLines={1}>
          {expense.merchant || 'Unknown'}
        </Text>
        <Text style={styles.expenseMeta}>
          {expense.category} · {getTimeString(date)}
        </Text>
      </View>

      {/* Amount */}
      <Text style={styles.expenseAmount}>-{formatCurrency(expense.amount)}</Text>
    </View>
  );
}

// ============================================
// MAIN SCREEN
// ============================================

export default function APAOverviewScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const router = useRouter();
  const { firebaseUser } = useAuthStore();
  const currentUserId = firebaseUser?.uid || '';

  // Data hooks
  const { booking, isLoading: bookingLoading } = useBooking(bookingId || '');
  const {
    expenses,
    totalAmount: apaSpent,
    isLoading: expensesLoading,
    refresh,
  } = useExpenses(bookingId || '', booking?.seasonId || '');
  const {
    total: apaReceived,
    entries: apaEntries,
    addEntry: addApaEntry,
    refresh: refreshApa,
  } = useApa(bookingId || '', currentUserId);

  const [showApaModal, setShowApaModal] = useState(false);
  const [showApaHistory, setShowApaHistory] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const isLoading = bookingLoading || expensesLoading;

  // Calculate APA values
  const apaSafe = apaReceived - apaSpent;
  const apaProgress = apaReceived > 0 ? Math.min((apaSpent / apaReceived) * 100, 100) : 0;

  // Group expenses by date
  const groupedExpenses = useMemo(() => groupExpensesByDate(expenses), [expenses]);

  // Display name
  const displayName = booking?.notes?.split('\n')[0]?.slice(0, 15) || 'Charter';

  // Status
  const isActive = booking?.status === 'active';
  const statusLabel = isActive ? 'LIVE' : booking?.status?.toUpperCase() || '';

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refresh(), refreshApa()]);
    setRefreshing(false);
  };

  // Handle add APA
  const handleAddApa = async (amount: number, note?: string) => {
    const result = await addApaEntry(amount, note);
    if (result.success) {
      refreshApa();
    }
    return result;
  };

  // Navigation handlers
  const handleBack = () => router.back();
  const handleExport = () => {
    setShowExportModal(true);
  };
  const handleCapture = () => router.push(`/booking/expenses/capture/${bookingId}`);
  const handleManual = () => router.push(`/booking/expenses/manual/${bookingId}`);
  const handleReconciliation = () => router.push(`/booking/reconciliation/${bookingId}`);

  // Tab navigation
  const handleTabShop = () => router.push(`/booking/shopping/${bookingId}`);
  const handleTabInfo = () => router.push(`/booking/${bookingId}`);

  // Error state
  if (!booking && !isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [styles.backButton, pressed && styles.buttonPressed]}
            onPress={handleBack}
          >
            <Text style={styles.backButtonText}>←</Text>
          </Pressable>
          <Text style={styles.headerTitle}>APA</Text>
          <View style={styles.headerSpacer} />
        </View>
        <EmptyState
          icon="⚠️"
          title="Booking not found"
          subtitle="This booking may have been deleted"
          actionLabel="Go Back"
          onAction={handleBack}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backButton, pressed && styles.buttonPressed]}
          onPress={handleBack}
        >
          <Text style={styles.backButtonText}>←</Text>
        </Pressable>

        <Text style={styles.headerTitle}>APA</Text>

        <View style={styles.headerRight}>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>{statusLabel}</Text>
          </View>
          <Text style={styles.headerClient} numberOfLines={1}>
            {displayName}
          </Text>
          <Pressable
            style={({ pressed }) => [styles.optionsButton, pressed && styles.buttonPressed]}
            onPress={handleExport}
          >
            <Text style={styles.optionsButtonText}>📤</Text>
          </Pressable>
        </View>
      </View>

      {/* Tab Switcher */}
      <View style={styles.tabSwitcher}>
        <View style={[styles.tab, styles.tabActive]}>
          <Text style={[styles.tabText, styles.tabTextActive]}>EXP</Text>
        </View>
        <Pressable
          style={({ pressed }) => [styles.tab, pressed && styles.buttonPressed]}
          onPress={handleTabShop}
        >
          <Text style={styles.tabText}>SHOP</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.tab, pressed && styles.buttonPressed]}
          onPress={handleTabInfo}
        >
          <Text style={styles.tabText}>INFO</Text>
        </Pressable>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Summary Hero */}
        <View style={styles.summaryHero}>
          {/* Values row */}
          <View style={styles.summaryRow}>
            <View style={styles.summaryCol}>
              <Text style={styles.summaryLabel}>SPENT</Text>
              <Text style={styles.summaryValueSpent}>{formatCurrency(apaSpent)}</Text>
            </View>
            <View style={styles.summaryCol}>
              <Text style={styles.summaryLabel}>SAFE</Text>
              <Text style={[styles.summaryValueSafe, apaSafe >= 0 && styles.summaryValuePositive]}>
                {formatCurrency(apaSafe)}
              </Text>
            </View>
          </View>

          {/* Progress bar */}
          <ProgressBar
            progress={apaProgress}
            trackColor={COLORS.foreground}
            fillColor={COLORS.card}
            height={SPACING.sm}
            style={styles.summaryProgress}
          />

          {/* Action buttons row */}
          <View style={styles.summaryActions}>
            <Pressable
              style={({ pressed }) => [styles.addApaButton, pressed && styles.buttonPressed]}
              onPress={() => setShowApaModal(true)}
            >
              <Text style={styles.addApaButtonText}>+ ADD APA</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.historyToggle, pressed && styles.buttonPressed]}
              onPress={() => setShowApaHistory(!showApaHistory)}
            >
              <Text style={styles.historyToggleText}>
                {showApaHistory ? '▲' : '▼'} HISTORY ({apaEntries.length})
              </Text>
            </Pressable>
          </View>

          {/* APA History (expanded) */}
          {showApaHistory && apaEntries.length > 0 && (
            <View style={styles.apaHistoryList}>
              {apaEntries.map((entry, index) => (
                <View key={entry.id || index} style={styles.apaHistoryItem}>
                  <Text style={styles.apaHistoryAmount}>+{formatCurrency(entry.amount)}</Text>
                  <Text style={styles.apaHistoryNote}>{entry.note || 'APA received'}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Expenses List */}
        {expenses.length === 0 && !isLoading ? (
          <EmptyState
            icon="💳"
            title="No expenses yet"
            subtitle="Scan a receipt or add a manual entry"
          />
        ) : (
          Array.from(groupedExpenses.entries()).map(([dateLabel, dateExpenses]) => (
            <View key={dateLabel} style={styles.dateGroup}>
              <Text style={styles.dateGroupLabel}>{dateLabel}</Text>
              {dateExpenses.map((expense) => (
                <BrutalistExpenseRow key={expense.id} expense={expense} />
              ))}
            </View>
          ))
        )}

        {/* Bottom spacing for fixed action bar */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Fixed Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomBarRow}>
          <Pressable
            style={({ pressed }) => [
              styles.bottomButton,
              styles.bottomButtonCapture,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleCapture}
          >
            <Text style={styles.bottomButtonIcon}>📸</Text>
            <Text style={styles.bottomButtonText}>CAPTURE</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.bottomButton,
              styles.bottomButtonManual,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleManual}
          >
            <Text style={styles.bottomButtonIcon}>✏️</Text>
            <Text style={styles.bottomButtonText}>MANUAL</Text>
          </Pressable>
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.reconciliationButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleReconciliation}
        >
          <Text style={styles.reconciliationIcon}>💰</Text>
          <Text style={styles.reconciliationText}>RECONCILIATION</Text>
        </Pressable>
      </View>

      {/* Add APA Modal */}
      <AddApaModal
        visible={showApaModal}
        onClose={() => setShowApaModal(false)}
        onSubmit={handleAddApa}
      />

      {/* Export Modal */}
      {booking && (
        <ExportModal
          visible={showExportModal}
          onClose={() => setShowExportModal(false)}
          booking={booking}
          expenses={expenses}
          apaEntries={apaEntries}
          reconciliation={null}
          seasonName={booking.seasonId}
        />
      )}
    </View>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  // Container
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Header
  header: {
    backgroundColor: COLORS.background,
    borderBottomWidth: BORDERS.heavy,
    borderBottomColor: COLORS.foreground,
    paddingTop: SPACING.xxl + SPACING.md,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.large,
    color: COLORS.foreground,
    textTransform: 'uppercase',
    marginLeft: SPACING.sm,
  },
  headerRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: SPACING.xs,
  },
  headerBadge: {
    backgroundColor: COLORS.primary,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    paddingVertical: SPACING.xxs,
    paddingHorizontal: SPACING.xs,
  },
  headerBadgeText: {
    fontFamily: FONTS.monoBold,
    fontSize: TYPOGRAPHY.sizes.meta,
    color: COLORS.foreground,
    textTransform: 'uppercase',
  },
  headerClient: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.foreground,
    fontStyle: 'italic',
    maxWidth: 80,
  },
  backButton: {
    width: 36,
    height: 36,
    backgroundColor: COLORS.accent,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.brutSm,
  },
  backButtonText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.large,
    color: COLORS.foreground,
  },
  optionsButton: {
    width: 36,
    height: 36,
    backgroundColor: COLORS.muted,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.brutSm,
  },
  optionsButtonText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.large,
    color: COLORS.foreground,
  },
  headerSpacer: {
    width: 36,
  },

  // Tab Switcher
  tabSwitcher: {
    flexDirection: 'row',
    borderBottomWidth: BORDERS.heavy,
    borderBottomColor: COLORS.foreground,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card,
    borderRightWidth: BORDERS.normal,
    borderRightColor: COLORS.foreground,
  },
  tabActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontFamily: FONTS.monoBold,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.foreground,
    textTransform: 'uppercase',
  },
  tabTextActive: {
    color: COLORS.foreground,
  },

  // ScrollView
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
  },

  // Summary Hero
  summaryHero: {
    backgroundColor: COLORS.primary,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.brut,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  summaryCol: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.foreground,
    opacity: 0.8,
    textTransform: 'uppercase',
    marginBottom: SPACING.xs,
  },
  summaryValueSpent: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.hero,
    color: COLORS.foreground,
  },
  summaryValueSafe: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.sectionTitle,
    color: COLORS.foreground,
  },
  summaryValuePositive: {
    color: COLORS.accent,
  },
  summaryProgress: {
    marginBottom: SPACING.md,
  },
  summaryActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  addApaButton: {
    flex: 1,
    backgroundColor: COLORS.secondary,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    ...SHADOWS.brutSm,
  },
  addApaButtonText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.white,
    textTransform: 'uppercase',
  },
  historyToggle: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: BORDERS.thin,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  historyToggleText: {
    fontFamily: FONTS.monoBold,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.foreground,
    textTransform: 'uppercase',
  },

  // APA History
  apaHistoryList: {
    marginTop: SPACING.md,
    borderTopWidth: BORDERS.thin,
    borderTopColor: COLORS.foreground,
    paddingTop: SPACING.sm,
    gap: SPACING.sm,
  },
  apaHistoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  apaHistoryAmount: {
    fontFamily: FONTS.monoBold,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
  },
  apaHistoryNote: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.foreground,
    opacity: 0.8,
  },

  // Date Group
  dateGroup: {
    marginBottom: SPACING.lg,
  },
  dateGroupLabel: {
    fontFamily: FONTS.monoBold,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: TYPOGRAPHY.letterSpacing.widest,
    marginBottom: SPACING.sm,
  },

  // Expense Row
  expenseRow: {
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    ...SHADOWS.brut,
  },
  expenseIconBox: {
    width: 48,
    height: 48,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expenseIcon: {
    fontSize: TYPOGRAPHY.sizes.cardTitle,
  },
  expenseContent: {
    flex: 1,
  },
  expenseMerchant: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
    textTransform: 'uppercase',
  },
  expenseMeta: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
    textTransform: 'uppercase',
    marginTop: SPACING.xxs,
  },
  expenseAmount: {
    fontFamily: FONTS.monoBold,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.destructive,
  },

  // Bottom Action Bar (Fixed)
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.background,
    borderTopWidth: BORDERS.heavy,
    borderTopColor: COLORS.foreground,
    padding: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  bottomBarRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  bottomButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    ...SHADOWS.brut,
  },
  bottomButtonCapture: {
    backgroundColor: COLORS.secondary,
  },
  bottomButtonManual: {
    backgroundColor: COLORS.card,
  },
  bottomButtonIcon: {
    fontSize: TYPOGRAPHY.sizes.large,
  },
  bottomButtonText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.foreground,
    textTransform: 'uppercase',
  },
  reconciliationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.accent,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    paddingVertical: SPACING.md,
    ...SHADOWS.brut,
  },
  reconciliationIcon: {
    fontSize: TYPOGRAPHY.sizes.large,
  },
  reconciliationText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
    textTransform: 'uppercase',
  },

  // Bottom spacer
  bottomSpacer: {
    height: 180, // Space for fixed bottom bar
  },

  // Press state
  buttonPressed: {
    transform: ANIMATION.pressedTransform,
  },
});
