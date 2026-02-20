/**
 * Tip Split Configuration Screen
 *
 * Configure how tips are split between crew members.
 * Captain only. Equal or custom percentage split.
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
} from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Header } from '../../../src/components/layout';
import { Button } from '../../../src/components/ui';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../../src/config/theme';
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
      Alert.alert('Pristup odbijen', 'Samo kapetan može uređivati podjelu napojnica.');
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
      Alert.alert('Greška', 'Ukupni postotak mora biti 100%');
      return;
    }

    setIsSaving(true);

    // Import seasonService to update tip split
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
        // Clear custom config for equal split
        updateData.tipSplitConfig = null;
      }

      await updateDoc(doc(db, 'seasons', currentSeason!.id), updateData);

      Alert.alert('Spremljeno', 'Podjela napojnica je ažurirana.', [
        { text: 'U redu', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('Error saving tip split:', error);
      Alert.alert('Greška', 'Nije moguće spremiti promjene');
    }

    setIsSaving(false);
  };

  if (!currentSeason) {
    return (
      <Screen noPadding>
        <Header title="Podjela napojnica" showBack onBack={() => router.back()} />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Nema aktivne sezone</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen noPadding>
      <Header title="Podjela napojnica" showBack onBack={() => router.back()} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Split Type Selection */}
        <Text style={styles.sectionTitle}>NAČIN PODJELE</Text>
        <View style={styles.typeSelector}>
          <Pressable
            style={[styles.typeOption, splitType === 'equal' && styles.typeOptionActive]}
            onPress={() => setSplitType('equal')}
          >
            <Text style={styles.typeIcon}>⚖️</Text>
            <Text
              style={[styles.typeLabel, splitType === 'equal' && styles.typeLabelActive]}
            >
              Jednako
            </Text>
            <Text style={styles.typeDescription}>
              Svaki član dobiva {formatNumber(equalPercentage, 1)}%
            </Text>
          </Pressable>

          <Pressable
            style={[styles.typeOption, splitType === 'custom' && styles.typeOptionActive]}
            onPress={() => setSplitType('custom')}
          >
            <Text style={styles.typeIcon}>⚙️</Text>
            <Text
              style={[styles.typeLabel, splitType === 'custom' && styles.typeLabelActive]}
            >
              Prilagođeno
            </Text>
            <Text style={styles.typeDescription}>Ručno postavi postotke</Text>
          </Pressable>
        </View>

        {/* Custom Split Configuration */}
        {splitType === 'custom' && (
          <>
            <View style={styles.splitHeader}>
              <Text style={styles.sectionTitle}>POSTOCI PO ČLANU</Text>
              <Pressable onPress={handleDistributeEvenly}>
                <Text style={styles.distributeButton}>Podijeli jednako</Text>
              </Pressable>
            </View>

            {customSplits.map((split) => (
              <View key={split.id} style={styles.crewSplitRow}>
                <View style={[styles.crewDot, { backgroundColor: split.color }]} />
                <Text style={styles.crewName}>{split.name}</Text>
                <View style={styles.percentageInput}>
                  <TextInput
                    style={styles.percentageValue}
                    value={split.percentage.toFixed(1).replace('.', ',')}
                    onChangeText={(text) => handleSplitChange(split.id, text)}
                    keyboardType="decimal-pad"
                    selectTextOnFocus
                  />
                  <Text style={styles.percentageSymbol}>%</Text>
                </View>
              </View>
            ))}

            {/* Total */}
            <View style={[styles.totalRow, !isValidTotal && styles.totalRowError]}>
              <Text style={styles.totalLabel}>Ukupno:</Text>
              <Text
                style={[styles.totalValue, !isValidTotal && styles.totalValueError]}
              >
                {formatNumber(totalPercentage, 1)}%
              </Text>
            </View>

            {!isValidTotal && (
              <Text style={styles.errorText}>
                Ukupni postotak mora biti točno 100%
              </Text>
            )}
          </>
        )}

        {/* Preview */}
        <View style={styles.previewCard}>
          <Text style={styles.previewTitle}>Primjer za napojnicu od 1.000 €</Text>
          {splitType === 'equal' ? (
            crewMembers.map((member) => (
              <View key={member.id} style={styles.previewRow}>
                <View style={[styles.crewDot, { backgroundColor: member.color }]} />
                <Text style={styles.previewName}>{member.name}</Text>
                <Text style={styles.previewAmount}>
                  {formatNumber(1000 * (equalPercentage / 100), 2)} €
                </Text>
              </View>
            ))
          ) : (
            customSplits.map((split) => (
              <View key={split.id} style={styles.previewRow}>
                <View style={[styles.crewDot, { backgroundColor: split.color }]} />
                <Text style={styles.previewName}>{split.name}</Text>
                <Text style={styles.previewAmount}>
                  {formatNumber(1000 * (split.percentage / 100), 2)} €
                </Text>
              </View>
            ))
          )}
        </View>

        {/* Save Button */}
        <Button
          variant="primary"
          onPress={handleSave}
          disabled={isSaving || (splitType === 'custom' && !isValidTotal)}
          style={styles.saveButton}
        >
          {isSaving ? 'Spremanje...' : 'Spremi'}
        </Button>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textMuted,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  typeOption: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeOptionActive: {
    borderColor: COLORS.coral,
    backgroundColor: `${COLORS.coral}10`,
  },
  typeIcon: {
    fontSize: 24,
    marginBottom: SPACING.xs,
  },
  typeLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  typeLabelActive: {
    color: COLORS.coral,
  },
  typeDescription: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  splitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  distributeButton: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.coral,
    fontWeight: '500',
  },
  crewSplitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  crewDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SPACING.sm,
  },
  crewName: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
  },
  percentageInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  percentageValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    minWidth: 50,
    textAlign: 'right',
  },
  percentageSymbol: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
    marginLeft: 2,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginTop: SPACING.sm,
  },
  totalRowError: {
    backgroundColor: `${COLORS.error}10`,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  totalLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  totalValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.success,
  },
  totalValueError: {
    color: COLORS.error,
  },
  errorText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.error,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  previewCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginTop: SPACING.xl,
  },
  previewTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  previewName: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  previewAmount: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  saveButton: {
    marginTop: SPACING.xl,
  },
  bottomSpacer: {
    height: SPACING.xl,
  },
});
