/**
 * DefectLogList Component
 *
 * Displays list of defect log entries.
 * Captain sees FAB to add new defects.
 * Captain can export all defects as PDF.
 * Non-captain: read-only.
 */

import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Warning, Wrench, MapPin, Export } from 'phosphor-react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
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
import { logger } from '@/utils/logger';

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

/**
 * Generate HTML template for defect log PDF export
 */
function generateDefectLogHtml(
  entries: DefectLogEntry[],
  seasonName: string,
  t: (key: string) => string
): string {
  const sortedEntries = [...entries].sort(
    (a, b) => b.createdAt.toMillis() - a.createdAt.toMillis()
  );

  const entryRows = sortedEntries.map((entry) => {
    const priorityColor = getPriorityColor(entry.priority);
    return `
      <tr>
        <td>${formatDate(entry.createdAt.toDate())}</td>
        <td>${entry.description}</td>
        <td>${entry.location || '-'}</td>
        <td style="color: ${priorityColor}; font-weight: bold;">
          ${t(`logs.defect.priorities.${entry.priority}`).toUpperCase()}
        </td>
        <td>${t(`logs.defect.statuses.${entry.status}`)}</td>
      </tr>
    `;
  }).join('');

  // Count by status
  const statusCounts = {
    reported: entries.filter((e) => e.status === 'reported').length,
    in_progress: entries.filter((e) => e.status === 'in_progress').length,
    resolved: entries.filter((e) => e.status === 'resolved').length,
    wont_fix: entries.filter((e) => e.status === 'wont_fix').length,
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t('logs.defect.title')} - ${seasonName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 11px;
      line-height: 1.4;
      color: #1a1a1a;
      padding: 24px;
    }
    .header {
      background-color: #ffd93d;
      border: 3px solid #1a1a1a;
      padding: 20px;
      margin-bottom: 24px;
    }
    .header h1 {
      font-size: 24px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 8px;
    }
    .header .meta {
      font-family: 'Courier New', monospace;
      font-size: 11px;
      color: #444;
    }
    .section {
      border: 2px solid #1a1a1a;
      margin-bottom: 16px;
      background: #fff;
    }
    .section h2 {
      background-color: #1a1a1a;
      color: #fff;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      padding: 8px 12px;
    }
    .summary-row {
      display: flex;
      gap: 16px;
      padding: 12px;
    }
    .summary-item {
      flex: 1;
      text-align: center;
      padding: 8px;
      background: #f5f5f5;
      border: 1px solid #ddd;
    }
    .summary-item .count {
      font-size: 24px;
      font-weight: 900;
    }
    .summary-item .label {
      font-size: 10px;
      text-transform: uppercase;
      color: #666;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10px;
    }
    th {
      background-color: #f5f5f5;
      text-align: left;
      padding: 8px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 2px solid #1a1a1a;
    }
    td {
      padding: 6px 8px;
      border-bottom: 1px solid #eee;
      vertical-align: top;
    }
    tr:nth-child(even) { background-color: #fafafa; }
    .footer {
      margin-top: 24px;
      padding-top: 12px;
      border-top: 1px solid #ccc;
      font-family: 'Courier New', monospace;
      font-size: 9px;
      color: #888;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${t('logs.defect.title')}</h1>
    <div class="meta">${seasonName} · ${formatDate(new Date())}</div>
  </div>

  <div class="section">
    <h2>${t('common.summary')}</h2>
    <div class="summary-row">
      <div class="summary-item">
        <div class="count">${entries.length}</div>
        <div class="label">${t('common.total')}</div>
      </div>
      <div class="summary-item">
        <div class="count" style="color: #ef4444;">${statusCounts.reported}</div>
        <div class="label">${t('logs.defect.statuses.reported')}</div>
      </div>
      <div class="summary-item">
        <div class="count" style="color: #3b82f6;">${statusCounts.in_progress}</div>
        <div class="label">${t('logs.defect.statuses.in_progress')}</div>
      </div>
      <div class="summary-item">
        <div class="count" style="color: #22c55e;">${statusCounts.resolved}</div>
        <div class="label">${t('logs.defect.statuses.resolved')}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>${t('logs.defect.allDefects')}</h2>
    <table>
      <thead>
        <tr>
          <th>${t('common.date')}</th>
          <th>${t('logs.defect.description')}</th>
          <th>${t('logs.defect.location')}</th>
          <th>${t('logs.defect.priority')}</th>
          <th>${t('logs.defect.status')}</th>
        </tr>
      </thead>
      <tbody>
        ${entryRows}
      </tbody>
    </table>
  </div>

  <div class="footer">
    ${t('common.generated')}: ${formatDate(new Date())} · AhoyCrew App
  </div>
</body>
</html>
  `.trim();
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
  const { isCurrentUserCaptain, currentSeason } = useSeason();
  const [isExporting, setIsExporting] = useState(false);

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

  /**
   * Export all defects as PDF
   */
  const handleExport = async () => {
    if (entries.length === 0) {
      Alert.alert(t('common.info'), t('logs.defect.empty.title'));
      return;
    }

    setIsExporting(true);

    try {
      logger.log('[DefectLogList] Exporting defect log as PDF...');

      const seasonName = currentSeason?.name || 'Season';
      const html = generateDefectLogHtml(entries, seasonName, t);

      // Generate PDF
      const { uri } = await Print.printToFileAsync({ html, base64: false });

      logger.log('[DefectLogList] PDF generated at:', uri);

      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert(t('common.error'), 'Sharing is not available on this device');
        return;
      }

      // Share the PDF
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: t('logs.defect.exportTitle'),
        UTI: 'com.adobe.pdf',
      });

      logger.log('[DefectLogList] PDF shared successfully');
    } catch (err) {
      logger.error('[DefectLogList] Export error:', err);
      Alert.alert(t('common.error'), t('common.exportError'));
    } finally {
      setIsExporting(false);
    }
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
        ListHeaderComponent={
          isCurrentUserCaptain && entries.length > 0 ? (
            <View style={styles.listHeader}>
              <Text style={styles.listHeaderTitle}>
                {entries.length} {t('logs.defect.defectsCount')}
              </Text>
              <Pressable
                style={({ pressed }) => [
                  styles.exportButton,
                  pressed && styles.pressed,
                  isExporting && styles.exportButtonDisabled,
                ]}
                onPress={handleExport}
                disabled={isExporting}
              >
                {isExporting ? (
                  <ActivityIndicator size="small" color={COLORS.foreground} />
                ) : (
                  <>
                    <Export size={SIZES.icon.sm} color={COLORS.foreground} weight="bold" />
                    <Text style={styles.exportButtonText}>{t('common.export')}</Text>
                  </>
                )}
              </Pressable>
            </View>
          ) : null
        }
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
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  listHeaderTitle: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: TYPOGRAPHY.letterSpacing.wide,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.accent,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    ...SHADOWS.brutSm,
  },
  exportButtonDisabled: {
    opacity: 0.7,
  },
  exportButtonText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.foreground,
    textTransform: 'uppercase',
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
