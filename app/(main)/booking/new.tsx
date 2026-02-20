/**
 * New Booking Screen (Brutalist)
 *
 * Create a new booking with client name, dates, guests,
 * marinas, APA amount, and notes.
 *
 * @see docs/Ahoy_Screen_Map.md §3.1
 */

import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { BrutInput } from '../../../src/components/ui/BrutInput';
import {
  COLORS,
  SHADOWS,
  BORDERS,
  SPACING,
  TYPOGRAPHY,
  FONTS,
  BORDER_RADIUS,
  ANIMATION,
} from '../../../src/config/theme';
import { DEFAULT_MARINA, MARINA_OPTIONS } from '../../../src/config/marinas';
import { formatDate } from '../../../src/utils/formatting';
import { useBookings } from '../../../src/features/booking';
import { useSeasonStore } from '../../../src/stores/seasonStore';
import { useAuthStore } from '../../../src/stores/authStore';

// ============================================
// COMPONENTS
// ============================================

interface DatePickerButtonProps {
  label: string;
  value: Date;
  onPress: () => void;
  required?: boolean;
}

function DatePickerButton({ label, value, onPress, required }: DatePickerButtonProps) {
  return (
    <View style={styles.datePickerContainer}>
      <Text style={styles.fieldLabel}>
        {label}{required && ' *'}
      </Text>
      <Pressable
        style={({ pressed }) => [
          styles.dateButton,
          pressed && styles.pressed,
        ]}
        onPress={onPress}
      >
        <Text style={styles.dateIcon}>📅</Text>
        <Text style={styles.dateText}>{formatDate(value)}</Text>
      </Pressable>
    </View>
  );
}

interface MarinaSelectProps {
  label: string;
  value: string;
  options: string[];
  onSelect: (value: string) => void;
}

