/**
 * Manual Entry Screen
 *
 * Form for adding expenses without a receipt (no-receipt type).
 * Generates a digital paragon for record keeping.
 */

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../../../../src/config/theme';
import { formatDate } from '../../../../../src/utils/formatting';
import { Screen } from '../../../../../src/components/layout';
import { Button } from '../../../../../src/components/ui';
import { useBooking } from '../../../../../src/features/booking/hooks/useBooking';
import { useExpenses } from '../../../../../src/features/expense/hooks/useExpenses';
import { CategoryPicker } from '../../../../../src/features/expense/components';
import { EXPENSE_DEFAULTS, type ExpenseCategory } from '../../../../../src/config/expenses';
import { useAuthStore } from '../../../../../src/stores/authStore';

export default function ManualEntryScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const router = useRouter();
  const { firebaseUser } = useAuthStore();
  const { booking } = useBooking(bookingId || '');
  const { createExpense } = useExpenses(bookingId || '', booking?.seasonId || '');

  // Form state
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>(EXPENSE_DEFAULTS.category);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAmountChange = (text: string) => {
    // Allow only numbers and one decimal point
    const cleaned = text.replace(/[^0-9.,]/g, '').replace(',', '.');
    // Only allow one decimal point
    const parts = cleaned.split('.');
    if (parts.length > 2) return;
    // Limit decimal places to 2
    if (parts[1] && parts[1].length > 2) return;
    setAmount(cleaned);
  };

  const onDateChange = (_: unknown, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleSubmit = async () => {
    if (!firebaseUser) return;

    // Validation
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!merchant.trim()) {
      setError('Please enter a merchant name');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const result = await createExpense({
      amount: parsedAmount,
      date: date,
      category,
      merchant: merchant.trim(),
      note: note.trim() || undefined,
      type: 'no-receipt',
      createdBy: firebaseUser.uid,
    });

    setIsSubmitting(false);

    if (result.success) {
      router.back();
    } else {
      setError(result.error || 'Failed to save expense');
    }
  };

  return (
    <Screen noPadding>
      <Stack.Screen options={{ title: 'Manual Entry' }} />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Warning Banner */}
          <View style={styles.warningBanner}>
            <Text style={styles.warningIcon}>{'\u{26A0}\u{FE0F}'}</Text>
            <View style={styles.warningContent}>
              <Text style={styles.warningTitle}>No receipt</Text>
              <Text style={styles.warningText}>A digital record will be created</Text>
            </View>
          </View>

          {/* Amount Input */}
          <View style={styles.section}>
            <Text style={styles.label}>Amount *</Text>
            <View style={styles.amountContainer}>
              <Text style={styles.currencySymbol}>€</Text>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={handleAmountChange}
                placeholder="0.00"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="decimal-pad"
                autoFocus
              />
            </View>
          </View>

          {/* Merchant Input */}
          <View style={styles.section}>
            <Text style={styles.label}>Merchant *</Text>
            <TextInput
              style={styles.input}
              value={merchant}
              onChangeText={setMerchant}
              placeholder="Enter merchant name"
              placeholderTextColor={COLORS.textMuted}
            />
          </View>

          {/* Category Picker */}
          <View style={styles.section}>
            <Text style={styles.label}>Category</Text>
            <CategoryPicker value={category} onChange={setCategory} />
          </View>

          {/* Date Picker */}
          <View style={styles.section}>
            <Text style={styles.label}>Date</Text>
            <Pressable
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateButtonIcon}>📅</Text>
              <Text style={styles.dateButtonText}>{formatDate(date)}</Text>
            </Pressable>
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onDateChange}
                maximumDate={new Date()}
              />
            )}
          </View>

          {/* Note Input */}
          <View style={styles.section}>
            <Text style={styles.label}>Note (optional)</Text>
            <TextInput
              style={[styles.input, styles.noteInput]}
              value={note}
              onChangeText={setNote}
              placeholder="Add a note..."
              placeholderTextColor={COLORS.textMuted}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Error Message */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
        </ScrollView>

        {/* Submit Button */}
        <View style={styles.footer}>
          <Button onPress={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Expense'}
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
  // Warning Banner
  warningBanner: {
    flexDirection: 'row',
    backgroundColor: `${COLORS.warning}15`,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    alignItems: 'center',
  },
  warningIcon: {
    fontSize: 24,
    marginRight: SPACING.sm,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.warning,
    marginBottom: 2,
  },
  warningText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  // Form Sections
  section: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  // Amount Input
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
  },
  currencySymbol: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginRight: SPACING.xs,
  },
  amountInput: {
    flex: 1,
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    paddingVertical: SPACING.md,
  },
  // Text Input
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
  },
  noteInput: {
    minHeight: 80,
    paddingTop: SPACING.md,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  dateButtonIcon: {
    fontSize: 18,
    marginRight: SPACING.sm,
  },
  dateButtonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
  },
  // Error
  errorContainer: {
    backgroundColor: `${COLORS.error}15`,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  errorText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.error,
  },
  // Footer
  footer: {
    padding: SPACING.md,
    paddingBottom: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
});
