/**
 * PageHeader Component
 *
 * Neo-brutalist page header with hard edges and offset shadows.
 * Used for screens with navigation (not tabs).
 *
 * @see docs/Ahoy_DESIGN_RULES.md Section - Page Header
 * @see docs/Ahoy_UI_ELEMENTS.md - Global Shell → Page Header
 */

import { ReactNode } from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import {
  COLORS,
  BORDERS,
  SPACING,
  TYPOGRAPHY,
  FONTS,
  LAYOUT,
  SHADOWS,
  BORDER_RADIUS,
  SIZES,
} from '../../config/theme';

/**
 * PageHeader variant type
 */
export type PageHeaderVariant = 'default' | 'primary';

/**
 * PageHeader props interface
 */
interface PageHeaderProps {
  /** Page title (displayed in uppercase) */
  title: string;
  /** Back button handler - if provided, shows back button */
  onBack?: () => void;
  /** Right side element (button, icon, etc.) */
  rightElement?: ReactNode;
  /** Visual variant */
  variant?: PageHeaderVariant;
  /** Custom container style */
  style?: ViewStyle;
}

/**
 * Get background color based on variant
 */
export function getVariantBackground(variant: PageHeaderVariant): string {
  return variant === 'primary' ? COLORS.primary : COLORS.background;
}

/**
 * Get title color based on variant
 * Primary variant uses white (card) text on blue background
 */
export function getVariantTitleColor(variant: PageHeaderVariant): string {
  return variant === 'primary' ? COLORS.card : COLORS.foreground;
}

/**
 * PageHeader - Neo-brutalist page header
 *
 * @example
 * <PageHeader title="Settings" onBack={() => router.back()} />
 *
 * @example
 * <PageHeader
 *   title="Bookings"
 *   rightElement={<BrutButton size="sm" onPress={handleAdd}>+ADD</BrutButton>}
 * />
 */
export function PageHeader({
  title,
  onBack,
  rightElement,
  variant = 'default',
  style,
}: PageHeaderProps) {
  const backgroundColor = getVariantBackground(variant);
  const titleColor = getVariantTitleColor(variant);
  const iconColor = variant === 'primary' ? COLORS.card : COLORS.foreground;

  return (
    <View
      style={[styles.container, { backgroundColor }, style]}
      testID="page-header"
    >
      {/* Left: Back button */}
      <View style={styles.leftSection}>
        {onBack && (
          <Pressable
            onPress={onBack}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.backButtonPressed,
            ]}
            testID="page-header-back"
          >
            <ArrowLeft size={18} color={COLORS.foreground} strokeWidth={2} />
          </Pressable>
        )}
      </View>

      {/* Center: Title */}
      <View style={styles.centerSection}>
        <Text
          style={[styles.title, { color: titleColor }]}
          numberOfLines={1}
          testID="page-header-title"
        >
          {title}
        </Text>
      </View>

      {/* Right: Action element */}
      <View style={styles.rightSection}>{rightElement}</View>
    </View>
  );
}

/**
 * Base styles (exported for testing)
 */
export const PAGE_HEADER_STYLES = {
  height: LAYOUT.headerHeight,
  backgroundColor: COLORS.background,
  borderBottomWidth: BORDERS.heavy,
  borderBottomColor: COLORS.foreground,
  borderRadius: BORDER_RADIUS.none,
  paddingHorizontal: SPACING.md,
} as const;

/**
 * Back button styles (exported for testing)
 */
export const BACK_BUTTON_STYLES = {
  size: 36,
  backgroundColor: COLORS.card,
  borderWidth: BORDERS.normal,
  borderColor: COLORS.foreground,
  borderRadius: BORDER_RADIUS.none,
} as const;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: PAGE_HEADER_STYLES.height,
    backgroundColor: PAGE_HEADER_STYLES.backgroundColor,
    borderBottomWidth: PAGE_HEADER_STYLES.borderBottomWidth,
    borderBottomColor: PAGE_HEADER_STYLES.borderBottomColor,
    borderRadius: PAGE_HEADER_STYLES.borderRadius,
    paddingHorizontal: PAGE_HEADER_STYLES.paddingHorizontal,
  },
  leftSection: {
    width: SIZES.icon.xl,
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
  },
  rightSection: {
    minWidth: SIZES.icon.xl,
    alignItems: 'flex-end',
  },
  backButton: {
    width: BACK_BUTTON_STYLES.size,
    height: BACK_BUTTON_STYLES.size,
    backgroundColor: BACK_BUTTON_STYLES.backgroundColor,
    borderWidth: BACK_BUTTON_STYLES.borderWidth,
    borderColor: BACK_BUTTON_STYLES.borderColor,
    borderRadius: BACK_BUTTON_STYLES.borderRadius,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.brutSm,
  },
  backButtonPressed: {
    transform: [{ translateX: 1 }, { translateY: 1 }],
    shadowOffset: { width: 0, height: 0 },
  },
  title: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.large,
    textTransform: 'uppercase',
    letterSpacing: TYPOGRAPHY.letterSpacing.wide,
  },
});