function MarinaSelect({ label, value, options, onSelect }: MarinaSelectProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <View style={styles.marinaSelectContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Pressable
        style={({ pressed }) => [
          styles.selectButton,
          pressed && styles.pressed,
        ]}
        onPress={() => setShowModal(true)}
      >
        <Text style={styles.selectText}>{value}</Text>
        <Text style={styles.selectArrow}>▼</Text>
      </Pressable>

      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{label}</Text>
            <ScrollView style={styles.optionsList}>
              {options.map((option) => (
                <Pressable
                  key={option}
                  style={({ pressed }) => [
                    styles.optionItem,
                    option === value && styles.optionItemSelected,
                    pressed && styles.pressed,
                  ]}
                  onPress={() => {
                    onSelect(option);
                    setShowModal(false);
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      option === value && styles.optionTextSelected,
                    ]}
                  >
                    {option}
                  </Text>
                  {option === value && (
                    <Text style={styles.optionCheck}>✓</Text>
                  )}
                </Pressable>
              ))}
            </ScrollView>
            <Pressable
              style={({ pressed }) => [
                styles.modalCloseButton,
                pressed && styles.pressed,
              ]}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.modalCloseText}>ZATVORI</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function NewBookingScreen() {
  const router = useRouter();
  const { createBooking } = useBookings();
  const { currentSeasonId } = useSeasonStore();
  const { firebaseUser } = useAuthStore();

  // Form state
  const [clientName, setClientName] = useState('');
  const [arrivalDate, setArrivalDate] = useState(new Date());
  const [departureDate, setDepartureDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 7); // Default 7 days
    return date;
  });
  const [guestCount, setGuestCount] = useState('');
  const [departureMarina, setDepartureMarina] = useState(DEFAULT_MARINA);
  const [arrivalMarina, setArrivalMarina] = useState(DEFAULT_MARINA);
  const [apaAmount, setApaAmount] = useState('');
  const [notes, setNotes] = useState('');

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showArrivalPicker, setShowArrivalPicker] = useState(false);
  const [showDeparturePicker, setShowDeparturePicker] = useState(false);

  // Validation
  const isValid = () => {
    if (!clientName.trim()) return false;
    if (!guestCount || parseInt(guestCount) < 1) return false;
    if (departureDate <= arrivalDate) return false;
    return true;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!currentSeasonId || !firebaseUser) {
      Alert.alert('Greška', 'Prijavite se i odaberite sezonu');
      return;
    }

    if (!isValid()) {
      Alert.alert('Greška', 'Ispunite sva obavezna polja');
      return;
    }

    setIsSubmitting(true);

    const bookingData = {
      seasonId: currentSeasonId,
      arrivalDate,
      departureDate,
      departureMarina,
      arrivalMarina,
      guestCount: parseInt(guestCount),
      apaTotal: apaAmount ? parseFloat(apaAmount.replace(/[^\d,.-]/g, '').replace(',', '.')) || 0 : 0,
      notes: clientName.trim() + (notes.trim() ? '\n\n' + notes.trim() : ''),
      createdBy: firebaseUser.uid,
    };

    const result = await createBooking(bookingData);

    setIsSubmitting(false);

    if (result.success) {
      router.back();
    } else {
      Alert.alert('Greška', result.error || 'Nije uspjelo kreiranje bookinga');
    }
  };

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
        <Text style={styles.headerTitle}>NEW BOOKING</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Client Name */}
        <BrutInput
          label="CLIENT NAME *"
          placeholder="Johnson Family"
          value={clientName}
          onChangeText={setClientName}
          autoCapitalize="words"
        />

        {/* Dates Section */}
        <Text style={styles.sectionLabel}>DATES</Text>
        <View style={styles.row}>
          <View style={styles.halfColumn}>
            <DatePickerButton
              label="START DATE"
              value={arrivalDate}
              onPress={() => setShowArrivalPicker(true)}
              required
            />
          </View>
          <View style={styles.halfColumn}>
            <DatePickerButton
              label="END DATE"
              value={departureDate}
              onPress={() => setShowDeparturePicker(true)}
              required
            />
          </View>
        </View>

        {/* Guests */}
        <BrutInput
          label="GUESTS *"
          placeholder="6"
          value={guestCount}
          onChangeText={setGuestCount}
          keyboardType="number-pad"
        />

        {/* Marina Section */}
        <Text style={styles.sectionLabel}>MARINA</Text>
        <View style={styles.row}>
          <View style={styles.halfColumn}>
            <MarinaSelect
              label="DEPARTURE"
              value={departureMarina}
              options={MARINA_OPTIONS}
              onSelect={setDepartureMarina}
            />
          </View>
          <View style={styles.halfColumn}>
            <MarinaSelect
              label="ARRIVAL"
              value={arrivalMarina}
              options={MARINA_OPTIONS}
              onSelect={setArrivalMarina}
            />
          </View>
        </View>

        {/* APA Amount */}
        <BrutInput
          label="APA AMOUNT"
          placeholder="10.000 €"
          value={apaAmount}
          onChangeText={setApaAmount}
          keyboardType="numeric"
          helperText="Advance Provisioning Allowance"
        />

        {/* Notes */}
        <BrutInput
          label="NOTES (CREW-PRIVATE)"
          placeholder="Anniversary trip, special requests..."
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
          size="lg"
        />

        {/* Submit Button */}
        <Pressable
          style={({ pressed }) => [
            styles.submitButton,
            (!isValid() || isSubmitting) && styles.submitButtonDisabled,
            pressed && isValid() && !isSubmitting && styles.pressed,
          ]}
          onPress={handleSubmit}
          disabled={!isValid() || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.submitButtonText}>CREATE BOOKING</Text>
          )}
        </Pressable>

        {/* Bottom spacing */}
        <View style={{ height: SPACING.xxl }} />
      </ScrollView>

      {/* Date Picker Modals - Outside ScrollView to avoid touch issues */}
      <Modal
        visible={showArrivalPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowArrivalPicker(false)}
      >
        <Pressable
          style={styles.dateModalOverlay}
          onPress={() => setShowArrivalPicker(false)}
        >
          <View style={styles.dateModalContent}>
            <Text style={styles.dateModalTitle}>START DATE</Text>
            <DateTimePicker
              value={arrivalDate}
              mode="date"
              display="spinner"
              onChange={(event, date) => {
                if (date) setArrivalDate(date);
              }}
              minimumDate={new Date()}
              style={styles.datePicker}
            />
            <Pressable
              style={({ pressed }) => [
                styles.dateModalConfirm,
                pressed && styles.pressed,
              ]}
              onPress={() => {
                // Auto-adjust departure if needed
                if (arrivalDate >= departureDate) {
                  const newDeparture = new Date(arrivalDate);
                  newDeparture.setDate(newDeparture.getDate() + 1);
                  setDepartureDate(newDeparture);
                }
                setShowArrivalPicker(false);
              }}
            >
              <Text style={styles.dateModalConfirmText}>POTVRDI</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      <Modal
        visible={showDeparturePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeparturePicker(false)}
      >
        <Pressable
          style={styles.dateModalOverlay}
          onPress={() => setShowDeparturePicker(false)}
        >
          <View style={styles.dateModalContent}>
            <Text style={styles.dateModalTitle}>END DATE</Text>
            <DateTimePicker
              value={departureDate}
              mode="date"
              display="spinner"
              onChange={(event, date) => {
                if (date) setDepartureDate(date);
              }}
              minimumDate={new Date(arrivalDate.getTime() + 24 * 60 * 60 * 1000)}
              style={styles.datePicker}
            />
            <Pressable
              style={({ pressed }) => [
                styles.dateModalConfirm,
                pressed && styles.pressed,
              ]}
              onPress={() => setShowDeparturePicker(false)}
            >
              <Text style={styles.dateModalConfirmText}>POTVRDI</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  // Container
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
  headerTitle: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.cardTitle,
    color: COLORS.foreground,
    textTransform: 'uppercase',
  },
  headerSpacer: {
    width: 40,
  },

  // ScrollView
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
  },

  // Section Label
  sectionLabel: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
    letterSpacing: 1,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },

  // Row layout
  row: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  halfColumn: {
    flex: 1,
  },

  // Field Label
  fieldLabel: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
    letterSpacing: TYPOGRAPHY.letterSpacing.widest,
    textTransform: 'uppercase',
    marginBottom: SPACING.xs,
  },

  // Date Picker Button
  datePickerContainer: {
    flex: 1,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  dateIcon: {
    fontSize: 18,
    marginRight: SPACING.sm,
  },
  dateText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
  },

  // Marina Select
  marinaSelectContainer: {
    flex: 1,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  selectText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
    flex: 1,
  },
  selectArrow: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
  },

  // Date Modal
  dateModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
    textTransform: 'uppercase',
    padding: SPACING.md,
    borderBottomWidth: BORDERS.normal,
    borderBottomColor: COLORS.foreground,
    textAlign: 'center',
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

  // Marina Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
    padding: SPACING.md,
    borderBottomWidth: BORDERS.normal,
    borderBottomColor: COLORS.foreground,
  },
  optionsList: {
    maxHeight: 300,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: BORDERS.thin,
    borderBottomColor: COLORS.muted,
  },
  optionItemSelected: {
    backgroundColor: COLORS.primaryLight,
  },
  optionText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
  },
  optionTextSelected: {
    fontFamily: FONTS.display,
    color: COLORS.primary,
  },
  optionCheck: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.large,
    color: COLORS.primary,
  },
  modalCloseButton: {
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

  // Submit Button
  submitButton: {
    backgroundColor: COLORS.primary,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.lg,
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

  // Pressed state
  pressed: {
    transform: ANIMATION.pressedTransform,
  },
});
