/**
 * Onboarding Screen
 *
 * Choice screen for new users to either create a new boat
 * or join an existing one with an invite code.
 */

import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS } from '../../src/config/theme';

export default function OnboardingScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoIcon}>sailboat</Text>
          <Text style={styles.logoText}>Ahoy</Text>
          <Text style={styles.tagline}>
            Set up your yacht crew workspace
          </Text>
        </View>

        {/* Options */}
        <View style={styles.options}>
          {/* Create Boat */}
          <Pressable
            style={styles.optionCard}
            onPress={() => router.push('/(auth)/create-boat')}
          >
            <View style={styles.optionIcon}>
              <Text style={styles.optionIconText}>+</Text>
            </View>
            <Text style={styles.optionTitle}>Create a Boat</Text>
            <Text style={styles.optionDescription}>
              Start a new workspace for your yacht and invite your crew
            </Text>
          </Pressable>

          {/* Join Boat */}
          <Pressable
            style={[styles.optionCard, styles.optionCardSecondary]}
            onPress={() => router.push('/(auth)/join-boat')}
          >
            <View style={[styles.optionIcon, styles.optionIconSecondary]}>
              <Text style={[styles.optionIconText, styles.optionIconTextSecondary]}>
                +1
              </Text>
            </View>
            <Text style={[styles.optionTitle, styles.optionTitleSecondary]}>
              Join a Boat
            </Text>
            <Text style={[styles.optionDescription, styles.optionDescriptionSecondary]}>
              Enter an invite code from your captain to join an existing crew
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.card,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoIcon: {
    fontSize: 64,
    marginBottom: 8,
  },
  logoText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: COLORS.coral,
  },
  tagline: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  options: {
    gap: 16,
  },
  optionCard: {
    backgroundColor: COLORS.coral,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  optionCardSecondary: {
    backgroundColor: COLORS.surface,
  },
  optionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.overlayLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  optionIconSecondary: {
    backgroundColor: `${COLORS.coral}20`,
  },
  optionIconText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  optionIconTextSecondary: {
    color: COLORS.coral,
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 20,
  },
  optionTitleSecondary: {
    color: COLORS.textPrimary,
  },
  optionDescriptionSecondary: {
    color: COLORS.textSecondary,
  },
});
