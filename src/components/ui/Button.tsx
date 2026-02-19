/**
 * Button Component
 *
 * Reusable button with multiple variants and states.
 */

import { ReactNode } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../config/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: ReactNode;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
}

/**
 * Get button styles based on variant
 */
export function getButtonStyles(variant: ButtonVariant, disabled: boolean): ViewStyle {
  const baseStyle: ViewStyle = {
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: disabled ? 0.5 : 1,
  };

  switch (variant) {
    case 'primary':
      return {
        ...baseStyle,
        backgroundColor: COLORS.coral,
      };
    case 'secondary':
      return {
        ...baseStyle,
        backgroundColor: COLORS.sageGreen,
      };
    case 'outline':
      return {
        ...baseStyle,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: COLORS.coral,
      };
    case 'ghost':
      return {
        ...baseStyle,
        backgroundColor: 'transparent',
      };
    default:
      return baseStyle;
  }
}

/**
 * Get button text color based on variant
 */
export function getButtonTextColor(variant: ButtonVariant): string {
  switch (variant) {
    case 'primary':
    case 'secondary':
      return COLORS.white;
    case 'outline':
    case 'ghost':
      return COLORS.coral;
    default:
      return COLORS.white;
  }
}

/**
 * Get button size styles
 */
export function getButtonSizeStyles(size: ButtonSize): ViewStyle {
  switch (size) {
    case 'sm':
      return {
        paddingVertical: SPACING.xs,
        paddingHorizontal: SPACING.md,
        minHeight: 32,
      };
    case 'md':
      return {
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.lg,
        minHeight: 44,
      };
    case 'lg':
      return {
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.xl,
        minHeight: 56,
      };
    default:
      return {};
  }
}

/**
 * Get button text size
 */
export function getButtonTextSize(size: ButtonSize): number {
  switch (size) {
    case 'sm':
      return FONT_SIZES.sm;
    case 'md':
      return FONT_SIZES.md;
    case 'lg':
      return FONT_SIZES.lg;
    default:
      return FONT_SIZES.md;
  }
}

export function Button({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
  testID,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const buttonStyles = [
    styles.base,
    getButtonStyles(variant, isDisabled),
    getButtonSizeStyles(size),
    fullWidth && styles.fullWidth,
    style,
  ];

  const textStyles = [
    styles.text,
    { color: getButtonTextColor(variant), fontSize: getButtonTextSize(size) },
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator color={getButtonTextColor(variant)} size="small" />
      ) : (
        <Text style={textStyles}>{children}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    fontWeight: '600',
  },
});
