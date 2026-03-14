/**
 * Logs Tab Screen
 *
 * Three sub-tabs for different log types:
 * - KVAROVI (Defects) - Captain only
 * - ŽELJE (Wish List) - All crew
 * - SKLADIŠTE (Storage Map) - Per-user
 */

import { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import {
  COLORS,
  SPACING,
  FONTS,
  TYPOGRAPHY,
  BORDERS,
  BORDER_RADIUS,
  SHADOWS,
} from '@/config/theme';
import { useAppTranslation } from '@/i18n';
import { AhoyLogo } from '@/components/ui';
import { DefectLogList, WishListComponent, StorageMapList } from '@/features/logs';
import { useSeason } from '@/features/season/hooks/useSeason';

type LogTabType = 'defects' | 'wishList' | 'storage';

export default function LogsScreen() {
  const { t } = useAppTranslation();
  const [activeTab, setActiveTab] = useState<LogTabType>('defects');
  const { currentSeason } = useSeason();

  const seasonName = currentSeason?.name?.toUpperCase() || '';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <AhoyLogo />
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>{t('logs.title')}</Text>
            {seasonName && (
              <Text style={styles.headerSubtitle}>{seasonName}</Text>
            )}
          </View>

          {/* Tab Switcher */}
          <View style={styles.tabSwitcher}>
            <Pressable
              style={[
                styles.tab,
                activeTab === 'defects' && styles.tabActive,
              ]}
              onPress={() => setActiveTab('defects')}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'defects' && styles.tabTextActive,
                ]}
              >
                {t('logs.tabs.defects')}
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.tab,
                activeTab === 'wishList' && styles.tabActive,
              ]}
              onPress={() => setActiveTab('wishList')}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'wishList' && styles.tabTextActive,
                ]}
              >
                {t('logs.tabs.wishList')}
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.tab,
                activeTab === 'storage' && styles.tabActive,
              ]}
              onPress={() => setActiveTab('storage')}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'storage' && styles.tabTextActive,
                ]}
              >
                {t('logs.tabs.storage')}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: SPACING.xs,
  },
  headerTitle: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.sectionTitle,
    color: COLORS.foreground,
    textTransform: 'uppercase',
  },
  headerSubtitle: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
    opacity: 0.7,
    textTransform: 'uppercase',
    letterSpacing: TYPOGRAPHY.letterSpacing.widest,
    marginTop: SPACING.xs,
  },
  tabSwitcher: {
    flexDirection: 'row',
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    backgroundColor: COLORS.card,
    ...SHADOWS.brutSm,
  },
  tab: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.none,
  },
  tabActive: {
    backgroundColor: COLORS.accent,
  },
  tabText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.meta,
    color: COLORS.foreground,
    letterSpacing: TYPOGRAPHY.letterSpacing.wide,
  },
  tabTextActive: {
    color: COLORS.foreground,
  },
});
