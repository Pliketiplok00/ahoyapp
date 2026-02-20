/**
 * BrutCard Component
 *
 * Neo-brutalist card with hard edges, offset shadows, and no border radius.
 * Supports default (white) and colored hero variants.
 *
 * @see docs/Ahoy_DESIGN_RULES.md Section 6 - Component Patterns
 */

import { View, StyleSheet, Pressable, ViewStyle, StyleProp } from 'react-native';
import { COLORS, SHADOWS, BORDERS, BORDER_RADIUS, SPACING, ANIMATION } from '../../config/theme';

export type BrutCardVariant =
  | 'default'      // White card background
  | 'primary'      // Sky blue hero
  | 'accent'       // Lime green hero
  | 'pink'         // Hot pink hero
  | 'amber'        // Amber hero
  | 'teal';        // Teal hero

export type BrutCardSize =
  | 'sm'           // Small shadow (2px)
  | 'md'           // Medium shadow (4px) - default
  | 'lg';          // Large shadow (6px)

interface BrutCardProps {
  /** Visual style variant */
  variant?: BrutCardVariant;
  /** Shadow size */
  size?: BrutCardSize;
  /** Content padding */
  padding?: keyof typeof SPACING | number;
  /** Optional press handler - makes card pressable */
  onPress?: () => void;
  /** Additional styles */
  style?: StyleProp<ViewStyle>;
  /** Test ID for testing */
  testID?: string;
  /** Child content */
  children: React.ReactNode;
}

/**
 * Get background color for variant
 */
export function getVariantBackground(variant: BrutCardVariant): string {
  switch (variant) {
    case 'primary':
      return COLORS.primary;
    case 'accent':
      return COLORS.accent;
    case 'pink':
      return COLORS.pink;
    case 'amber':
      return COLORS.heroAmber;
    case 'teal':
      return COLORS.heroTeal;
    case 'default':
    default:
      return COLORS.card;
  }
}

/**
 * Get shadow style for size
 */
export function getShadow(size: BrutCardSize) {
  switch (size) {
    case 'sm':
      return SHADOWS.brutSm;
    case 'lg':
      return SHADOWS.brutLg;
    case 'md':
    default:
      return SHADOWS.brut;
  }
}

/**
 * Get padding value
 */
export function getPadding(padding: keyof typeof SPACING | number): number {
  if (typeof padding === 'number') {
    return padding;
  }
  return SPACING[padding];
}

/**
 * BrutCard - Neo-brutalist card component
 *
 * @example
 * // Default white card
 * <BrutCard>
 *   <Text>Content</Text>
 * </BrutCard>
 *
 * @example
 * // Colored hero card
 * <BrutCard variant="primary" size="lg">
 *   <Text>Hero Title</Text>
 * </BrutCard>
 *
 * @example
 * // Pressable card
 * <BrutCard onPress={() => handlePress()}>
 *   <Text>Click me</Text>
 * </BrutCard>
 */
export function BrutCard({
  variant = 'default',
  size = 'md',
  padding = 'md',
  onPress,
  style,
  testID,
  children,
}: BrutCardProps) {
  const backgroundColor = getVariantBackground(variant);
  const shadow = getShadow(size);
  const paddingValue = getPadding(padding);

  const cardStyles: ViewStyle[] = [
    styles.base,
    shadow,
    { backgroundColor, padding: paddingValue },
    style as ViewStyle,
  ];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        testID={testID}
        style={({ pressed }) => [
          ...cardStyles,
          pressed && styles.pressed,
        ]}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View style={cardStyles} testID={testID}>
      {children}
    </View>
  );
}

/**
 * Base card styles (exported for testing)
 */
export const BASE_STYLES = {
  borderWidth: BORDERS.normal,
  borderColor: COLORS.foreground,
  borderRadius: BORDER_RADIUS.none,
  backgroundColor: COLORS.card,
} as const;

const styles = StyleSheet.create({
  base: BASE_STYLES,
  pressed: {
    transform: ANIMATION.pressedTransform as unknown as ViewStyle['transform'],
  },
});
