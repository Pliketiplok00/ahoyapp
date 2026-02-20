/**
 * BrutButton Component
 *
 * Neo-brutalist button with hard edges, offset shadows, and uppercase text.
 * Supports primary (dark), blue, accent, and secondary (white) variants.
 *
 * @see docs/Ahoy_DESIGN_RULES.md Section 5-6 - Interactive States, Component Patterns
 */

import { Pressable, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import {
  COLORS,
  SHADOWS,
  BORDERS,
  BORDER_RADIUS,
  SPACING,
  TYPOGRAPHY,
  FONTS,
  ANIMATION,
} from '../../config/theme';

export type BrutButtonVariant =
  | 'primary'      // Dark (near-black) background
  | 'blue'         // Sky blue background
  | 'accent'       // Lime green background
  | 'secondary';   // White background

export type BrutButtonSize =
  | 'sm'           // Small - compact
  | 'md'           // Medium - default
  | 'lg';          // Large - prominent

interface BrutButtonProps {
  /** Button label text */
  children: React.ReactNode;
  /** Visual style variant */
  variant?: BrutButtonVariant;
  /** Button size */
  size?: BrutButtonSize;
  /** Press handler */
  onPress: () => void;
  /** Disabled state */
  disabled?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Full width button */
  fullWidth?: boolean;
  /** Additional container styles */
  style?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
}

/**
 * Get button background and text colors for variant
 */
export function getVariantStyles(variant: BrutButtonVariant): { bg: string; text: string } {
  switch (variant) {
    case 'primary':
      return { bg: COLORS.secondary, text: COLORS.white };
    case 'blue':
      return { bg: COLORS.primary, text: COLORS.foreground };
    case 'accent':
      return { bg: COLORS.accent, text: COLORS.foreground };
    case 'secondary':
    default:
      return { bg: COLORS.card, text: COLORS.foreground };
  }
}

/**
 * Get button size styles
 */
export function getSizeStyles(size: BrutButtonSize): { container: ViewStyle; text: TextStyle } {
  switch (size) {
    case 'sm':
      return {
        container: {
          paddingHorizontal: SPACING.sm,
          paddingVertical: SPACING.xs,
        },
        text: {
          fontSize: TYPOGRAPHY.sizes.label,
        },
      };
    case 'lg':
      return {
        container: {
          paddingHorizontal: SPACING.xl,
          paddingVertical: SPACING.md,
        },
        text: {
          fontSize: TYPOGRAPHY.sizes.large,
        },
      };
    case 'md':
    default:
      return {
        container: {
          paddingHorizontal: SPACING.lg,
          paddingVertical: SPACING.sm,
        },
        text: {
          fontSize: TYPOGRAPHY.sizes.body,
        },
      };
  }
}

/**
 * Base button styles (exported for testing)
 */
export const BASE_STYLES = {
  borderWidth: BORDERS.normal,
  borderColor: COLORS.foreground,
  borderRadius: BORDER_RADIUS.none,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
} as const;

/**
 * BrutButton - Neo-brutalist button component
 *
 * @example
 * // Primary dark button
 * <BrutButton variant="primary" onPress={handleSubmit}>
 *   Submit
 * </BrutButton>
 *
 * @example
 * // Blue accent button
 * <BrutButton variant="blue" size="lg" onPress={handleAction}>
 *   Take Action
 * </BrutButton>
 *
 * @example
 * // Loading state
 * <BrutButton variant="primary" loading onPress={handleSubmit}>
 *   Submitting...
 * </BrutButton>
 */
export function BrutButton({
  children,
  variant = 'primary',
  size = 'md',
  onPress,
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  testID,
}: BrutButtonProps) {
  const variantStyles = getVariantStyles(variant);
  const sizeStyles = getSizeStyles(size);
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      testID={testID}
      style={({ pressed }) => [
        styles.base,
        SHADOWS.brut,
        sizeStyles.container,
        { backgroundColor: variantStyles.bg },
        fullWidth && styles.fullWidth,
        pressed && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variantStyles.text}
          testID={testID ? `${testID}-loader` : undefined}
        />
      ) : (
        <Text
          style={[
            styles.text,
            sizeStyles.text,
            { color: variantStyles.text },
          ]}
        >
          {children}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    ...BASE_STYLES,
    flexDirection: 'row',
  },
  text: {
    fontFamily: FONTS.display,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: TYPOGRAPHY.letterSpacing.tight,
  },
  fullWidth: {
    width: '100%',
  },
  pressed: {
    transform: ANIMATION.pressedTransform as unknown as ViewStyle['transform'],
  },
  disabled: {
    opacity: 0.4,
  },
});
