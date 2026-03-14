/**
 * WishList Component
 *
 * Displays wish list items.
 * All crew can add items.
 * Tap to toggle done status.
 * Swipe to delete own items.
 */

import { useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Warning, Star, CheckCircle, RadioButton, Trash } from 'phosphor-react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
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
import { useWishList } from '../hooks/useWishList';
import { useSeason } from '@/features/season/hooks/useSeason';
import type { WishListItem } from '../types';

/**
 * Get category badge color
 */
function getCategoryColor(category: WishListItem['category']): string {
  switch (category) {
    case 'equipment':
      return COLORS.primary;
    case 'supplies':
      return COLORS.accent;
    case 'maintenance':
      return COLORS.statsBg;
    case 'upgrade':
      return COLORS.pink;
    case 'other':
    default:
      return COLORS.muted;
  }
}

interface WishCardProps {
  item: WishListItem;
  onToggle: () => void;
  onDelete: () => void;
  canEdit: boolean;
}

function WishCard({ item, onToggle, onDelete, canEdit }: WishCardProps) {
  const { t } = useAppTranslation();
  const categoryColor = getCategoryColor(item.category);
  const { crewMembers } = useSeason();
  const creatorName = crewMembers.find((c) => c.id === item.createdBy)?.name || 'Unknown';

  const renderRightActions = () => {
    if (!canEdit) return null;

    return (
      <Pressable
        style={({ pressed }) => [
          styles.deleteAction,
          pressed && styles.pressed,
        ]}
        onPress={onDelete}
      >
        <Trash size={SIZES.icon.md} color={COLORS.white} weight="bold" />
      </Pressable>
    );
  };

  const cardContent = (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        item.isDone && styles.cardDone,
        pressed && styles.pressed,
      ]}
      onPress={onToggle}
    >
      {/* Check icon */}
      <View style={styles.checkContainer}>
        {item.isDone ? (
          <CheckCircle size={SIZES.icon.md} color={COLORS.accent} weight="fill" />
        ) : (
          <RadioButton size={SIZES.icon.md} color={COLORS.mutedForeground} weight="regular" />
        )}
      </View>

      <View style={styles.cardContent}>
        {/* Description */}
        <Text
          style={[
            styles.description,
            item.isDone && styles.descriptionDone,
          ]}
          numberOfLines={2}
        >
          {item.description}
        </Text>

        {/* Footer */}
        <View style={styles.cardFooter}>
          <View style={[styles.categoryBadge, { backgroundColor: categoryColor }]}>
            <Text style={styles.categoryText}>
              {t(`logs.wish.categories.${item.category}`)}
            </Text>
          </View>
          <Text style={styles.creatorText}>{creatorName}</Text>
        </View>
      </View>
    </Pressable>
  );

  if (canEdit) {
    return (
      <Swipeable renderRightActions={renderRightActions}>
        {cardContent}
      </Swipeable>
    );
  }

  return cardContent;
}

export function WishListComponent() {
  const { t } = useAppTranslation();
  const router = useRouter();
  const { items, isLoading, error, refresh, toggleDone, deleteItem, canEditItem } = useWishList();

  // Refresh on focus
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const handleAddWish = () => {
    router.push('/logs/wish/add');
  };

  const handleToggle = async (itemId: string) => {
    await toggleDone(itemId);
  };

  const handleDelete = async (itemId: string) => {
    await deleteItem(itemId);
  };

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
  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Star size={SIZES.icon.xl} color={COLORS.accent} weight="regular" />
          </View>
          <Text style={styles.emptyTitle}>{t('logs.wish.empty.title')}</Text>
          <Text style={styles.emptyText}>{t('logs.wish.empty.description')}</Text>
        </View>
        <FAB
          onPress={handleAddWish}
          icon="+"
          floating
          testID="add-wish-fab"
        />
      </View>
    );
  }

  // Sort: undone first, then done
  const sortedItems = [...items].sort((a, b) => {
    if (a.isDone === b.isDone) return 0;
    return a.isDone ? 1 : -1;
  });

  return (
    <View style={styles.container}>
      <FlatList
        data={sortedItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <WishCard
            item={item}
            onToggle={() => handleToggle(item.id)}
            onDelete={() => handleDelete(item.id)}
            canEdit={canEditItem(item)}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
      <FAB
        onPress={handleAddWish}
        icon="+"
        floating
        testID="add-wish-fab"
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
  card: {
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    ...SHADOWS.brutSm,
  },
  cardDone: {
    backgroundColor: COLORS.muted,
    opacity: 0.8,
  },
  checkContainer: {
    padding: SPACING.md,
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
    padding: SPACING.md,
    paddingLeft: 0,
  },
  description: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
    lineHeight: TYPOGRAPHY.sizes.body * 1.4,
  },
  descriptionDone: {
    textDecorationLine: 'line-through',
    color: COLORS.mutedForeground,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  categoryBadge: {
    borderWidth: BORDERS.thin,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xxs,
  },
  categoryText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.meta,
    color: COLORS.foreground,
    textTransform: 'uppercase',
  },
  creatorText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.meta,
    color: COLORS.mutedForeground,
  },
  deleteAction: {
    backgroundColor: COLORS.destructive,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    marginBottom: SPACING.sm,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderLeftWidth: 0,
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
