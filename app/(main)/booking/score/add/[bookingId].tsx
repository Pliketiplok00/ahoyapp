/**
 * Add Score Entry Screen
 *
 * Captain-only screen for adding score entries.
 */

import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen, Header } from '../../../../../src/components/layout';
import { COLORS, SPACING, FONT_SIZES } from '../../../../../src/config/theme';
import { AddScoreEntry, useScoreCard } from '../../../../../src/features/score';
import { useSeasonStore } from '../../../../../src/stores/seasonStore';
import { useAuthStore } from '../../../../../src/stores/authStore';
import { USER_ROLES } from '../../../../../src/constants/userRoles';

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

  const handleSubmit = async (
    toUserId: string,
    points: -3 | -2 | -1 | 1 | 2 | 3,
    reason?: string
  ) => {
    const success = await addScore(toUserId, points, reason);
    if (success) {
      router.back();
    }
    return success;
  };

  // Check if user can add scores
  if (!canAddScore) {
    return (
      <Screen edges={['top']}>
        <Header title="Add Score" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>🔒</Text>
          <Text style={styles.errorText}>
            Only captains can add score entries
          </Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen noPadding edges={['top']}>
      <Header title="Add Score" />
      <AddScoreEntry
        crewMembers={crewMembers}
        currentUserId={currentUserId}
        onSubmit={handleSubmit}
        isSubmitting={isAdding}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  errorText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});
