/**
 * Storage Item Detail Screen
 *
 * Shows storage item details.
 * Owner can edit/delete and toggle visibility.
 */

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { CaretLeft, MapPin, Trash, Eye, EyeSlash } from 'phosphor-react-native';
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
import { useSeason } from '@/features/season/hooks/useSeason';
import type { StorageMapEntry } from '@/features/logs';
import { formatDate } from '@/utils/formatting';

export default function StorageDetailScreen() {
  const { t } = useAppTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { entries, toggleVisibility, deleteEntry, isOwnEntry } = useStorageMap();
  const { crewMembers } = useSeason();

  const [entry, setEntry] = useState<StorageMapEntry | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const found = entries.find((e) => e.id === id);
    setEntry(found || null);
  }, [entries, id]);

  const handleToggleVisibility = async () => {
    if (!entry) return;

    setIsUpdating(true);
    try {
      await toggleVisibility(entry.id);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = () => {
    if (!entry) return;

    Alert.alert(
      t('common.delete'),
      t('pantry.confirmDelete'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            const success = await deleteEntry(entry.id);
            if (success) {
              router.back();
            }
          },
        },
      ]
    );
  };

  if (!entry) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            onPress={() => router.back()}
          >
            <CaretLeft size={SIZES.icon.md} color={COLORS.foreground} weight="bold" />
          </Pressable>
          <Text style={styles.headerTitle}>{t('logs.storage.title')}</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </View>
    );
  }

  const isOwn = isOwnEntry(entry);
  const creatorName = crewMembers.find((c) => c.id === entry.createdBy)?.name || 'Unknown';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          onPress={() => router.back()}
        >
          <CaretLeft size={SIZES.icon.md} color={COLORS.foreground} weight="bold" />
        </Pressable>
        <Text style={styles.headerTitle}>{t('logs.storage.title')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Main Card */}
        <View style={styles.card}>
          {/* Item Name */}
          <Text style={styles.itemName}>{entry.item}</Text>

          {/* Location */}
          <View style={styles.locationRow}>
            <MapPin size={SIZES.icon.sm} color={COLORS.mutedForeground} weight="bold" />
            <Text style={styles.locationText}>{entry.location}</Text>
          </View>

          {/* Quantity */}
          <View style={styles.quantityRow}>
            <Text style={styles.quantityLabel}>{t('logs.storage.quantity')}:</Text>
            <View style={styles.quantityBadge}>
              <Text style={styles.quantityText}>{entry.quantity}x</Text>
            </View>
          </View>

          {/* Meta */}
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>
              {t('logs.common.createdBy')}: {creatorName}
            </Text>
            <Text style={styles.metaText}>
              {formatDate(entry.createdAt.toDate())}
            </Text>
          </View>
        </View>

        {/* Visibility Section (own items only) */}
        {isOwn && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('logs.common.visibility')}</Text>
            <Pressable
              style={({ pressed }) => [
                styles.visibilityButton,
                pressed && styles.pressed,
              ]}
              onPress={handleToggleVisibility}
              disabled={isUpdating}
            >
              {entry.isPublic ? (
                <>
                  <Eye size={SIZES.icon.md} color={COLORS.primary} weight="bold" />
                  <Text style={styles.visibilityText}>{t('logs.common.public')}</Text>
                </>
              ) : (
                <>
                  <EyeSlash size={SIZES.icon.md} color={COLORS.mutedForeground} weight="regular" />
                  <Text style={styles.visibilityText}>{t('logs.common.private')}</Text>
                </>
              )}
              <Text style={styles.visibilityHint}>
                {t('logs.storage.toggleVisibility')}
              </Text>
            </Pressable>
          </View>
        )}

        {/* Photos Section */}
        {entry.photos && entry.photos.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('logs.common.photos')}</Text>
            <View style={styles.photosGrid}>
              {entry.photos.map((_, index) => (
                <View key={index} style={styles.photoPlaceholder}>
                  <Text style={styles.photoPlaceholderText}>{index + 1}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Owner Actions */}
        {isOwn && (
          <View style={styles.actionsRow}>
            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                styles.deleteButton,
                pressed && styles.pressed,
              ]}
              onPress={handleDelete}
            >
              <Trash size={SIZES.icon.sm} color={COLORS.white} weight="bold" />
              <Text style={styles.actionButtonText}>{t('common.delete')}</Text>
            </Pressable>
          </View>
        )}

        <View style={{ height: SPACING.xxl }} />
      </ScrollView>
    </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  card: {
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    margin: SPACING.md,
    padding: SPACING.md,
    ...SHADOWS.brut,
  },
  itemName: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.cardTitle,
    color: COLORS.foreground,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
    gap: SPACING.xs,
  },
  locationText: {
    flex: 1,
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.mutedForeground,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  quantityLabel: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.mutedForeground,
  },
  quantityBadge: {
    backgroundColor: COLORS.primary,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xxs,
  },
  quantityText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.white,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: BORDERS.thin,
    borderTopColor: COLORS.muted,
  },
  metaText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.meta,
    color: COLORS.mutedForeground,
  },
  section: {
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    padding: SPACING.md,
    ...SHADOWS.brut,
  },
  sectionTitle: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: TYPOGRAPHY.letterSpacing.wide,
    marginBottom: SPACING.md,
  },
  visibilityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.muted,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    padding: SPACING.md,
    ...SHADOWS.brutSm,
  },
  visibilityText: {
    flex: 1,
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
    textTransform: 'uppercase',
  },
  visibilityHint: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.meta,
    color: COLORS.mutedForeground,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  photoPlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: COLORS.muted,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoPlaceholderText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.mutedForeground,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: SPACING.md,
    gap: SPACING.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    ...SHADOWS.brut,
  },
  deleteButton: {
    backgroundColor: COLORS.destructive,
  },
  actionButtonText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.white,
    textTransform: 'uppercase',
  },
  pressed: {
    transform: ANIMATION.pressedTransform,
  },
});
