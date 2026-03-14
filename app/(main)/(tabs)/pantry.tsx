/**
 * Pantry Tab Screen
 *
 * Crew inventory management - wine, spirits, beer, etc.
 * Shows items grouped by category with stock status.
 *
 * @see docs/AHOYCREW_TODO.md - CREW PANTRY section
 */

import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  COLORS,
  SHADOWS,
  BORDERS,
  SPACING,
  TYPOGRAPHY,
  FONTS,
  BORDER_RADIUS,
} from '@/config/theme';
import { useAppTranslation } from '@/i18n';
import { AhoyLogo, EmptyState, FAB } from '@/components/ui';
import { usePantry, PantryItemCard, PANTRY_CATEGORIES } from '@/features/pantry';
import type { PantryCategory } from '@/features/pantry';
import { formatCurrency } from '@/utils/formatting';

// ============ Component ============

export default function PantryScreen() {
  const { t } = useAppTranslation();
  const router = useRouter();
  const {
    items,
    itemsByCategory,
    totalItems,
    totalValue,
    isLoading,
    error,
    refresh,
  } = usePantry();

  const [refreshing, setRefreshing] = useState(false);

  // Pull-to-refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  // Navigation handlers
  const handleAddItem = () => {
    router.push('/(main)/pantry/add');
  };

  const handleItemPress = (itemId: string) => {
    router.push(`/(main)/pantry/${itemId}`);
  };

  // Get categories that have items
  const categoriesWithItems = PANTRY_CATEGORIES.filter(
    (cat) => itemsByCategory[cat].length > 0
  );

  // Loading state
  if (isLoading && items.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <AhoyLogo />
          <Text style={styles.headerTitle}>{t('pantry.title')}</Text>
        </View>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      </View>
    );
  }

  // Error state
  if (error && items.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <AhoyLogo />
          <Text style={styles.headerTitle}>{t('pantry.title')}</Text>
        </View>
        <View style={styles.centerContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{t(error)}</Text>
          <Pressable
            style={({ pressed }) => [
              styles.retryButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={refresh}
          >
            <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // Empty state
  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <AhoyLogo />
          <Text style={styles.headerTitle}>{t('pantry.title')}</Text>
        </View>
        <View style={styles.centerContainer}>
          <EmptyState
            icon="🍷"
            title={t('pantry.empty.title')}
            subtitle={t('pantry.empty.description')}
            actionLabel={t('pantry.addItem')}
            onAction={handleAddItem}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <AhoyLogo />
        <Text style={styles.headerTitle}>{t('pantry.title')}</Text>
      </View>

      {/* Summary Bar */}
      <View style={styles.summaryBar}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{totalItems}</Text>
          <Text style={styles.summaryLabel}>{t('pantry.summary.items')}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{formatCurrency(totalValue)}</Text>
          <Text style={styles.summaryLabel}>{t('pantry.summary.value')}</Text>
        </View>
      </View>

      {/* Items List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {categoriesWithItems.map((category) => (
          <CategorySection
            key={category}
            category={category}
            items={itemsByCategory[category]}
            onItemPress={handleItemPress}
            t={t}
          />
        ))}

        {/* Bottom padding for FAB */}
        <View style={styles.fabSpacer} />
      </ScrollView>

      {/* FAB */}
      <FAB
        icon="+"
        onPress={handleAddItem}
        floating
        testID="add-pantry-item-fab"
      />
    </View>
  );
}

// ============ Category Section ============

interface CategorySectionProps {
  category: PantryCategory;
  items: ReturnType<typeof usePantry>['items'];
  onItemPress: (id: string) => void;
  t: ReturnType<typeof useAppTranslation>['t'];
}

function CategorySection({ category, items, onItemPress, t }: CategorySectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>
        {t(`pantry.categories.${category}`).toUpperCase()}
      </Text>
      {items.map((item) => (
        <PantryItemCard
          key={item.id}
          item={item}
          onPress={() => onItemPress(item.id)}
          testID={`pantry-item-${item.id}`}
        />
      ))}
    </View>
  );
}

// ============ Styles ============

const styles = StyleSheet.create({
  // Container
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Header
  header: {
    backgroundColor: COLORS.primary,
    borderBottomWidth: BORDERS.heavy,
    borderBottomColor: COLORS.foreground,
    paddingTop: SPACING.xxl + SPACING.md, // Safe area + padding
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  headerTitle: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.sectionTitle,
    color: COLORS.foreground,
    textTransform: 'uppercase',
    marginTop: SPACING.xs,
  },

  // Summary Bar
  summaryBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderBottomWidth: BORDERS.normal,
    borderBottomColor: COLORS.foreground,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.cardTitle,
    color: COLORS.foreground,
  },
  summaryLabel: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.meta,
    color: COLORS.mutedForeground,
    marginTop: 2,
  },
  summaryDivider: {
    width: BORDERS.normal,
    backgroundColor: COLORS.foreground,
    marginVertical: SPACING.xs,
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
  },

  // Sections
  section: {
    marginBottom: SPACING.lg,
  },
  sectionLabel: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
    letterSpacing: TYPOGRAPHY.letterSpacing.wide,
    marginBottom: SPACING.sm,
  },

  // Center container (loading/error/empty)
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  loadingText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.mutedForeground,
    marginTop: SPACING.md,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  errorText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.destructive,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    ...SHADOWS.brut,
  },
  retryButtonText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.white,
    textTransform: 'uppercase',
  },
  buttonPressed: {
    transform: [{ translateX: 2 }, { translateY: 2 }],
  },

  // FAB spacer
  fabSpacer: {
    height: 80,
  },
});
