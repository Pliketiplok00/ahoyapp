/**
 * Settings Screen
 *
 * User profile, personal settings, boat settings,
 * crew management, and logout.
 */

import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../../../src/components/layout';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../../src/config/theme';
import { useAuth } from '../../../src/features/auth/hooks/useAuth';

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

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
          },
        },
      ],
    );
  };

  const userEmail = firebaseUser?.email || 'Anonymous User';

  return (
    <Screen noPadding edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>👤</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>Crew Member</Text>
            <Text style={styles.profileEmail}>{userEmail}</Text>
            <Text style={styles.profileRoles}>Captain</Text>
          </View>
        </View>

        {/* Personal Section */}
        <Text style={styles.sectionTitle}>PERSONAL</Text>
        <SettingsItem icon="💰" label="My Earnings" disabled />
        <SettingsItem icon="🔔" label="Notifications" disabled />

        {/* Boat Section */}
        <Text style={styles.sectionTitle}>BOAT</Text>
        <SettingsItem icon="⛵" label="Season Settings" disabled />
        <SettingsItem icon="👥" label="Crew Management" disabled />
        <SettingsItem icon="💸" label="Tip Split" disabled />

        {/* Logout */}
        <View style={styles.logoutContainer}>
          <Pressable
            style={styles.logoutButton}
            onPress={handleLogout}
            disabled={isLoading}
          >
            <Text style={styles.logoutIcon}>🚪</Text>
            <Text style={styles.logoutText}>Log Out</Text>
          </Pressable>
        </View>

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
});
