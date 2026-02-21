/**
 * Join Boat Screen
 *
 * Screen for joining an existing boat workspace using an invite code.
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
import { useRouter } from 'expo-router';
import { useSeason } from '../../src/features/season/hooks/useSeason';
import { COLORS } from '../../src/config/theme';

export default function JoinBoatScreen() {
  const router = useRouter();
  const { joinSeason, isLoading } = useSeason();

  const [inviteCode, setInviteCode] = useState('');

  const handleJoinBoat = async () => {
    const code = inviteCode.trim().toUpperCase();

    if (!code) {
      Alert.alert('Error', 'Please enter an invite code');
      return;
    }

    if (code.length < 6) {
      Alert.alert('Error', 'Invite code must be at least 6 characters');
      return;
    }

    const result = await joinSeason(code);

    if (result.success) {
      // Navigate to main app
      router.replace('/(main)/(tabs)');
    } else {
      Alert.alert('Error', result.error || 'Failed to join boat');
    }
  };

  const formatInviteCode = (text: string) => {
    // Remove any non-alphanumeric characters and convert to uppercase
    const cleaned = text.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    setInviteCode(cleaned);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Text style={styles.backText}>Back</Text>
            </Pressable>
          </View>

          {/* Icon */}
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>+1</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>Join a Boat</Text>
          <Text style={styles.subtitle}>
            Enter the invite code you received from your captain
          </Text>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>Invite Code</Text>
              <TextInput
                style={styles.input}
                placeholder="ABCD1234"
                placeholderTextColor={COLORS.textMuted}
                value={inviteCode}
                onChangeText={formatInviteCode}
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={12}
                editable={!isLoading}
              />
              <Text style={styles.hint}>
                The code is 8 characters, letters and numbers
              </Text>
            </View>

            {/* Submit Button */}
            <Pressable
              style={[styles.submitButton, isLoading && styles.buttonDisabled]}
              onPress={handleJoinBoat}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.submitText}>Join Boat</Text>
              )}
            </Pressable>
          </View>

          {/* Alternative */}
          <View style={styles.alternativeContainer}>
            <Text style={styles.alternativeText}>
              Don't have an invite code?
            </Text>
            <Pressable onPress={() => router.push('/(auth)/create-boat')}>
              <Text style={styles.alternativeLink}>Create your own boat</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.card,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    paddingVertical: 16,
  },
  backButton: {
    paddingVertical: 8,
  },
  backText: {
    fontSize: 16,
    color: COLORS.coral,
  },
  iconContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 24,
  },
  icon: {
    fontSize: 64,
    color: COLORS.coral,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
  },
  form: {
    flex: 1,
  },
  field: {
    marginBottom: 24,
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
    fontSize: 20,
    color: COLORS.textPrimary,
    textAlign: 'center',
    letterSpacing: 4,
    fontWeight: '600',
  },
  hint: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 8,
    textAlign: 'center',
  },
  submitButton: {
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
  submitText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  alternativeContainer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  alternativeText: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: 8,
  },
  alternativeLink: {
    fontSize: 14,
    color: COLORS.coral,
    fontWeight: '600',
  },
});
