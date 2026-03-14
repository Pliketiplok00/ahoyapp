/**
 * Invite Crew Screen (Brutalist)
 *
 * Screen for inviting crew members to the boat workspace.
 * Shows invite code for manual sharing via SMS/WhatsApp/email.
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
import * as Clipboard from 'expo-clipboard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useSeason } from '@/features/season/hooks/useSeason';
import {
  COLORS,
  BORDERS,
  SPACING,
  TYPOGRAPHY,
  FONTS,
  BORDER_RADIUS,
  SHADOWS,
  ANIMATION,
  SIZES,
} from '@/config/theme';
import { Check, Warning as WarningIcon } from 'phosphor-react-native';

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

  const handleAddEmail = async () => {
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      Alert.alert('Neispravan email', 'Molimo unesite ispravnu email adresu');
      return;
    }

    if (invites.some((i) => i.email === trimmedEmail)) {
      Alert.alert('Duplikat', 'Ovaj email je već na listi');
      return;
    }

    // Add to list as sending
    setInvites((prev) => [...prev, { email: trimmedEmail, status: 'sending' }]);
    setEmail('');

    // Create invite in Firestore
    const result = await sendInvite({ email: trimmedEmail });

    // Update with result
    setInvites((prev) =>
      prev.map((i) =>
        i.email === trimmedEmail
          ? {
              ...i,
              status: result.success ? 'sent' : 'error',
              inviteCode: result.inviteCode,
            }
          : i
      )
    );
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    setInvites(invites.filter((i) => i.email !== emailToRemove));
  };

  const handleCopyCode = async (code: string) => {
    await Clipboard.setStringAsync(code);
    Alert.alert('Kopirano!', 'Kod je kopiran u međuspremnik');
  };

  const handleFinish = () => {
    router.replace('/(main)/(tabs)');
  };

  const renderStatusIcon = (status: InviteItem['status']) => {
    switch (status) {
      case 'sent':
        return <Check size={16} color={COLORS.success} weight="bold" />;
      case 'error':
        return <WarningIcon size={16} color={COLORS.destructive} weight="fill" />;
      default:
        return null;
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
            <Pressable
              style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
              onPress={() => router.back()}
            >
              <Text style={styles.backText}>Natrag</Text>
            </Pressable>
          </View>

          {/* Title */}
          <Text style={styles.title}>Pozovi svoju posadu</Text>
          <Text style={styles.subtitle}>
            Dodaj članove posade. Dobit ćeš kod za dijeljenje koji šalješ članu putem SMS-a, WhatsAppa ili emaila.
          </Text>

          {/* Email Input */}
          <View style={styles.inputRow}>
            <TextInput
              style={styles.emailInput}
              placeholder="crew@email.com"
              placeholderTextColor={COLORS.mutedForeground}
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
              style={({ pressed }) => [
                styles.addButton,
                !email.trim() && styles.addButtonDisabled,
                pressed && email.trim() && styles.pressed,
              ]}
              onPress={handleAddEmail}
              disabled={!email.trim() || isSendingAll}
            >
              <Text style={styles.addButtonText}>+</Text>
            </Pressable>
          </View>

          {/* Invite List */}
          <View style={styles.inviteList}>
            {invites.map((invite) => (
              <View key={invite.email} style={styles.inviteCard}>
                {/* Email Header */}
                <View style={styles.inviteHeader}>
                  <Text style={styles.inviteEmail}>{invite.email}</Text>
                  {invite.status === 'sending' && (
                    <ActivityIndicator size="small" color={COLORS.primary} />
                  )}
                  {invite.status === 'sent' && (
                    <View style={styles.inviteStatusSent}>{renderStatusIcon(invite.status)}</View>
                  )}
                  {invite.status === 'error' && (
                    <View style={styles.inviteStatusError}>{renderStatusIcon(invite.status)}</View>
                  )}
                  {invite.status === 'pending' && !isSendingAll && (
                    <Pressable
                      onPress={() => handleRemoveEmail(invite.email)}
                      style={({ pressed }) => [styles.removeButton, pressed && styles.pressed]}
                    >
                      <Text style={styles.removeButtonText}>X</Text>
                    </Pressable>
                  )}
                </View>

                {/* Invite Code Display (only when sent) */}
                {invite.status === 'sent' && invite.inviteCode && (
                  <View style={styles.codeSection}>
                    <Text style={styles.codeLabel}>KOD ZA PRIDRUŽIVANJE:</Text>
                    <View style={styles.codeBox}>
                      <Text style={styles.codeText}>{invite.inviteCode}</Text>
                    </View>
                    <Pressable
                      style={({ pressed }) => [styles.copyButton, pressed && styles.pressed]}
                      onPress={() => handleCopyCode(invite.inviteCode!)}
                    >
                      <Text style={styles.copyButtonText}>KOPIRAJ KOD</Text>
                    </Pressable>
                    <Text style={styles.codeHint}>
                      Pošalji ovaj kod članu putem SMS-a, WhatsAppa ili emaila.
                    </Text>
                  </View>
                )}

                {/* Error state */}
                {invite.status === 'error' && (
                  <View style={styles.errorSection}>
                    <Text style={styles.errorText}>Greška pri kreiranju pozivnice</Text>
                  </View>
                )}
              </View>
            ))}
          </View>

          {/* Empty State */}
          {invites.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>👥</Text>
              <Text style={styles.emptyText}>
                Dodaj emailove članova posade iznad
              </Text>
            </View>
          )}

          {/* Actions */}
          <View style={styles.actions}>
            <Pressable
              style={({ pressed }) => [
                styles.submitButton,
                (isLoading || isSendingAll) && styles.buttonDisabled,
                pressed && !isLoading && !isSendingAll && styles.pressed,
              ]}
              onPress={handleFinish}
              disabled={isLoading || isSendingAll}
            >
              <Text style={styles.submitText}>
                {invites.length > 0 ? 'ZAVRŠI' : 'PRESKOČI'}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Container
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },

  // Header
  header: {
    paddingVertical: SPACING.md,
  },
  backButton: {
    width: 80,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    alignItems: 'center',
    ...SHADOWS.brutSm,
  },
  backText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
  },

  // Title
  title: {
    fontFamily: FONTS.display,
    fontSize: 32,
    color: COLORS.foreground,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.mutedForeground,
    marginBottom: SPACING.xl,
    lineHeight: 22,
  },

  // Input Row
  inputRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  emailInput: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
  },
  addButton: {
    backgroundColor: COLORS.accent,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    width: 52,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.brutSm,
  },
  addButtonDisabled: {
    backgroundColor: COLORS.muted,
  },
  addButtonText: {
    fontFamily: FONTS.display,
    color: COLORS.foreground,
    fontSize: 24,
  },

  // Invite List
  inviteList: {
    gap: SPACING.md,
  },
  inviteCard: {
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    padding: SPACING.md,
    ...SHADOWS.brut,
  },
  inviteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inviteEmail: {
    flex: 1,
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
  },
  inviteStatusSent: {
    marginLeft: SPACING.sm,
  },
  inviteStatusError: {
    marginLeft: SPACING.sm,
  },
  removeButton: {
    width: 32,
    height: 32,
    backgroundColor: COLORS.muted,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
  },

  // Code Section
  codeSection: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: BORDERS.thin,
    borderTopColor: COLORS.muted,
  },
  codeLabel: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
    letterSpacing: TYPOGRAPHY.letterSpacing.widest,
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
  },
  codeBox: {
    backgroundColor: COLORS.primary,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  codeText: {
    fontFamily: FONTS.monoBold,
    fontSize: TYPOGRAPHY.sizes.hero,
    color: COLORS.foreground,
    letterSpacing: 4,
  },
  copyButton: {
    backgroundColor: COLORS.secondary,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    marginBottom: SPACING.sm,
    ...SHADOWS.brutSm,
  },
  copyButtonText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.white,
    textTransform: 'uppercase',
  },
  codeHint: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
    textAlign: 'center',
    lineHeight: 18,
  },

  // Error Section
  errorSection: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: BORDERS.thin,
    borderTopColor: COLORS.muted,
  },
  errorText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.destructive,
  },

  // Empty State
  emptyState: {
    paddingVertical: SPACING.xxl,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  emptyText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.mutedForeground,
    textAlign: 'center',
  },

  // Actions
  actions: {
    marginTop: 'auto',
    paddingTop: SPACING.xl,
  },
  submitButton: {
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
  buttonDisabled: {
    opacity: 0.5,
  },
  submitText: {
    fontFamily: FONTS.display,
    color: COLORS.foreground,
    fontSize: TYPOGRAPHY.sizes.body,
    textTransform: 'uppercase',
  },

  // Press state
  pressed: {
    transform: ANIMATION.pressedTransform,
  },
});
