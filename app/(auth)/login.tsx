/**
 * Login Screen
 *
 * Magic link email authentication.
 * User enters email, receives magic link, taps to authenticate.
 */

import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/features/auth/hooks/useAuth';
import { COLORS } from '../../src/config/theme';

type LoginState = 'input' | 'sent';

const __DEV__ = process.env.NODE_ENV !== 'production';

export default function LoginScreen() {
  const { sendMagicLink, isLoading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [loginState, setLoginState] = useState<LoginState>('input');
  const [sentEmail, setSentEmail] = useState('');

  const handleSendLink = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
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
      Alert.alert('Error', result.error || 'Failed to send magic link');
    }
  };

  const handleTryAgain = () => {
    setLoginState('input');
    setSentEmail('');
  };

  // Show "check your email" state
  if (loginState === 'sent') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>📧</Text>
          </View>

          <Text style={styles.title}>Check your email</Text>

          <Text style={styles.subtitle}>
            We sent a magic link to
          </Text>
          <Text style={styles.email}>{sentEmail}</Text>

          <Text style={styles.instructions}>
            Tap the link in the email to sign in.{'\n'}
            The link will expire in 1 hour.
          </Text>

          <Pressable
            style={styles.secondaryButton}
            onPress={handleTryAgain}
          >
            <Text style={styles.secondaryButtonText}>
              Use a different email
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // Show email input state
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Text style={styles.logoIcon}>⛵</Text>
            <Text style={styles.logoText}>Ahoy</Text>
            <Text style={styles.tagline}>Yacht Crew Expense Tracking</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Text style={styles.label}>Email address</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor={COLORS.textMuted}
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

            <Pressable
              style={[
                styles.button,
                isLoading && styles.buttonDisabled,
              ]}
              onPress={handleSendLink}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Send Magic Link</Text>
              )}
            </Pressable>
          </View>

          {/* Footer */}
          <Text style={styles.footerText}>
            No password needed.{'\n'}
            We'll send you a secure link to sign in.
          </Text>

          {/* Dev Quick Login - only in development */}
          {__DEV__ && (
            <View style={styles.devContainer}>
              <Text style={styles.devHint}>DEV: Quick Login (auto-joins dev season)</Text>
              <View style={styles.devButtonsRow}>
                <Pressable
                  style={[styles.devQuickButton, { backgroundColor: '#FF6B6B' }]}
                  onPress={() => sendMagicLink('dev1@ahoy.test')}
                  disabled={isLoading}
                >
                  <Text style={styles.devQuickButtonText}>Dev 1</Text>
                </Pressable>
                <Pressable
                  style={[styles.devQuickButton, { backgroundColor: '#4ECDC4' }]}
                  onPress={() => sendMagicLink('dev2@ahoy.test')}
                  disabled={isLoading}
                >
                  <Text style={styles.devQuickButtonText}>Dev 2</Text>
                </Pressable>
                <Pressable
                  style={[styles.devQuickButton, { backgroundColor: '#45B7D1' }]}
                  onPress={() => sendMagicLink('dev3@ahoy.test')}
                  disabled={isLoading}
                >
                  <Text style={styles.devQuickButtonText}>Dev 3</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardView: {
    flex: 1,
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
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.coral,
  },
  tagline: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  form: {
    marginBottom: 32,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 14,
    marginBottom: 16,
  },
  button: {
    backgroundColor: COLORS.coral,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footerText: {
    textAlign: 'center',
    color: COLORS.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  // Sent state styles
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  icon: {
    fontSize: 64,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  email: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 24,
  },
  instructions: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  secondaryButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: COLORS.coral,
    fontSize: 16,
    fontWeight: '500',
  },
  devContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  devHint: {
    color: '#999',
    fontSize: 12,
    marginBottom: 8,
  },
  devButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  devQuickButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 70,
  },
  devQuickButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
