/**
 * Income Settings Screen (Brutalist)
 *
 * Configure personal daily rates for income tracking.
 * PRIVATE: Only visible to the current user.
 */

import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  COLORS,
  SHADOWS,
  BORDERS,
  SPACING,
  TYPOGRAPHY,
  FONTS,
  BORDER_RADIUS,
  ANIMATION,
} from '@/config/theme';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useSeason } from '@/features/season/hooks/useSeason';
import { useIncome } from '@/features/income';

export default function IncomeSettingsScreen() {
  const router = useRouter();
  const { firebaseUser } = useAuth();
  const { currentSeasonId } = useSeason();
  const { settings, isLoading, saveSettings } = useIncome(
    firebaseUser?.uid,
    currentSeasonId || undefined
  );

  // Form state
  const [guestRate, setGuestRate] = useState('');
  const [nonGuestRate, setNonGuestRate] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load existing settings
  useEffect(() => {
    if (settings) {
      setGuestRate(settings.guestDayRate.toString());
      setNonGuestRate(settings.nonGuestDayRate.toString());
    }
  }, [settings]);

  // Handle save
  const handleSave = async () => {
    const guestRateNum = parseFloat(guestRate.replace(',', '.')) || 0;
    const nonGuestRateNum = parseFloat(nonGuestRate.replace(',', '.')) || 0;

    if (guestRateNum < 0 || nonGuestRateNum < 0) {
      setSaveError('Iznosi ne mogu biti negativni');
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    const result = await saveSettings(guestRateNum, nonGuestRateNum);

    setIsSaving(false);

    if (result.success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } else {
      // Show actual error for debugging
      setSaveError(result.error || 'Nije moguće spremiti. Pokušaj ponovo.');
    }
  };

  // Check if form has changes
  const hasChanges = () => {
    const currentGuestRate = parseFloat(guestRate.replace(',', '.')) || 0;
    const currentNonGuestRate = parseFloat(nonGuestRate.replace(',', '.')) || 0;
    return (
      currentGuestRate !== (settings?.guestDayRate || 0) ||
      currentNonGuestRate !== (settings?.nonGuestDayRate || 0)
    );
  };

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
        <Text style={styles.headerTitle}>POSTAVKE ZARADE</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.accent} />
            <Text style={styles.loadingText}>Učitavanje...</Text>
          </View>
        ) : (
          <>
            {/* Privacy Notice */}
            <View style={styles.privacyBox}>
              <Text style={styles.privacyIcon}>🔒</Text>
              <Text style={styles.privacyText}>
                Ovi podaci su privatni i vidljivi samo tebi.
              </Text>
            </View>

            {/* Rate Settings */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>DNEVNICE</Text>

              {/* Guest Day Rate */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>DNEVNICA S GOSTIMA</Text>
                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.input}
                    value={guestRate}
                    onChangeText={setGuestRate}
                    placeholder="0"
                    placeholderTextColor={COLORS.mutedForeground}
                    keyboardType="decimal-pad"
                  />
                  <View style={styles.currencyBadge}>
                    <Text style={styles.currencyText}>€</Text>
                  </View>
                </View>
                <Text style={styles.fieldHint}>
                  Iznos koji zaradiš po danu kada su gosti na brodu
                </Text>
              </View>

              {/* Non-Guest Day Rate */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>DNEVNICA BEZ GOSTIJU</Text>
                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.input}
                    value={nonGuestRate}
                    onChangeText={setNonGuestRate}
                    placeholder="0"
                    placeholderTextColor={COLORS.mutedForeground}
                    keyboardType="decimal-pad"
                  />
                  <View style={styles.currencyBadge}>
                    <Text style={styles.currencyText}>€</Text>
                  </View>
                </View>
                <Text style={styles.fieldHint}>
                  Iznos koji zaradiš po danu bez gostiju (priprema, održavanje)
                </Text>
              </View>
            </View>

            {/* Error Message */}
            {saveError && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{saveError}</Text>
              </View>
            )}

            {/* Success Message */}
            {saveSuccess && (
              <View style={styles.successBox}>
                <Text style={styles.successText}>✓ Spremljeno!</Text>
              </View>
            )}

            {/* Save Button */}
            <Pressable
              style={({ pressed }) => [
                styles.saveButton,
                !hasChanges() && styles.saveButtonDisabled,
                pressed && styles.pressed,
              ]}
              onPress={handleSave}
              disabled={isSaving || !hasChanges()}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Text style={styles.saveButtonText}>SPREMI POSTAVKE</Text>
              )}
            </Pressable>

            {/* Info */}
            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>KAKO FUNKCIONIRA</Text>
              <Text style={styles.infoText}>
                Ove dnevnice koriste se za automatski izračun tvoje zarade kada
                dodaješ radne dane. Možeš ih promijeniti u bilo kojem trenutku.
              </Text>
            </View>

            {/* Bottom spacing */}
            <View style={{ height: SPACING.xxl * 2 }} />
          </>
        )}
      </ScrollView>
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

  // Loading
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xxl,
  },
  loadingText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.mutedForeground,
    marginTop: SPACING.md,
  },

  // Privacy Box
  privacyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.brutSm,
  },
  privacyIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  privacyText: {
    flex: 1,
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
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

  // Field Group
  fieldGroup: {
    marginBottom: SPACING.lg,
  },
  fieldLabel: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.foreground,
    letterSpacing: 0.5,
    marginBottom: SPACING.xs,
  },
  fieldHint: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.meta,
    color: COLORS.mutedForeground,
    marginTop: SPACING.xs,
  },

  // Input Row
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.large,
    color: COLORS.foreground,
    backgroundColor: COLORS.background,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  currencyBadge: {
    backgroundColor: COLORS.primary,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderLeftWidth: 0,
    borderRadius: BORDER_RADIUS.none,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currencyText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.large,
    color: COLORS.foreground,
  },

  // Messages
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
  successBox: {
    backgroundColor: COLORS.accent,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  successText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
    textAlign: 'center',
  },

  // Save Button
  saveButton: {
    backgroundColor: COLORS.secondary,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.brut,
  },
  saveButtonDisabled: {
    backgroundColor: COLORS.muted,
    opacity: 0.7,
  },
  saveButtonText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.white,
    letterSpacing: 1,
  },

  // Info Box
  infoBox: {
    backgroundColor: COLORS.muted,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    padding: SPACING.md,
  },
  infoTitle: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.foreground,
    letterSpacing: 0.5,
    marginBottom: SPACING.xs,
  },
  infoText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.mutedForeground,
    lineHeight: 20,
  },

  // Pressed
  pressed: {
    transform: ANIMATION.pressedTransform,
  },
});
