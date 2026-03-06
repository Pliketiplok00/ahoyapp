/**
 * Onboarding Screen (Brutalist)
 *
 * Choice screen for new users to either create a new boat
 * or join an existing one with an invite code.
 */

import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  COLORS,
  BORDERS,
  SPACING,
  TYPOGRAPHY,
  FONTS,
  BORDER_RADIUS,
  SHADOWS,
  ANIMATION,
} from '@/config/theme';

export default function OnboardingScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoBox}>
            <Text style={styles.logoEmoji}>{'\u26F5'}</Text>
          </View>
          <Text style={styles.logoText}>AHOY</Text>
          <Text style={styles.tagline}>
            RADNI PROSTOR ZA POSADU JAHTE
          </Text>
        </View>

        {/* Options */}
        <View style={styles.options}>
          {/* Create Boat */}
          <Pressable
            style={({ pressed }) => [
              styles.optionCard,
              styles.optionCardPrimary,
              pressed && styles.pressed,
            ]}
            onPress={() => router.push('/(auth)/create-boat')}
          >
            <View style={styles.optionIconPrimary}>
              <Text style={styles.optionIconTextPrimary}>+</Text>
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitlePrimary}>KREIRAJ BROD</Text>
              <Text style={styles.optionDescriptionPrimary}>
                Kreiraj novi radni prostor za svoju jahtu i pozovi posadu
              </Text>
            </View>
          </Pressable>

          {/* Join Boat */}
          <Pressable
            style={({ pressed }) => [
              styles.optionCard,
              styles.optionCardSecondary,
              pressed && styles.pressed,
            ]}
            onPress={() => router.push('/(auth)/join-boat')}
          >
            <View style={styles.optionIconSecondary}>
              <Text style={styles.optionIconTextSecondary}>+1</Text>
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitleSecondary}>PRIDRUŽI SE</Text>
              <Text style={styles.optionDescriptionSecondary}>
                Unesi pozivni kod od svog kapetana
              </Text>
            </View>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    justifyContent: 'center',
  },

  // Logo
  logoContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  logoBox: {
    width: 80,
    height: 80,
    backgroundColor: COLORS.primary,
    borderWidth: BORDERS.heavy,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.brut,
  },
  logoEmoji: {
    fontSize: 40,
  },
  logoText: {
    fontFamily: FONTS.display,
    fontSize: 48,
    color: COLORS.foreground,
    letterSpacing: TYPOGRAPHY.letterSpacing.widest,
  },
  tagline: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
    marginTop: SPACING.sm,
    textAlign: 'center',
    letterSpacing: TYPOGRAPHY.letterSpacing.wide,
  },

  // Options
  options: {
    gap: SPACING.md,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    padding: SPACING.lg,
    ...SHADOWS.brut,
  },
  optionCardPrimary: {
    backgroundColor: COLORS.accent,
  },
  optionCardSecondary: {
    backgroundColor: COLORS.card,
  },
  optionContent: {
    flex: 1,
  },

  // Primary option (Create)
  optionIconPrimary: {
    width: 48,
    height: 48,
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  optionIconTextPrimary: {
    fontFamily: FONTS.display,
    fontSize: 24,
    color: COLORS.foreground,
  },
  optionTitlePrimary: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.cardTitle,
    color: COLORS.foreground,
    marginBottom: SPACING.xs,
  },
  optionDescriptionPrimary: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.foreground,
    opacity: 0.8,
  },

  // Secondary option (Join)
  optionIconSecondary: {
    width: 48,
    height: 48,
    backgroundColor: COLORS.muted,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  optionIconTextSecondary: {
    fontFamily: FONTS.display,
    fontSize: 20,
    color: COLORS.foreground,
  },
  optionTitleSecondary: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.cardTitle,
    color: COLORS.foreground,
    marginBottom: SPACING.xs,
  },
  optionDescriptionSecondary: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
  },

  // Pressed state
  pressed: {
    transform: ANIMATION.pressedTransform,
  },
});
