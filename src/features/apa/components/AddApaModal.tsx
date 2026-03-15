/**
 * AddApaModal Component (Brutalist)
 *
 * Modal for adding new APA (cash advance) entry.
 * Shows amount input and optional note.
 *
 * @example
 * <AddApaModal visible={true} onClose={close} onSubmit={handleAdd} />
 */

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Modal,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { X } from 'phosphor-react-native';
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

/**
 * Clean and validate amount input
 * Allows numbers and one decimal point with max 2 decimal places
 */
export function cleanAmountInput(text: string): string | null {
  const cleaned = text.replace(/[^0-9.,]/g, '').replace(',', '.');
  const parts = cleaned.split('.');
  if (parts.length > 2) return null;
  if (parts[1] && parts[1].length > 2) return null;
  return cleaned;
}

/**
 * Validate amount for submission
 */
export function validateAmount(amount: string): { valid: boolean; value: number; error?: string } {
  const parsed = parseFloat(amount);
  if (isNaN(parsed) || parsed <= 0) {
    return { valid: false, value: 0, error: 'apa.errors.invalidAmount' };
  }
  return { valid: true, value: parsed };
}

interface AddApaModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (amount: number, note?: string) => Promise<{ success: boolean; error?: string }>;
  isSubmitting?: boolean;
}

export function AddApaModal({
  visible,
  onClose,
  onSubmit,
  isSubmitting = false,
}: AddApaModalProps) {
  const { t } = useAppTranslation();
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleAmountChange = (text: string) => {
    const cleaned = cleanAmountInput(text);
    if (cleaned !== null) {
      setAmount(cleaned);
    }
  };

  const handleSubmit = async () => {
    const validation = validateAmount(amount);

    if (!validation.valid) {
      setError(t('apa.errors.invalidAmount'));
      return;
    }

    setError(null);
    const result = await onSubmit(validation.value, note.trim() || undefined);

    if (result.success) {
      setAmount('');
      setNote('');
      onClose();
    } else {
      setError(result.error || t('apa.errors.addFailed'));
    }
  };

  const handleClose = () => {
    setAmount('');
    setNote('');
    setError(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Pressable style={styles.backdrop} onPress={handleClose} />

        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{t('apa.addApa')}</Text>
            <Pressable
              style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
              onPress={handleClose}
            >
              <X size={SIZES.icon.md} color={COLORS.foreground} weight="bold" />
            </Pressable>
          </View>

          {/* Subtitle */}
          <Text style={styles.subtitle}>{t('apa.subtitle')}</Text>

          {/* Amount Input */}
          <View style={styles.amountContainer}>
            <Text style={styles.currencySymbol}>€</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={handleAmountChange}
              placeholder="0,00"
              placeholderTextColor={COLORS.mutedForeground}
              keyboardType="decimal-pad"
              autoFocus
            />
          </View>

          {/* Note Input */}
          <TextInput
            style={styles.noteInput}
            value={note}
            onChangeText={setNote}
            placeholder={t('apa.notePlaceholder')}
            placeholderTextColor={COLORS.mutedForeground}
          />

          {/* Error */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Submit Button */}
          <Pressable
            style={({ pressed }) => [
              styles.submitButton,
              isSubmitting && styles.submitButtonDisabled,
              pressed && !isSubmitting && styles.pressed,
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.submitButtonText}>{t('apa.addApa')}</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
    backgroundColor: COLORS.overlay,
  },
  container: {
    backgroundColor: COLORS.card,
    borderTopWidth: BORDERS.heavy,
    borderLeftWidth: BORDERS.heavy,
    borderRightWidth: BORDERS.heavy,
    borderColor: COLORS.foreground,
    borderTopLeftRadius: BORDER_RADIUS.none,
    borderTopRightRadius: BORDER_RADIUS.none,
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  title: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.sectionTitle,
    color: COLORS.foreground,
    textTransform: 'uppercase',
  },
  closeButton: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.muted,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.mutedForeground,
    marginBottom: SPACING.lg,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.muted,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.brutSm,
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
    paddingVertical: SPACING.md,
  },
  noteInput: {
    backgroundColor: COLORS.muted,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
    marginBottom: SPACING.md,
  },
  errorContainer: {
    backgroundColor: COLORS.muted,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.destructive,
    borderRadius: BORDER_RADIUS.none,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
  },
  errorText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.destructive,
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
  pressed: {
    transform: ANIMATION.pressedTransform,
  },
});
