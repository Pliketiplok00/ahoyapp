/**
 * Logs Tab Screen
 *
 * Three sub-tabs for different log types:
 * - KVAROVI (Defects) - Captain only
 * - ŽELJE (Wish List) - All crew
 * - SKLADIŠTE (Storage Map) - Per-user
 */

import { useState, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  COLORS,
  SPACING,
  FONTS,
  TYPOGRAPHY,
  BORDERS,
} from '@/config/theme';
import { useAppTranslation } from '@/i18n';
import { AhoyLogo, SegmentedTabs } from '@/components/ui';
import type { Tab } from '@/components/ui';
import { DefectLogList, WishListComponent, StorageMapList } from '@/features/logs';
import { useSeason } from '@/features/season/hooks/useSeason';

type LogTabType = 'defects' | 'wishList' | 'storage';

export default function LogsScreen() {
  const { t } = useAppTranslation();
  const [activeTab, setActiveTab] = useState<LogTabType>('defects');
  const { currentSeason } = useSeason();

  // Build tabs array with translated labels
  const tabs: Tab[] = useMemo(() => [
    { key: 'defects', label: t('logs.tabs.defects') },
    { key: 'wishList', label: t('logs.tabs.wishList') },
    { key: 'storage', label: t('logs.tabs.storage') },
  ], [t]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <AhoyLogo />
        <Text style={styles.headerSubtitle}>
          {currentSeason?.boatName || 'S/Y CREW SEASON'}
        </Text>
        {currentSeason?.name ? (
          <Text style={styles.headerSeasonName}>{currentSeason.name}</Text>
        ) : null}
      </View>

      {/* Tab Bar (below header) */}
      <SegmentedTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(key) => setActiveTab(key as LogTabType)}
        testID="logs-tabs"
      />

      {/* Tab Content */}
      {activeTab === 'defects' && <DefectLogList />}
      {activeTab === 'wishList' && <WishListComponent />}
      {activeTab === 'storage' && <StorageMapList />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    borderBottomWidth: BORDERS.heavy,
    borderBottomColor: COLORS.foreground,
    paddingTop: SPACING.xxl + SPACING.md,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  headerTitle: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.sectionTitle,
    color: COLORS.foreground,
    textTransform: 'uppercase',
    marginTop: SPACING.xs,
  },
  headerSubtitle: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
    opacity: 0.8,
    marginTop: SPACING.xs,
  },
  headerSeasonName: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.foreground,
    opacity: 0.6,
    textTransform: 'uppercase',
    letterSpacing: TYPOGRAPHY.letterSpacing.wide,
    marginTop: SPACING.xxs,
  },
});
