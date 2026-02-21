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
import { COLORS } from '@/config/theme';
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
      Alert.alert('Error', 'Please enter a boat name');
      return;
    }
    if (!seasonName.trim()) {
      Alert.alert('Error', 'Please enter a season name');
      return;
    }
    if (endDate <= startDate) {
      Alert.alert('Error', 'End date must be after start date');
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
      Alert.alert('Error', result.error || 'Failed to create boat');
    }
  };

  const handleStartDateChange = (_: unknown, date?: Date) => {
    setShowStartPicker(Platform.OS === 'ios');
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
    setShowEndPicker(Platform.OS === 'ios');
    if (date) {
      setEndDate(date);
    }
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
              <Text style={styles.backText}>Back</Text>
            </Pressable>
          </View>

          {/* Title */}
          <Text style={styles.title}>Create Your Boat</Text>
          <Text style={styles.subtitle}>
            Set up your yacht workspace for the season
          </Text>

          {/* Form */}
          <View style={styles.form}>
            {/* Boat Name */}
            <View style={styles.field}>
              <Text style={styles.label}>Boat Name</Text>
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
              <Text style={styles.label}>Season Name</Text>
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
                <Text style={styles.label}>Season Start</Text>
                <Pressable
                  style={styles.dateButton}
                  onPress={() => setShowStartPicker(true)}
                  disabled={isLoading}
                >
                  <Text style={styles.dateText}>{formatDate(startDate)}</Text>
                </Pressable>
              </View>

              <View style={[styles.field, styles.dateField]}>
                <Text style={styles.label}>Season End</Text>
                <Pressable
                  style={styles.dateButton}
                  onPress={() => setShowEndPicker(true)}
                  disabled={isLoading}
                >
                  <Text style={styles.dateText}>{formatDate(endDate)}</Text>
                </Pressable>
              </View>
            </View>

            {/* Date Pickers */}
            {showStartPicker && (
              <DateTimePicker
                value={startDate}
                mode="date"
                display="spinner"
                onChange={handleStartDateChange}
              />
            )}
            {showEndPicker && (
              <DateTimePicker
                value={endDate}
                mode="date"
                display="spinner"
                minimumDate={startDate}
                onChange={handleEndDateChange}
              />
            )}

            {/* Currency */}
            <View style={styles.field}>
              <Text style={styles.label}>Currency</Text>
              <Pressable
                style={styles.selectButton}
                onPress={() => setShowCurrencyPicker(true)}
                disabled={isLoading}
              >
                <Text style={styles.selectText}>
                  {selectedCurrency?.label || 'Select currency'}
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
                <Text style={styles.submitText}>Continue</Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

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
              <Text style={styles.modalTitle}>Select Currency</Text>
              <Pressable onPress={() => setShowCurrencyPicker(false)}>
                <Text style={styles.modalClose}>Done</Text>
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
  container: {
    flex: 1,
    backgroundColor: COLORS.card,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    paddingVertical: 16,
  },
  backButton: {
    paddingVertical: 8,
  },
  backText: {
    fontSize: 16,
    color: COLORS.coral,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 32,
  },
  form: {
    flex: 1,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateField: {
    flex: 1,
  },
  dateButton: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dateText: {
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  selectButton: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectText: {
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  selectArrow: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  submitButton: {
    backgroundColor: COLORS.coral,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    minHeight: 52,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  submitText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surface,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  modalClose: {
    fontSize: 16,
    color: COLORS.coral,
    fontWeight: '600',
  },
  currencyOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surface,
  },
  currencyOptionSelected: {
    backgroundColor: `${COLORS.coral}10`,
  },
  currencyOptionText: {
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  currencyOptionTextSelected: {
    color: COLORS.coral,
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 16,
    color: COLORS.coral,
    fontWeight: '600',
  },
});
