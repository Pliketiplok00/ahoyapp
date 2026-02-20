/**
 * Score Card Screen
 *
 * Full view of score card for a booking.
 * Shows leaderboard and history of score entries.
 */

import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen, Header, HeaderAction } from '../../../../src/components/layout';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../../../src/config/theme';
import {
  ScoreLeaderboard,
  ScoreHistory,
  useScoreCard,
} from '../../../../src/features/score';
import { useSeasonStore } from '../../../../src/stores/seasonStore';
import { useAuthStore } from '../../../../src/stores/authStore';
import { USER_ROLES } from '../../../../src/constants/userRoles';

type TabType = 'leaderboard' | 'history';

export default function ScoreCardScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('leaderboard');

  // Get REAL crew members from season store
  const { crewMembers } = useSeasonStore();
  const { firebaseUser } = useAuthStore();
  const currentUserId = firebaseUser?.uid || '';
  const currentCrewMember = crewMembers.find((m) => m.id === currentUserId);
  const isCaptain = currentCrewMember?.roles?.includes(USER_ROLES.CAPTAIN) || false;

  const {
    entries,
    leaderboard,
    loading,
    error,
    canAddScore,
    refresh,
  } = useScoreCard({
    bookingId: bookingId || '',
    crewMembers,
    currentUserId,
    isCaptain,
  });

  const handleAddScore = () => {
    router.push(`/booking/score/add/${bookingId}`);
  };

  // Loading state
  if (loading) {
    return (
      <Screen edges={['top']}>
        <Header title="Score Card" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.coral} />
        </View>
      </Screen>
    );
  }

  // Error state
  if (error) {
    return (
      <Screen edges={['top']}>
        <Header title="Score Card" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={refresh}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  return (
    <Screen noPadding edges={['top']}>
      <Header
        title="Score Card"
        rightAction={
          canAddScore && <HeaderAction icon="+" onPress={handleAddScore} />
        }
      />

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <Pressable
          style={[styles.tab, activeTab === 'leaderboard' && styles.tabActive]}
          onPress={() => setActiveTab('leaderboard')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'leaderboard' && styles.tabTextActive,
            ]}
          >
            Leaderboard
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'history' && styles.tabActive]}
          onPress={() => setActiveTab('history')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'history' && styles.tabTextActive,
            ]}
          >
            History
          </Text>
        </Pressable>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === 'leaderboard' ? (
          <ScoreLeaderboard leaderboard={leaderboard} />
        ) : (
          <ScoreHistory entries={entries} crewMembers={crewMembers} />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  retryButton: {
    backgroundColor: COLORS.coral,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
  },
  retryButtonText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: COLORS.coral,
  },
  tabText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  tabTextActive: {
    color: COLORS.coral,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
});
