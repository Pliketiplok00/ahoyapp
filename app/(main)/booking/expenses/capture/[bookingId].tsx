/**
 * Quick Capture Screen
 *
 * Camera interface for scanning receipts.
 * Uses expo-image-picker for photo capture.
 */

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  Alert,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../../../../src/config/theme';
import { formatDate } from '../../../../../src/utils/formatting';
import { Screen } from '../../../../../src/components/layout';
import { Button } from '../../../../../src/components/ui';
import { useBooking } from '../../../../../src/features/booking/hooks/useBooking';
import { useExpenses } from '../../../../../src/features/expense/hooks/useExpenses';
import { CategoryPicker } from '../../../../../src/features/expense/components';
import { EXPENSE_DEFAULTS, type ExpenseCategory } from '../../../../../src/config/expenses';
import { useAuthStore } from '../../../../../src/stores/authStore';

export default function QuickCaptureScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const router = useRouter();
  const { firebaseUser } = useAuthStore();
  const { booking } = useBooking(bookingId || '');
  const { createExpense } = useExpenses(bookingId || '', booking?.seasonId || '');

  // State
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>(EXPENSE_DEFAULTS.category);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Camera permission is needed to scan receipts.',
        [{ text: 'OK' }]
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleAmountChange = (text: string) => {
    const cleaned = text.replace(/[^0-9.,]/g, '').replace(',', '.');
    const parts = cleaned.split('.');
    if (parts.length > 2) return;
    if (parts[1] && parts[1].length > 2) return;
    setAmount(cleaned);
  };

  const onDateChange = (_: unknown, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleSubmit = async () => {
    if (!firebaseUser) return;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!merchant.trim()) {
      setError('Please enter a merchant name');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const result = await createExpense({
      amount: parsedAmount,
      date: date,
      category,
      merchant: merchant.trim(),
      note: note.trim() || undefined,
      receiptLocalPath: imageUri || undefined,
      type: 'receipt',
      createdBy: firebaseUser.uid,
    });

    setIsSubmitting(false);

    if (result.success) {
      router.back();
    } else {
      setError(result.error || 'Failed to save expense');
    }
  };

  return (
    <Screen noPadding>
      <Stack.Screen options={{ title: 'Scan Receipt' }} />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Image Capture Area */}
          {!imageUri ? (
            <View style={styles.captureArea}>
              <Text style={styles.captureIcon}>{'\u{1F4F7}'}</Text>
              <Text style={styles.captureTitle}>Capture Receipt</Text>
              <Text style={styles.captureSubtitle}>
                Take a photo or select from gallery
              </Text>
              <View style={styles.captureButtons}>
                <Pressable
                  style={[styles.captureButton, styles.cameraButton]}
                  onPress={handleTakePhoto}
                >
                  <Text style={styles.captureButtonText}>Take Photo</Text>
                </Pressable>
                <Pressable
                  style={[styles.captureButton, styles.galleryButton]}
                  onPress={handlePickImage}
                >
                  <Text style={styles.captureButtonTextSecondary}>Gallery</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <View style={styles.imagePreview}>
              <Image source={{ uri: imageUri }} style={styles.previewImage} />
              <Pressable
                style={styles.retakeButton}
                onPress={() => setImageUri(null)}
              >
                <Text style={styles.retakeText}>Retake</Text>
              </Pressable>
            </View>
          )}

          {/* Form Fields */}
          <View style={styles.form}>
            {/* Amount Input */}
            <View style={styles.section}>
              <Text style={styles.label}>Amount *</Text>
              <View style={styles.amountContainer}>
                <Text style={styles.currencySymbol}>€</Text>
                <TextInput
                  style={styles.amountInput}
                  value={amount}
                  onChangeText={handleAmountChange}
                  placeholder="0.00"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            {/* Merchant Input */}
            <View style={styles.section}>
              <Text style={styles.label}>Merchant *</Text>
              <TextInput
                style={styles.input}
                value={merchant}
                onChangeText={setMerchant}
                placeholder="Enter merchant name"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>

            {/* Category Picker */}
            <View style={styles.section}>
              <Text style={styles.label}>Category</Text>
              <CategoryPicker value={category} onChange={setCategory} />
            </View>

            {/* Date Picker */}
            <View style={styles.section}>
              <Text style={styles.label}>Date</Text>
              <Pressable
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateButtonIcon}>📅</Text>
                <Text style={styles.dateButtonText}>{formatDate(date)}</Text>
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

            {/* Note Input */}
            <View style={styles.section}>
              <Text style={styles.label}>Note (optional)</Text>
              <TextInput
                style={[styles.input, styles.noteInput]}
                value={note}
                onChangeText={setNote}
                placeholder="Add a note..."
                placeholderTextColor={COLORS.textMuted}
                multiline
                numberOfLines={2}
                textAlignVertical="top"
              />
            </View>

            {/* Error Message */}
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Submit Button */}
        <View style={styles.footer}>
          <Button onPress={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Expense'}
          </Button>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  // Capture Area
  captureArea: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  captureIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  captureTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  captureSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.lg,
  },
  captureButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  captureButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  cameraButton: {
    backgroundColor: COLORS.coral,
  },
  galleryButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  captureButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.white,
  },
  captureButtonTextSecondary: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  // Image Preview
  imagePreview: {
    marginBottom: SPACING.lg,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
  },
  retakeButton: {
    alignSelf: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  retakeText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.coral,
    fontWeight: '600',
  },
  // Form
  form: {
    marginBottom: SPACING.lg,
  },
  section: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
  },
  currencySymbol: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginRight: SPACING.xs,
  },
  amountInput: {
    flex: 1,
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    paddingVertical: SPACING.md,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
  },
  noteInput: {
    minHeight: 60,
    paddingTop: SPACING.md,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  dateButtonIcon: {
    fontSize: 18,
    marginRight: SPACING.sm,
  },
  dateButtonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
  },
  // Error
  errorContainer: {
    backgroundColor: `${COLORS.error}15`,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  errorText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.error,
  },
  // Footer
  footer: {
    padding: SPACING.md,
    paddingBottom: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
});
