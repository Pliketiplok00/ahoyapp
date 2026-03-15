/**
 * Reconciliation Screen (Brutalist)
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
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Check, CaretLeft, Warning, Scales } from 'phosphor-react-native';
import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
  FONTS,
  BORDERS,
  BORDER_RADIUS,
  SHADOWS,
  ANIMATION,
  SIZES,
} from '@/config/theme';
import { useAppTranslation } from '@/i18n';
import { useBooking } from '@/features/booking/hooks/useBooking';
import { useReconciliation } from '@/features/apa';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { formatCurrency } from '@/utils/formatting';

export default function ReconciliationScreen() {
  const { t } = useAppTranslation();
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
      setError(t('reconciliation.errors.invalidAmount'));
      return;
    }

    if (preview && !preview.isBalanced) {
      const diffType = preview.difference >= 0 ? t('reconciliation.surplus') : t('reconciliation.shortage');
      Alert.alert(
        t('reconciliation.confirmTitle'),
        `${t('reconciliation.difference')}: ${diffType} ${formatCurrency(Math.abs(preview.difference))}. ${t('common.confirm')}?`,
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('common.confirm'),
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
        t('reconciliation.successTitle'),
        t('reconciliation.successMessage'),
        [
          {
            text: t('common.ok'),
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      setError(result.error || t('reconciliation.errors.saveFailed'));
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            onPress={() => router.back()}
          >
            <CaretLeft size={SIZES.icon.md} color={COLORS.foreground} weight="bold" />
          </Pressable>
          <Text style={styles.headerTitle}>{t('reconciliation.titleShort')}</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </View>
    );
  }

  // Booking not found
  if (!booking) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            onPress={() => router.back()}
          >
            <CaretLeft size={SIZES.icon.md} color={COLORS.foreground} weight="bold" />
          </Pressable>
          <Text style={styles.headerTitle}>{t('reconciliation.titleShort')}</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.centerContainer}>
          <Warning size={SIZES.icon.xl} color={COLORS.mutedForeground} weight="regular" />
          <Text style={styles.emptyText}>{t('reconciliation.bookingNotFound')}</Text>
        </View>
      </View>
    );
  }

  // Already reconciled
  if (isReconciled && existingReconciliation) {
    const diff = existingReconciliation.difference;
    const isBalanced = Math.abs(diff) < 0.01;

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            onPress={() => router.back()}
          >
            <CaretLeft size={SIZES.icon.md} color={COLORS.foreground} weight="bold" />
          </Pressable>
          <Text style={styles.headerTitle}>{t('reconciliation.titleShort')}</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Already Reconciled Banner */}
          <View style={styles.completedBanner}>
            <Check size={SIZES.icon.md} color={COLORS.foreground} weight="bold" />
            <Text style={styles.completedText}>{t('reconciliation.alreadyReconciled')}</Text>
          </View>

          {/* Result Card */}
          <View style={styles.resultCard}>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>{t('reconciliation.apaReceived')}</Text>
              <Text style={styles.resultValue}>{formatCurrency(apaTotal)}</Text>
            </View>
            <View style={styles.resultDivider} />
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>{t('reconciliation.expensesTotal')}</Text>
              <Text style={[styles.resultValue, styles.negative]}>- {formatCurrency(expenseTotal)}</Text>
            </View>
            <View style={styles.resultDivider} />
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>{t('reconciliation.expectedCash')}</Text>
              <Text style={styles.resultValueBold}>{formatCurrency(existingReconciliation.expectedCash)}</Text>
            </View>
            <View style={styles.resultDivider} />
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>{t('reconciliation.actualCash')}</Text>
              <Text style={styles.resultValueBold}>{formatCurrency(existingReconciliation.actualCash)}</Text>
            </View>
            <View style={styles.resultDividerHeavy} />
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>{t('reconciliation.difference')}</Text>
              <Text style={[
                styles.resultValueBold,
                isBalanced ? styles.balanced : (diff >= 0 ? styles.positive : styles.negative),
              ]}>
                {isBalanced ? t('reconciliation.balanced') : (
                  `${diff >= 0 ? '+' : ''}${formatCurrency(diff)}`
                )}
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  // Main reconciliation form
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          onPress={() => router.back()}
        >
          <CaretLeft size={SIZES.icon.md} color={COLORS.foreground} weight="bold" />
        </Pressable>
        <Text style={styles.headerTitle}>{t('reconciliation.title')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Expected Cash Summary */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Scales size={SIZES.icon.md} color={COLORS.white} weight="bold" />
              <Text style={styles.summaryTitle}>{t('reconciliation.expectedCash')}</Text>
            </View>
            <Text style={styles.summaryAmount}>{formatCurrency(expectedCash)}</Text>
            <View style={styles.summaryBreakdown}>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>{t('reconciliation.apaReceived')}</Text>
                <Text style={styles.breakdownValue}>{formatCurrency(apaTotal)}</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>{t('reconciliation.expensesTotal')}</Text>
                <Text style={[styles.breakdownValue, styles.negativeWhite]}>
                  - {formatCurrency(expenseTotal)}
                </Text>
              </View>
            </View>
          </View>

          {/* Cash Input */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>{t('reconciliation.countCash')}</Text>
            <Text style={styles.inputHint}>{t('reconciliation.countCashHint')}</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.currencySymbol}>€</Text>
              <TextInput
                style={styles.input}
                value={actualCash}
                onChangeText={handleCashChange}
                placeholder="0,00"
                placeholderTextColor={COLORS.mutedForeground}
                keyboardType="decimal-pad"
                autoFocus
              />
            </View>
          </View>

          {/* Preview Result */}
          {preview && (
            <View style={styles.previewCard}>
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>{t('reconciliation.expectedCash')}</Text>
                <Text style={styles.previewValue}>{formatCurrency(preview.expectedCash)}</Text>
              </View>
              <View style={styles.previewDivider} />
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>{t('reconciliation.actualCash')}</Text>
                <Text style={styles.previewValue}>{formatCurrency(preview.actualCash)}</Text>
              </View>
              <View style={styles.previewDividerHeavy} />
              <View style={styles.previewRow}>
                <Text style={styles.previewLabelBold}>{t('reconciliation.difference')}</Text>
                <Text style={[
                  styles.previewValueBold,
                  preview.isBalanced ? styles.balanced : (preview.difference >= 0 ? styles.positive : styles.negative),
                ]}>
                  {preview.isBalanced ? t('reconciliation.balanced') : (
                    `${preview.difference >= 0 ? '+' : ''}${formatCurrency(preview.difference)}`
                  )}
                </Text>
              </View>
            </View>
          )}

          {/* Error */}
          {(error || reconError) && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error || reconError}</Text>
            </View>
          )}

          {/* Bottom spacing */}
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Footer Button */}
        <View style={styles.footer}>
          <Pressable
            style={({ pressed }) => [
              styles.submitButton,
              (!actualCash || isSaving) && styles.submitButtonDisabled,
              pressed && actualCash && !isSaving && styles.pressed,
            ]}
            onPress={handleSubmit}
            disabled={!actualCash || isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.submitButtonText}>{t('reconciliation.finishReconciliation')}</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
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
    textTransform: 'uppercase',
    flex: 1,
    textAlign: 'center',
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
  headerSpacer: {
    width: 40,
  },

  // Center container
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  emptyText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.mutedForeground,
    marginTop: SPACING.md,
  },

  // Keyboard & Scroll
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: SPACING.md,
  },

  // Completed Banner
  completedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.accent,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
    ...SHADOWS.brut,
  },
  completedText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
    textTransform: 'uppercase',
  },

  // Result Card (already reconciled)
  resultCard: {
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    ...SHADOWS.brut,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
  },
  resultDivider: {
    height: BORDERS.thin,
    backgroundColor: COLORS.muted,
  },
  resultDividerHeavy: {
    height: BORDERS.normal,
    backgroundColor: COLORS.foreground,
  },
  resultLabel: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.mutedForeground,
  },
  resultValue: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
  },
  resultValueBold: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.large,
    color: COLORS.foreground,
  },

  // Summary Card
  summaryCard: {
    backgroundColor: COLORS.secondary,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.brut,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  summaryTitle: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.white,
    opacity: 0.9,
    textTransform: 'uppercase',
    letterSpacing: TYPOGRAPHY.letterSpacing.wide,
  },
  summaryAmount: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.hero,
    color: COLORS.white,
    marginBottom: SPACING.md,
  },
  summaryBreakdown: {
    borderTopWidth: BORDERS.thin,
    borderTopColor: COLORS.overlayLight,
    paddingTop: SPACING.md,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  breakdownLabel: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.white,
    opacity: 0.8,
  },
  breakdownValue: {
    fontFamily: FONTS.monoBold,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.white,
  },
  negativeWhite: {
    color: 'hsl(0, 70%, 75%)',
  },

  // Input Section
  inputSection: {
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.cardTitle,
    color: COLORS.foreground,
    marginBottom: SPACING.xs,
  },
  inputHint: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.mutedForeground,
    marginBottom: SPACING.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    paddingHorizontal: SPACING.md,
    ...SHADOWS.brut,
  },
  currencySymbol: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.hero,
    color: COLORS.foreground,
    marginRight: SPACING.xs,
  },
  input: {
    flex: 1,
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.hero,
    color: COLORS.foreground,
    paddingVertical: SPACING.md,
  },

  // Preview Card
  previewCard: {
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    marginBottom: SPACING.md,
    ...SHADOWS.brutSm,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
  },
  previewDivider: {
    height: BORDERS.thin,
    backgroundColor: COLORS.muted,
  },
  previewDividerHeavy: {
    height: BORDERS.normal,
    backgroundColor: COLORS.foreground,
  },
  previewLabel: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.mutedForeground,
  },
  previewLabelBold: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
    textTransform: 'uppercase',
  },
  previewValue: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
  },
  previewValueBold: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.large,
    color: COLORS.foreground,
  },

  // Colors
  positive: {
    color: COLORS.accent,
  },
  negative: {
    color: COLORS.destructive,
  },
  balanced: {
    color: COLORS.accent,
  },

  // Error
  errorContainer: {
    backgroundColor: COLORS.muted,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.destructive,
    borderRadius: BORDER_RADIUS.none,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  errorText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.destructive,
  },

  // Footer
  footer: {
    padding: SPACING.md,
    paddingBottom: SPACING.lg,
    borderTopWidth: BORDERS.heavy,
    borderTopColor: COLORS.foreground,
    backgroundColor: COLORS.background,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    ...SHADOWS.brut,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.white,
    textTransform: 'uppercase',
  },

  // Pressed
  pressed: {
    transform: ANIMATION.pressedTransform,
  },
});
