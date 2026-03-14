/**
 * AhoyLogo Component
 *
 * Clickable AHOY! logo that navigates to home screen.
 * Used in tab screen headers to provide home navigation
 * since home is excluded from the bottom tab bar.
 */

import { Pressable, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import {
  COLORS,
  FONTS,
  TYPOGRAPHY,
  SPACING,
  ANIMATION,
} from '../../config/theme';

interface AhoyLogoProps {
  /** Size variant */
  size?: 'small' | 'large';
  /** Custom color (defaults to foreground) */
  color?: string;
}

export function AhoyLogo({ size = 'small', color }: AhoyLogoProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push('/(main)/(tabs)');
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [pressed && styles.pressed]}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      testID="ahoy-logo"
    >
      <Text
        style={[
          styles.text,
          size === 'large' && styles.textLarge,
          color ? { color } : null,
        ]}
      >
        AHOY!
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  text: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.foreground,
    letterSpacing: TYPOGRAPHY.letterSpacing.wide,
  },
  textLarge: {
    fontSize: TYPOGRAPHY.sizes.hero,
  },
  pressed: {
    opacity: 0.7,
    transform: ANIMATION.pressedTransform,
  },
});
