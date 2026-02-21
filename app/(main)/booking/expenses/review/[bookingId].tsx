/**
 * Review Screen
 *
 * Shows receipt image and OCR-extracted data.
 * Allows editing before saving expense.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ScrollView,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  COLORS,
  SPACING,
  BORDERS,
  BORDER_RADIUS,
  SHADOWS,
  FONTS,
  TYPOGRAPHY,
  ANIMATION,
} from '../../../../../src/config/theme';
import { Screen } from '../../../../../src/components/layout';
import { useBooking } from '../../../../../src/features/booking/hooks/useBooking';
import { useExpenses } from '../../../../../src/features/expense/hooks/useExpenses';
import { CategoryPicker } from '../../../../../src/features/expense/components';
import {
  extractReceiptData,
  imageToBase64,
  parseAmount,
  testGeminiConnection,
  type OCRResult,
} from '../../../../../src/features/expense/services/ocrService';
import { EXPENSE_DEFAULTS, type ExpenseCategory } from '../../../../../src/config/expenses';
import { useAuthStore } from '../../../../../src/stores/authStore';
import { formatDate } from '../../../../../src/utils/formatting';

type OCRStatus = 'loading' | 'success' | 'error' | 'not-receipt';

export default function ReviewScreen() {
  const { bookingId, imageUri } = useLocalSearchParams<{
    bookingId: string;
    imageUri: string;
  }>();
  const router = useRouter();
  const { firebaseUser } = useAuthStore();
  const { booking } = useBooking(bookingId || '');
  const { createExpense } = useExpenses(bookingId || '', booking?.seasonId || '');

  // OCR state
  const [ocrStatus, setOcrStatus] = useState<OCRStatus>('loading');
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);

  // Form state
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>(EXPENSE_DEFAULTS.category);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [note, setNote] = useState('');

  // Submit state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  /**
   * Run OCR on image
   */
  const runOCR = useCallback(async () => {
    if (!imageUri) {
      setOcrStatus('error');
      setOcrError('No image provided');
      return;
    }

    setOcrStatus('loading');
    setOcrError(null);

    try {
      // Convert image to base64
      const base64 = await imageToBase64(imageUri);

      // Call OCR service
      const result = await extractReceiptData(base64);

      if (!result.success) {
        if (result.error === 'Not a receipt') {
          setOcrStatus('not-receipt');
          setOcrError("This doesn't look like a receipt. Try another image.");
        } else {
          setOcrStatus('error');
          setOcrError(result.error || 'Failed to analyze receipt');
        }
        return;
      }

      if (result.data) {
        setOcrResult(result.data);
        setOcrStatus('success');

        // Pre-fill form with extracted data
        if (result.data.merchant) {
          setMerchant(result.data.merchant);
        }
        if (result.data.amount !== null) {
          setAmount(result.data.amount.toFixed(2).replace('.', ','));
        }
        if (result.data.category) {
          setCategory(result.data.category);
        }
        if (result.data.date) {
          // Parse date from DD.MM.YYYY
          const parts = result.data.date.split('.');
          if (parts.length === 3) {
            const parsedDate = new Date(
              parseInt(parts[2], 10),
              parseInt(parts[1], 10) - 1,
              parseInt(parts[0], 10)
            );
            if (!isNaN(parsedDate.getTime())) {
              setDate(parsedDate);
            }
          }
        }
      }
    } catch (error) {
      console.error('OCR error:', error);
      setOcrStatus('error');
      setOcrError('Failed to analyze receipt. Please try again.');
    }
  }, [imageUri]);

  // Run OCR on mount (with connection test first)
  useEffect(() => {
    // First test connection without image
    testGeminiConnection().then((ok) => {
      console.log('[OCR] Connection test:', ok ? 'SUCCESS' : 'FAILED');
      if (ok) {
        // If connection works, run full OCR
        runOCR();
      } else {
        setOcrStatus('error');
        setOcrError('Cannot connect to AI service. Check your internet connection.');
      }
    });
  }, [runOCR]);

  /**
   * Handle amount input
   */
  const handleAmountChange = (text: string) => {
    // Allow comma or dot as decimal separator
    const cleaned = text.replace(/[^0-9.,]/g, '');
    setAmount(cleaned);
  };

  /**
   * Handle date change
   */
  const onDateChange = (_: unknown, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  /**
   * Handle back navigation
   */
  const handleBack = () => {
    router.back();
  };

  /**
   * Handle retry OCR
   */
  const handleRetry = () => {
    runOCR();
  };

  /**
   * Handle manual entry (skip OCR)
   */
  const handleManualEntry = () => {
    setOcrStatus('success');
    setOcrError(null);
  };

  /**
   * Handle save expense
   */
  const handleSave = async () => {
    if (!firebaseUser || !booking) {
      Alert.alert('Error', 'Please try again');
      return;
    }

    // Parse amount
    const parsedAmount = parseAmount(amount);
    if (parsedAmount === null || parsedAmount <= 0) {
      setSubmitError('Please enter a valid amount');
      return;
    }

    if (!merchant.trim()) {
      setSubmitError('Please enter a merchant name');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const result = await createExpense({
      amount: parsedAmount,
      date: date,
      category,
      merchant: merchant.trim(),
      note: note.trim() || undefined,
      receiptLocalPath: imageUri,
      type: 'receipt',
      createdBy: firebaseUser.uid,
    });

    setIsSubmitting(false);

    if (result.success) {
      // Go back to APA screen (2 levels: review -> capture -> apa)
      router.dismiss(2);
    } else {
      setSubmitError(result.error || 'Failed to save expense');
    }
  };

  /**
   * Get confidence badge color
   */
  const getConfidenceBadgeStyle = () => {
    switch (ocrResult?.confidence) {
      case 'high':
        return styles.confidenceHigh;
      case 'medium':
        return styles.confidenceMedium;
      case 'low':
        return styles.confidenceLow;
      default:
        return styles.confidenceMedium;
    }
  };

  return (
    <Screen noPadding>
      <Stack.Screen options={{ headerShown: false }} />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>←</Text>
          </Pressable>
          <Text style={styles.headerTitle}>REVIEW</Text>
          {ocrStatus === 'success' && (
            <Pressable
              style={[styles.saveButton, isSubmitting && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={isSubmitting}
            >
              <Text style={styles.saveButtonText}>
                {isSubmitting ? '...' : 'SAVE'}
              </Text>
            </Pressable>
          )}
          {ocrStatus !== 'success' && <View style={styles.backButton} />}
        </View>

        {/* Loading State */}
        {ocrStatus === 'loading' && (
          <View style={styles.loadingContainer}>
            {imageUri && (
              <Image source={{ uri: imageUri }} style={styles.loadingImage} />
            )}
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>Analyzing receipt...</Text>
              <Text style={styles.loadingSubtext}>This may take a few seconds</Text>
            </View>
          </View>
        )}

        {/* Error State */}
        {(ocrStatus === 'error' || ocrStatus === 'not-receipt') && (
          <View style={styles.errorContainer}>
            {imageUri && (
              <Image source={{ uri: imageUri }} style={styles.errorImage} />
            )}
            <View style={styles.errorCard}>
              <Text style={styles.errorIcon}>
                {ocrStatus === 'not-receipt' ? '🧾' : '⚠️'}
              </Text>
              <Text style={styles.errorTitle}>
                {ocrStatus === 'not-receipt' ? 'NOT A RECEIPT' : 'ANALYSIS FAILED'}
              </Text>
              <Text style={styles.errorText}>{ocrError}</Text>

              <View style={styles.errorButtons}>
                <Pressable
                  style={({ pressed }) => [
                    styles.retryButton,
                    pressed && styles.buttonPressed,
                  ]}
                  onPress={handleRetry}
                >
                  <Text style={styles.retryButtonText}>TRY AGAIN</Text>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [
                    styles.manualButton,
                    pressed && styles.buttonPressed,
                  ]}
                  onPress={handleManualEntry}
                >
                  <Text style={styles.manualButtonText}>ENTER MANUALLY</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}

        {/* Success State - Form */}
        {ocrStatus === 'success' && (
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Receipt Thumbnail */}
            {imageUri && (
              <View style={styles.thumbnailContainer}>
                <Image source={{ uri: imageUri }} style={styles.thumbnail} />
                {ocrResult?.confidence && (
                  <View style={[styles.confidenceBadge, getConfidenceBadgeStyle()]}>
                    <Text style={styles.confidenceText}>
                      {ocrResult.confidence.toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Extracted Data Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>EXTRACTED DATA</Text>

              {/* Merchant */}
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>MERCHANT</Text>
                <TextInput
                  style={styles.input}
                  value={merchant}
                  onChangeText={setMerchant}
                  placeholder="Enter merchant name"
                  placeholderTextColor={COLORS.mutedForeground}
                />
              </View>

              {/* Amount */}
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>AMOUNT</Text>
                <View style={styles.amountContainer}>
                  <TextInput
                    style={styles.amountInput}
                    value={amount}
                    onChangeText={handleAmountChange}
                    placeholder="0,00"
                    placeholderTextColor={COLORS.mutedForeground}
                    keyboardType="decimal-pad"
                  />
                  <Text style={styles.currencyLabel}>€</Text>
                </View>
              </View>

              {/* Date */}
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>DATE</Text>
                <Pressable
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.dateText}>{formatDate(date)}</Text>
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

              {/* Category */}
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>CATEGORY</Text>
                <CategoryPicker value={category} onChange={setCategory} />
              </View>

              {/* Note */}
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>NOTE (OPTIONAL)</Text>
                <TextInput
                  style={[styles.input, styles.noteInput]}
                  value={note}
                  onChangeText={setNote}
                  placeholder="Add a note..."
                  placeholderTextColor={COLORS.mutedForeground}
                  multiline
                  numberOfLines={2}
                  textAlignVertical="top"
                />
              </View>
            </View>

            {/* Error Message */}
            {submitError && (
              <View style={styles.submitErrorContainer}>
                <Text style={styles.submitErrorText}>{submitError}</Text>
              </View>
            )}

            {/* Save Button (mobile footer) */}
            <View style={styles.footerButton}>
              <Pressable
                style={({ pressed }) => [
                  styles.saveExpenseButton,
                  pressed && styles.buttonPressed,
                  isSubmitting && styles.saveButtonDisabled,
                ]}
                onPress={handleSave}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color={COLORS.foreground} size="small" />
                ) : (
                  <Text style={styles.saveExpenseButtonText}>SAVE EXPENSE</Text>
                )}
              </Pressable>
            </View>

            {/* Bottom spacing */}
            <View style={{ height: SPACING.xxl }} />
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
    letterSpacing: TYPOGRAPHY.letterSpacing.wide,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
  },
  backButtonText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.cardTitle,
    color: COLORS.foreground,
  },
  saveButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.accent,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    ...SHADOWS.brutSm,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
  },

  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingImage: {
    width: '80%',
    height: '60%',
    borderRadius: BORDER_RADIUS.none,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    opacity: 0.5,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  loadingText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.cardTitle,
    color: COLORS.foreground,
    marginTop: SPACING.lg,
  },
  loadingSubtext: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.mutedForeground,
    marginTop: SPACING.xs,
  },

  // Error State
  errorContainer: {
    flex: 1,
    padding: SPACING.md,
  },
  errorImage: {
    width: '100%',
    height: 200,
    borderRadius: BORDER_RADIUS.none,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    marginBottom: SPACING.md,
  },
  errorCard: {
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    padding: SPACING.lg,
    alignItems: 'center',
    ...SHADOWS.brut,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  errorTitle: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.cardTitle,
    color: COLORS.foreground,
    marginBottom: SPACING.sm,
  },
  errorText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.mutedForeground,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  errorButtons: {
    width: '100%',
    gap: SPACING.sm,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    ...SHADOWS.brut,
  },
  retryButtonText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.white,
  },
  manualButton: {
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    ...SHADOWS.brutSm,
  },
  manualButtonText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
  },

  // Success State
  scrollView: {
    flex: 1,
  },
  thumbnailContainer: {
    margin: SPACING.md,
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: 150,
    borderRadius: BORDER_RADIUS.none,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    ...SHADOWS.brut,
  },
  confidenceBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
  },
  confidenceHigh: {
    backgroundColor: COLORS.accent,
  },
  confidenceMedium: {
    backgroundColor: COLORS.statsBg,
  },
  confidenceLow: {
    backgroundColor: COLORS.destructive,
  },
  confidenceText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.meta,
    color: COLORS.foreground,
  },

  // Section
  section: {
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    margin: SPACING.md,
    marginTop: 0,
    padding: SPACING.md,
    ...SHADOWS.brut,
  },
  sectionTitle: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
    letterSpacing: TYPOGRAPHY.letterSpacing.widest,
    marginBottom: SPACING.md,
  },

  // Fields
  field: {
    marginBottom: SPACING.md,
  },
  fieldLabel: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.meta,
    color: COLORS.mutedForeground,
    letterSpacing: TYPOGRAPHY.letterSpacing.wide,
    marginBottom: SPACING.xs,
  },
  input: {
    backgroundColor: COLORS.muted,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
  },
  noteInput: {
    minHeight: 60,
    paddingTop: SPACING.sm,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountInput: {
    flex: 1,
    backgroundColor: COLORS.muted,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.cardTitle,
    color: COLORS.foreground,
  },
  currencyLabel: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.cardTitle,
    color: COLORS.foreground,
    marginLeft: SPACING.sm,
  },
  dateButton: {
    backgroundColor: COLORS.muted,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  dateText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
  },

  // Submit Error
  submitErrorContainer: {
    backgroundColor: `${COLORS.destructive}20`,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.destructive,
    borderRadius: BORDER_RADIUS.none,
    marginHorizontal: SPACING.md,
    padding: SPACING.md,
  },
  submitErrorText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.destructive,
  },

  // Footer Button
  footerButton: {
    padding: SPACING.md,
  },
  saveExpenseButton: {
    backgroundColor: COLORS.accent,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    ...SHADOWS.brut,
  },
  saveExpenseButtonText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.large,
    color: COLORS.foreground,
  },

  // Pressed state
  buttonPressed: {
    transform: ANIMATION.pressedTransform,
  },
});
