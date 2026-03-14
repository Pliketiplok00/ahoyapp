/**
 * StorageMapList Component
 *
 * Displays storage map entries.
 * Two sections: own entries and others' public entries.
 * Tap visibility icon to toggle public/private.
 */

import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, SectionList, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Warning, Package, Eye, EyeSlash, MapPin, ArrowsClockwise } from 'phosphor-react-native';
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
import { FAB } from '@/components/ui';
import { useStorageMap } from '../hooks/useStorageMap';
import { useSeason } from '@/features/season/hooks/useSeason';
import type { StorageMapEntry } from '../types';

interface StorageCardProps {
  entry: StorageMapEntry;
  onPress: () => void;
  onToggleVisibility: () => void;
  isOwn: boolean;
}

function StorageCard({ entry, onPress, onToggleVisibility, isOwn }: StorageCardProps) {
  const { crewMembers } = useSeason();
  const creatorName = crewMembers.find((c) => c.id === entry.createdBy)?.name || 'Unknown';

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.cardContent}>
        {/* Header row */}
        <View style={styles.cardHeader}>
          <Text style={styles.itemName} numberOfLines={1}>
            {entry.item}
          </Text>
          {isOwn && (
            <Pressable
              style={({ pressed }) => [
                styles.visibilityButton,
                pressed && styles.pressed,
              ]}
              onPress={(e) => {
                e.stopPropagation();
                onToggleVisibility();
              }}
            >
              {entry.isPublic ? (
                <Eye size={SIZES.icon.sm} color={COLORS.primary} weight="bold" />
              ) : (
                <EyeSlash size={SIZES.icon.sm} color={COLORS.mutedForeground} weight="regular" />
              )}
            </Pressable>
          )}
        </View>

        {/* Location */}
        <View style={styles.locationRow}>
          <MapPin size={SIZES.icon.sm} color={COLORS.mutedForeground} weight="bold" />
          <Text style={styles.locationText} numberOfLines={1}>
            {entry.location}
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.cardFooter}>
          <View style={styles.quantityBadge}>
            <Text style={styles.quantityText}>{entry.quantity}x</Text>
          </View>
          {!isOwn && (
            <Text style={styles.creatorText}>{creatorName}</Text>
          )}
          {entry.photos && entry.photos.length > 0 && (
            <Text style={styles.photoCount}>{entry.photos.length} foto</Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}

export function StorageMapList() {
  const { t } = useAppTranslation();
  const router = useRouter();
  const {
    ownEntries,
    othersEntries,
    isLoading,
    error,
    refresh,
    toggleVisibility,
    transferToSeason,
    isOwnEntry,
  } = useStorageMap();
  const { currentSeason } = useSeason();
  const [isTransferring, setIsTransferring] = useState(false);

  // Refresh on focus
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const handleAddItem = () => {
    router.push('/logs/storage/add');
  };

  const handleItemPress = (entryId: string) => {
    router.push(`/logs/storage/${entryId}`);
  };

  const handleToggleVisibility = async (entryId: string) => {
    await toggleVisibility(entryId);
  };

  const handleTransfer = async () => {
    // TODO: Show season picker modal
    Alert.alert(
      t('logs.storage.transferToSeason'),
      'Season picker coming soon',
      [{ text: t('common.ok') }]
    );
  };

  // Build sections
  const sections = [];
  if (ownEntries.length > 0) {
    sections.push({
      title: t('logs.storage.myItems'),
      data: ownEntries,
      isOwn: true,
    });
  }
  if (othersEntries.length > 0) {
    sections.push({
      title: t('logs.storage.othersItems'),
      data: othersEntries,
      isOwn: false,
    });
  }

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Warning size={SIZES.icon.xl} color={COLORS.destructive} weight="fill" />
        <Text style={styles.errorText}>{error}</Text>
        <Pressable
          style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
          onPress={refresh}
        >
          <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
        </Pressable>
      </View>
    );
  }

  // Empty state
  if (sections.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Package size={SIZES.icon.xl} color={COLORS.primary} weight="regular" />
          </View>
          <Text style={styles.emptyTitle}>{t('logs.storage.empty.title')}</Text>
          <Text style={styles.emptyText}>{t('logs.storage.empty.description')}</Text>
        </View>
        <FAB
          onPress={handleAddItem}
          icon="+"
          floating
          testID="add-storage-fab"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item, section }) => (
          <StorageCard
            entry={item}
            onPress={() => handleItemPress(item.id)}
            onToggleVisibility={() => handleToggleVisibility(item.id)}
            isOwn={section.isOwn}
          />
        )}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          ownEntries.length > 0 ? (
            <Pressable
              style={({ pressed }) => [
                styles.transferButton,
                pressed && styles.pressed,
              ]}
              onPress={handleTransfer}
              disabled={isTransferring}
            >
              <ArrowsClockwise
                size={SIZES.icon.sm}
                color={COLORS.foreground}
                weight="bold"
              />
              <Text style={styles.transferButtonText}>
                {t('logs.storage.transferToSeason')}
              </Text>
            </Pressable>
          ) : null
        }
      />
      <FAB
        onPress={handleAddItem}
        icon="+"
        floating
        testID="add-storage-fab"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  loadingText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.mutedForeground,
    marginTop: SPACING.md,
  },
  errorText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.destructive,
    textAlign: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    ...SHADOWS.brut,
  },
  retryButtonText: {
    fontFamily: FONTS.display,
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sizes.body,
  },
  listContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl * 2,
  },
  sectionHeader: {
    backgroundColor: COLORS.background,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  sectionTitle: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: TYPOGRAPHY.letterSpacing.wide,
  },
  card: {
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    marginBottom: SPACING.sm,
    ...SHADOWS.brutSm,
  },
  cardContent: {
    padding: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemName: {
    flex: 1,
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
  },
  visibilityButton: {
    padding: SPACING.xs,
    marginLeft: SPACING.sm,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    gap: SPACING.xs,
  },
  locationText: {
    flex: 1,
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    gap: SPACING.sm,
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
    fontSize: TYPOGRAPHY.sizes.meta,
    color: COLORS.white,
  },
  creatorText: {
    flex: 1,
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.meta,
    color: COLORS.mutedForeground,
  },
  photoCount: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.meta,
    color: COLORS.primary,
  },
  transferButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.muted,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    padding: SPACING.md,
    marginTop: SPACING.md,
    gap: SPACING.sm,
    ...SHADOWS.brutSm,
  },
  transferButtonText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    marginBottom: SPACING.lg,
    ...SHADOWS.brut,
  },
  emptyTitle: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.cardTitle,
    color: COLORS.foreground,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  emptyText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.mutedForeground,
    textAlign: 'center',
  },
  pressed: {
    transform: ANIMATION.pressedTransform,
  },
});
