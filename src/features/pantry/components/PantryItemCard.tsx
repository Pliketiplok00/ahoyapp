/**
 * PantryItemCard Component
 *
 * Displays a pantry item with stock status, prices, and markup.
 * Brutalist design with colored stock indicator.
 */

import { View, Text, Pressable, StyleSheet } from 'react-native';
import {
  COLORS,
  SHADOWS,
  BORDERS,
  SPACING,
  TYPOGRAPHY,
  FONTS,
  BORDER_RADIUS,
  ANIMATION,
} from '../../../config/theme';
import { useAppTranslation } from '../../../i18n';
import { formatCurrency } from '../../../utils/formatting';
import type { PantryItem } from '../types';

// ============ Constants ============

const LOW_STOCK_THRESHOLD = 3;

const STOCK_COLORS = {
  inStock: COLORS.accent, // Green
  lowStock: '#F59E0B', // Yellow/amber
  outOfStock: COLORS.destructive, // Red
} as const;

// ============ Types ============

interface PantryItemCardProps {
  item: PantryItem;
  onPress: () => void;
  testID?: string;
}

// ============ Helpers ============

function getStockStatus(quantity: number): keyof typeof STOCK_COLORS {
  if (quantity === 0) return 'outOfStock';
  if (quantity < LOW_STOCK_THRESHOLD) return 'lowStock';
  return 'inStock';
}

function getStockColor(quantity: number): string {
  return STOCK_COLORS[getStockStatus(quantity)];
}

// ============ Component ============

export function PantryItemCard({ item, onPress, testID }: PantryItemCardProps) {
  const { t } = useAppTranslation();
  const stockColor = getStockColor(item.quantity);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
      testID={testID}
    >
      {/* Left: Stock indicator + Name */}
      <View style={styles.leftSection}>
        <View style={[styles.stockDot, { backgroundColor: stockColor }]} />
        <View style={styles.nameContainer}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.category}>
            {t(`pantry.categories.${item.category}`)}
          </Text>
        </View>
      </View>

      {/* Right: Stock count + Prices */}
      <View style={styles.rightSection}>
        <View style={styles.stockContainer}>
          <Text style={[styles.stockCount, { color: stockColor }]}>
            {item.quantity}
          </Text>
          <Text style={styles.stockUnit}>{t('pantry.stock.units')}</Text>
        </View>
        <View style={styles.priceContainer}>
          <Text style={styles.purchasePrice}>
            {formatCurrency(item.purchasePrice)}
          </Text>
          <Text style={styles.arrow}>→</Text>
          <Text style={styles.sellingPrice}>
            {formatCurrency(item.sellingPrice)}
          </Text>
          <Text style={styles.markup}>+{item.markupPercent}%</Text>
        </View>
      </View>
    </Pressable>
  );
}

// ============ Styles ============

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.brut,
  },
  pressed: {
    transform: ANIMATION.pressedTransform,
  },

  // Left section
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stockDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SPACING.sm,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.foreground,
  },
  nameContainer: {
    flex: 1,
  },
  name: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
  },
  category: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.meta,
    color: COLORS.mutedForeground,
    marginTop: 2,
  },

  // Right section
  rightSection: {
    alignItems: 'flex-end',
  },
  stockContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: SPACING.xxs,
  },
  stockCount: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.cardTitle,
  },
  stockUnit: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.meta,
    color: COLORS.mutedForeground,
    marginLeft: 2,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  purchasePrice: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
  },
  arrow: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
    marginHorizontal: SPACING.xxs,
  },
  sellingPrice: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.foreground,
    fontWeight: '600',
  },
  markup: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.meta,
    color: COLORS.accent,
    marginLeft: SPACING.xs,
  },
});

// ============ Exports ============

export { getStockColor, getStockStatus, STOCK_COLORS, LOW_STOCK_THRESHOLD };
