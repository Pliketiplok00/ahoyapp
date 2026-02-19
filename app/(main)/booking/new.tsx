/**
 * New Booking Screen
 *
 * Create a new booking with arrival/departure dates,
 * guest count, marinas, and notes.
 */

import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Screen, Header } from '../../../src/components/layout';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../../src/config/theme';
import { DEFAULT_MARINA, MARINA_OPTIONS } from '../../../src/config/marinas';
import { formatDate } from '../../../src/utils/formatting';
import { useBookings } from '../../../src/features/booking';
import { useSeasonStore } from '../../../src/stores/seasonStore';
import { useAuthStore } from '../../../src/stores/authStore';

export default function NewBookingScreen() {
  const router = useRouter();
  const { createBooking } = useBookings();
  const { currentSeasonId } = useSeasonStore();
  const { firebaseUser } = useAuthStore();

  // Form state
  const [arrivalDate, setArrivalDate] = useState(new Date());
  const [departureDate, setDepartureDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 7); // Default 7 days
    return date;
  });
  const [guestCount, setGuestCount] = useState('');
  const [departureMarina, setDepartureMarina] = useState(DEFAULT_MARINA);
  const [arrivalMarina, setArrivalMarina] = useState(DEFAULT_MARINA);
  const [notes, setNotes] = useState('');

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showArrivalPicker, setShowArrivalPicker] = useState(false);
  const [showDeparturePicker, setShowDeparturePicker] = useState(false);
  const [showDepartureMarinaList, setShowDepartureMarinaList] = useState(false);
  const [showArrivalMarinaList, setShowArrivalMarinaList] = useState(false);

  // Validation
  const isValid = () => {
    if (!guestCount || parseInt(guestCount) < 1) return false;
    if (departureDate <= arrivalDate) return false;
    return true;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!currentSeasonId || !firebaseUser) {
      Alert.alert('Error', 'Please log in and select a season');
      return;
    }

    if (!isValid()) {
      Alert.alert('Error', 'Please fill in all required fields correctly');
      return;
    }

    setIsSubmitting(true);

    const result = await createBooking({
      seasonId: currentSeasonId,
      arrivalDate,
      departureDate,
      departureMarina,
      arrivalMarina,
      guestCount: parseInt(guestCount),
      notes: notes.trim() || undefined,
      createdBy: firebaseUser.uid,
    });

    setIsSubmitting(false);

    if (result.success) {
      router.back();
    } else {
      Alert.alert('Error', result.error || 'Failed to create booking');
    }
  };

  // Date picker handlers
  const onArrivalDateChange = (_: unknown, selectedDate?: Date) => {
    setShowArrivalPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setArrivalDate(selectedDate);
      // Auto-adjust departure if needed
      if (selectedDate >= departureDate) {
        const newDeparture = new Date(selectedDate);
        newDeparture.setDate(newDeparture.getDate() + 1);
        setDepartureDate(newDeparture);
      }
    }
  };

  const onDepartureDateChange = (_: unknown, selectedDate?: Date) => {
    setShowDeparturePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDepartureDate(selectedDate);
    }
  };

  return (
    <Screen noPadding edges={['top']}>
      <Header title="New Booking" />

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        {/* Dates Section */}
        <Text style={styles.sectionTitle}>DATES</Text>

        {/* Arrival Date */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Arrival Date *</Text>
          <Pressable
            style={styles.dateButton}
            onPress={() => setShowArrivalPicker(true)}
          >
            <Text style={styles.dateButtonIcon}>📅</Text>
            <Text style={styles.dateButtonText}>{formatDate(arrivalDate)}</Text>
          </Pressable>
          {showArrivalPicker && (
            <DateTimePicker
              value={arrivalDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onArrivalDateChange}
              minimumDate={new Date()}
            />
          )}
        </View>

        {/* Departure Date */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Departure Date *</Text>
          <Pressable
            style={styles.dateButton}
            onPress={() => setShowDeparturePicker(true)}
          >
            <Text style={styles.dateButtonIcon}>📅</Text>
            <Text style={styles.dateButtonText}>{formatDate(departureDate)}</Text>
          </Pressable>
          {showDeparturePicker && (
            <DateTimePicker
              value={departureDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onDepartureDateChange}
              minimumDate={new Date(arrivalDate.getTime() + 24 * 60 * 60 * 1000)}
            />
          )}
        </View>

        {/* Guest Count */}
        <Text style={styles.sectionTitle}>GUESTS</Text>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Number of Guests *</Text>
          <TextInput
            style={styles.input}
            value={guestCount}
            onChangeText={setGuestCount}
            placeholder="e.g., 8"
            placeholderTextColor={COLORS.textMuted}
            keyboardType="number-pad"
          />
        </View>

        {/* Marinas Section */}
        <Text style={styles.sectionTitle}>ROUTE</Text>

        {/* Departure Marina */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Departure Marina</Text>
          <Pressable
            style={styles.selectButton}
            onPress={() => setShowDepartureMarinaList(!showDepartureMarinaList)}
          >
            <Text style={styles.selectButtonText}>{departureMarina}</Text>
            <Text style={styles.selectButtonIcon}>▼</Text>
          </Pressable>
          {showDepartureMarinaList && (
            <View style={styles.optionsList}>
              {MARINA_OPTIONS.map((marina) => (
                <Pressable
                  key={marina}
                  style={[
                    styles.optionItem,
                    marina === departureMarina && styles.optionItemSelected,
                  ]}
                  onPress={() => {
                    setDepartureMarina(marina);
                    setShowDepartureMarinaList(false);
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      marina === departureMarina && styles.optionTextSelected,
                    ]}
                  >
                    {marina}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* Arrival Marina */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Arrival Marina</Text>
          <Pressable
            style={styles.selectButton}
            onPress={() => setShowArrivalMarinaList(!showArrivalMarinaList)}
          >
            <Text style={styles.selectButtonText}>{arrivalMarina}</Text>
            <Text style={styles.selectButtonIcon}>▼</Text>
          </Pressable>
          {showArrivalMarinaList && (
            <View style={styles.optionsList}>
              {MARINA_OPTIONS.map((marina) => (
                <Pressable
                  key={marina}
                  style={[
                    styles.optionItem,
                    marina === arrivalMarina && styles.optionItemSelected,
                  ]}
                  onPress={() => {
                    setArrivalMarina(marina);
                    setShowArrivalMarinaList(false);
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      marina === arrivalMarina && styles.optionTextSelected,
                    ]}
                  >
                    {marina}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* Notes */}
        <Text style={styles.sectionTitle}>NOTES</Text>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Crew Notes (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Private notes for the crew..."
            placeholderTextColor={COLORS.textMuted}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Submit Button */}
        <Pressable
          style={[
            styles.submitButton,
            (!isValid() || isSubmitting) && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!isValid() || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.submitButtonText}>Create Booking</Text>
          )}
        </Pressable>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    fontSize: FONT_SIZES.lg,
    color: COLORS.textPrimary,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
  },
  dateButtonIcon: {
    fontSize: 18,
    marginRight: SPACING.sm,
  },
  dateButtonText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textPrimary,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
  },
  selectButtonText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textPrimary,
  },
  selectButtonIcon: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
  optionsList: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
    maxHeight: 200,
  },
  optionItem: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  optionItemSelected: {
    backgroundColor: `${COLORS.coral}10`,
  },
  optionText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
  },
  optionTextSelected: {
    color: COLORS.coral,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: COLORS.coral,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: SPACING.xxl,
  },
});
