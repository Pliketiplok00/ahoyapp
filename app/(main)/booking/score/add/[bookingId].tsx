/**
 * Add Score Entry Screen (Brutalist)
 *
 * Captain-only screen for adding score entries.
 * Select crew member, points, and optional reason.
 *
 * @see docs/Ahoy_Screen_Map.md
 */

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  COLORS,
  SHADOWS,
  BORDERS,
  SPACING,
  TYPOGRAPHY,
  FONTS,
  BORDER_RADIUS,
  ANIMATION,
} from '../../../../../src/config/theme';
import { useScoreCard } from '../../../../../src/features/score';
import { useSeasonStore } from '../../../../../src/stores/seasonStore';
import { useAuthStore } from '../../../../../src/stores/authStore';
import { USER_ROLES } from '../../../../../src/constants/userRoles';
import { SCORE_POINTS, type ScorePoints, type User } from '../../../../../src/types/models';

// ============================================
// COMPONENTS
// ============================================

interface CrewButtonProps {
  member: User;
  isSelected: boolean;
  onPress: () => void;
}

function CrewButton({ member, isSelected, onPress }: CrewButtonProps) {
  // Get initials from name
  const initials = member.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';

  return (
    <Pressable
      style={({ pressed }) => [
        styles.crewButton,
        isSelected && styles.crewButtonSelected,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      {/* SQUARE Avatar */}
      <View style={[styles.crewAvatar, { backgroundColor: member.color }]}>
        <Text style={styles.crewAvatarText}>{initials}</Text>
      </View>
      <Text
        style={[styles.crewName, isSelected && styles.crewNameSelected]}
        numberOfLines={1}
      >
        {member.name?.toUpperCase() || 'UNKNOWN'}
      </Text>
    </Pressable>
  );
}

interface PointButtonProps {
  points: ScorePoints;
  isSelected: boolean;
  onPress: () => void;
}

function PointButton({ points, isSelected, onPress }: PointButtonProps) {
  const isPositive = points > 0;
  const baseColor = isPositive ? COLORS.success : COLORS.destructive;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.pointButton,
        isSelected && { backgroundColor: baseColor, borderColor: COLORS.foreground },
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.pointButtonText,
          { color: isSelected ? COLORS.card : baseColor },
        ]}
      >
        {points > 0 ? `+${points}` : points}
      </Text>
    </Pressable>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function AddScoreScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const router = useRouter();

  // Get REAL crew members from season store
  const { crewMembers } = useSeasonStore();
  const { firebaseUser } = useAuthStore();
  const currentUserId = firebaseUser?.uid || '';
  const currentCrewMember = crewMembers.find((m) => m.id === currentUserId);
  const isCaptain = currentCrewMember?.roles?.includes(USER_ROLES.CAPTAIN) || false;

  const { addScore, isAdding, canAddScore } = useScoreCard({
    bookingId: bookingId || '',
    crewMembers,
    currentUserId,
    isCaptain,
  });

  // Form state
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedPoints, setSelectedPoints] = useState<ScorePoints | null>(null);
  const [reason, setReason] = useState('');

  // Filter out current user (captain) from crew members
  const eligibleMembers = crewMembers.filter((m) => m.id !== currentUserId);

  const canSubmit = selectedUserId && selectedPoints !== null && !isAdding;

  const handleSubmit = async () => {
    if (!selectedUserId || selectedPoints === null) return;

    const success = await addScore(selectedUserId, selectedPoints, reason.trim() || undefined);
    if (success) {
      router.back();
    }
  };

  // Check if user can add scores
  if (!canAddScore) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </Pressable>
          <Text style={styles.headerTitle}>AWARD POINTS</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorEmoji}>🔒</Text>
          <Text style={styles.errorTitle}>ACCESS DENIED</Text>
          <Text style={styles.errorText}>
            Only captains can add score entries
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Split points into positive and negative rows
  const positivePoints = SCORE_POINTS.filter((p) => p > 0) as ScorePoints[];
  const negativePoints = SCORE_POINTS.filter((p) => p < 0) as ScorePoints[];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>AWARD POINTS</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Crew Member Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>CREW MEMBER</Text>
          <View style={styles.crewGrid}>
            {eligibleMembers.map((member) => (
              <CrewButton
                key={member.id}
                member={member}
                isSelected={selectedUserId === member.id}
                onPress={() => setSelectedUserId(member.id)}
              />
            ))}
          </View>
        </View>

        {/* Points Selection - 2x3 Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>POINTS</Text>
          <View style={styles.pointsGrid}>
            {/* Positive row */}
            <View style={styles.pointsRow}>
              {positivePoints.map((points) => (
                <PointButton
                  key={points}
                  points={points}
                  isSelected={selectedPoints === points}
                  onPress={() => setSelectedPoints(points)}
                />
              ))}
            </View>
            {/* Negative row */}
            <View style={styles.pointsRow}>
              {negativePoints.map((points) => (
                <PointButton
                  key={points}
                  points={points}
                  isSelected={selectedPoints === points}
                  onPress={() => setSelectedPoints(points)}
                />
              ))}
            </View>
          </View>
        </View>

        {/* Reason Input */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>REASON (OPTIONAL)</Text>
          <TextInput
            style={styles.reasonInput}
            placeholder="Late to dock, saved the day..."
            placeholderTextColor={COLORS.mutedForeground}
            value={reason}
            onChangeText={setReason}
            multiline
            maxLength={200}
          />
        </View>

        {/* Submit Button */}
        <Pressable
          style={({ pressed }) => [
            styles.submitButton,
            !canSubmit && styles.submitButtonDisabled,
            pressed && canSubmit && styles.pressed,
          ]}
          onPress={handleSubmit}
          disabled={!canSubmit}
        >
          {isAdding ? (
            <ActivityIndicator color={COLORS.foreground} />
          ) : (
            <Text style={styles.submitButtonText}>AWARD POINTS</Text>
          )}
        </Pressable>

        {/* Info Note */}
        <Text style={styles.infoNote}>
          Note: Scores cannot be deleted. Add opposite points to compensate.
        </Text>

        <View style={{ height: SPACING.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  // Container
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primary,
    borderBottomWidth: BORDERS.heavy,
    borderBottomColor: COLORS.foreground,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
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
  backButtonText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.cardTitle,
    color: COLORS.foreground,
  },
  headerTitle: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.cardTitle,
    color: COLORS.foreground,
    textTransform: 'uppercase',
  },
  headerSpacer: {
    width: 40,
  },

  // Error State
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  errorEmoji: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  errorTitle: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.large,
    color: COLORS.foreground,
    marginBottom: SPACING.xs,
  },
  errorText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.mutedForeground,
    textAlign: 'center',
  },

  // ScrollView
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
  },

  // Section
  section: {
    marginBottom: SPACING.lg,
  },
  sectionLabel: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
    letterSpacing: TYPOGRAPHY.letterSpacing.widest,
    marginBottom: SPACING.sm,
  },

  // Crew Grid
  crewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  crewButton: {
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    minWidth: 90,
  },
  crewButtonSelected: {
    backgroundColor: COLORS.accent,
    borderWidth: BORDERS.heavy,
  },
  crewAvatar: {
    width: 40,
    height: 40,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none, // SQUARE!
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  crewAvatarText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.card,
    fontWeight: '700',
  },
  crewName: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.foreground,
  },
  crewNameSelected: {
    fontWeight: '700',
  },

  // Points Grid - 2x3
  pointsGrid: {
    gap: SPACING.sm,
  },
  pointsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  pointButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
  },
  pointButtonText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.cardTitle,
    fontWeight: '700',
  },

  // Reason Input
  reasonInput: {
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    padding: SPACING.md,
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
    minHeight: 100,
    textAlignVertical: 'top',
  },

  // Submit Button
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
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
    textTransform: 'uppercase',
  },

  // Info Note
  infoNote: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: SPACING.lg,
  },

  // Pressed state
  pressed: {
    transform: ANIMATION.pressedTransform,
  },
});
