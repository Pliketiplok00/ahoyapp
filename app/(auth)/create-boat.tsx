/**
 * Create Boat Screen
 *
 * Form for creating a new boat workspace (season).
 * Includes boat name, season name, dates, and currency.
 */

import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSeason } from '@/features/season/hooks/useSeason';
import {
  COLORS,
  BORDERS,
  SPACING,
  TYPOGRAPHY,
  FONTS,
  BORDER_RADIUS,
  SHADOWS,
  ANIMATION,
} from '@/config/theme';
import { CURRENCY_OPTIONS, DEFAULT_CURRENCY } from '@/constants/currencies';
import { formatDate } from '@/utils/formatting';

export default function CreateBoatScreen() {
  const router = useRouter();
  const { createSeason, isLoading } = useSeason();

  // Form state
  const [boatName, setBoatName] = useState('');
  const [seasonName, setSeasonName] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() + 6);
    return date;
  });
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY);

  // UI state
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);

  const handleCreateBoat = async () => {
    if (!boatName.trim()) {
      Alert.alert('Greška', 'Molimo unesite ime broda');
      return;
    }
    if (!seasonName.trim()) {
      Alert.alert('Greška', 'Molimo unesite ime sezone');
      return;
    }
    if (endDate <= startDate) {
      Alert.alert('Greška', 'Datum završetka mora biti nakon datuma početka');
      return;
    }

    const result = await createSeason({
      boatName: boatName.trim(),
      name: seasonName.trim(),
      startDate,
      endDate,
      currency,
    });

    if (result.success) {
      // Navigate to invite crew screen
      router.replace('/(auth)/invite-crew');
    } else {
      Alert.alert('Greška', result.error || 'Kreiranje broda nije uspjelo');
    }
  };

  const handleStartDateChange = (_: unknown, date?: Date) => {
    if (date) {
      setStartDate(date);
      // Ensure end date is after start date
      if (date >= endDate) {
        const newEnd = new Date(date);
        newEnd.setMonth(newEnd.getMonth() + 6);
        setEndDate(newEnd);
      }
    }
  };

  const handleEndDateChange = (_: unknown, date?: Date) => {
    if (date) {
      setEndDate(date);
    }
  };

  const confirmStartDate = () => {
    // Auto-adjust end date if needed
    if (startDate >= endDate) {
      const newEnd = new Date(startDate);
      newEnd.setMonth(newEnd.getMonth() + 6);
      setEndDate(newEnd);
    }
    setShowStartPicker(false);
  };

  const confirmEndDate = () => {
    setShowEndPicker(false);
  };

  const selectedCurrency = CURRENCY_OPTIONS.find((c) => c.value === currency);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Text style={styles.backText}>Natrag</Text>
            </Pressable>
          </View>

          {/* Title */}
          <Text style={styles.title}>Kreiraj svoj brod</Text>
          <Text style={styles.subtitle}>
            Postavi radni prostor jahte za sezonu
          </Text>

          {/* Form */}
          <View style={styles.form}>
            {/* Boat Name */}
            <View style={styles.field}>
              <Text style={styles.label}>Ime broda</Text>
              <TextInput
                style={styles.input}
                placeholder="S/Y Adriatic Dream"
                placeholderTextColor={COLORS.textMuted}
                value={boatName}
                onChangeText={setBoatName}
                autoCapitalize="words"
                editable={!isLoading}
              />
            </View>

            {/* Season Name */}
            <View style={styles.field}>
              <Text style={styles.label}>Ime sezone</Text>
              <TextInput
                style={styles.input}
                placeholder="Summer 2026"
                placeholderTextColor={COLORS.textMuted}
                value={seasonName}
                onChangeText={setSeasonName}
                autoCapitalize="words"
                editable={!isLoading}
              />
            </View>

            {/* Season Dates */}
            <View style={styles.dateRow}>
              <View style={[styles.field, styles.dateField]}>
                <Text style={styles.label}>Početak sezone</Text>
                <Pressable
                  style={styles.dateButton}
                  onPress={() => setShowStartPicker(true)}
                  disabled={isLoading}
                >
                  <Text style={styles.dateText}>{formatDate(startDate)}</Text>
                </Pressable>
              </View>

              <View style={[styles.field, styles.dateField]}>
                <Text style={styles.label}>Kraj sezone</Text>
                <Pressable
                  style={styles.dateButton}
                  onPress={() => setShowEndPicker(true)}
                  disabled={isLoading}
                >
                  <Text style={styles.dateText}>{formatDate(endDate)}</Text>
                </Pressable>
              </View>
            </View>


            {/* Currency */}
            <View style={styles.field}>
              <Text style={styles.label}>Valuta</Text>
              <Pressable
                style={styles.selectButton}
                onPress={() => setShowCurrencyPicker(true)}
                disabled={isLoading}
              >
                <Text style={styles.selectText}>
                  {selectedCurrency?.label || 'Odaberi valutu'}
                </Text>
                <Text style={styles.selectArrow}>v</Text>
              </Pressable>
            </View>

            {/* Submit Button */}
            <Pressable
              style={[styles.submitButton, isLoading && styles.buttonDisabled]}
              onPress={handleCreateBoat}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.submitText}>Nastavi</Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Start Date Picker Modal */}
      <Modal
        visible={showStartPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowStartPicker(false)}
      >
        <Pressable
          style={styles.dateModalOverlay}
          onPress={() => setShowStartPicker(false)}
        >
          <View style={styles.dateModalContent}>
            <Text style={styles.dateModalTitle}>Početak sezone</Text>
            <DateTimePicker
              value={startDate}
              mode="date"
              display="spinner"
              onChange={handleStartDateChange}
              style={styles.datePicker}
            />
            <Pressable style={styles.dateModalConfirm} onPress={confirmStartDate}>
              <Text style={styles.dateModalConfirmText}>POTVRDI</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* End Date Picker Modal */}
      <Modal
        visible={showEndPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEndPicker(false)}
      >
        <Pressable
          style={styles.dateModalOverlay}
          onPress={() => setShowEndPicker(false)}
        >
          <View style={styles.dateModalContent}>
            <Text style={styles.dateModalTitle}>Kraj sezone</Text>
            <DateTimePicker
              value={endDate}
              mode="date"
              display="spinner"
              minimumDate={startDate}
              onChange={handleEndDateChange}
              style={styles.datePicker}
            />
            <Pressable style={styles.dateModalConfirm} onPress={confirmEndDate}>
              <Text style={styles.dateModalConfirmText}>POTVRDI</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* Currency Picker Modal */}
      <Modal
        visible={showCurrencyPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCurrencyPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Odaberi valutu</Text>
              <Pressable onPress={() => setShowCurrencyPicker(false)}>
                <Text style={styles.modalClose}>Gotovo</Text>
              </Pressable>
            </View>
            <FlatList
              data={CURRENCY_OPTIONS}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <Pressable
                  style={[
                    styles.currencyOption,
                    currency === item.value && styles.currencyOptionSelected,
                  ]}
                  onPress={() => {
                    setCurrency(item.value);
                    setShowCurrencyPicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.currencyOptionText,
                      currency === item.value && styles.currencyOptionTextSelected,
                    ]}
                  >
                    {item.label} - {item.name}
                  </Text>
                  {currency === item.value && (
                    <Text style={styles.checkmark}>OK</Text>
                  )}
                </Pressable>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Container
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },

  // Header
  header: {
    paddingVertical: SPACING.md,
  },
  backButton: {
    width: 80,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    alignItems: 'center',
    ...SHADOWS.brutSm,
  },
  backText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
  },

  // Title
  title: {
    fontFamily: FONTS.display,
    fontSize: 32,
    color: COLORS.foreground,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.mutedForeground,
    marginBottom: SPACING.xl,
  },

  // Form
  form: {
    flex: 1,
  },
  field: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: TYPOGRAPHY.letterSpacing.widest,
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

  // Date Row
  dateRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  dateField: {
    flex: 1,
  },
  dateButton: {
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
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

  // Select Button
  selectButton: {
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
  },
  selectArrow: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
  },

  // Submit Button
  submitButton: {
    backgroundColor: COLORS.accent,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.xl,
    minHeight: 52,
    ...SHADOWS.brut,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  submitText: {
    fontFamily: FONTS.display,
    color: COLORS.foreground,
    fontSize: TYPOGRAPHY.sizes.body,
    textTransform: 'uppercase',
  },

  // Currency Modal
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
    maxHeight: '60%',
    ...SHADOWS.brutLg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: BORDERS.normal,
    borderBottomColor: COLORS.foreground,
  },
  modalTitle: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.cardTitle,
    color: COLORS.foreground,
    textTransform: 'uppercase',
  },
  modalClose: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.accent,
  },
  currencyOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: BORDERS.thin,
    borderBottomColor: COLORS.muted,
  },
  currencyOptionSelected: {
    backgroundColor: COLORS.primaryLight,
  },
  currencyOptionText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
  },
  currencyOptionTextSelected: {
    fontFamily: FONTS.display,
    color: COLORS.primary,
  },
  checkmark: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.primary,
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
});
