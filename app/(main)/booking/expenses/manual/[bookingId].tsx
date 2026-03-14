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
import { Calendar } from 'phosphor-react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SIZES } from '@/config/theme';
import { formatDate } from '@/utils/formatting';
import { Screen } from '@/components/layout';
import { Button } from '@/components/ui';
import { useBooking } from '@/features/booking/hooks/useBooking';
import { useExpenses } from '@/features/expense/hooks/useExpenses';
import { CategoryPicker } from '@/features/expense/components';
import { EXPENSE_DEFAULTS, type ExpenseCategory } from '@/config/expenses';
import { useAuthStore } from '@/stores/authStore';

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
      setError('Unesite ispravan iznos');
      return;
    }

    if (!merchant.trim()) {
      setError('Unesite naziv trgovine');
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
      setError(result.error || 'Nije uspjelo spremanje troška');
    }
  };

  return (
    <Screen noPadding>
      <Stack.Screen options={{ title: 'Ručni unos' }} />

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
              <Text style={styles.warningTitle}>Bez računa</Text>
              <Text style={styles.warningText}>Kreirat će se digitalni zapis</Text>
            </View>
          </View>

          {/* Amount Input */}
          <View style={styles.section}>
            <Text style={styles.label}>Iznos *</Text>
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
            <Text style={styles.label}>Trgovina *</Text>
            <TextInput
              style={styles.input}
              value={merchant}
              onChangeText={setMerchant}
              placeholder="Unesite naziv trgovine"
              placeholderTextColor={COLORS.textMuted}
            />
          </View>

          {/* Category Picker */}
          <View style={styles.section}>
            <Text style={styles.label}>Kategorija</Text>
            <CategoryPicker value={category} onChange={setCategory} />
          </View>

          {/* Date Picker */}
          <View style={styles.section}>
            <Text style={styles.label}>Datum</Text>
            <Pressable
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Calendar size={SIZES.icon.md} color={COLORS.foreground} weight="regular" />
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
            <Text style={styles.label}>Napomena (opcionalno)</Text>
            <TextInput
              style={[styles.input, styles.noteInput]}
              value={note}
              onChangeText={setNote}
              placeholder="Dodaj napomenu..."
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
            {isSubmitting ? 'Spremanje...' : 'Spremi trošak'}
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
