/**
 * Add Work Day Screen (Brutalist)
 *
 * Add a new work day entry for income tracking.
 * PRIVATE: Only affects current user's data.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  COLORS,
  SHADOWS,
  BORDERS,
  SPACING,
  TYPOGRAPHY,
  FONTS,
  BORDER_RADIUS,
  ANIMATION,
  SIZES,
} from '@/config/theme';
import { Warning, Calendar } from 'phosphor-react-native';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useSeason } from '@/features/season/hooks/useSeason';
import { useIncome } from '@/features/income';
import { formatDate, formatCurrency } from '@/utils/formatting';
import type { WorkDayType } from '@/features/income';

export default function AddWorkDayScreen() {
  const router = useRouter();
  const { firebaseUser } = useAuth();
  const { currentSeasonId } = useSeason();
  const { settings, addWorkDay } = useIncome(
    firebaseUser?.uid,
    currentSeasonId || undefined
  );

  // Form state
  const [date, setDate] = useState(new Date());
  const [type, setType] = useState<WorkDayType>('guest');
  const [note, setNote] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Calculate earnings preview
  const getEarningsPreview = (): number => {
    if (!settings) return 0;
    return type === 'guest' ? settings.guestDayRate : settings.nonGuestDayRate;
  };

  // Handle date change
  const handleDateChange = (_: unknown, selectedDate?: Date) => {
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  // Confirm date selection
  const confirmDate = () => {
    setShowDatePicker(false);
  };

  // Handle save
  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);

    const result = await addWorkDay({
      date,
      type,
      note: note.trim() || undefined,
    });

    setIsSaving(false);

    if (result.success) {
      router.back();
    } else {
      setSaveError(result.error || 'Greška pri spremanju');
    }
  };

  const earnings = getEarningsPreview();
  const hasSettings = settings && (settings.guestDayRate > 0 || settings.nonGuestDayRate > 0);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>NOVI RADNI DAN</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* No Settings Warning */}
        {!hasSettings && (
          <View style={styles.warningBox}>
            <Warning size={20} color={COLORS.foreground} weight="fill" />
            <View style={styles.warningContent}>
              <Text style={styles.warningText}>
                Nemaš postavljene dnevnice. Zarada će biti 0€.
              </Text>
              <Pressable
                style={({ pressed }) => [styles.warningLink, pressed && styles.pressed]}
                onPress={() => router.push('/(main)/settings/income')}
              >
                <Text style={styles.warningLinkText}>POSTAVI DNEVNICE →</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Date Selection */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>DATUM</Text>
          <Pressable
            style={({ pressed }) => [styles.dateButton, pressed && styles.pressed]}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateText}>{formatDate(date)}</Text>
            <Calendar size={20} color={COLORS.foreground} weight="regular" />
          </Pressable>
        </View>

        {/* Type Selection */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>VRSTA DANA</Text>
          <View style={styles.typeRow}>
            <Pressable
              style={({ pressed }) => [
                styles.typeButton,
                type === 'guest' && styles.typeButtonActive,
                pressed && styles.pressed,
              ]}
              onPress={() => setType('guest')}
            >
              <Text style={styles.typeIcon}>👥</Text>
              <Text
                style={[
                  styles.typeText,
                  type === 'guest' && styles.typeTextActive,
                ]}
              >
                S GOSTIMA
              </Text>
              {settings && (
                <Text
                  style={[
                    styles.typeRate,
                    type === 'guest' && styles.typeRateActive,
                  ]}
                >
                  {formatCurrency(settings.guestDayRate)}
                </Text>
              )}
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.typeButton,
                type === 'non-guest' && styles.typeButtonActive,
                pressed && styles.pressed,
              ]}
              onPress={() => setType('non-guest')}
            >
              <Text style={styles.typeIcon}>🔧</Text>
              <Text
                style={[
                  styles.typeText,
                  type === 'non-guest' && styles.typeTextActive,
                ]}
              >
                BEZ GOSTIJU
              </Text>
              {settings && (
                <Text
                  style={[
                    styles.typeRate,
                    type === 'non-guest' && styles.typeRateActive,
                  ]}
                >
                  {formatCurrency(settings.nonGuestDayRate)}
                </Text>
              )}
            </Pressable>
          </View>
        </View>

        {/* Earnings Preview */}
        <View style={styles.earningsPreview}>
          <Text style={styles.earningsLabel}>ZARADA</Text>
          <Text style={styles.earningsValue}>{formatCurrency(earnings)}</Text>
        </View>

        {/* Note Input */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>BILJEŠKA (OPCIONALNO)</Text>
          <TextInput
            style={styles.noteInput}
            value={note}
            onChangeText={setNote}
            placeholder="Npr. Charter Dubrovnik-Split"
            placeholderTextColor={COLORS.mutedForeground}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Error Message */}
        {saveError && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{saveError}</Text>
          </View>
        )}

        {/* Save Button */}
        <Pressable
          style={({ pressed }) => [
            styles.saveButton,
            isSaving && styles.saveButtonDisabled,
            pressed && styles.pressed,
          ]}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Text style={styles.saveButtonText}>DODAJ RADNI DAN</Text>
          )}
        </Pressable>

        {/* Bottom spacing */}
        <View style={{ height: SPACING.xxl * 2 }} />
      </ScrollView>

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <Pressable
          style={styles.dateModalOverlay}
          onPress={() => setShowDatePicker(false)}
        >
          <View style={styles.dateModalContent}>
            <Text style={styles.dateModalTitle}>ODABERI DATUM</Text>
            <DateTimePicker
              value={date}
              mode="date"
              display="spinner"
              onChange={handleDateChange}
              style={styles.datePicker}
              maximumDate={new Date()}
            />
            <Pressable style={styles.dateModalConfirm} onPress={confirmDate}>
              <Text style={styles.dateModalConfirmText}>POTVRDI</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
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
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  headerTitle: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.cardTitle,
    color: COLORS.foreground,
  },
  headerSpacer: {
    width: 40,
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
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.cardTitle,
    color: COLORS.foreground,
  },

  // ScrollView
  scrollView: {
    flex: 1,
    padding: SPACING.md,
  },

  // Warning Box
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.warning,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.brutSm,
  },
  warningIcon: {
    marginRight: SPACING.sm,
  },
  warningContent: {
    flex: 1,
  },
  warningText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
    marginBottom: SPACING.xs,
  },
  warningLink: {
    alignSelf: 'flex-start',
  },
  warningLinkText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.primary,
    letterSpacing: 0.5,
  },

  // Form Section
  formSection: {
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.brut,
  },
  sectionTitle: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
    letterSpacing: 1,
    marginBottom: SPACING.md,
  },

  // Date Button
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  dateText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.large,
    color: COLORS.foreground,
  },

  // Type Selection
  typeRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  typeButton: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    padding: SPACING.md,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: COLORS.accent,
    ...SHADOWS.brut,
  },
  typeIcon: {
    fontSize: 24,
    marginBottom: SPACING.xs,
  },
  typeText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
    letterSpacing: 0.5,
    marginBottom: SPACING.xs,
  },
  typeTextActive: {
    color: COLORS.foreground,
  },
  typeRate: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.mutedForeground,
  },
  typeRateActive: {
    color: COLORS.foreground,
  },

  // Earnings Preview
  earningsPreview: {
    backgroundColor: COLORS.secondary,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    alignItems: 'center',
    ...SHADOWS.brut,
  },
  earningsLabel: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.white,
    letterSpacing: 1,
    marginBottom: SPACING.xs,
    opacity: 0.9,
  },
  earningsValue: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.hero,
    color: COLORS.white,
  },

  // Note Input
  noteInput: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
    backgroundColor: COLORS.background,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    minHeight: 80,
  },

  // Error Box
  errorBox: {
    backgroundColor: COLORS.destructive,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  errorText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.white,
    textAlign: 'center',
  },

  // Save Button
  saveButton: {
    backgroundColor: COLORS.accent,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    ...SHADOWS.brut,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
    letterSpacing: 1,
  },

  // Date Modal
  dateModalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  dateModalContent: {
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    width: '100%',
    ...SHADOWS.brutLg,
  },
  dateModalTitle: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.cardTitle,
    color: COLORS.foreground,
    textAlign: 'center',
    textTransform: 'uppercase',
    paddingVertical: SPACING.md,
    borderBottomWidth: BORDERS.normal,
    borderBottomColor: COLORS.foreground,
  },
  datePicker: {
    height: 200,
    backgroundColor: COLORS.card,
  },
  dateModalConfirm: {
    backgroundColor: COLORS.primary,
    borderTopWidth: BORDERS.normal,
    borderTopColor: COLORS.foreground,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  dateModalConfirmText: {
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
