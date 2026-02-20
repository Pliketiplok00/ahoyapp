/**
 * Tip Split Configuration Screen (Brutalist)
 *
 * Configure how tips are split between crew members.
 * Captain only. Equal or custom percentage split.
 *
 * @see docs/Ahoy_Screen_Map.md
 */

import { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  COLORS,
  SHADOWS,
  BORDERS,
  SPACING,
  TYPOGRAPHY,
  FONTS,
  BORDER_RADIUS,
  ANIMATION,
} from '../../../src/config/theme';
import { useSeason } from '../../../src/features/season/hooks/useSeason';
import { formatNumber } from '../../../src/utils/formatting';

type SplitType = 'equal' | 'custom';

interface CrewSplitConfig {
  id: string;
  name: string;
  color: string;
  percentage: number;
}

export default function TipSplitScreen() {
  const router = useRouter();
  const { currentSeason, crewMembers, isCurrentUserCaptain } = useSeason();

  const [splitType, setSplitType] = useState<SplitType>('equal');
  const [customSplits, setCustomSplits] = useState<CrewSplitConfig[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Redirect if not captain
  useEffect(() => {
    if (!isCurrentUserCaptain) {
      Alert.alert('Access Denied', 'Only the Captain can edit tip split settings.');
      router.back();
    }
  }, [isCurrentUserCaptain, router]);

  // Initialize from current season
  useEffect(() => {
    if (currentSeason) {
      setSplitType(currentSeason.tipSplitType || 'equal');

      const splits = crewMembers.map((member) => ({
        id: member.id,
        name: member.name,
        color: member.color,
        percentage: currentSeason.tipSplitConfig?.[member.id] ?? 100 / crewMembers.length,
      }));
      setCustomSplits(splits);
    }
  }, [currentSeason, crewMembers]);

  // Calculate equal split percentage
  const equalPercentage = useMemo(() => {
    return crewMembers.length > 0 ? 100 / crewMembers.length : 0;
  }, [crewMembers.length]);

  // Calculate total percentage for custom splits
  const totalPercentage = useMemo(() => {
    return customSplits.reduce((sum, split) => sum + split.percentage, 0);
  }, [customSplits]);

  const isValidTotal = Math.abs(totalPercentage - 100) < 0.01;

  const handleSplitChange = (memberId: string, value: string) => {
    const numValue = parseFloat(value.replace(',', '.')) || 0;
    setCustomSplits((prev) =>
      prev.map((split) =>
        split.id === memberId ? { ...split, percentage: numValue } : split
      )
    );
  };

  const handleDistributeEvenly = () => {
    const evenSplit = 100 / crewMembers.length;
    setCustomSplits((prev) =>
      prev.map((split) => ({ ...split, percentage: evenSplit }))
    );
  };

  const handleSave = async () => {
    if (splitType === 'custom' && !isValidTotal) {
      Alert.alert('Error', 'Total percentage must equal 100%');
      return;
    }

    setIsSaving(true);

    const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore');
    const { db } = await import('../../../src/config/firebase');

    try {
      const updateData: Record<string, unknown> = {
        tipSplitType: splitType,
        updatedAt: serverTimestamp(),
      };

      if (splitType === 'custom') {
        const tipSplitConfig: Record<string, number> = {};
        customSplits.forEach((split) => {
          tipSplitConfig[split.id] = split.percentage;
        });
        updateData.tipSplitConfig = tipSplitConfig;
      } else {
        updateData.tipSplitConfig = null;
      }

      await updateDoc(doc(db, 'seasons', currentSeason!.id), updateData);

      Alert.alert('Saved', 'Tip split settings updated.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('Error saving tip split:', error);
      Alert.alert('Error', 'Could not save changes');
    }

    setIsSaving(false);
  };

  // Empty state
  if (!currentSeason) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [styles.backButton, pressed && styles.buttonPressed]}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </Pressable>
          <Text style={styles.headerTitle}>TIP SPLIT</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>NO ACTIVE SEASON</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backButton, pressed && styles.buttonPressed]}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>TIP SPLIT</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Split Type Selector */}
        <Text style={styles.sectionLabel}>SPLIT TYPE</Text>
        <View style={styles.tabContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.tab,
              splitType === 'equal' && styles.tabActive,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => setSplitType('equal')}
          >
            <Text style={[
              styles.tabText,
              splitType === 'equal' && styles.tabTextActive,
            ]}>
              EQUAL
            </Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.tab,
              splitType === 'custom' && styles.tabActive,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => setSplitType('custom')}
          >
            <Text style={[
              styles.tabText,
              splitType === 'custom' && styles.tabTextActive,
            ]}>
              CUSTOM
            </Text>
          </Pressable>
        </View>

        {/* Split Type Description */}
        <View style={styles.descriptionCard}>
          {splitType === 'equal' ? (
            <>
              <Text style={styles.descriptionEmoji}>⚖️</Text>
              <Text style={styles.descriptionTitle}>EQUAL SPLIT</Text>
              <Text style={styles.descriptionText}>
                Each crew member receives {formatNumber(equalPercentage, 1)}%
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.descriptionEmoji}>⚙️</Text>
              <Text style={styles.descriptionTitle}>CUSTOM SPLIT</Text>
              <Text style={styles.descriptionText}>
                Set individual percentages for each crew member
              </Text>
            </>
          )}
        </View>

        {/* Custom Split Configuration */}
        {splitType === 'custom' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLabel}>PERCENTAGES</Text>
              <Pressable
                style={({ pressed }) => [pressed && styles.buttonPressed]}
                onPress={handleDistributeEvenly}
              >
                <Text style={styles.distributeLink}>DISTRIBUTE EVENLY</Text>
              </Pressable>
            </View>

            {customSplits.map((split) => (
              <View key={split.id} style={styles.splitRow}>
                {/* Square Avatar */}
                <View style={[styles.avatar, { backgroundColor: split.color || COLORS.primary }]}>
                  <Text style={styles.avatarText}>{split.name.charAt(0).toUpperCase()}</Text>
                </View>
                <Text style={styles.splitName}>{split.name.toUpperCase()}</Text>
                <View style={styles.percentageInputContainer}>
                  <TextInput
                    style={styles.percentageInput}
                    value={split.percentage.toFixed(1).replace('.', ',')}
                    onChangeText={(text) => handleSplitChange(split.id, text)}
                    keyboardType="decimal-pad"
                    selectTextOnFocus
                  />
                  <Text style={styles.percentageSymbol}>%</Text>
                </View>
              </View>
            ))}

            {/* Total Row */}
            <View style={[styles.totalRow, !isValidTotal && styles.totalRowError]}>
              <Text style={styles.totalLabel}>TOTAL</Text>
              <Text style={[
                styles.totalValue,
                isValidTotal ? styles.totalValueValid : styles.totalValueError,
              ]}>
                {formatNumber(totalPercentage, 1)}%
              </Text>
            </View>

            {!isValidTotal && (
              <Text style={styles.errorText}>Total must equal exactly 100%</Text>
            )}
          </View>
        )}

        {/* Preview */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>PREVIEW</Text>
          <View style={styles.previewCard}>
            <Text style={styles.previewTitle}>If tip is 1.000 €</Text>

            {splitType === 'equal' ? (
              crewMembers.map((member) => (
                <View key={member.id} style={styles.previewRow}>
                  {/* Square Avatar */}
                  <View style={[styles.avatarSmall, { backgroundColor: member.color || COLORS.primary }]}>
                    <Text style={styles.avatarSmallText}>{member.name.charAt(0).toUpperCase()}</Text>
                  </View>
                  <Text style={styles.previewName}>{member.name}</Text>
                  <Text style={styles.previewPercent}>{formatNumber(equalPercentage, 0)}%</Text>
                  <Text style={styles.previewAmount}>
                    {formatNumber(1000 * (equalPercentage / 100), 0)} €
                  </Text>
                </View>
              ))
            ) : (
              customSplits.map((split) => (
                <View key={split.id} style={styles.previewRow}>
                  {/* Square Avatar */}
                  <View style={[styles.avatarSmall, { backgroundColor: split.color || COLORS.primary }]}>
                    <Text style={styles.avatarSmallText}>{split.name.charAt(0).toUpperCase()}</Text>
                  </View>
                  <Text style={styles.previewName}>{split.name}</Text>
                  <Text style={styles.previewPercent}>{formatNumber(split.percentage, 0)}%</Text>
                  <Text style={styles.previewAmount}>
                    {formatNumber(1000 * (split.percentage / 100), 0)} €
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>

        {/* Save Button */}
        <Pressable
          style={({ pressed }) => [
            styles.saveButton,
            (isSaving || (splitType === 'custom' && !isValidTotal)) && styles.buttonDisabled,
            pressed && !(isSaving || (splitType === 'custom' && !isValidTotal)) && styles.buttonPressed,
          ]}
          onPress={handleSave}
          disabled={isSaving || (splitType === 'custom' && !isValidTotal)}
        >
          {isSaving ? (
            <ActivityIndicator color={COLORS.foreground} />
          ) : (
            <Text style={styles.saveButtonText}>SAVE SETTINGS</Text>
          )}
        </Pressable>

        {/* Bottom spacing */}
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
    width: 40,
  },

  // ScrollView
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.large,
    color: COLORS.mutedForeground,
  },

  // Sections
  section: {
    marginTop: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sectionLabel: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
    letterSpacing: TYPOGRAPHY.letterSpacing.widest,
    marginBottom: SPACING.sm,
  },

  // Tab Selector
  tabContainer: {
    flexDirection: 'row',
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRightWidth: BORDERS.normal,
    borderRightColor: COLORS.foreground,
  },
  tabActive: {
    backgroundColor: COLORS.accent,
  },
  tabText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.mutedForeground,
    textTransform: 'uppercase',
  },
  tabTextActive: {
    color: COLORS.foreground,
  },

  // Description Card
  descriptionCard: {
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    padding: SPACING.lg,
    marginTop: SPACING.md,
    alignItems: 'center',
    ...SHADOWS.brutSm,
  },
  descriptionEmoji: {
    fontSize: 32,
    marginBottom: SPACING.sm,
  },
  descriptionTitle: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
    marginBottom: SPACING.xs,
  },
  descriptionText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
    textAlign: 'center',
  },

  // Distribute Link
  distributeLink: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },

  // Split Row
  splitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.brutSm,
  },

  // Avatar - SQUARE
  avatar: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.none,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  avatarText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
  },
  avatarSmall: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.none,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.foreground,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  avatarSmallText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.foreground,
  },

  // Split Name
  splitName: {
    flex: 1,
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
  },

  // Percentage Input
  percentageInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.muted,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  percentageInput: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: '600',
    color: COLORS.foreground,
    minWidth: 50,
    textAlign: 'right',
    padding: 0,
  },
  percentageSymbol: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.mutedForeground,
    marginLeft: 2,
  },

  // Total Row
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    padding: SPACING.md,
    marginTop: SPACING.sm,
  },
  totalRowError: {
    borderColor: COLORS.destructive,
    backgroundColor: COLORS.card,
  },
  totalLabel: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
  },
  totalValue: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.large,
    fontWeight: '700',
  },
  totalValueValid: {
    color: COLORS.success,
  },
  totalValueError: {
    color: COLORS.destructive,
  },

  // Error Text
  errorText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.destructive,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },

  // Preview Card
  previewCard: {
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    padding: SPACING.md,
    ...SHADOWS.brut,
  },
  previewTitle: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
    textAlign: 'center',
    marginBottom: SPACING.md,
    textTransform: 'uppercase',
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: BORDERS.thin,
    borderBottomColor: COLORS.muted,
  },
  previewName: {
    flex: 1,
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
  },
  previewPercent: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
    marginRight: SPACING.md,
    width: 40,
    textAlign: 'right',
  },
  previewAmount: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: '600',
    color: COLORS.foreground,
    width: 70,
    textAlign: 'right',
  },

  // Save Button
  saveButton: {
    backgroundColor: COLORS.accent,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.xl,
    ...SHADOWS.brut,
  },
  saveButtonText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
    textTransform: 'uppercase',
    letterSpacing: TYPOGRAPHY.letterSpacing.wide,
  },

  // Common
  buttonPressed: {
    transform: ANIMATION.pressedTransform,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
