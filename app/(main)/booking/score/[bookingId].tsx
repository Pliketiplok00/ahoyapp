/**
 * Score Card Screen (Brutalist)
 *
 * Full view of score card for a booking.
 * Shows leaderboard and history of score entries.
 *
 * @see docs/Ahoy_Screen_Map.md
 */

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  ScrollView,
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
} from '@/config/theme';
import {
  useScoreCard,
  getRankIcon,
  getLastPlaceIcon,
  formatPoints,
} from '@/features/score';
import { useSeasonStore } from '@/stores/seasonStore';
import { useAuthStore } from '@/stores/authStore';
import { useBooking } from '@/features/booking';
import { USER_ROLES } from '@/constants/userRoles';
import { formatDate } from '@/utils/formatting';
import type { BookingScoreSummary, ScoreEntry, User } from '@/types/models';

type TabType = 'leaderboard' | 'history';

// ============================================
// COMPONENTS
// ============================================

interface LeaderboardRowProps {
  item: BookingScoreSummary;
  index: number;
  totalItems: number;
}

function LeaderboardRow({ item, index, totalItems }: LeaderboardRowProps) {
  const rankIcon = getRankIcon(index, item.totalPoints);
  const lastPlaceIcon = getLastPlaceIcon(index, totalItems, item.totalPoints);
  const displayIcon = rankIcon || lastPlaceIcon;

  // Get initials from name
  const initials = item.userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const pointsColor =
    item.totalPoints > 0
      ? COLORS.success
      : item.totalPoints < 0
        ? COLORS.destructive
        : COLORS.mutedForeground;

  return (
    <View style={styles.leaderboardRow}>
      {/* SQUARE Avatar */}
      <View style={[styles.avatar, { backgroundColor: item.userColor }]}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>

      {/* Name + Icon */}
      <View style={styles.nameSection}>
        <Text style={styles.userName}>
          {item.userName.toUpperCase()}
          {displayIcon ? ` ${displayIcon}` : ''}
        </Text>
        <Text style={styles.entryCount}>{item.entryCount} entries</Text>
      </View>

      {/* Points */}
      <Text style={[styles.points, { color: pointsColor }]}>
        {formatPoints(item.totalPoints)}
      </Text>
    </View>
  );
}

interface HistoryRowProps {
  entry: ScoreEntry;
  crewMembers: User[];
}

