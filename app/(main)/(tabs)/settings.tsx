/**
 * Settings Screen
 *
 * User profile, personal settings, boat settings,
 * crew management, and logout.
 */

import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Screen } from '../../../src/components/layout';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../../src/config/theme';
import { useAuth } from '../../../src/features/auth/hooks/useAuth';
import { useSeason } from '../../../src/features/season/hooks/useSeason';
import * as Clipboard from 'expo-clipboard';
import { resetToCorrectCrew, listCrewMembers, deleteAllCrew, makeCurrentUserCaptain, resetCrewWithCurrentUser } from '../../../scripts/debugCrew';
import { testFirebaseConnection } from '../../../src/utils/firebaseTest';
import { seedDevData } from '../../../scripts/seed-dev-data';

interface SettingsItemProps {
  icon: string;
  label: string;
  onPress?: () => void;
  disabled?: boolean;
}

function SettingsItem({ icon, label, onPress, disabled }: SettingsItemProps) {
  return (
    <Pressable
      style={[styles.settingsItem, disabled && styles.settingsItemDisabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.settingsIcon}>{icon}</Text>
      <Text style={[styles.settingsLabel, disabled && styles.settingsLabelDisabled]}>
        {label}
      </Text>
      <Text style={styles.settingsArrow}>→</Text>
    </Pressable>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const { signOut, firebaseUser, isLoading } = useAuth();
  const { currentSeason, currentSeasonId, currentUserCrew, isCurrentUserCaptain, crewMembers } = useSeason();
  const [devLoading, setDevLoading] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Odjava',
      'Jeste li sigurni da se želite odjaviti?',
      [
        { text: 'Odustani', style: 'cancel' },
        {
          text: 'Odjavi se',
          style: 'destructive',
          onPress: async () => {
            await signOut();
          },
        },
      ],
    );
  };

  // DEV: List current crew (check console)
  const handleListCrew = async () => {
    if (!currentSeasonId) {
      Alert.alert('Error', 'No season selected');
      return;
    }
    setDevLoading(true);
    await listCrewMembers(currentSeasonId);
    setDevLoading(false);
    Alert.alert('Done', 'Check console for crew list');
  };

  // DEV: Reset to correct 3 crew members
  const handleResetCrew = async () => {
    if (!currentSeasonId) {
      Alert.alert('Error', 'No season selected');
      return;
    }
    Alert.alert(
      'Reset Crew',
      'This will DELETE all crew and add only:\n\n• Božo (Captain)\n• Marina (Crew)\n• Marko (Crew)\n\nContinue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            setDevLoading(true);
            await resetToCorrectCrew(currentSeasonId);
            setDevLoading(false);
            Alert.alert('Success', 'Crew reset to 3 members.\n\nRestart app to see changes.');
          },
        },
      ]
    );
  };

  // DEV: Delete ALL crew
  const handleDeleteAllCrew = async () => {
    if (!currentSeasonId) {
      Alert.alert('Error', 'No season selected');
      return;
    }
    Alert.alert(
      'Delete ALL Crew',
      'This will DELETE all crew members. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            setDevLoading(true);
            const result = await deleteAllCrew(currentSeasonId);
            setDevLoading(false);
            Alert.alert('Done', `Deleted: ${result.deleted.join(', ')}\n\nRestart app to see changes.`);
          },
        },
      ]
    );
  };

  // DEV: Make current user captain (uses real Firebase UID)
  const handleMakeMeCaptain = async () => {
    if (!currentSeasonId) {
      Alert.alert('Error', 'No season selected');
      return;
    }
    Alert.alert(
      'Make Me Captain',
      'This will make YOU the captain using your real Firebase UID.\n\nYou will be able to add score entries.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Make Me Captain',
          onPress: async () => {
            setDevLoading(true);
            const result = await makeCurrentUserCaptain(currentSeasonId);
            setDevLoading(false);
            if (result.success) {
              Alert.alert('Success', 'You are now the captain!\n\nRestart app to see changes.');
            } else {
              Alert.alert('Error', result.error || 'Failed');
            }
          },
        },
      ]
    );
  };

  // DEV: Test Firebase connection
  const handleTestFirebase = async () => {
    setDevLoading(true);
    try {
      const result = await testFirebaseConnection();
      Alert.alert(
        'Firebase Test Results',
        `Auth: ${result.authStatus} ${result.userId ? `(${result.userId.substring(0, 8)}...)` : ''}\n` +
        `Read: ${result.firestoreRead} ${result.readError ? `\n  Error: ${result.readError}` : ''}\n` +
        `Write: ${result.firestoreWrite} ${result.writeError ? `\n  Error: ${result.writeError}` : ''}`
      );
    } catch (error) {
      Alert.alert('Firebase Test Failed', String(error));
    }
    setDevLoading(false);
  };

  // DEV: Reset crew with current user as captain
  const handleResetWithMe = async () => {
    if (!currentSeasonId) {
      Alert.alert('Error', 'No season selected');
      return;
    }
    Alert.alert(
      'Reset Crew (You + 2)',
      'This will:\n• Delete all crew\n• Make YOU the captain\n• Add Marina & Marko as crew',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            setDevLoading(true);
            await resetCrewWithCurrentUser(currentSeasonId);
            setDevLoading(false);
            Alert.alert('Success', 'Crew reset!\n\nRestart app to see changes.');
          },
        },
      ]
    );
  };

  // DEV: Copy UID to clipboard
  const handleCopyUid = async () => {
    if (firebaseUser?.uid) {
      await Clipboard.setStringAsync(firebaseUser.uid);
      Alert.alert('Copied', 'UID copied to clipboard');
    }
  };

  // DEV: Seed dev data
  const handleSeedDevData = async () => {
    Alert.alert(
      'Seed Dev Data',
      'This will create:\n• 1 season (S/Y Ahalya)\n• 3 test crew\n• 2 bookings\n• 5 expenses\n\nSafe to run multiple times.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Seed',
          onPress: async () => {
            setDevLoading(true);
            const result = await seedDevData();
            setDevLoading(false);
            if (result.success) {
              Alert.alert('Success', 'Dev data seeded!\n\nRestart app to see changes.');
            } else {
              Alert.alert('Error', result.error || 'Failed to seed data');
            }
          },
        },
      ]
    );
  };

  const userEmail = firebaseUser?.email || 'Anonymous User';
  const userName = currentUserCrew?.name || userEmail.split('@')[0] || 'Crew Member';
  const userRoles = currentUserCrew?.roles?.join(', ') || 'Crew';
  const userColor = currentUserCrew?.color || COLORS.coral;

  return (
    <Screen noPadding edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Postavke</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={[styles.avatar, { backgroundColor: userColor }]}>
            <Text style={styles.avatarText}>{userName.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{userName}</Text>
            <Text style={styles.profileEmail}>{userEmail}</Text>
            <Text style={[styles.profileRoles, { color: userColor }]}>{userRoles}</Text>
          </View>
        </View>

        {/* Boat Section */}
        {currentSeason && (
          <>
            <Text style={styles.sectionTitle}>BROD</Text>
            <View style={styles.boatCard}>
              <Text style={styles.boatName}>{currentSeason.boatName}</Text>
              <Text style={styles.boatSeason}>{currentSeason.name}</Text>
              <Text style={styles.boatCrew}>{crewMembers.length} članova posade</Text>
            </View>
            <SettingsItem
              icon="⛵"
              label="Postavke sezone"
              onPress={() => router.push('/settings/season')}
              disabled={!isCurrentUserCaptain}
            />
            <SettingsItem
              icon="👥"
              label="Upravljanje posadom"
              onPress={() => router.push('/settings/crew')}
            />
            <SettingsItem
              icon="💸"
              label="Podjela napojnica"
              onPress={() => router.push('/settings/tip-split')}
              disabled={!isCurrentUserCaptain}
            />
          </>
        )}

        {/* Personal Section - POST-MVP v1.1
        <Text style={styles.sectionTitle}>OSOBNO</Text>
        <SettingsItem icon="💰" label="Moja zarada" onPress={() => router.push('/settings/earnings')} />
        <SettingsItem icon="🔔" label="Obavijesti" onPress={() => router.push('/settings/notifications')} />
        */}

        {/* Logout */}
        <View style={styles.logoutContainer}>
          <Pressable
            style={styles.logoutButton}
            onPress={handleLogout}
            disabled={isLoading}
          >
            <Text style={styles.logoutIcon}>🚪</Text>
            <Text style={styles.logoutText}>Odjavi se</Text>
          </Pressable>
        </View>

        {/* DEV Section (only in development) */}
        {__DEV__ && (
          <>
            <Text style={styles.sectionTitle}>DEV TOOLS</Text>
            <View style={styles.devSection}>
              {/* User Info */}
              <View style={styles.devUserInfo}>
                <Text style={styles.devUserLabel}>UID:</Text>
                <Text style={styles.devUserValue} numberOfLines={1}>
                  {firebaseUser?.uid || 'Not logged in'}
                </Text>
                <Pressable style={styles.devCopyButton} onPress={handleCopyUid}>
                  <Text style={styles.devCopyButtonText}>Copy</Text>
                </Pressable>
              </View>
              <View style={styles.devUserInfo}>
                <Text style={styles.devUserLabel}>Email:</Text>
                <Text style={styles.devUserValue}>
                  {firebaseUser?.email || 'Anonymous'}
                </Text>
              </View>

              {/* Seed Data */}
              <Pressable
                style={[styles.devButton, styles.devButtonSuccess]}
                onPress={handleSeedDevData}
                disabled={devLoading}
              >
                <Text style={styles.devButtonText}>
                  {devLoading ? 'Seeding...' : '🌱 Seed Dev Data'}
                </Text>
              </Pressable>

              <Pressable
                style={[styles.devButton, styles.devButtonWarning]}
                onPress={handleTestFirebase}
                disabled={devLoading}
              >
                <Text style={styles.devButtonText}>
                  {devLoading ? 'Testing...' : '🔥 Test Firebase Connection'}
                </Text>
              </Pressable>
              {currentSeasonId && (
                <>
                  <Pressable
                    style={[styles.devButton, styles.devButtonInfo]}
                    onPress={handleListCrew}
                    disabled={devLoading}
                  >
                    <Text style={styles.devButtonText}>
                      {devLoading ? 'Loading...' : '📋 List Crew (console)'}
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[styles.devButton, styles.devButtonPrimary]}
                    onPress={handleResetCrew}
                    disabled={devLoading}
                  >
                    <Text style={styles.devButtonText}>
                      {devLoading ? 'Loading...' : '🔄 Reset to 3 Crew'}
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[styles.devButton, styles.devButtonDanger]}
                    onPress={handleDeleteAllCrew}
                    disabled={devLoading}
                  >
                    <Text style={styles.devButtonText}>
                      {devLoading ? 'Loading...' : '🗑️ Delete ALL Crew'}
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[styles.devButton, styles.devButtonSuccess]}
                    onPress={handleMakeMeCaptain}
                    disabled={devLoading}
                  >
                    <Text style={styles.devButtonText}>
                      {devLoading ? 'Loading...' : '👑 Make ME Captain'}
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[styles.devButton, styles.devButtonWarning]}
                    onPress={handleResetWithMe}
                    disabled={devLoading}
                  >
                    <Text style={styles.devButtonText}>
                      {devLoading ? 'Loading...' : '🔄 Reset Crew (Me + 2)'}
                    </Text>
                  </Pressable>
                </>
              )}
            </View>
          </>
        )}

        {/* Version Info */}
        <Text style={styles.versionText}>Ahoy v1.0.0 (MVP)</Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.coral,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    paddingTop: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  avatarText: {
    fontSize: 24,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  profileEmail: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  profileRoles: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.coral,
    fontWeight: '500',
    marginTop: SPACING.xs,
    textTransform: 'capitalize',
  },
  boatCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.coral,
  },
  boatName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  boatSeason: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  boatCrew: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  settingsItemDisabled: {
    opacity: 0.5,
  },
  settingsIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  settingsLabel: {
    flex: 1,
    fontSize: FONT_SIZES.lg,
    color: COLORS.textPrimary,
  },
  settingsLabelDisabled: {
    color: COLORS.textMuted,
  },
  settingsArrow: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textMuted,
  },
  logoutContainer: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${COLORS.error}15`,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
  },
  logoutIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  logoutText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.error,
  },
  versionText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  devSection: {
    backgroundColor: '#1a1a2e',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: '#e94560',
    gap: SPACING.sm,
  },
  devButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  devButtonInfo: {
    backgroundColor: '#16213e',
  },
  devButtonPrimary: {
    backgroundColor: '#0f3460',
  },
  devButtonDanger: {
    backgroundColor: '#e94560',
  },
  devButtonSuccess: {
    backgroundColor: '#22c55e',
  },
  devButtonWarning: {
    backgroundColor: '#f59e0b',
  },
  devButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: FONT_SIZES.md,
  },
  devUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    backgroundColor: '#0f0f1a',
    borderRadius: BORDER_RADIUS.sm,
  },
  devUserLabel: {
    color: '#888',
    fontSize: FONT_SIZES.sm,
    width: 50,
  },
  devUserValue: {
    flex: 1,
    color: '#fff',
    fontSize: FONT_SIZES.sm,
    fontFamily: 'monospace',
  },
  devCopyButton: {
    backgroundColor: '#333',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
    marginLeft: SPACING.sm,
  },
  devCopyButtonText: {
    color: '#fff',
    fontSize: FONT_SIZES.xs,
  },
});
