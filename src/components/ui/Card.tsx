/**
 * Card Component
 *
 * Reusable card container with multiple variants.
 */

import { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../../config/theme';

export type CardVariant = 'elevated' | 'outlined' | 'filled';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps {
  children: ReactNode;
  variant?: CardVariant;
  padding?: CardPadding;
  onPress?: () => void;
  style?: ViewStyle;
  testID?: string;
}

/**
 * Get card styles based on variant
 */
export function getCardVariantStyles(variant: CardVariant): ViewStyle {
  const baseStyle: ViewStyle = {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  };

  switch (variant) {
    case 'elevated':
      return {
        ...baseStyle,
        backgroundColor: COLORS.white,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
      };
    case 'outlined':
      return {
        ...baseStyle,
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.border,
      };
    case 'filled':
      return {
        ...baseStyle,
        backgroundColor: COLORS.surface,
      };
    default:
      return baseStyle;
  }
}

/**
 * Get card padding based on size
 */
export function getCardPadding(padding: CardPadding): number {
  switch (padding) {
    case 'none':
      return 0;
    case 'sm':
      return SPACING.sm;
    case 'md':
      return SPACING.md;
    case 'lg':
      return SPACING.lg;
    default:
      return SPACING.md;
  }
}

export function Card({
  children,
  variant = 'elevated',
  padding = 'md',
  onPress,
  style,
  testID,
}: CardProps) {
  const cardStyle = [
    styles.base,
    getCardVariantStyles(variant),
    { padding: getCardPadding(padding) },
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={onPress}
        activeOpacity={0.7}
        testID={testID}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyle} testID={testID}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    // Base styles are applied in getCardVariantStyles
  },
});
