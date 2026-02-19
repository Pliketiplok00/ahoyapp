/**
 * Input Component
 *
 * Reusable text input with label and error states.
 */

import { ReactNode } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../config/theme';

export type InputVariant = 'default' | 'filled';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  hint?: string;
  variant?: InputVariant;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
}

/**
 * Get input container styles based on state
 */
export function getInputContainerStyles(
  variant: InputVariant,
  hasError: boolean,
  isFocused: boolean,
  isDisabled: boolean
): ViewStyle {
  const baseStyle: ViewStyle = {
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    minHeight: 48,
    justifyContent: 'center',
    opacity: isDisabled ? 0.5 : 1,
  };

  if (hasError) {
    return {
      ...baseStyle,
      backgroundColor: variant === 'filled' ? `${COLORS.error}10` : COLORS.white,
      borderWidth: 1,
      borderColor: COLORS.error,
    };
  }

  if (isFocused) {
    return {
      ...baseStyle,
      backgroundColor: variant === 'filled' ? COLORS.surface : COLORS.white,
      borderWidth: 2,
      borderColor: COLORS.coral,
    };
  }

  switch (variant) {
    case 'filled':
      return {
        ...baseStyle,
        backgroundColor: COLORS.surface,
        borderWidth: 0,
      };
    case 'default':
    default:
      return {
        ...baseStyle,
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.border,
      };
  }
}

/**
 * Get label color based on state
 */
export function getLabelColor(hasError: boolean, isFocused: boolean): string {
  if (hasError) return COLORS.error;
  if (isFocused) return COLORS.coral;
  return COLORS.textSecondary;
}

export function Input({
  label,
  error,
  hint,
  variant = 'default',
  leftIcon,
  rightIcon,
  containerStyle,
  inputStyle,
  editable = true,
  ...textInputProps
}: InputProps) {
  const hasError = !!error;
  const isDisabled = !editable;

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: getLabelColor(hasError, false) }]}>
          {label}
        </Text>
      )}
      <View
        style={[
          styles.inputContainer,
          getInputContainerStyles(variant, hasError, false, isDisabled),
        ]}
      >
        {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
        <TextInput
          style={[styles.input, inputStyle]}
          placeholderTextColor={COLORS.textMuted}
          editable={editable}
          {...textInputProps}
        />
        {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
      {hint && !error && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    marginBottom: SPACING.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    padding: 0,
  },
  iconLeft: {
    marginRight: SPACING.sm,
  },
  iconRight: {
    marginLeft: SPACING.sm,
  },
  error: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.error,
    marginTop: SPACING.xs,
  },
  hint: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
});
