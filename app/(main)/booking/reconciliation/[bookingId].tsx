/**
 * Reconciliation Screen
 *
 * End-of-booking cash reconciliation.
 * Compares expected cash (APA - expenses) with actual cash count.
 */

import { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/config/theme';
import { Screen } from '@/components/layout';
import { Button } from '@/components/ui';
import { useBooking } from '@/features/booking/hooks/useBooking';
import { useReconciliation, ReconciliationResult } from '@/features/apa';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { formatCurrency } from '@/utils/formatting';

export default function ReconciliationScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const router = useRouter();
  const { firebaseUser } = useAuth();
  const { booking, isLoading: bookingLoading } = useBooking(bookingId || '');

  const {
    apaTotal,
    expenseTotal,
    expectedCash,
    existingReconciliation,
    isReconciled,
    isLoading: reconLoading,
    isSaving,
    error: reconError,
    calculate,
    save,
  } = useReconciliation(bookingId || '', firebaseUser?.uid || '', booking?.reconciliation);

  const [actualCash, setActualCash] = useState('');
  const [error, setError] = useState<string | null>(null);

  const isLoading = bookingLoading || reconLoading;

  // Calculate preview whenever actualCash changes
  const preview = useMemo(() => {
    const parsed = parseFloat(actualCash.replace(',', '.'));
    if (isNaN(parsed)) return null;
    return calculate(parsed);
  }, [actualCash, calculate]);

  const handleCashChange = (text: string) => {
    // Allow only numbers and one decimal point
    const cleaned = text.replace(/[^0-9.,]/g, '').replace(',', '.');
    const parts = cleaned.split('.');
    if (parts.length > 2) return;
    if (parts[1] && parts[1].length > 2) return;
    setActualCash(cleaned);
    setError(null);
  };

  const handleSubmit = async () => {
    const parsed = parseFloat(actualCash.replace(',', '.'));

    if (isNaN(parsed) || parsed < 0) {
      setError('Please enter a valid cash amount');
      return;
    }

    // Confirm if there's a difference
    if (preview && !preview.isBalanced) {
      Alert.alert(
        'Confirm Reconciliation',
        `There is a ${preview.difference >= 0 ? 'surplus' : 'shortage'} of ${formatCurrency(Math.abs(preview.difference))}. Continue?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Confirm',
            onPress: () => completeReconciliation(parsed),
          },
        ]
      );
    } else {
      completeReconciliation(parsed);
    }
  };

  const completeReconciliation = async (amount: number) => {
    const result = await save(amount);

    if (result.success) {
      Alert.alert(
        'Reconciliation Complete',
        'Cash reconciliation has been saved successfully.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      setError(result.error || 'Failed to save reconciliation');
    }
  };

  if (!booking && !isLoading) {
    return (
      <Screen>
        <Stack.Screen options={{ title: 'Reconciliation' }} />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Booking not found</Text>
        </View>
      </Screen>
    );
  }

  // Already reconciled - show existing result
  if (isReconciled && existingReconciliation) {
    return (
      <Screen>
        <Stack.Screen options={{ title: 'Reconciliation' }} />
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.completedBanner}>
            <Text style={styles.completedIcon}>{'✓'}</Text>
            <Text style={styles.completedText}>Already Reconciled</Text>
          </View>

          <ReconciliationResult
            apaTotal={apaTotal}
            expenseTotal={expenseTotal}
            expectedCash={existingReconciliation.expectedCash}
            actualCash={existingReconciliation.actualCash}
            difference={existingReconciliation.difference}
            isBalanced={Math.abs(existingReconciliation.difference) < 0.01}
          />
        </ScrollView>
      </Screen>
    );
  }

  return (
    <Screen noPadding>
      <Stack.Screen options={{ title: 'Cash Reconciliation' }} />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Summary Section */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Expected Cash</Text>
            <Text style={styles.summaryAmount}>{formatCurrency(expectedCash)}</Text>
            <View style={styles.summaryBreakdown}>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>APA Received</Text>
                <Text style={styles.breakdownValue}>{formatCurrency(apaTotal)}</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Expenses</Text>
                <Text style={[styles.breakdownValue, styles.negative]}>
                  - {formatCurrency(expenseTotal)}
                </Text>
              </View>
            </View>
          </View>

          {/* Cash Input */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Count your cash</Text>
            <Text style={styles.inputHint}>
              Enter the actual amount of cash you have on hand
            </Text>
            <View style={styles.inputContainer}>
              <Text style={styles.currencySymbol}>€</Text>
              <TextInput
                style={styles.input}
                value={actualCash}
                onChangeText={handleCashChange}
                placeholder="0.00"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="decimal-pad"
                autoFocus
              />
            </View>
          </View>

          {/* Preview Result */}
          {preview && (
            <View style={styles.previewSection}>
              <ReconciliationResult
                apaTotal={preview.apaTotal}
                expenseTotal={preview.expenseTotal}
                expectedCash={preview.expectedCash}
                actualCash={preview.actualCash}
                difference={preview.difference}
                isBalanced={preview.isBalanced}
              />
            </View>
          )}

          {/* Error */}
          {(error || reconError) && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error || reconError}</Text>
            </View>
          )}
        </ScrollView>

        {/* Submit Button */}
        <View style={styles.footer}>
          <Button
            onPress={handleSubmit}
            disabled={!actualCash || isSaving || isLoading}
            testID="submit-reconciliation"
          >
            {isSaving ? 'Saving...' : 'Complete Reconciliation'}
          </Button>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
  },
  // Already Reconciled
  completedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.success,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    gap: SPACING.xs,
  },
  completedIcon: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.white,
    fontWeight: '700',
  },
  completedText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.white,
  },
  // Summary Card
  summaryCard: {
    backgroundColor: COLORS.steelBlue,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  summaryTitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.white,
    opacity: 0.8,
    marginBottom: SPACING.xs,
  },
  summaryAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: SPACING.md,
  },
  summaryBreakdown: {
    borderTopWidth: 1,
    borderTopColor: COLORS.overlayLight,
    paddingTop: SPACING.md,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  breakdownLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.white,
    opacity: 0.8,
  },
  breakdownValue: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.white,
  },
  negative: {
    color: '#ffaaaa',
  },
  // Input Section
  inputSection: {
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  inputHint: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginRight: SPACING.xs,
  },
  input: {
    flex: 1,
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.textPrimary,
    paddingVertical: SPACING.md,
  },
  // Preview Section
  previewSection: {
    marginBottom: SPACING.lg,
  },
  // Error
  errorContainer: {
    backgroundColor: `${COLORS.error}15`,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
  },
  errorText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.error,
  },
  // Footer
  footer: {
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
});
