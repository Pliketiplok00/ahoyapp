/**
 * Add Defect Screen
 *
 * Form to report a new defect.
 * Captain only.
 */

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { CaretLeft, Camera, Image as ImageIcon, X } from 'phosphor-react-native';
import * as ImagePicker from 'expo-image-picker';
import {
  COLORS,
  SHADOWS,
  BORDERS,
  SPACING,
  FONTS,
  TYPOGRAPHY,
  BORDER_RADIUS,
  ANIMATION,
  SIZES,
} from '@/config/theme';
import { useAppTranslation } from '@/i18n';
import { useDefectLog, DEFECT_PRIORITIES } from '@/features/logs';
import type { DefectPriority } from '@/features/logs';

export default function AddDefectScreen() {
  const { t } = useAppTranslation();
  const router = useRouter();
  const { createEntry, uploadPhoto } = useDefectLog();

  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [priority, setPriority] = useState<DefectPriority>('medium');
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotos((prev) => [...prev, result.assets[0].uri]);
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is required.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotos((prev) => [...prev, result.assets[0].uri]);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert(t('common.error'), t('logs.defect.description') + ' ' + t('common.required'));
      return;
    }

    setIsSubmitting(true);

    try {
      const success = await createEntry({
        description: description.trim(),
        location: location.trim(),
        priority,
        photos: [], // Photos will be uploaded after creation
      });

      if (success) {
        router.back();
      }
    } finally {
      setIsSubmitting(false);
    }
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
          <CaretLeft size={SIZES.icon.md} color={COLORS.foreground} weight="bold" />
        </Pressable>
        <Text style={styles.headerTitle}>{t('logs.defect.addDefect')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Description */}
        <View style={styles.field}>
          <Text style={styles.label}>{t('logs.defect.description')} *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder={t('logs.defect.description')}
            placeholderTextColor={COLORS.mutedForeground}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Location */}
        <View style={styles.field}>
          <Text style={styles.label}>{t('logs.defect.location')}</Text>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="e.g. Guest cabin 2, bathroom"
            placeholderTextColor={COLORS.mutedForeground}
          />
        </View>

        {/* Priority */}
        <View style={styles.field}>
          <Text style={styles.label}>{t('logs.defect.priority')}</Text>
          <View style={styles.priorityRow}>
            {DEFECT_PRIORITIES.map((p) => (
              <Pressable
                key={p}
                style={({ pressed }) => [
                  styles.priorityButton,
                  priority === p && styles.priorityButtonActive,
                  priority === p && p === 'critical' && styles.priorityButtonCritical,
                  priority === p && p === 'high' && styles.priorityButtonHigh,
                  priority === p && p === 'medium' && styles.priorityButtonMedium,
                  priority === p && p === 'low' && styles.priorityButtonLow,
                  pressed && styles.pressed,
                ]}
                onPress={() => setPriority(p)}
              >
                <Text
                  style={[
                    styles.priorityText,
                    priority === p && styles.priorityTextActive,
                  ]}
                >
                  {t(`logs.defect.priorities.${p}`)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Photos */}
        <View style={styles.field}>
          <Text style={styles.label}>{t('logs.common.photos')}</Text>
          <View style={styles.photoRow}>
            <Pressable
              style={({ pressed }) => [styles.photoButton, pressed && styles.pressed]}
              onPress={handleTakePhoto}
            >
              <Camera size={SIZES.icon.md} color={COLORS.foreground} weight="bold" />
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.photoButton, pressed && styles.pressed]}
              onPress={handlePickImage}
            >
              <ImageIcon size={SIZES.icon.md} color={COLORS.foreground} weight="bold" />
            </Pressable>
          </View>
          {photos.length > 0 && (
            <View style={styles.photoThumbnails}>
              {photos.map((uri, index) => (
                <View key={index} style={styles.thumbnailContainer}>
                  <Pressable
                    style={styles.thumbnailRemove}
                    onPress={() => handleRemovePhoto(index)}
                  >
                    <X size={SIZES.icon.xs} color={COLORS.white} weight="bold" />
                  </Pressable>
                  <View style={styles.thumbnail}>
                    <Text style={styles.thumbnailText}>{index + 1}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Submit Button */}
        <Pressable
          style={({ pressed }) => [
            styles.submitButton,
            pressed && styles.pressed,
            isSubmitting && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.submitButtonText}>{t('common.save')}</Text>
          )}
        </Pressable>

        <View style={{ height: SPACING.xxl }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderBottomWidth: BORDERS.heavy,
    borderBottomColor: COLORS.foreground,
    paddingTop: SPACING.xxl + SPACING.md,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  backButton: {
    padding: SPACING.sm,
  },
  headerTitle: {
    flex: 1,
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.cardTitle,
    color: COLORS.foreground,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  headerSpacer: {
    width: SIZES.icon.md + SPACING.sm * 2,
  },
  scrollView: {
    flex: 1,
    padding: SPACING.md,
  },
  field: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: TYPOGRAPHY.letterSpacing.wide,
    marginBottom: SPACING.sm,
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
    ...SHADOWS.brutSm,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  priorityRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  priorityButton: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    ...SHADOWS.brutSm,
  },
  priorityButtonActive: {
    backgroundColor: COLORS.muted,
  },
  priorityButtonCritical: {
    backgroundColor: COLORS.destructive,
  },
  priorityButtonHigh: {
    backgroundColor: COLORS.pink,
  },
  priorityButtonMedium: {
    backgroundColor: COLORS.statsBg,
  },
  priorityButtonLow: {
    backgroundColor: COLORS.muted,
  },
  priorityText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.foreground,
    textTransform: 'uppercase',
  },
  priorityTextActive: {
    color: COLORS.foreground,
  },
  photoRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  photoButton: {
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.brutSm,
  },
  photoThumbnails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  thumbnailContainer: {
    position: 'relative',
  },
  thumbnailRemove: {
    position: 'absolute',
    top: -SPACING.xs,
    right: -SPACING.xs,
    zIndex: 1,
    backgroundColor: COLORS.destructive,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.foreground,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnail: {
    width: 60,
    height: 60,
    backgroundColor: COLORS.muted,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
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
    opacity: 0.7,
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
