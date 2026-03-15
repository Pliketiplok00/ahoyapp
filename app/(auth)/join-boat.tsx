/**
 * Join Boat Screen (Brutalist)
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
import { CaretLeft, UsersThree, Anchor } from 'phosphor-react-native';
import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
  FONTS,
  BORDERS,
  BORDER_RADIUS,
  SHADOWS,
  ANIMATION,
  SIZES,
} from '@/config/theme';
import { useAppTranslation } from '@/i18n';
import { useSeason } from '@/features/season/hooks/useSeason';

export default function JoinBoatScreen() {
  const { t } = useAppTranslation();
  const router = useRouter();
  const { joinSeason, isLoading } = useSeason();

  const [inviteCode, setInviteCode] = useState('');

  const handleJoinBoat = async () => {
    const code = inviteCode.trim().toUpperCase();

    if (!code) {
      Alert.alert(t('common.error'), t('auth.joinBoat.errors.codeRequired'));
      return;
    }

    if (code.length < 6) {
      Alert.alert(t('common.error'), t('auth.joinBoat.errors.codeTooShort'));
      return;
    }

    const result = await joinSeason(code);

    if (result.success) {
      router.replace('/(main)/(tabs)');
    } else {
      Alert.alert(t('common.error'), result.error || t('auth.joinBoat.errors.joinFailed'));
    }
  };

  const formatInviteCode = (text: string) => {
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
            <Pressable
              style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
              onPress={() => router.back()}
            >
              <CaretLeft size={SIZES.icon.md} color={COLORS.foreground} weight="bold" />
            </Pressable>
          </View>

          {/* Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.iconBox}>
              <UsersThree size={SIZES.icon.xl} color={COLORS.white} weight="fill" />
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>{t('auth.joinBoat.title')}</Text>
          <Text style={styles.subtitle}>{t('auth.joinBoat.subtitle')}</Text>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>{t('auth.joinBoat.inviteCode')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('auth.joinBoat.inviteCodePlaceholder')}
                placeholderTextColor={COLORS.mutedForeground}
                value={inviteCode}
                onChangeText={formatInviteCode}
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={12}
                editable={!isLoading}
              />
              <Text style={styles.hint}>{t('auth.joinBoat.inviteCodeHint')}</Text>
            </View>

            {/* Submit Button */}
            <Pressable
              style={({ pressed }) => [
                styles.submitButton,
                isLoading && styles.submitButtonDisabled,
                pressed && !isLoading && styles.pressed,
              ]}
              onPress={handleJoinBoat}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.submitText}>{t('auth.joinBoat.join')}</Text>
              )}
            </Pressable>
          </View>

          {/* Alternative */}
          <View style={styles.alternativeContainer}>
            <Text style={styles.alternativeText}>{t('auth.joinBoat.noCode')}</Text>
            <Pressable
              style={({ pressed }) => [pressed && styles.pressed]}
              onPress={() => router.push('/(auth)/create-boat')}
            >
              <Text style={styles.alternativeLink}>{t('auth.joinBoat.createBoat')}</Text>
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
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },

  // Header
  header: {
    paddingVertical: SPACING.md,
  },
  backButton: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.brutSm,
  },

  // Icon
  iconContainer: {
    alignItems: 'center',
    marginTop: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  iconBox: {
    width: 80,
    height: 80,
    backgroundColor: COLORS.primary,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.brut,
  },

  // Title
  title: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.sectionTitle,
    color: COLORS.foreground,
    textAlign: 'center',
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.mutedForeground,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: TYPOGRAPHY.sizes.body * TYPOGRAPHY.lineHeights.relaxed,
  },

  // Form
  form: {
    flex: 1,
  },
  field: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
    letterSpacing: TYPOGRAPHY.letterSpacing.widest,
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.cardTitle,
    color: COLORS.foreground,
    textAlign: 'center',
    letterSpacing: 4,
    ...SHADOWS.brut,
  },
  hint: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },

  // Submit Button
  submitButton: {
    backgroundColor: COLORS.primary,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    ...SHADOWS.brut,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.white,
    textTransform: 'uppercase',
  },

  // Alternative
  alternativeContainer: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  alternativeText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.mutedForeground,
    marginBottom: SPACING.sm,
  },
  alternativeLink: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.primary,
    textTransform: 'uppercase',
  },

  // Pressed
  pressed: {
    transform: ANIMATION.pressedTransform,
  },
});
