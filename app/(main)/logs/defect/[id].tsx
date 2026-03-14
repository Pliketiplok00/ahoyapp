/**
 * Defect Detail Screen
 *
 * Shows full defect info with status change options.
 * Captain only can edit status.
 */

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { CaretLeft, MapPin, Trash, PencilSimple, ShareNetwork } from 'phosphor-react-native';
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
import { useDefectLog, DEFECT_STATUSES } from '@/features/logs';
import { useSeason } from '@/features/season/hooks/useSeason';
import type { DefectLogEntry, DefectStatus } from '@/features/logs';
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

export default function DefectDetailScreen() {
  const { t } = useAppTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { entries, updateEntry, deleteEntry, canEdit } = useDefectLog();
  const { isCurrentUserCaptain, crewMembers } = useSeason();

  const [entry, setEntry] = useState<DefectLogEntry | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const found = entries.find((e) => e.id === id);
    setEntry(found || null);
  }, [entries, id]);

  const handleStatusChange = async (newStatus: DefectStatus) => {
    if (!entry || !canEdit) return;

    setIsUpdating(true);
    try {
      await updateEntry(entry.id, { status: newStatus });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = () => {
    if (!entry || !canEdit) return;

    Alert.alert(
      t('common.delete'),
      t('pantry.confirmDelete'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            const success = await deleteEntry(entry.id);
            if (success) {
              router.back();
            }
          },
        },
      ]
    );
  };

  const handleShare = () => {
    // TODO: Implement PDF export and share
    Alert.alert('Export', 'PDF export coming soon');
  };

  if (!entry) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            onPress={() => router.back()}
          >
            <CaretLeft size={SIZES.icon.md} color={COLORS.foreground} weight="bold" />
          </Pressable>
          <Text style={styles.headerTitle}>{t('logs.defect.title')}</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </View>
    );
  }

  const priorityColor = getPriorityColor(entry.priority);
  const creatorName = crewMembers.find((c) => c.id === entry.createdBy)?.name || 'Unknown';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          onPress={() => router.back()}
        >
          <CaretLeft size={SIZES.icon.md} color={COLORS.foreground} weight="bold" />
        </Pressable>
        <Text style={styles.headerTitle}>{t('logs.defect.title')}</Text>
        <Pressable
          style={({ pressed }) => [styles.shareButton, pressed && styles.pressed]}
          onPress={handleShare}
        >
          <ShareNetwork size={SIZES.icon.md} color={COLORS.foreground} weight="bold" />
        </Pressable>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Priority Bar */}
        <View style={[styles.priorityBar, { backgroundColor: priorityColor }]}>
          <Text style={styles.priorityText}>
            {t(`logs.defect.priorities.${entry.priority}`).toUpperCase()}
          </Text>
        </View>

        {/* Main Card */}
        <View style={styles.card}>
          {/* Description */}
          <Text style={styles.description}>{entry.description}</Text>

          {/* Location */}
          {entry.location && (
            <View style={styles.locationRow}>
              <MapPin size={SIZES.icon.sm} color={COLORS.mutedForeground} weight="bold" />
              <Text style={styles.locationText}>{entry.location}</Text>
            </View>
          )}

          {/* Meta */}
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>
              {t('logs.common.createdBy')}: {creatorName}
            </Text>
            <Text style={styles.metaText}>
              {formatDate(entry.createdAt.toDate())}
            </Text>
          </View>
        </View>

        {/* Status Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('logs.defect.status')}</Text>
          <View style={styles.statusRow}>
            {DEFECT_STATUSES.map((status) => (
              <Pressable
                key={status}
                style={({ pressed }) => [
                  styles.statusButton,
                  entry.status === status && styles.statusButtonActive,
                  pressed && styles.pressed,
                  !canEdit && styles.statusButtonDisabled,
                ]}
                onPress={() => handleStatusChange(status)}
                disabled={!canEdit || isUpdating}
              >
                <Text
                  style={[
                    styles.statusButtonText,
                    entry.status === status && styles.statusButtonTextActive,
                  ]}
                >
                  {t(`logs.defect.statuses.${status}`)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Photos Section */}
        {entry.photos && entry.photos.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('logs.common.photos')}</Text>
            <View style={styles.photosGrid}>
              {entry.photos.map((_, index) => (
                <View key={index} style={styles.photoPlaceholder}>
                  <Text style={styles.photoPlaceholderText}>{index + 1}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Captain Actions */}
        {isCurrentUserCaptain && (
          <View style={styles.actionsRow}>
            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                styles.deleteButton,
                pressed && styles.pressed,
              ]}
              onPress={handleDelete}
            >
              <Trash size={SIZES.icon.sm} color={COLORS.white} weight="bold" />
              <Text style={styles.actionButtonText}>{t('common.delete')}</Text>
            </Pressable>
          </View>
        )}

        {/* Captain notice for non-captains */}
        {!isCurrentUserCaptain && (
          <View style={styles.notice}>
            <Text style={styles.noticeText}>{t('logs.common.captainOnly')}</Text>
          </View>
        )}

        <View style={{ height: SPACING.xxl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderBottomWidth: BORDERS.heavy,
    borderBottomColor: COLORS.foreground,
    paddingTop: SPACING.xxl + SPACING.md,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  backButton: {
    padding: SPACING.sm,
  },
  headerTitle: {
    flex: 1,
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.cardTitle,
    color: COLORS.foreground,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  headerSpacer: {
    width: SIZES.icon.md + SPACING.sm * 2,
  },
  shareButton: {
    padding: SPACING.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  priorityBar: {
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  priorityText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.white,
    letterSpacing: TYPOGRAPHY.letterSpacing.wide,
  },
  card: {
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    margin: SPACING.md,
    padding: SPACING.md,
    ...SHADOWS.brut,
  },
  description: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
    lineHeight: TYPOGRAPHY.sizes.body * 1.6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
    gap: SPACING.xs,
  },
  locationText: {
    flex: 1,
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.mutedForeground,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: BORDERS.thin,
    borderTopColor: COLORS.muted,
  },
  metaText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.meta,
    color: COLORS.mutedForeground,
  },
  section: {
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    padding: SPACING.md,
    ...SHADOWS.brut,
  },
  sectionTitle: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: TYPOGRAPHY.letterSpacing.wide,
    marginBottom: SPACING.md,
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  statusButton: {
    backgroundColor: COLORS.muted,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    ...SHADOWS.brutSm,
  },
  statusButtonActive: {
    backgroundColor: COLORS.accent,
  },
  statusButtonDisabled: {
    opacity: 0.5,
  },
  statusButtonText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.foreground,
    textTransform: 'uppercase',
  },
  statusButtonTextActive: {
    color: COLORS.foreground,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  photoPlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: COLORS.muted,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoPlaceholderText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.mutedForeground,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: SPACING.md,
    gap: SPACING.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    ...SHADOWS.brut,
  },
  deleteButton: {
    backgroundColor: COLORS.destructive,
  },
  actionButtonText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.white,
    textTransform: 'uppercase',
  },
  notice: {
    backgroundColor: COLORS.muted,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.foreground,
    marginHorizontal: SPACING.md,
    padding: SPACING.md,
    alignItems: 'center',
  },
  noticeText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
    fontStyle: 'italic',
  },
  pressed: {
    transform: ANIMATION.pressedTransform,
  },
});
