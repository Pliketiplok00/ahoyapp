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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { BrutInput } from '@/components/ui/BrutInput';
import { Calendar, Check } from 'phosphor-react-native';
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
import { DEFAULT_MARINA, MARINA_OPTIONS } from '@/config/marinas';
import { formatDate } from '@/utils/formatting';
import { useBookings } from '@/features/booking';
import { useSeasonStore } from '@/stores/seasonStore';
import { useAuthStore } from '@/stores/authStore';

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
        <Calendar size={SIZES.icon.md} color={COLORS.foreground} weight="regular" />
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
                    <Check size={SIZES.icon.sm} color={COLORS.primary} weight="bold" />
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
  const { currentSeasonId, currentSeason } = useSeasonStore();
  const { firebaseUser } = useAuthStore();

  // Get season date limits
  const seasonStartDate = currentSeason?.startDate?.toDate() || new Date();
  const seasonEndDate = currentSeason?.endDate?.toDate();

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

  // Pending dates for validation (before user confirms)
  const [pendingArrivalDate, setPendingArrivalDate] = useState<Date | null>(null);
  const [pendingDepartureDate, setPendingDepartureDate] = useState<Date | null>(null);

  // Validation
  const isValid = () => {
    if (!clientName.trim()) return false;

    // Compare dates by day only (ignore time component)
    const arrivalDay = new Date(arrivalDate).setHours(0, 0, 0, 0);
    const departureDay = new Date(departureDate).setHours(0, 0, 0, 0);
    if (departureDay <= arrivalDay) return false;

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
      guestCount: guestCount ? parseInt(guestCount) : null,
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
        <Text style={styles.headerTitle}>NOVI BOOKING</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
        >
        {/* Client Name */}
        <BrutInput
          label="IME KLIJENTA *"
          placeholder="Obitelj Horvat"
          value={clientName}
          onChangeText={setClientName}
          autoCapitalize="words"
        />

        {/* Dates Section */}
        <Text style={styles.sectionLabel}>DATUMI</Text>
        <View style={styles.row}>
          <View style={styles.halfColumn}>
            <DatePickerButton
              label="DATUM POČETKA"
              value={arrivalDate}
              onPress={() => setShowArrivalPicker(true)}
              required
            />
          </View>
          <View style={styles.halfColumn}>
            <DatePickerButton
              label="DATUM ZAVRŠETKA"
              value={departureDate}
              onPress={() => setShowDeparturePicker(true)}
              required
            />
          </View>
        </View>

        {/* Guests */}
        <BrutInput
          label="GOSTI"
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
              label="POLAZAK"
              value={departureMarina}
              options={MARINA_OPTIONS}
              onSelect={setDepartureMarina}
            />
          </View>
          <View style={styles.halfColumn}>
            <MarinaSelect
              label="DOLAZAK"
              value={arrivalMarina}
              options={MARINA_OPTIONS}
              onSelect={setArrivalMarina}
            />
          </View>
        </View>

        {/* APA Amount */}
        <BrutInput
          label="APA IZNOS"
          placeholder="10.000 €"
          value={apaAmount}
          onChangeText={setApaAmount}
          keyboardType="numeric"
          helperText="Predujam za opskrbu"
        />

        {/* Notes */}
        <BrutInput
          label="BILJEŠKE"
          placeholder="Posebni zahtjevi, preferencije..."
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
            <Text style={styles.submitButtonText}>KREIRAJ BOOKING</Text>
          )}
        </Pressable>

        {/* Bottom spacing */}
        <View style={{ height: SPACING.xxl }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Date Picker Modals - Outside ScrollView to avoid touch issues */}
      <Modal
        visible={showArrivalPicker}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setPendingArrivalDate(null);
          setShowArrivalPicker(false);
        }}
      >
        <Pressable
          style={styles.dateModalOverlay}
          onPress={() => {
            setPendingArrivalDate(null);
            setShowArrivalPicker(false);
          }}
        >
          <View style={styles.dateModalContent}>
            <Text style={styles.dateModalTitle}>DATUM POČETKA</Text>
            <DateTimePicker
              value={pendingArrivalDate || arrivalDate}
              mode="date"
              display="spinner"
              onChange={(event, date) => {
                if (date) setPendingArrivalDate(date);
              }}
              style={styles.datePicker}
            />
            <Pressable
              style={({ pressed }) => [
                styles.dateModalConfirm,
                pressed && styles.pressed,
              ]}
              onPress={() => {
                const dateToUse = pendingArrivalDate || arrivalDate;

                // Check if outside season and show warning
                const isBeforeSeason = dateToUse < seasonStartDate;
                const isAfterSeason = seasonEndDate && dateToUse > seasonEndDate;

                if (isBeforeSeason || isAfterSeason) {
                  const warningMessage = isBeforeSeason
                    ? `Odabrani datum (${formatDate(dateToUse)}) je prije početka sezone (${formatDate(seasonStartDate)}). Želiš li nastaviti?`
                    : `Odabrani datum (${formatDate(dateToUse)}) je izvan sezone koja traje do ${formatDate(seasonEndDate!)}. Želiš li nastaviti?`;

                  Alert.alert(
                    'Datum izvan sezone',
                    warningMessage,
                    [
                      {
                        text: 'Odustani',
                        style: 'cancel',
                        onPress: () => {
                          setPendingArrivalDate(null);
                        }
                      },
                      {
                        text: 'Nastavi svejedno',
                        onPress: () => {
                          setArrivalDate(dateToUse);
                          // Auto-adjust departure if needed
                          if (dateToUse >= departureDate) {
                            const newDeparture = new Date(dateToUse);
                            newDeparture.setDate(newDeparture.getDate() + 1);
                            setDepartureDate(newDeparture);
                          }
                          setPendingArrivalDate(null);
                          setShowArrivalPicker(false);
                        }
                      }
                    ]
                  );
                } else {
                  // Date is within season, apply directly
                  setArrivalDate(dateToUse);
                  // Auto-adjust departure if needed
                  if (dateToUse >= departureDate) {
                    const newDeparture = new Date(dateToUse);
                    newDeparture.setDate(newDeparture.getDate() + 1);
                    setDepartureDate(newDeparture);
                  }
                  setPendingArrivalDate(null);
                  setShowArrivalPicker(false);
                }
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
        onRequestClose={() => {
          setPendingDepartureDate(null);
          setShowDeparturePicker(false);
        }}
      >
        <Pressable
          style={styles.dateModalOverlay}
          onPress={() => {
            setPendingDepartureDate(null);
            setShowDeparturePicker(false);
          }}
        >
          <View style={styles.dateModalContent}>
            <Text style={styles.dateModalTitle}>DATUM ZAVRŠETKA</Text>
            <DateTimePicker
              value={pendingDepartureDate || departureDate}
              mode="date"
              display="spinner"
              onChange={(event, date) => {
                if (date) setPendingDepartureDate(date);
              }}
              minimumDate={new Date(arrivalDate.getTime() + 24 * 60 * 60 * 1000)}
              style={styles.datePicker}
            />
            <Pressable
              style={({ pressed }) => [
                styles.dateModalConfirm,
                pressed && styles.pressed,
              ]}
              onPress={() => {
                const dateToUse = pendingDepartureDate || departureDate;

                // Check if outside season and show warning
                const isAfterSeason = seasonEndDate && dateToUse > seasonEndDate;

                if (isAfterSeason) {
                  Alert.alert(
                    'Datum izvan sezone',
                    `Odabrani datum (${formatDate(dateToUse)}) je izvan sezone koja traje do ${formatDate(seasonEndDate!)}. Želiš li nastaviti?`,
                    [
                      {
                        text: 'Odustani',
                        style: 'cancel',
                        onPress: () => {
                          setPendingDepartureDate(null);
                        }
                      },
                      {
                        text: 'Nastavi svejedno',
                        onPress: () => {
                          setDepartureDate(dateToUse);
                          setPendingDepartureDate(null);
                          setShowDeparturePicker(false);
                        }
                      }
                    ]
                  );
                } else {
                  // Date is within season, apply directly
                  setDepartureDate(dateToUse);
                  setPendingDepartureDate(null);
                  setShowDeparturePicker(false);
                }
              }}
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

  // KeyboardAvoidingView
  keyboardAvoid: {
    flex: 1,
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
