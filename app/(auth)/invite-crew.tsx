/**
 * Invite Crew Screen
 *
 * Screen for inviting crew members to the boat workspace.
 * Part of the onboarding flow after creating a boat.
 */

import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useSeason } from '../../src/features/season/hooks/useSeason';
import { COLORS } from '../../src/config/theme';

interface InviteItem {
  email: string;
  status: 'pending' | 'sending' | 'sent' | 'error';
  inviteCode?: string;
}

export default function InviteCrewScreen() {
  const router = useRouter();
  const { sendInvite, currentSeason, isLoading } = useSeason();

  const [email, setEmail] = useState('');
  const [invites, setInvites] = useState<InviteItem[]>([]);
  const [isSendingAll, setIsSendingAll] = useState(false);

  const validateEmail = (text: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(text);
  };

  const handleAddEmail = () => {
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    if (invites.some((i) => i.email === trimmedEmail)) {
      Alert.alert('Duplicate', 'This email is already in the list');
      return;
    }

    setInvites([...invites, { email: trimmedEmail, status: 'pending' }]);
    setEmail('');
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    setInvites(invites.filter((i) => i.email !== emailToRemove));
  };

  const handleSendInvites = async () => {
    if (invites.length === 0) {
      handleSkip();
      return;
    }

    setIsSendingAll(true);

    const pendingInvites = invites.filter((i) => i.status === 'pending');

    for (const invite of pendingInvites) {
      // Update status to sending
      setInvites((prev) =>
        prev.map((i) =>
          i.email === invite.email ? { ...i, status: 'sending' } : i
        )
      );

      const result = await sendInvite({ email: invite.email });

      // Update status based on result
      setInvites((prev) =>
        prev.map((i) =>
          i.email === invite.email
            ? {
                ...i,
                status: result.success ? 'sent' : 'error',
                inviteCode: result.inviteCode,
              }
            : i
        )
      );
    }

    setIsSendingAll(false);

    // Check if all invites were sent successfully
    const allSent = invites.every(
      (i) => i.status === 'sent' || i.status === 'pending'
    );

    if (allSent) {
      // Navigate to main app after a short delay
      setTimeout(() => {
        router.replace('/(main)/(tabs)');
      }, 1000);
    }
  };

  const handleSkip = () => {
    router.replace('/(main)/(tabs)');
  };

  const getStatusIcon = (status: InviteItem['status']) => {
    switch (status) {
      case 'sending':
        return '...';
      case 'sent':
        return 'OK';
      case 'error':
        return '!';
      default:
        return '';
    }
  };

  const getStatusColor = (status: InviteItem['status']) => {
    switch (status) {
      case 'sending':
        return COLORS.warmYellow;
      case 'sent':
        return COLORS.sageGreen;
      case 'error':
        return COLORS.statusCancelled;
      default:
        return COLORS.textMuted;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Text style={styles.backText}>Back</Text>
            </Pressable>
          </View>

          {/* Title */}
          <Text style={styles.title}>Invite Your Crew</Text>
          <Text style={styles.subtitle}>
            Add your crew members' email addresses.{'\n'}
            They'll receive an invite to join {currentSeason?.boatName || 'your boat'}.
          </Text>

          {/* Email Input */}
          <View style={styles.inputRow}>
            <TextInput
              style={styles.emailInput}
              placeholder="crew@email.com"
              placeholderTextColor={COLORS.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              editable={!isSendingAll}
              onSubmitEditing={handleAddEmail}
              returnKeyType="done"
            />
            <Pressable
              style={[styles.addButton, !email.trim() && styles.addButtonDisabled]}
              onPress={handleAddEmail}
              disabled={!email.trim() || isSendingAll}
            >
              <Text style={styles.addButtonText}>+</Text>
            </Pressable>
          </View>

          {/* Invite List */}
          <View style={styles.inviteList}>
            {invites.map((invite) => (
              <View key={invite.email} style={styles.inviteItem}>
                <View style={styles.inviteInfo}>
                  <Text style={styles.inviteEmail}>{invite.email}</Text>
                  {invite.status !== 'pending' && (
                    <Text
                      style={[
                        styles.inviteStatus,
                        { color: getStatusColor(invite.status) },
                      ]}
                    >
                      {getStatusIcon(invite.status)}
                    </Text>
                  )}
                </View>
                {invite.status === 'pending' && !isSendingAll && (
                  <Pressable
                    onPress={() => handleRemoveEmail(invite.email)}
                    style={styles.removeButton}
                  >
                    <Text style={styles.removeButtonText}>X</Text>
                  </Pressable>
                )}
                {invite.status === 'sending' && (
                  <ActivityIndicator size="small" color={COLORS.warmYellow} />
                )}
              </View>
            ))}
          </View>

          {/* Empty State */}
          {invites.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                Add crew member emails above
              </Text>
            </View>
          )}

          {/* Actions */}
          <View style={styles.actions}>
            <Pressable
              style={[
                styles.submitButton,
                (isLoading || isSendingAll) && styles.buttonDisabled,
              ]}
              onPress={handleSendInvites}
              disabled={isLoading || isSendingAll}
            >
              {isSendingAll ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.submitText}>
                  {invites.length > 0 ? 'Send Invites' : 'Continue'}
                </Text>
              )}
            </Pressable>

            {invites.length > 0 && (
              <Pressable
                style={styles.skipButton}
                onPress={handleSkip}
                disabled={isSendingAll}
              >
                <Text style={styles.skipText}>Skip for now</Text>
              </Pressable>
            )}
          </View>
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
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
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 32,
    lineHeight: 22,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  emailInput: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  addButton: {
    backgroundColor: COLORS.coral,
    borderRadius: 12,
    width: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonDisabled: {
    backgroundColor: COLORS.textMuted,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: '600',
  },
  inviteList: {
    gap: 12,
  },
  inviteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  inviteInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inviteEmail: {
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  inviteStatus: {
    fontSize: 14,
    fontWeight: '600',
  },
  removeButton: {
    padding: 8,
  },
  removeButtonText: {
    fontSize: 16,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  actions: {
    marginTop: 'auto',
    paddingTop: 24,
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
  skipButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  skipText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
});
