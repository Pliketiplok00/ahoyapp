/**
 * BrutInput Component
 *
 * Neo-brutalist text input with hard edges and focus state changes.
 * Uses Space Mono font and changes background on focus.
 *
 * @see docs/Ahoy_DESIGN_RULES.md Section 5-6 - Interactive States, Component Patterns
 */

import { useState, useCallback } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps,
} from 'react-native';
import {
  COLORS,
  SHADOWS,
  BORDERS,
  BORDER_RADIUS,
  SPACING,
  TYPOGRAPHY,
  FONTS,
} from '../../config/theme';

export type BrutInputSize =
  | 'sm'           // Compact
  | 'md'           // Default
  | 'lg';          // Prominent

export type BrutInputState =
  | 'default'      // Normal state
  | 'focused'      // Currently focused
  | 'error'        // Has validation error
  | 'disabled';    // Disabled state

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
  /** Additional input styles */
  inputStyle?: TextStyle;
  /** Test ID for testing */
  testID?: string;
}

/**
 * Get input size styles
 */
export function getSizeStyles(size: BrutInputSize): { container: ViewStyle; text: TextStyle } {
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
          paddingHorizontal: SPACING.lg,
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
          paddingHorizontal: SPACING.md,
          paddingVertical: SPACING.sm,
        },
        text: {
          fontSize: TYPOGRAPHY.sizes.body,
        },
      };
  }
}

/**
 * Get state styles for input
 */
export function getStateStyles(state: BrutInputState): {
  container: ViewStyle;
  borderColor: string;
  backgroundColor: string;
} {
  switch (state) {
    case 'focused':
      return {
        container: SHADOWS.brut,
        borderColor: COLORS.foreground,
        backgroundColor: COLORS.primaryLight,
      };
    case 'error':
      return {
        container: SHADOWS.brut,
        borderColor: COLORS.destructive,
        backgroundColor: COLORS.card,
      };
    case 'disabled':
      return {
        container: SHADOWS.none,
        borderColor: COLORS.muted,
        backgroundColor: COLORS.muted,
      };
    case 'default':
    default:
      return {
        container: SHADOWS.none,
        borderColor: COLORS.foreground,
        backgroundColor: COLORS.card,
      };
  }
}

/**
 * Base input styles (exported for testing)
 */
export const BASE_STYLES = {
  borderWidth: BORDERS.normal,
  borderRadius: BORDER_RADIUS.none,
} as const;

/**
 * BrutInput - Neo-brutalist text input component
 *
 * @example
 * // Basic input
 * <BrutInput
 *   label="Email"
 *   placeholder="Enter your email"
 *   value={email}
 *   onChangeText={setEmail}
 * />
 *
 * @example
 * // Input with error
 * <BrutInput
 *   label="Password"
 *   error="Password is required"
 *   secureTextEntry
 * />
 *
 * @example
 * // Large multiline input
 * <BrutInput
 *   size="lg"
 *   multiline
 *   numberOfLines={4}
 *   placeholder="Enter notes..."
 * />
 */
export function BrutInput({
  label,
  error,
  helperText,
  size = 'md',
  containerStyle,
  inputStyle,
  testID,
  editable = true,
  ...textInputProps
}: BrutInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  // Determine current state
  const state: BrutInputState = !editable
    ? 'disabled'
    : error
    ? 'error'
    : isFocused
    ? 'focused'
    : 'default';

  const sizeStyles = getSizeStyles(size);
  const stateStyles = getStateStyles(state);

  const handleFocus = useCallback((e: Parameters<NonNullable<TextInputProps['onFocus']>>[0]) => {
    setIsFocused(true);
    textInputProps.onFocus?.(e);
  }, [textInputProps]);

  const handleBlur = useCallback((e: Parameters<NonNullable<TextInputProps['onBlur']>>[0]) => {
    setIsFocused(false);
    textInputProps.onBlur?.(e);
  }, [textInputProps]);

  return (
    <View style={[styles.container, containerStyle]} testID={testID}>
      {label && (
        <Text style={styles.label} testID={testID ? `${testID}-label` : undefined}>
          {label}
        </Text>
      )}

      <View
        style={[
          styles.inputContainer,
          sizeStyles.container,
          stateStyles.container,
          {
            borderColor: stateStyles.borderColor,
            backgroundColor: stateStyles.backgroundColor,
          },
        ]}
      >
        <TextInput
          {...textInputProps}
          editable={editable}
          style={[
            styles.input,
            sizeStyles.text,
            { color: editable ? COLORS.foreground : COLORS.mutedForeground },
            inputStyle,
          ]}
          placeholderTextColor={COLORS.mutedForeground}
          onFocus={handleFocus}
          onBlur={handleBlur}
          testID={testID ? `${testID}-input` : undefined}
        />
      </View>

      {error && (
        <Text style={styles.error} testID={testID ? `${testID}-error` : undefined}>
          {error}
        </Text>
      )}

      {helperText && !error && (
        <Text style={styles.helperText} testID={testID ? `${testID}-helper` : undefined}>
          {helperText}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.label,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: TYPOGRAPHY.letterSpacing.widest,
    color: COLORS.mutedForeground,
    marginBottom: SPACING.xs,
  },
  inputContainer: {
    ...BASE_STYLES,
  },
  input: {
    fontFamily: FONTS.mono,
    color: COLORS.foreground,
    padding: 0, // Container handles padding
    margin: 0,
  },
  error: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.destructive,
    marginTop: SPACING.xs,
  },
  helperText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
    marginTop: SPACING.xs,
  },
});