function HistoryRow({ entry, crewMembers }: HistoryRowProps) {
  const toMember = crewMembers.find((m) => m.id === entry.toUserId);
  const fromMember = crewMembers.find((m) => m.id === entry.fromUserId);

  const toInitials = toMember?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';

  const pointsColor =
    entry.points > 0
      ? COLORS.success
      : entry.points < 0
        ? COLORS.destructive
        : COLORS.mutedForeground;

  const dateStr = entry.createdAt?.toDate
    ? formatDate(entry.createdAt.toDate())
    : '';

  return (
    <View style={styles.historyRow}>
      {/* SQUARE Avatar */}
      <View style={[styles.avatarSmall, { backgroundColor: toMember?.color || COLORS.muted }]}>
        <Text style={styles.avatarTextSmall}>{toInitials}</Text>
      </View>

      {/* Info */}
      <View style={styles.historyInfo}>
        <Text style={styles.historyName}>
          {toMember?.name?.toUpperCase() || 'Unknown'}
        </Text>
        {entry.reason && (
          <Text style={styles.historyReason} numberOfLines={1}>
            {entry.reason}
          </Text>
        )}
        <Text style={styles.historyMeta}>
          by {fromMember?.name || 'Unknown'} · {dateStr}
        </Text>
      </View>

      {/* Points */}
      <Text style={[styles.historyPoints, { color: pointsColor }]}>
        {formatPoints(entry.points)}
      </Text>
    </View>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function ScoreCardScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('leaderboard');

  // Get booking for client name
  const { booking } = useBooking(bookingId || null);

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

  // Get client name from booking notes (first line)
  const clientName = booking?.notes?.split('\n')[0] || 'Guest';
  const bookingDate = booking?.arrivalDate?.toDate
    ? formatDate(booking.arrivalDate.toDate())
    : '';

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </Pressable>
          <Text style={styles.headerTitle}>CREW SCORE</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>LOADING...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </Pressable>
          <Text style={styles.headerTitle}>CREW SCORE</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorEmoji}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable
            style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
            onPress={refresh}
          >
            <Text style={styles.retryButtonText}>RETRY</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

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
        <Text style={styles.headerTitle}>CREW SCORE</Text>
        {canAddScore ? (
          <Pressable
            style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
            onPress={handleAddScore}
          >
            <Text style={styles.addButtonText}>+ ADD</Text>
          </Pressable>
        ) : (
          <View style={styles.headerSpacer} />
        )}
      </View>

      {/* Booking Info */}
      <View style={styles.bookingInfo}>
        <Text style={styles.bookingInfoText}>
          {clientName.toUpperCase()} · {bookingDate}
        </Text>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <Pressable
          style={({ pressed }) => [
            styles.tab,
            activeTab === 'leaderboard' && styles.tabActive,
            pressed && styles.pressed,
          ]}
          onPress={() => setActiveTab('leaderboard')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'leaderboard' && styles.tabTextActive,
            ]}
          >
            LEADERBOARD
          </Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.tab,
            activeTab === 'history' && styles.tabActive,
            pressed && styles.pressed,
          ]}
          onPress={() => setActiveTab('history')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'history' && styles.tabTextActive,
            ]}
          >
            HISTORY
          </Text>
        </Pressable>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'leaderboard' ? (
          leaderboard.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🏆</Text>
              <Text style={styles.emptyTitle}>NO SCORES YET</Text>
              <Text style={styles.emptyText}>
                Captain can add score entries
              </Text>
            </View>
          ) : (
            <View style={styles.leaderboardCard}>
              {leaderboard.map((item, index) => (
                <View key={item.userId}>
                  <LeaderboardRow
                    item={item}
                    index={index}
                    totalItems={leaderboard.length}
                  />
                  {index < leaderboard.length - 1 && (
                    <View style={styles.divider} />
                  )}
                </View>
              ))}
            </View>
          )
        ) : entries.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={styles.emptyTitle}>NO HISTORY</Text>
            <Text style={styles.emptyText}>
              Score entries will appear here
            </Text>
          </View>
        ) : (
          <View style={styles.historyCard}>
            {entries.map((entry, index) => (
              <View key={entry.id}>
                <HistoryRow entry={entry} crewMembers={crewMembers} />
                {index < entries.length - 1 && (
                  <View style={styles.divider} />
                )}
              </View>
            ))}
          </View>
        )}

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
    width: 70,
  },
  addButton: {
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    ...SHADOWS.brutSm,
  },
  addButtonText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.foreground,
  },

  // Booking Info
  bookingInfo: {
    backgroundColor: COLORS.muted,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: BORDERS.thin,
    borderBottomColor: COLORS.foreground,
  },
  bookingInfoText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
    letterSpacing: TYPOGRAPHY.letterSpacing.wide,
  },

  // Loading State
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.mutedForeground,
    marginTop: SPACING.md,
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
  errorText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.destructive,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  retryButton: {
    backgroundColor: COLORS.accent,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  retryButtonText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
  },

  // Tab Selector
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: BORDERS.normal,
    borderBottomColor: COLORS.foreground,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRightWidth: BORDERS.thin,
    borderRightColor: COLORS.foreground,
  },
  tabActive: {
    backgroundColor: COLORS.accent,
  },
  tabText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
    letterSpacing: TYPOGRAPHY.letterSpacing.wide,
  },
  tabTextActive: {
    color: COLORS.foreground,
  },

  // ScrollView
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.large,
    color: COLORS.foreground,
    marginBottom: SPACING.xs,
  },
  emptyText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.mutedForeground,
    textAlign: 'center',
  },

  // Leaderboard Card
  leaderboardCard: {
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    ...SHADOWS.brut,
  },

  // Leaderboard Row
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none, // SQUARE!
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.card,
    fontWeight: '700',
  },
  nameSection: {
    flex: 1,
  },
  userName: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
  },
  entryCount: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
    marginTop: 2,
  },
  points: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.cardTitle,
    fontWeight: '700',
  },
  divider: {
    height: BORDERS.thin,
    backgroundColor: COLORS.muted,
    marginHorizontal: SPACING.md,
  },

  // History Card
  historyCard: {
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    ...SHADOWS.brut,
  },

  // History Row
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.md,
  },
  avatarSmall: {
    width: 32,
    height: 32,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none, // SQUARE!
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTextSmall: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.card,
    fontWeight: '700',
  },
  historyInfo: {
    flex: 1,
  },
  historyName: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
  },
  historyReason: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
    marginTop: 2,
  },
  historyMeta: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
    marginTop: 2,
  },
  historyPoints: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.large,
    fontWeight: '700',
  },

  // Pressed state
  pressed: {
    transform: ANIMATION.pressedTransform,
  },
});
