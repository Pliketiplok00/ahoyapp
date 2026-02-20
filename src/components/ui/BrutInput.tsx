/**
 * BrutInput Component (Minimal Rewrite)
 *
 * Neo-brutalist text input - simplified for reliability.
 * Focus styling removed to fix touch/keyboard issues.
 *
 * @see docs/Ahoy_DESIGN_RULES.md
 */

import React from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import {
  COLORS,
  FONTS,
  TYPOGRAPHY,
  SPACING,
  BORDERS,
  BORDER_RADIUS,
} from '../../config/theme';

export type BrutInputSize = 'sm' | 'md' | 'lg';

interface BrutInputProps extends Omit<TextInputProps, 'style'> {
  /** Optional label above input */
  label?: string;
  /** Error message to display */
  error?: string;
  /** Helper text below input */
  helperText?: string;
  /** Input size */
  size?: BrutInputSize;
  /** Additional container styles */
  containerStyle?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
}

/**
 * Get size-specific styles
 */
function getSizeConfig(size: BrutInputSize) {
  switch (size) {
    case 'sm':
      return {
        paddingVertical: SPACING.xs,
        paddingHorizontal: SPACING.sm,
        fontSize: TYPOGRAPHY.sizes.label,
      };
    case 'lg':
      return {
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.lg,
        fontSize: TYPOGRAPHY.sizes.large,
      };
    case 'md':
    default:
      return {
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.md,
        fontSize: TYPOGRAPHY.sizes.body,
      };
  }
}

/**
 * BrutInput - Minimal neo-brutalist text input
 *
 * @example
 * <BrutInput
 *   label="Email"
 *   placeholder="Enter your email"
 *   value={email}
 *   onChangeText={setEmail}
 * />
 */
export function BrutInput({
  label,
  error,
  helperText,
  size = 'md',
  containerStyle,
  testID,
  multiline,
  numberOfLines,
  editable = true,
  ...textInputProps
}: BrutInputProps) {
  const sizeConfig = getSizeConfig(size);

  return (
    <View style={[styles.container, containerStyle]} testID={testID}>
      {label && (
        <Text style={styles.label} testID={testID ? `${testID}-label` : undefined}>
          {label}
        </Text>
      )}

      <TextInput
        {...textInputProps}
        editable={editable}
        multiline={multiline}
        numberOfLines={numberOfLines}
        style={[
          styles.input,
          {
            paddingVertical: sizeConfig.paddingVertical,
            paddingHorizontal: sizeConfig.paddingHorizontal,
            fontSize: sizeConfig.fontSize,
            minHeight: multiline ? 100 : undefined,
            textAlignVertical: multiline ? 'top' : 'center',
            opacity: editable ? 1 : 0.5,
          },
          error && styles.inputError,
        ]}
        placeholderTextColor={COLORS.mutedForeground}
        testID={testID ? `${testID}-input` : undefined}
      />

      {error && (
        <Text style={styles.error} testID={testID ? `${testID}-error` : undefined}>
          {error}
        </Text>
      )}

      {helperText && !error && (
        <Text style={styles.helper} testID={testID ? `${testID}-helper` : undefined}>
          {helperText}
        </Text>
      )}
    </View>
  );
}

// Legacy exports for test compatibility
export function getSizeStyles(size: BrutInputSize) {
  const config = getSizeConfig(size);
  return {
    container: {},
    text: {
      fontSize: config.fontSize,
      paddingHorizontal: config.paddingHorizontal,
      paddingVertical: config.paddingVertical,
    },
  };
}

export type BrutInputState = 'default' | 'focused' | 'error' | 'disabled';

export function getStateStyles(state: BrutInputState) {
  // Simplified - no focus styling for now
  return {
    container: {},
    borderColor: state === 'error' ? COLORS.destructive : COLORS.foreground,
    backgroundColor: COLORS.card,
  };
}

export const BASE_STYLES = {
  borderWidth: BORDERS.normal,
  borderRadius: BORDER_RADIUS.none,
} as const;

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.label,
    fontWeight: '600',
    color: COLORS.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: TYPOGRAPHY.letterSpacing.widest,
    marginBottom: SPACING.xs,
  },
  input: {
    fontFamily: FONTS.mono,
    color: COLORS.foreground,
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
  },
  inputError: {
    borderColor: COLORS.destructive,
  },
  error: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.destructive,
    marginTop: SPACING.xs,
  },
  helper: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
    marginTop: SPACING.xs,
  },
});
