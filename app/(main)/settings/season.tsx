/**
 * Season Settings Screen (Brutalist)
 *
 * Edit season details like boat name, dates, currency.
 * Captain only. Includes danger zone for season deletion.
 *
 * @see docs/Ahoy_Screen_Map.md
 */

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
import { BrutInput } from '../../../src/components/ui/BrutInput';
import { useSeason } from '../../../src/features/season/hooks/useSeason';
import { formatDate } from '../../../src/utils/formatting';

export default function SeasonSettingsScreen() {
  const router = useRouter();
  const { currentSeason, updateSeason, isLoading, isCurrentUserCaptain } = useSeason();

  const [boatName, setBoatName] = useState('');
  const [seasonName, setSeasonName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Redirect if not captain
  useEffect(() => {
    if (!isCurrentUserCaptain) {
      Alert.alert('Access Denied', 'Only the Captain can edit season settings.');
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
      Alert.alert('Error', 'Boat name is required');
      return;
    }
    if (!seasonName.trim()) {
      Alert.alert('Error', 'Season name is required');
      return;
    }

    setIsSaving(true);
    const result = await updateSeason({
      boatName: boatName.trim(),
      name: seasonName.trim(),
    });
    setIsSaving(false);

    if (result.success) {
      Alert.alert('Saved', 'Season settings updated.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } else {
      Alert.alert('Error', result.error || 'Could not save changes');
    }
  };

  const handleDeleteSeason = () => {
    Alert.alert(
      'Delete Season',
      'Are you sure you want to delete this season? This action cannot be undone. All bookings, expenses, and crew data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: confirmDeleteSeason,
        },
      ]
    );
  };

  const confirmDeleteSeason = async () => {
    setIsDeleting(true);

    try {
      const { doc, deleteDoc } = await import('firebase/firestore');
      const { db } = await import('../../../src/config/firebase');

      await deleteDoc(doc(db, 'seasons', currentSeason!.id));

      Alert.alert('Deleted', 'Season has been deleted.', [
        { text: 'OK', onPress: () => router.replace('/(main)/(tabs)') },
      ]);
    } catch (error) {
      console.error('Error deleting season:', error);
      Alert.alert('Error', 'Could not delete season');
    }

    setIsDeleting(false);
  };

  // Empty state
  if (!currentSeason) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [styles.backButton, pressed && styles.buttonPressed]}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </Pressable>
          <Text style={styles.headerTitle}>SEASON SETTINGS</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>📭</Text>
          <Text style={styles.emptyText}>NO ACTIVE SEASON</Text>
        </View>
      </SafeAreaView>
    );
  }

  const startDate = currentSeason.startDate?.toDate?.() || new Date();
  const endDate = currentSeason.endDate?.toDate?.() || new Date();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backButton, pressed && styles.buttonPressed]}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>SEASON SETTINGS</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Boat Name */}
        <BrutInput
          label="BOAT NAME"
          value={boatName}
          onChangeText={setBoatName}
          placeholder="e.g. S/Y Ahalya"
          editable={!isSaving}
        />

        {/* Season Name */}
        <BrutInput
          label="SEASON NAME"
          value={seasonName}
          onChangeText={setSeasonName}
          placeholder="e.g. Summer 2026"
          editable={!isSaving}
        />

        {/* Dates (read-only) */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>DATES</Text>
          <View style={styles.dateRow}>
            <View style={styles.dateBox}>
              <Text style={styles.dateLabel}>START</Text>
              <Text style={styles.dateValue}>{formatDate(startDate)}</Text>
            </View>
            <View style={styles.dateBox}>
              <Text style={styles.dateLabel}>END</Text>
              <Text style={styles.dateValue}>{formatDate(endDate)}</Text>
            </View>
          </View>
          <Text style={styles.readOnlyHint}>
            Dates cannot be changed after season creation
          </Text>
        </View>

        {/* Currency (read-only) */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>CURRENCY</Text>
          <View style={styles.readOnlyBox}>
            <Text style={styles.readOnlyValue}>{currentSeason.currency}</Text>
          </View>
          <Text style={styles.readOnlyHint}>
            Currency cannot be changed after season creation
          </Text>
        </View>

        {/* Season Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>SEASON INFO</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>ID</Text>
            <Text style={styles.infoValue}>{currentSeason.id.slice(0, 8)}...</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>CREATED</Text>
            <Text style={styles.infoValue}>
              {currentSeason.createdAt?.toDate
                ? formatDate(currentSeason.createdAt.toDate())
                : 'Unknown'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>TIP SPLIT</Text>
            <Text style={styles.infoValue}>
              {currentSeason.tipSplitType === 'equal' ? 'Equal' : 'Custom'}
            </Text>
          </View>
        </View>

        {/* Save Button */}
        <Pressable
          style={({ pressed }) => [
            styles.saveButton,
            (isSaving || isLoading) && styles.buttonDisabled,
            pressed && !isSaving && !isLoading && styles.buttonPressed,
          ]}
          onPress={handleSave}
          disabled={isSaving || isLoading}
        >
          {isSaving ? (
            <ActivityIndicator color={COLORS.foreground} />
          ) : (
            <Text style={styles.saveButtonText}>SAVE CHANGES</Text>
          )}
        </Pressable>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Danger Zone */}
        <View style={styles.dangerZone}>
          <Text style={styles.dangerTitle}>DANGER ZONE</Text>
          <Text style={styles.dangerText}>
            Deleting the season will permanently remove all bookings, expenses, and crew data.
          </Text>
          <Pressable
            style={({ pressed }) => [
              styles.deleteButton,
              isDeleting && styles.buttonDisabled,
              pressed && !isDeleting && styles.buttonPressed,
            ]}
            onPress={handleDeleteSeason}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <ActivityIndicator color={COLORS.card} />
            ) : (
              <Text style={styles.deleteButtonText}>DELETE SEASON</Text>
            )}
          </Pressable>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  // Layout
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.primary,
    borderBottomWidth: BORDERS.normal,
    borderBottomColor: COLORS.foreground,
  },
  backButton: {
    width: 44,
    height: 44,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontFamily: FONTS.display,
    fontSize: 24,
    color: COLORS.foreground,
  },
  headerTitle: {
    flex: 1,
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.cardTitle,
    color: COLORS.foreground,
    textAlign: 'center',
    letterSpacing: TYPOGRAPHY.letterSpacing.wide,
  },
  headerSpacer: {
    width: 44,
  },
  buttonPressed: {
    transform: ANIMATION.pressedTransform,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  emptyText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.large,
    color: COLORS.mutedForeground,
  },

  // Field Groups
  fieldGroup: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.label,
    fontWeight: '600',
    color: COLORS.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: TYPOGRAPHY.letterSpacing.widest,
    marginBottom: SPACING.xs,
  },

  // Date Row
  dateRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  dateBox: {
    flex: 1,
    backgroundColor: COLORS.muted,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    padding: SPACING.md,
  },
  dateLabel: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
    letterSpacing: TYPOGRAPHY.letterSpacing.wide,
    marginBottom: SPACING.xs,
  },
  dateValue: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
  },

  // Read-only fields
  readOnlyBox: {
    backgroundColor: COLORS.muted,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    padding: SPACING.md,
  },
  readOnlyValue: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
  },
  readOnlyHint: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
    marginTop: SPACING.xs,
    fontStyle: 'italic',
  },

  // Info Card
  infoCard: {
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    ...SHADOWS.brut,
  },
  infoTitle: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
    letterSpacing: TYPOGRAPHY.letterSpacing.wide,
    marginBottom: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: BORDERS.thin,
    borderBottomColor: COLORS.muted,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
  },
  infoLabel: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
  },
  infoValue: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.foreground,
  },

  // Save Button
  saveButton: {
    backgroundColor: COLORS.accent,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    ...SHADOWS.brut,
  },
  saveButtonText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
    letterSpacing: TYPOGRAPHY.letterSpacing.wide,
  },
  buttonDisabled: {
    opacity: 0.5,
  },

  // Divider
  divider: {
    height: BORDERS.thin,
    backgroundColor: COLORS.muted,
    marginVertical: SPACING.xl,
  },

  // Danger Zone
  dangerZone: {
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.destructive,
    borderRadius: BORDER_RADIUS.none,
    padding: SPACING.md,
  },
  dangerTitle: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.destructive,
    letterSpacing: TYPOGRAPHY.letterSpacing.wide,
    marginBottom: SPACING.sm,
  },
  dangerText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
    lineHeight: 18,
    marginBottom: SPACING.md,
  },
  deleteButton: {
    backgroundColor: COLORS.destructive,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  deleteButtonText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.card,
    letterSpacing: TYPOGRAPHY.letterSpacing.wide,
  },

  // Bottom Spacer
  bottomSpacer: {
    height: SPACING.xl,
  },
});
