/**
 * DefectLogList Component
 *
 * Displays list of defect log entries.
 * Captain sees FAB to add new defects.
 * Non-captain: read-only.
 */

import { useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Warning, Plus, Wrench, MapPin } from 'phosphor-react-native';
import {
  COLORS,
  SHADOWS,
  BORDERS,
  SPACING,
  FONTS,
  TYPOGRAPHY,
  BORDER_RADIUS,
  ANIMATION,
  SIZES,
} from '@/config/theme';
import { useAppTranslation } from '@/i18n';
import { FAB } from '@/components/ui';
import { useDefectLog } from '../hooks/useDefectLog';
import { useSeason } from '@/features/season/hooks/useSeason';
import type { DefectLogEntry } from '../types';
import { formatDate } from '@/utils/formatting';

/**
 * Get priority badge color
 */
function getPriorityColor(priority: DefectLogEntry['priority']): string {
  switch (priority) {
    case 'critical':
      return COLORS.destructive;
    case 'high':
      return COLORS.pink;
    case 'medium':
      return COLORS.statsBg;
    case 'low':
    default:
      return COLORS.mutedForeground;
  }
}

/**
 * Get status badge style
 */
function getStatusStyle(status: DefectLogEntry['status']): { bg: string; text: string } {
  switch (status) {
    case 'resolved':
      return { bg: COLORS.accent, text: COLORS.foreground };
    case 'in_progress':
      return { bg: COLORS.primary, text: COLORS.white };
    case 'wont_fix':
      return { bg: COLORS.muted, text: COLORS.mutedForeground };
    case 'reported':
    default:
      return { bg: COLORS.card, text: COLORS.foreground };
  }
}

interface DefectCardProps {
  entry: DefectLogEntry;
  onPress: () => void;
}

function DefectCard({ entry, onPress }: DefectCardProps) {
  const { t } = useAppTranslation();
  const priorityColor = getPriorityColor(entry.priority);
  const statusStyle = getStatusStyle(entry.status);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      {/* Priority indicator */}
      <View style={[styles.priorityBar, { backgroundColor: priorityColor }]} />

      <View style={styles.cardContent}>
        {/* Header row */}
        <View style={styles.cardHeader}>
          <Text style={styles.description} numberOfLines={2}>
            {entry.description}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {t(`logs.defect.statuses.${entry.status}`)}
            </Text>
          </View>
        </View>

        {/* Location */}
        {entry.location && (
          <View style={styles.locationRow}>
            <MapPin size={SIZES.icon.sm} color={COLORS.mutedForeground} weight="bold" />
            <Text style={styles.locationText} numberOfLines={1}>
              {entry.location}
            </Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.cardFooter}>
          <Text style={styles.dateText}>
            {formatDate(entry.createdAt.toDate())}
          </Text>
          {entry.photos && entry.photos.length > 0 && (
            <Text style={styles.photoCount}>{entry.photos.length} foto</Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}

export function DefectLogList() {
  const { t } = useAppTranslation();
  const router = useRouter();
  const { entries, isLoading, error, canEdit, refresh } = useDefectLog();
  const { isCurrentUserCaptain } = useSeason();

  // Refresh on focus
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const handleAddDefect = () => {
    router.push('/logs/defect/add');
  };

  const handleDefectPress = (entryId: string) => {
    router.push(`/logs/defect/${entryId}`);
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Warning size={SIZES.icon.xl} color={COLORS.destructive} weight="fill" />
        <Text style={styles.errorText}>{error}</Text>
        <Pressable
          style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
          onPress={refresh}
        >
          <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
        </Pressable>
      </View>
    );
  }

  // Empty state
  if (entries.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Wrench size={SIZES.icon.xl} color={COLORS.primary} weight="regular" />
          </View>
          <Text style={styles.emptyTitle}>{t('logs.defect.empty.title')}</Text>
          <Text style={styles.emptyText}>{t('logs.defect.empty.description')}</Text>
        </View>
        {isCurrentUserCaptain && (
          <FAB
            onPress={handleAddDefect}
            icon="+"
            floating
            testID="add-defect-fab"
          />
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <DefectCard
            entry={item}
            onPress={() => handleDefectPress(item.id)}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
      {isCurrentUserCaptain && (
        <FAB
          onPress={handleAddDefect}
          icon="+"
          floating
          testID="add-defect-fab"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  loadingText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.mutedForeground,
    marginTop: SPACING.md,
  },
  errorText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.destructive,
    textAlign: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    ...SHADOWS.brut,
  },
  retryButtonText: {
    fontFamily: FONTS.display,
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sizes.body,
  },
  listContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl * 2,
  },
  card: {
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    overflow: 'hidden',
    ...SHADOWS.brut,
  },
  priorityBar: {
    width: 6,
  },
  cardContent: {
    flex: 1,
    padding: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: SPACING.sm,
  },
  description: {
    flex: 1,
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
    lineHeight: TYPOGRAPHY.sizes.body * 1.4,
  },
  statusBadge: {
    borderWidth: BORDERS.thin,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xxs,
  },
  statusText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.meta,
    textTransform: 'uppercase',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    gap: SPACING.xs,
  },
  locationText: {
    flex: 1,
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
  dateText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.meta,
    color: COLORS.mutedForeground,
  },
  photoCount: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.meta,
    color: COLORS.primary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    marginBottom: SPACING.lg,
    ...SHADOWS.brut,
  },
  emptyTitle: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.cardTitle,
    color: COLORS.foreground,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  emptyText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.mutedForeground,
    textAlign: 'center',
  },
  pressed: {
    transform: ANIMATION.pressedTransform,
  },
});
