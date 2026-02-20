/**
 * Season Settings Screen
 *
 * Edit season details like boat name, dates, currency.
 * Captain only.
 */

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Header } from '../../../src/components/layout';
import { Button } from '../../../src/components/ui';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../../src/config/theme';
import { useSeason } from '../../../src/features/season/hooks/useSeason';
import { formatDate } from '../../../src/utils/formatting';

export default function SeasonSettingsScreen() {
  const router = useRouter();
  const { currentSeason, updateSeason, isLoading, isCurrentUserCaptain } = useSeason();

  const [boatName, setBoatName] = useState('');
  const [seasonName, setSeasonName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Redirect if not captain
  useEffect(() => {
    if (!isCurrentUserCaptain) {
      Alert.alert('Pristup odbijen', 'Samo kapetan može uređivati postavke sezone.');
      router.back();
    }
  }, [isCurrentUserCaptain, router]);

  // Initialize form with current season data
  useEffect(() => {
    if (currentSeason) {
      setBoatName(currentSeason.boatName);
      setSeasonName(currentSeason.name);
    }
  }, [currentSeason]);

  const handleSave = async () => {
    if (!boatName.trim()) {
      Alert.alert('Greška', 'Ime broda je obavezno');
      return;
    }
    if (!seasonName.trim()) {
      Alert.alert('Greška', 'Naziv sezone je obavezan');
      return;
    }

    setIsSaving(true);
    const result = await updateSeason({
      boatName: boatName.trim(),
      name: seasonName.trim(),
    });
    setIsSaving(false);

    if (result.success) {
      Alert.alert('Spremljeno', 'Postavke sezone su ažurirane.', [
        { text: 'U redu', onPress: () => router.back() },
      ]);
    } else {
      Alert.alert('Greška', result.error || 'Nije moguće spremiti promjene');
    }
  };

  if (!currentSeason) {
    return (
      <Screen noPadding>
        <Header title="Postavke sezone" showBack onBack={() => router.back()} />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Nema aktivne sezone</Text>
        </View>
      </Screen>
    );
  }

  const startDate = currentSeason.startDate?.toDate?.() || new Date();
  const endDate = currentSeason.endDate?.toDate?.() || new Date();

  return (
    <Screen noPadding>
      <Header title="Postavke sezone" showBack onBack={() => router.back()} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Boat Name */}
        <View style={styles.field}>
          <Text style={styles.label}>Ime broda</Text>
          <TextInput
            style={styles.input}
            value={boatName}
            onChangeText={setBoatName}
            placeholder="npr. M/Y Serenity"
            placeholderTextColor={COLORS.textMuted}
          />
        </View>

        {/* Season Name */}
        <View style={styles.field}>
          <Text style={styles.label}>Naziv sezone</Text>
          <TextInput
            style={styles.input}
            value={seasonName}
            onChangeText={setSeasonName}
            placeholder="npr. Sezona 2026"
            placeholderTextColor={COLORS.textMuted}
          />
        </View>

        {/* Season Dates (read-only for now) */}
        <View style={styles.field}>
          <Text style={styles.label}>Trajanje sezone</Text>
          <View style={styles.readOnlyField}>
            <Text style={styles.readOnlyValue}>
              {formatDate(startDate)} - {formatDate(endDate)}
            </Text>
            <Text style={styles.readOnlyHint}>
              Datumi se ne mogu mijenjati nakon kreiranja sezone
            </Text>
          </View>
        </View>

        {/* Currency (read-only) */}
        <View style={styles.field}>
          <Text style={styles.label}>Valuta</Text>
          <View style={styles.readOnlyField}>
            <Text style={styles.readOnlyValue}>{currentSeason.currency}</Text>
            <Text style={styles.readOnlyHint}>
              Valuta se ne može mijenjati nakon kreiranja sezone
            </Text>
          </View>
        </View>

        {/* Season Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Informacije o sezoni</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>ID sezone:</Text>
            <Text style={styles.infoValue}>{currentSeason.id.slice(0, 8)}...</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Kreirana:</Text>
            <Text style={styles.infoValue}>
              {currentSeason.createdAt?.toDate
                ? formatDate(currentSeason.createdAt.toDate())
                : 'Nepoznato'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Podjela napojnica:</Text>
            <Text style={styles.infoValue}>
              {currentSeason.tipSplitType === 'equal' ? 'Jednako' : 'Prilagođeno'}
            </Text>
          </View>
        </View>

        {/* Save Button */}
        <Button
          variant="primary"
          onPress={handleSave}
          disabled={isSaving || isLoading}
          style={styles.saveButton}
        >
          {isSaving ? 'Spremanje...' : 'Spremi promjene'}
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
  field: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    fontSize: FONT_SIZES.lg,
    color: COLORS.textPrimary,
  },
  readOnlyField: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    opacity: 0.7,
  },
  readOnlyValue: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
  },
  readOnlyHint: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
    fontStyle: 'italic',
  },
  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginTop: SPACING.md,
  },
  infoTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
  },
  infoLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
  infoValue: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontFamily: 'monospace',
  },
  saveButton: {
    marginTop: SPACING.xl,
  },
  bottomSpacer: {
    height: SPACING.xl,
  },
});
