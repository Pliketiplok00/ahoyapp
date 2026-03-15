/**
 * Login Screen (Brutalist)
 *
 * Magic link email authentication with neo-brutalist design.
 * User enters email, receives magic link, taps to authenticate.
 *
 * @see docs/Ahoy_Screen_Map.md
 */

import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { BrutInput } from '@/components/ui/BrutInput';
import {
  COLORS,
  SHADOWS,
  BORDERS,
  SPACING,
  TYPOGRAPHY,
  FONTS,
  BORDER_RADIUS,
  ANIMATION,
  SIZES,
} from '@/config/theme';
import { Envelope, Anchor } from 'phosphor-react-native';

type LoginState = 'input' | 'sent';

const __DEV__ = process.env.NODE_ENV !== 'production';

export default function LoginScreen() {
  const { sendMagicLink, isLoading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [loginState, setLoginState] = useState<LoginState>('input');
  const [sentEmail, setSentEmail] = useState('');

  const handleSendLink = async () => {
    if (!email.trim()) {
      Alert.alert('Greška', 'Molimo unesite email adresu');
      return;
    }

    const result = await sendMagicLink(email.trim());

    if (result.success) {
      // If dev bypass was used, auth state will change and navigate automatically
      // Don't show "check your email" screen in that case
      if (!result.devBypassed) {
        setSentEmail(email.trim());
        setLoginState('sent');
        setEmail('');
      }
    } else {
      Alert.alert('Greška', result.error || 'Slanje magic linka nije uspjelo');
    }
  };

  const handleTryAgain = () => {
    setLoginState('input');
    setSentEmail('');
  };

  // ============================================
  // SENT STATE - "Check your email"
  // ============================================
  if (loginState === 'sent') {
    return (
      <SafeAreaView style={styles.container}>
        {/* Hero Section */}
        <View style={styles.hero}>
          <Anchor size={64} color={COLORS.foreground} weight="fill" />
          <Text style={styles.heroTitle}>AHOY!</Text>
          <Text style={styles.heroSubtitle}>Yacht Crew Expense Manager</Text>
        </View>

        <View style={styles.content}>
          {/* Check Email Card */}
          <View style={styles.sentCard}>
            <Envelope size={SIZES.icon.xl} color={COLORS.foreground} weight="fill" />
            <Text style={styles.sentTitle}>PROVJERI SVOJ EMAIL</Text>
            <Text style={styles.sentText}>Poslali smo magic link na</Text>
            <Text style={styles.sentEmail}>{sentEmail}</Text>
            <Text style={styles.sentInstructions}>
              Klikni na link u emailu za prijavu.{'\n'}
              Link istječe za 1 sat.
            </Text>
          </View>

          {/* Try Again Button */}
          <Pressable
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleTryAgain}
          >
            <Text style={styles.secondaryButtonText}>KORISTI DRUGI EMAIL</Text>
          </Pressable>
        </View>

        {/* Version Footer */}
        <Text style={styles.version}>v1.0.0 (MVP)</Text>
      </SafeAreaView>
    );
  }

  // ============================================
  // INPUT STATE - Email entry
  // ============================================
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Section */}
          <View style={styles.hero}>
            <Anchor size={64} color={COLORS.foreground} weight="fill" />
            <Text style={styles.heroTitle}>AHOY!</Text>
            <Text style={styles.heroSubtitle}>Upravljanje troškovima posade jahte</Text>
          </View>

          {/* Form Section */}
          <View style={styles.content}>
            <BrutInput
              label="EMAIL"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              editable={!isLoading}
            />

            {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}

            {/* Send Magic Link Button */}
            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                isLoading && styles.buttonDisabled,
                pressed && !isLoading && styles.buttonPressed,
              ]}
              onPress={handleSendLink}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.foreground} />
              ) : (
                <Text style={styles.primaryButtonText}>POŠALJI MAGIC LINK</Text>
              )}
            </Pressable>

            {/* Helper Text */}
            <Text style={styles.helperText}>
              Bez lozinke.{'\n'}
              Poslat ćemo ti sigurni link za prijavu.
            </Text>

            {/* DEV Section */}
            {__DEV__ && (
              <View style={styles.devSection}>
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or</Text>
                  <View style={styles.dividerLine} />
                </View>

                <Text style={styles.devLabel}>DEV QUICK LOGIN</Text>
                <View style={styles.devButtonsRow}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.devButton,
                      { backgroundColor: COLORS.pink },
                      pressed && styles.buttonPressed,
                    ]}
                    onPress={() => sendMagicLink('dev1@ahoy.test')}
                    disabled={isLoading}
                  >
                    <Text style={styles.devButtonText}>Dev 1</Text>
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => [
                      styles.devButton,
                      { backgroundColor: COLORS.accent },
                      pressed && styles.buttonPressed,
                    ]}
                    onPress={() => sendMagicLink('dev2@ahoy.test')}
                    disabled={isLoading}
                  >
                    <Text style={styles.devButtonText}>Dev 2</Text>
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => [
                      styles.devButton,
                      { backgroundColor: COLORS.primary },
                      pressed && styles.buttonPressed,
                    ]}
                    onPress={() => sendMagicLink('dev3@ahoy.test')}
                    disabled={isLoading}
                  >
                    <Text style={styles.devButtonText}>Dev 3</Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>

          {/* Version Footer */}
          <Text style={styles.version}>v1.0.0 (MVP)</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  // Layout
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
  },

  // Hero Section
  hero: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.xxl,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: BORDERS.heavy,
    borderBottomColor: COLORS.foreground,
    alignItems: 'center',
  },
  heroEmoji: {
    fontSize: 48,
    marginBottom: SPACING.sm,
  },
  heroTitle: {
    fontFamily: FONTS.display,
    fontSize: 48,
    color: COLORS.foreground,
    letterSpacing: TYPOGRAPHY.letterSpacing.tight,
  },
  heroSubtitle: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
    marginTop: SPACING.xs,
    opacity: 0.8,
  },

  // Primary Button
  primaryButton: {
    backgroundColor: COLORS.accent,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    ...SHADOWS.brut,
  },
  primaryButtonText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
    textTransform: 'uppercase',
    letterSpacing: TYPOGRAPHY.letterSpacing.wide,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonPressed: {
    transform: ANIMATION.pressedTransform,
  },

  // Secondary Button
  secondaryButton: {
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  secondaryButtonText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
    textTransform: 'uppercase',
    letterSpacing: TYPOGRAPHY.letterSpacing.wide,
  },

  // Error & Helper Text
  errorText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.destructive,
    marginBottom: SPACING.md,
  },
  helperText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
    textAlign: 'center',
    marginTop: SPACING.lg,
    lineHeight: 20,
  },

  // Sent State
  sentCard: {
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    padding: SPACING.xl,
    alignItems: 'center',
    ...SHADOWS.brut,
  },
  sentEmoji: {
    marginBottom: SPACING.md,
  },
  sentTitle: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.cardTitle,
    color: COLORS.foreground,
    marginBottom: SPACING.md,
  },
  sentText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.mutedForeground,
  },
  sentEmail: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  sentInstructions: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
    textAlign: 'center',
    lineHeight: 20,
  },

  // DEV Section
  devSection: {
    marginTop: SPACING.xl,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  dividerLine: {
    flex: 1,
    height: BORDERS.thin,
    backgroundColor: COLORS.muted,
  },
  dividerText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
    paddingHorizontal: SPACING.md,
    textTransform: 'uppercase',
  },
  devLabel: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
    textAlign: 'center',
    marginBottom: SPACING.sm,
    letterSpacing: TYPOGRAPHY.letterSpacing.widest,
  },
  devButtonsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    justifyContent: 'center',
  },
  devButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    minWidth: 80,
    alignItems: 'center',
  },
  devButtonText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.foreground,
    fontWeight: '600',
  },

  // Version Footer
  version: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
    textAlign: 'center',
    paddingVertical: SPACING.lg,
  },
});
