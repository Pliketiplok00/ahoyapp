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
// SafeAreaView removed - using paddingTop on header instead
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Warning, Trophy, ClipboardText, Plus } from 'phosphor-react-native';
import { useAppTranslation } from '@/i18n';
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
  t: (key: string) => string;
}

function LeaderboardRow({ item, index, totalItems, t }: LeaderboardRowProps) {
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
        <Text style={styles.entryCount}>{item.entryCount} {t('score.entries')}</Text>
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

function HistoryRow({ entry, crewMembers, t }: HistoryRowProps & { t: (key: string) => string }) {
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
          {toMember?.name?.toUpperCase() || t('score.unknown')}
        </Text>
        {entry.reason && (
          <Text style={styles.historyReason} numberOfLines={1}>
            {entry.reason}
          </Text>
        )}
        <Text style={styles.historyMeta}>
          {t('score.from')} {fromMember?.name || t('score.unknown')} · {dateStr}
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
  const { t } = useAppTranslation();
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
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </Pressable>
          <Text style={styles.headerTitle}>{t('score.title')}</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>{t('score.loading')}</Text>
        </View>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </Pressable>
          <Text style={styles.headerTitle}>{t('score.title')}</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.errorContainer}>
          <Warning size={SIZES.icon.xl} color={COLORS.destructive} weight="fill" />
          <Text style={styles.errorText}>{error}</Text>
          <Pressable
            style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
            onPress={refresh}
          >
            <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>{t('score.title')}</Text>
        {canAddScore ? (
          <Pressable
            style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
            onPress={handleAddScore}
          >
            <View style={styles.addButtonContent}>
              <Plus size={SIZES.icon.sm} color={COLORS.foreground} weight="bold" />
            </View>
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
            {t('score.leaderboard')}
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
            {t('score.history')}
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
              <View style={styles.emptyIconBox}>
                <Trophy size={SIZES.icon.xl} color={COLORS.white} weight="fill" />
              </View>
              <Text style={styles.emptyTitle}>{t('score.emptyLeaderboardTitle')}</Text>
              <Text style={styles.emptyText}>
                {t('score.emptyLeaderboardText')}
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
                    t={t}
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
            <View style={styles.emptyIconBox}>
              <ClipboardText size={SIZES.icon.xl} color={COLORS.white} weight="fill" />
            </View>
            <Text style={styles.emptyTitle}>{t('score.emptyHistoryTitle')}</Text>
            <Text style={styles.emptyText}>
              {t('score.emptyHistoryText')}
            </Text>
          </View>
        ) : (
          <View style={styles.historyCard}>
            {entries.map((entry, index) => (
              <View key={entry.id}>
                <HistoryRow entry={entry} crewMembers={crewMembers} t={t} />
                {index < entries.length - 1 && (
                  <View style={styles.divider} />
                )}
              </View>
            ))}
          </View>
        )}

        <View style={{ height: SPACING.xxl }} />
      </ScrollView>
    </View>
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
    paddingTop: SPACING.xxl + SPACING.md,
    paddingBottom: SPACING.md,
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
  addButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
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
    fontSize: SIZES.icon.xl,
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
  emptyIconBox: {
    width: 80,
    height: 80,
    backgroundColor: COLORS.primary,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.brut,
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
