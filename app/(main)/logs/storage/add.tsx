/**
 * Add Storage Item Screen
 *
 * Form to add a new storage map entry.
 * All crew can add their own entries.
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
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { CaretLeft, Camera, Image as ImageIcon, X, Eye, EyeSlash } from 'phosphor-react-native';
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
import { useStorageMap } from '@/features/logs';

export default function AddStorageScreen() {
  const { t } = useAppTranslation();
  const router = useRouter();
  const { createEntry } = useStorageMap();

  const [item, setItem] = useState('');
  const [location, setLocation] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [isPublic, setIsPublic] = useState(false);
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
    if (!item.trim()) {
      Alert.alert(t('common.error'), t('logs.storage.item') + ' ' + t('common.required'));
      return;
    }
    if (!location.trim()) {
      Alert.alert(t('common.error'), t('logs.storage.location') + ' ' + t('common.required'));
      return;
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 1) {
      Alert.alert(t('common.error'), t('logs.storage.quantity') + ' ' + t('common.required'));
      return;
    }

    setIsSubmitting(true);

    try {
      const success = await createEntry({
        item: item.trim(),
        location: location.trim(),
        quantity: qty,
        isPublic,
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
        <Text style={styles.headerTitle}>{t('logs.storage.addItem')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Item Name */}
        <View style={styles.field}>
          <Text style={styles.label}>{t('logs.storage.item')} *</Text>
          <TextInput
            style={styles.input}
            value={item}
            onChangeText={setItem}
            placeholder={t('logs.storage.item')}
            placeholderTextColor={COLORS.mutedForeground}
          />
        </View>

        {/* Location */}
        <View style={styles.field}>
          <Text style={styles.label}>{t('logs.storage.location')} *</Text>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="e.g. Engine room, port locker"
            placeholderTextColor={COLORS.mutedForeground}
          />
        </View>

        {/* Quantity */}
        <View style={styles.field}>
          <Text style={styles.label}>{t('logs.storage.quantity')}</Text>
          <TextInput
            style={[styles.input, styles.quantityInput]}
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="number-pad"
            placeholder="1"
            placeholderTextColor={COLORS.mutedForeground}
          />
        </View>

        {/* Visibility Toggle */}
        <View style={styles.field}>
          <Text style={styles.label}>{t('logs.common.visibility')}</Text>
          <View style={styles.visibilityRow}>
            <Pressable
              style={({ pressed }) => [
                styles.visibilityOption,
                !isPublic && styles.visibilityOptionActive,
                pressed && styles.pressed,
              ]}
              onPress={() => setIsPublic(false)}
            >
              <EyeSlash
                size={SIZES.icon.sm}
                color={!isPublic ? COLORS.foreground : COLORS.mutedForeground}
                weight={!isPublic ? 'bold' : 'regular'}
              />
              <Text
                style={[
                  styles.visibilityText,
                  !isPublic && styles.visibilityTextActive,
                ]}
              >
                {t('logs.common.private')}
              </Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.visibilityOption,
                isPublic && styles.visibilityOptionActive,
                pressed && styles.pressed,
              ]}
              onPress={() => setIsPublic(true)}
            >
              <Eye
                size={SIZES.icon.sm}
                color={isPublic ? COLORS.foreground : COLORS.mutedForeground}
                weight={isPublic ? 'bold' : 'regular'}
              />
              <Text
                style={[
                  styles.visibilityText,
                  isPublic && styles.visibilityTextActive,
                ]}
              >
                {t('logs.common.public')}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Photos */}
        <View style={styles.field}>
          <Text style={styles.label}>{t('logs.common.photos')} ({t('common.optional')})</Text>
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
            <ActivityIndicator color={COLORS.foreground} />
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
  quantityInput: {
    width: 100,
    textAlign: 'center',
  },
  visibilityRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  visibilityOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    paddingVertical: SPACING.md,
    ...SHADOWS.brutSm,
  },
  visibilityOptionActive: {
    backgroundColor: COLORS.accent,
  },
  visibilityText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.mutedForeground,
    textTransform: 'uppercase',
  },
  visibilityTextActive: {
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
    backgroundColor: COLORS.accent,
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
    color: COLORS.foreground,
    textTransform: 'uppercase',
  },
  pressed: {
    transform: ANIMATION.pressedTransform,
  },
});
