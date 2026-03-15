/**
 * Expense Edit Screen (Brutalist)
 *
 * Edit existing expense with all fields editable.
 * Shows receipt image if available.
 */

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  Alert,
  Modal,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Warning, Trash, Calendar, Check } from 'phosphor-react-native';
import { useAppTranslation } from '@/i18n';
import {
  COLORS,
  SPACING,
  BORDERS,
  TYPOGRAPHY,
  FONTS,
  BORDER_RADIUS,
  SHADOWS,
  ANIMATION,
  SIZES,
} from '@/config/theme';
import { formatDate, formatCurrency } from '@/utils/formatting';
import { useExpenses } from '@/features/expense/hooks/useExpenses';
import { getExpense } from '@/features/expense/services/expenseService';
import { EXPENSE_CATEGORIES, getCategoryEmoji, type ExpenseCategory } from '@/config/expenses';
import type { Expense } from '@/types/models';

export default function ExpenseEditScreen() {
  const { t } = useAppTranslation();
  const { expenseId, bookingId } = useLocalSearchParams<{ expenseId: string; bookingId: string }>();
  const router = useRouter();
  const { updateExpense, deleteExpense } = useExpenses(bookingId || '', '');

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [expense, setExpense] = useState<Expense | null>(null);
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('other');
  const [date, setDate] = useState(new Date());
  const [note, setNote] = useState('');

  // UI state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  // Load expense on mount
  useEffect(() => {
    async function loadExpense() {
      if (!expenseId) return;

      setIsLoading(true);
      const result = await getExpense(expenseId);

      if (result.success && result.data) {
        const exp = result.data;
        setExpense(exp);
        setAmount(exp.amount.toString());
        setMerchant(exp.merchant || '');
        setCategory(exp.category);
        setDate(exp.date.toDate());
        setNote(exp.note || '');
      } else {
        setError(t('expenses.edit.expenseNotFound'));
      }

      setIsLoading(false);
    }

    loadExpense();
  }, [expenseId]);

  const handleAmountChange = (text: string) => {
    const cleaned = text.replace(/[^0-9.,]/g, '').replace(',', '.');
    const parts = cleaned.split('.');
    if (parts.length > 2) return;
    if (parts[1] && parts[1].length > 2) return;
    setAmount(cleaned);
  };

  const handleSave = async () => {
    if (!expenseId) return;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert(t('common.error'), t('expenses.errors.invalidAmount'));
      return;
    }

    if (!merchant.trim()) {
      Alert.alert(t('common.error'), t('expenses.errors.merchantRequired'));
      return;
    }

    setIsSubmitting(true);

    const result = await updateExpense(expenseId, {
      amount: parsedAmount,
      date,
      category,
      merchant: merchant.trim(),
      note: note.trim() || undefined,
    });

    setIsSubmitting(false);

    if (result.success) {
      router.back();
    } else {
      Alert.alert(t('common.error'), result.error || t('expenses.errors.saveFailed'));
    }
  };

  const handleDelete = () => {
    Alert.alert(
      t('expenses.edit.deleteExpense'),
      t('expenses.edit.deleteConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            if (!expenseId) return;
            setIsSubmitting(true);
            const result = await deleteExpense(expenseId);
            setIsSubmitting(false);
            if (result.success) {
              router.back();
            } else {
              Alert.alert(t('common.error'), result.error || t('expenses.errors.deleteFailed'));
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error || !expense) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </Pressable>
          <Text style={styles.headerTitle}>{t('common.error').toUpperCase()}</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.errorState}>
          <Warning size={SIZES.icon.lg} color={COLORS.destructive} weight="fill" />
          <Text style={styles.errorTitle}>{error || t('expenses.edit.expenseNotFound')}</Text>
          <Pressable
            style={({ pressed }) => [styles.errorButton, pressed && styles.pressed]}
            onPress={() => router.back()}
          >
            <Text style={styles.errorButtonText}>{t('common.back').toUpperCase()}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>{t('expenses.edit.title').toUpperCase()}</Text>
        <Pressable
          style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}
          onPress={handleDelete}
        >
          <Trash size={SIZES.icon.md} color={COLORS.destructive} weight="bold" />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Receipt Image or Digital Receipt */}
          <View style={styles.receiptSection}>
            <Text style={styles.sectionLabel}>{t('expenses.edit.receipt').toUpperCase()}</Text>
            {expense.receiptUrl || expense.receiptLocalPath ? (
              <Image
                source={{ uri: expense.receiptUrl || expense.receiptLocalPath }}
                style={styles.receiptImage}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.digitalReceipt}>
                <Text style={styles.digitalReceiptTitle}>{t('expenses.edit.digitalReceipt').toUpperCase()}</Text>
                <View style={styles.digitalReceiptDivider} />

                <View style={styles.digitalReceiptRow}>
                  <Text style={styles.digitalReceiptLabel}>{t('expenses.amount')}:</Text>
                  <Text style={styles.digitalReceiptValue}>
                    {formatCurrency(expense.amount)}
                  </Text>
                </View>

                <View style={styles.digitalReceiptRow}>
                  <Text style={styles.digitalReceiptLabel}>{t('expenses.merchant')}:</Text>
                  <Text style={styles.digitalReceiptValue}>
                    {expense.merchant || t('expenses.edit.unknown')}
                  </Text>
                </View>

                <View style={styles.digitalReceiptRow}>
                  <Text style={styles.digitalReceiptLabel}>{t('expenses.category')}:</Text>
                  <Text style={styles.digitalReceiptValue}>
                    {getCategoryEmoji(expense.category)} {EXPENSE_CATEGORIES.find(c => c.id === expense.category)?.label || expense.category}
                  </Text>
                </View>

                <View style={styles.digitalReceiptRow}>
                  <Text style={styles.digitalReceiptLabel}>{t('common.date')}:</Text>
                  <Text style={styles.digitalReceiptValue}>
                    {formatDate(expense.date.toDate())}
                  </Text>
                </View>

                <View style={styles.digitalReceiptFooter}>
                  <Text style={styles.digitalReceiptFooterText}>{t('expenses.edit.manualEntry').toUpperCase()}</Text>
                </View>
              </View>
            )}
          </View>

          {/* Amount */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>{t('expenses.amount').toUpperCase()} *</Text>
            <View style={styles.amountRow}>
              <Text style={styles.currencySymbol}>€</Text>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={handleAmountChange}
                placeholder="0.00"
                placeholderTextColor={COLORS.mutedForeground}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          {/* Merchant */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>{t('expenses.merchant').toUpperCase()} *</Text>
            <TextInput
              style={styles.input}
              value={merchant}
              onChangeText={setMerchant}
              placeholder={t('expenses.merchantPlaceholder')}
              placeholderTextColor={COLORS.mutedForeground}
            />
          </View>

          {/* Category */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>{t('expenses.category').toUpperCase()}</Text>
            <Pressable
              style={({ pressed }) => [styles.selectButton, pressed && styles.pressed]}
              onPress={() => setShowCategoryPicker(true)}
            >
              <Text style={styles.selectEmoji}>{getCategoryEmoji(category)}</Text>
              <Text style={styles.selectText}>
                {EXPENSE_CATEGORIES.find((c) => c.id === category)?.label || t('common.none')}
              </Text>
              <Text style={styles.selectArrow}>▼</Text>
            </Pressable>
          </View>

          {/* Date */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>{t('common.date').toUpperCase()}</Text>
            <Pressable
              style={({ pressed }) => [styles.selectButton, pressed && styles.pressed]}
              onPress={() => setShowDatePicker(true)}
            >
              <Calendar size={SIZES.icon.md} color={COLORS.foreground} weight="regular" />
              <Text style={styles.selectText}>{formatDate(date)}</Text>
            </Pressable>
          </View>

          {/* Note */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>{t('expenses.note').toUpperCase()}</Text>
            <TextInput
              style={[styles.input, styles.noteInput]}
              value={note}
              onChangeText={setNote}
              placeholder={t('expenses.notePlaceholder')}
              placeholderTextColor={COLORS.mutedForeground}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Spacer for bottom button */}
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Save Button */}
        <View style={styles.footer}>
          <Pressable
            style={({ pressed }) => [
              styles.saveButton,
              isSubmitting && styles.buttonDisabled,
              pressed && !isSubmitting && styles.pressed,
            ]}
            onPress={handleSave}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.saveButtonText}>{t('expenses.edit.saveChanges').toUpperCase()}</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowDatePicker(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('common.date').toUpperCase()}</Text>
            <DateTimePicker
              value={date}
              mode="date"
              display="spinner"
              onChange={(_, selectedDate) => {
                if (selectedDate) setDate(selectedDate);
              }}
              maximumDate={new Date()}
              style={styles.datePicker}
            />
            <Pressable
              style={({ pressed }) => [styles.modalConfirm, pressed && styles.pressed]}
              onPress={() => setShowDatePicker(false)}
            >
              <Text style={styles.modalConfirmText}>{t('common.confirm').toUpperCase()}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* Category Picker Modal */}
      <Modal
        visible={showCategoryPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCategoryPicker(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowCategoryPicker(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('expenses.category').toUpperCase()}</Text>
            <ScrollView style={styles.categoryList}>
              {EXPENSE_CATEGORIES.map((cat) => (
                <Pressable
                  key={cat.id}
                  style={({ pressed }) => [
                    styles.categoryOption,
                    category === cat.id && styles.categoryOptionSelected,
                    pressed && styles.pressed,
                  ]}
                  onPress={() => {
                    setCategory(cat.id);
                    setShowCategoryPicker(false);
                  }}
                >
                  <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                  <Text
                    style={[
                      styles.categoryLabel,
                      category === cat.id && styles.categoryLabelSelected,
                    ]}
                  >
                    {cat.label}
                  </Text>
                  {category === cat.id && (
                    <Check size={SIZES.icon.sm} color={COLORS.primary} weight="bold" />
                  )}
                </Pressable>
              ))}
            </ScrollView>
            <Pressable
              style={({ pressed }) => [styles.modalClose, pressed && styles.pressed]}
              onPress={() => setShowCategoryPicker(false)}
            >
              <Text style={styles.modalCloseText}>{t('common.close').toUpperCase()}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  // Container
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primary,
    borderBottomWidth: BORDERS.heavy,
    borderBottomColor: COLORS.foreground,
    paddingTop: SPACING.xxl + SPACING.md,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  headerTitle: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.cardTitle,
    color: COLORS.foreground,
    textTransform: 'uppercase',
  },
  backButton: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.brutSm,
  },
  backButtonText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.cardTitle,
    color: COLORS.foreground,
  },
  deleteButton: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.destructive,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.brutSm,
  },
  deleteButtonText: {
    fontSize: TYPOGRAPHY.sizes.large,
  },
  headerSpacer: {
    width: 40,
  },

  // Receipt Section
  receiptSection: {
    marginBottom: SPACING.lg,
  },
  sectionLabel: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
    letterSpacing: TYPOGRAPHY.letterSpacing.widest,
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
  },
  receiptImage: {
    width: '100%',
    height: 200,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    backgroundColor: COLORS.muted,
  },
  noReceiptBox: {
    width: '100%',
    height: 150,
    backgroundColor: COLORS.muted,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noReceiptIcon: {
    fontSize: SIZES.icon.lg,
    marginBottom: SPACING.sm,
  },
  noReceiptText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.mutedForeground,
    textTransform: 'uppercase',
  },
  noReceiptSubtext: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
    marginTop: SPACING.xxs,
  },

  // Digital Receipt
  digitalReceipt: {
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    padding: SPACING.md,
    ...SHADOWS.brutSm,
  },
  digitalReceiptTitle: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.cardTitle,
    color: COLORS.foreground,
    textAlign: 'center',
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
  },
  digitalReceiptDivider: {
    height: BORDERS.normal,
    backgroundColor: COLORS.foreground,
    marginBottom: SPACING.md,
  },
  digitalReceiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    borderBottomWidth: BORDERS.thin,
    borderBottomColor: COLORS.muted,
  },
  digitalReceiptLabel: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.mutedForeground,
  },
  digitalReceiptValue: {
    fontFamily: FONTS.monoBold,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
    textAlign: 'right',
    flex: 1,
    marginLeft: SPACING.md,
  },
  digitalReceiptFooter: {
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: BORDERS.thin,
    borderTopColor: COLORS.foreground,
    alignItems: 'center',
  },
  digitalReceiptFooterText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
    fontStyle: 'italic',
    textTransform: 'uppercase',
    letterSpacing: TYPOGRAPHY.letterSpacing.wide,
  },

  // Fields
  field: {
    marginBottom: SPACING.lg,
  },
  fieldLabel: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
    letterSpacing: TYPOGRAPHY.letterSpacing.widest,
    textTransform: 'uppercase',
    marginBottom: SPACING.xs,
  },
  input: {
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
  },
  noteInput: {
    minHeight: 80,
    paddingTop: SPACING.sm,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    paddingHorizontal: SPACING.md,
  },
  currencySymbol: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.hero,
    color: COLORS.foreground,
    marginRight: SPACING.xs,
  },
  amountInput: {
    flex: 1,
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.hero,
    color: COLORS.foreground,
    paddingVertical: SPACING.sm,
  },

  // Select Button
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  selectEmoji: {
    fontSize: TYPOGRAPHY.sizes.large,
    marginRight: SPACING.sm,
  },
  selectText: {
    flex: 1,
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
  },
  selectArrow: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
  },

  // Footer
  footer: {
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
  saveButton: {
    backgroundColor: COLORS.primary,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.brut,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.white,
    textTransform: 'uppercase',
  },

  // Error State
  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  errorIcon: {
    fontSize: SIZES.icon.xl,
    marginBottom: SPACING.md,
  },
  errorTitle: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.cardTitle,
    color: COLORS.foreground,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  errorButton: {
    backgroundColor: COLORS.accent,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    ...SHADOWS.brut,
  },
  errorButtonText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
    textTransform: 'uppercase',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    width: '100%',
    maxHeight: '70%',
    ...SHADOWS.brutLg,
  },
  modalTitle: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.cardTitle,
    color: COLORS.foreground,
    textTransform: 'uppercase',
    textAlign: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: BORDERS.normal,
    borderBottomColor: COLORS.foreground,
  },
  datePicker: {
    height: 200,
    backgroundColor: COLORS.card,
  },
  modalConfirm: {
    backgroundColor: COLORS.primary,
    borderTopWidth: BORDERS.normal,
    borderTopColor: COLORS.foreground,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  modalConfirmText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.white,
    textTransform: 'uppercase',
  },
  modalClose: {
    backgroundColor: COLORS.muted,
    borderTopWidth: BORDERS.normal,
    borderTopColor: COLORS.foreground,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  modalCloseText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
    textTransform: 'uppercase',
  },

  // Category List
  categoryList: {
    maxHeight: 250,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: BORDERS.thin,
    borderBottomColor: COLORS.muted,
  },
  categoryOptionSelected: {
    backgroundColor: COLORS.primaryLight,
  },
  categoryEmoji: {
    fontSize: TYPOGRAPHY.sizes.cardTitle,
    marginRight: SPACING.md,
  },
  categoryLabel: {
    flex: 1,
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
  },
  categoryLabelSelected: {
    fontFamily: FONTS.display,
    color: COLORS.primary,
  },
  categoryCheck: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.large,
    color: COLORS.primary,
  },

  // Press state
  pressed: {
    transform: ANIMATION.pressedTransform,
  },
});
