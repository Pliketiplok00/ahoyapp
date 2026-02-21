/**
 * Settings Screen (Brutalist)
 *
 * User profile, personal settings, boat settings,
 * crew management, and logout.
 *
 * @see docs/Ahoy_Screen_Map.md §2.6
 */

import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { useState } from 'react';
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
} from '@/config/theme';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useSeason } from '@/features/season/hooks/useSeason';
import * as Clipboard from 'expo-clipboard';
import { resetToCorrectCrew, listCrewMembers, deleteAllCrew, makeCurrentUserCaptain, resetCrewWithCurrentUser } from '../../../scripts/debugCrew';
import { testFirebaseConnection } from '@/utils/firebaseTest';
import { seedDevData } from '../../../scripts/seed-dev-data';

// ============================================
// COMPONENTS
// ============================================

interface MenuItemProps {
  icon: string;
  label: string;
  onPress?: () => void;
  disabled?: boolean;
}

function MenuItem({ icon, label, onPress, disabled }: MenuItemProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.menuItem,
        disabled && styles.menuItemDisabled,
        pressed && !disabled && styles.pressed,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.menuIcon}>{icon}</Text>
      <Text style={[styles.menuLabel, disabled && styles.menuLabelDisabled]}>
        {label}
      </Text>
      <Text style={styles.menuArrow}>→</Text>
    </Pressable>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

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

  // DEV: Debug auth state
  const handleDebugAuthState = () => {
    Alert.alert(
      'Debug Auth State',
      `UID: ${firebaseUser?.uid || 'NULL'}\n` +
      `Email: ${firebaseUser?.email || 'Anonymous'}\n` +
      `IsAnonymous: ${firebaseUser?.isAnonymous ?? 'N/A'}\n` +
      `Current Season: ${currentSeasonId || 'NONE'}\n` +
      `Season Name: ${currentSeason?.boatName || 'N/A'}\n` +
      `User in Season: ${currentUserCrew ? 'YES' : 'NO'}\n` +
      `Crew Name: ${currentUserCrew?.name || 'N/A'}\n` +
      `Roles: ${currentUserCrew?.roles?.join(', ') || 'N/A'}`
    );
  };

  // User data
  const userEmail = firebaseUser?.email || 'Anonymous User';
  const userName = currentUserCrew?.name || userEmail.split('@')[0] || 'Crew Member';
  const userRoles = currentUserCrew?.roles?.join(', ') || 'Crew';
  const userColor = currentUserCrew?.color || COLORS.primary;
  const boatName = currentSeason?.boatName || 'S/Y Ahalya';

  return (
    <View style={styles.container}>
      {/* Header - matches BookingsScreen pattern */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>POSTAVKE</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={[styles.avatar, { backgroundColor: userColor }]}>
            <Text style={styles.avatarText}>{userName.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{userName}</Text>
            <Text style={styles.profileRole}>{userRoles} · {boatName}</Text>
          </View>
          <Pressable
            style={({ pressed }) => [styles.profileArrow, pressed && styles.pressed]}
            onPress={() => Alert.alert('Profil', 'Postavke profila dolaze uskoro!')}
          >
            <Text style={styles.profileArrowText}>→</Text>
          </Pressable>
        </View>

        {/* Season Section */}
        {currentSeason && (
          <>
            <Text style={styles.sectionLabel}>SEZONA</Text>
            <View style={styles.menuGroup}>
              <MenuItem
                icon="📅"
                label="Postavke sezone"
                onPress={() => router.push('/settings/season')}
                disabled={!isCurrentUserCaptain}
              />
              <MenuItem
                icon="👥"
                label="Upravljanje posadom"
                onPress={() => router.push('/settings/crew')}
              />
              <MenuItem
                icon="💰"
                label="Podjela napojnica"
                onPress={() => router.push('/settings/tip-split')}
                disabled={!isCurrentUserCaptain}
              />
            </View>
          </>
        )}

        {/* Other Section */}
        <Text style={styles.sectionLabel}>OSTALO</Text>
        <View style={styles.menuGroup}>
          <MenuItem
            icon="❓"
            label="Pomoć"
            onPress={() => Alert.alert('Pomoć', 'Stranica pomoći dolazi uskoro!')}
          />
          <MenuItem
            icon="📝"
            label="Feedback"
            onPress={() => Alert.alert('Feedback', 'Feedback forma dolazi uskoro!')}
          />
          <MenuItem
            icon="⚖️"
            label="Pravila privatnosti"
            onPress={() => Alert.alert('Privatnost', 'Pravila privatnosti dolaze uskoro!')}
          />
        </View>

        {/* Logout Button */}
        <Pressable
          style={({ pressed }) => [
            styles.logoutButton,
            pressed && styles.pressed,
          ]}
          onPress={handleLogout}
          disabled={isLoading}
        >
          <Text style={styles.logoutIcon}>🚪</Text>
          <Text style={styles.logoutText}>ODJAVI SE</Text>
        </Pressable>

        {/* DEV Section (only in development) */}
        {__DEV__ && (
          <>
            <Text style={styles.sectionLabel}>DEV TOOLS</Text>
            <View style={styles.devSection}>
              {/* User Info */}
              <View style={styles.devUserInfo}>
                <Text style={styles.devUserLabel}>UID:</Text>
                <Text style={styles.devUserValue} numberOfLines={1}>
                  {firebaseUser?.uid || 'Not logged in'}
                </Text>
                <Pressable
                  style={({ pressed }) => [styles.devCopyButton, pressed && styles.pressed]}
                  onPress={handleCopyUid}
                >
                  <Text style={styles.devCopyButtonText}>COPY</Text>
                </Pressable>
              </View>
              <View style={styles.devUserInfo}>
                <Text style={styles.devUserLabel}>Email:</Text>
                <Text style={styles.devUserValue}>
                  {firebaseUser?.email || 'Anonymous'}
                </Text>
              </View>

              {/* Debug Button */}
              <Pressable
                style={({ pressed }) => [styles.devButton, styles.devButtonInfo, pressed && styles.pressed]}
                onPress={handleDebugAuthState}
              >
                <Text style={styles.devButtonText}>🔍 DEBUG AUTH STATE</Text>
              </Pressable>

              {/* Seed Data */}
              <Pressable
                style={({ pressed }) => [styles.devButton, styles.devButtonSuccess, pressed && styles.pressed]}
                onPress={handleSeedDevData}
                disabled={devLoading}
              >
                <Text style={styles.devButtonText}>
                  {devLoading ? 'SEEDING...' : '🌱 SEED DEV DATA'}
                </Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [styles.devButton, styles.devButtonWarning, pressed && styles.pressed]}
                onPress={handleTestFirebase}
                disabled={devLoading}
              >
                <Text style={styles.devButtonText}>
                  {devLoading ? 'TESTING...' : '🔥 TEST FIREBASE CONNECTION'}
                </Text>
              </Pressable>

              {currentSeasonId && (
                <>
                  <Pressable
                    style={({ pressed }) => [styles.devButton, styles.devButtonInfo, pressed && styles.pressed]}
                    onPress={handleListCrew}
                    disabled={devLoading}
                  >
                    <Text style={styles.devButtonText}>
                      {devLoading ? 'LOADING...' : '📋 LIST CREW (CONSOLE)'}
                    </Text>
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => [styles.devButton, styles.devButtonPrimary, pressed && styles.pressed]}
                    onPress={handleResetCrew}
                    disabled={devLoading}
                  >
                    <Text style={styles.devButtonText}>
                      {devLoading ? 'LOADING...' : '🔄 RESET TO 3 CREW'}
                    </Text>
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => [styles.devButton, styles.devButtonDanger, pressed && styles.pressed]}
                    onPress={handleDeleteAllCrew}
                    disabled={devLoading}
                  >
                    <Text style={styles.devButtonText}>
                      {devLoading ? 'LOADING...' : '🗑️ DELETE ALL CREW'}
                    </Text>
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => [styles.devButton, styles.devButtonSuccess, pressed && styles.pressed]}
                    onPress={handleMakeMeCaptain}
                    disabled={devLoading}
                  >
                    <Text style={styles.devButtonText}>
                      {devLoading ? 'LOADING...' : '👑 MAKE ME CAPTAIN'}
                    </Text>
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => [styles.devButton, styles.devButtonWarning, pressed && styles.pressed]}
                    onPress={handleResetWithMe}
                    disabled={devLoading}
                  >
                    <Text style={styles.devButtonText}>
                      {devLoading ? 'LOADING...' : '🔄 RESET CREW (ME + 2)'}
                    </Text>
                  </Pressable>
                </>
              )}
            </View>
          </>
        )}

        {/* Version Info */}
        <Text style={styles.versionText}>Ahoy v1.0.0 (MVP)</Text>

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
  // Container (matches BookingsScreen)
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Header (matches BookingsScreen pattern exactly)
  header: {
    backgroundColor: COLORS.primary,
    borderBottomWidth: BORDERS.heavy,
    borderBottomColor: COLORS.foreground,
    paddingTop: SPACING.xxl + SPACING.md, // Safe area + padding
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  headerTitle: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.sectionTitle,
    color: COLORS.foreground,
    textTransform: 'uppercase',
  },

  // ScrollView
  scrollView: {
    flex: 1,
    padding: SPACING.md,
  },

  // Profile Card
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    ...SHADOWS.brut,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.none, // SQUARE avatar!
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  avatarText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.sectionTitle,
    color: COLORS.white,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.cardTitle,
    color: COLORS.foreground,
  },
  profileRole: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.mutedForeground,
    marginTop: SPACING.xxs,
  },
  profileArrow: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.muted,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileArrowText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.cardTitle,
    color: COLORS.foreground,
  },

  // Section Label
  sectionLabel: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
    letterSpacing: 1,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },

  // Menu Group
  menuGroup: {
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    ...SHADOWS.brut,
  },

  // Menu Item
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: BORDERS.thin,
    borderBottomColor: COLORS.muted,
  },
  menuItemDisabled: {
    opacity: 0.5,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  menuLabel: {
    flex: 1,
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
  },
  menuLabelDisabled: {
    color: COLORS.mutedForeground,
  },
  menuArrow: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.large,
    color: COLORS.mutedForeground,
  },

  // Logout Button
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.pink,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    paddingVertical: SPACING.md,
    marginTop: SPACING.lg,
    ...SHADOWS.brut,
  },
  logoutIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  logoutText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.white,
    textTransform: 'uppercase',
  },

  // Version
  versionText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
    textAlign: 'center',
    marginTop: SPACING.xl,
  },

  // DEV Section
  devSection: {
    backgroundColor: COLORS.foreground,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    padding: SPACING.md,
    gap: SPACING.sm,
    ...SHADOWS.brut,
  },
  devUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    backgroundColor: COLORS.secondary,
    borderRadius: BORDER_RADIUS.none,
  },
  devUserLabel: {
    fontFamily: FONTS.mono,
    color: COLORS.mutedForeground,
    fontSize: TYPOGRAPHY.sizes.label,
    width: 50,
  },
  devUserValue: {
    flex: 1,
    fontFamily: FONTS.mono,
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sizes.label,
  },
  devCopyButton: {
    backgroundColor: COLORS.primary,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.white,
    borderRadius: BORDER_RADIUS.none,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    marginLeft: SPACING.sm,
  },
  devCopyButtonText: {
    fontFamily: FONTS.display,
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sizes.meta,
  },
  devButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.white,
    borderRadius: BORDER_RADIUS.none,
    alignItems: 'center',
  },
  devButtonInfo: {
    backgroundColor: COLORS.primary,
  },
  devButtonPrimary: {
    backgroundColor: COLORS.primary,
  },
  devButtonDanger: {
    backgroundColor: COLORS.destructive,
  },
  devButtonSuccess: {
    backgroundColor: COLORS.accent,
  },
  devButtonWarning: {
    backgroundColor: COLORS.statsBg,
  },
  devButtonText: {
    fontFamily: FONTS.display,
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sizes.label,
    textTransform: 'uppercase',
  },

  // Pressed state
  pressed: {
    transform: ANIMATION.pressedTransform,
  },
});
