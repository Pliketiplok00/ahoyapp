/**
 * Crew Management Screen (Brutalist)
 *
 * View and manage crew members.
 * Captain can add/remove crew and change roles.
 *
 * @see docs/Ahoy_Screen_Map.md
 */

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { BrutInput } from '../../../src/components/ui/BrutInput';
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
import { USER_ROLES, type UserRole } from '../../../src/constants/userRoles';
import type { CrewMember, SeasonInvite } from '../../../src/features/season/types';

// ============================================
// COMPONENTS
// ============================================

interface CrewMemberItemProps {
  member: CrewMember;
  isCurrentUser: boolean;
  isCaptain: boolean;
  onChangeRole: (memberId: string, newRoles: UserRole[]) => void;
  onRemove: (memberId: string) => void;
  onTransferCaptain: (memberId: string, memberName: string) => void;
}

function CrewMemberItem({
  member,
  isCurrentUser,
  isCaptain,
  onChangeRole,
  onRemove,
  onTransferCaptain,
}: CrewMemberItemProps) {
  const isEditor = member.roles.includes(USER_ROLES.EDITOR);
  const isMemberCaptain = member.roles.includes(USER_ROLES.CAPTAIN);

  const handleToggleEditor = () => {
    if (isEditor) {
      onChangeRole(member.id, member.roles.filter((r) => r !== USER_ROLES.EDITOR));
    } else {
      onChangeRole(member.id, [...member.roles, USER_ROLES.EDITOR]);
    }
  };

  const handleRemove = () => {
    Alert.alert(
      'Remove Member',
      `Are you sure you want to remove ${member.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => onRemove(member.id),
        },
      ]
    );
  };

  return (
    <View style={styles.crewCard}>
      {/* Avatar - SQUARE */}
      <View style={[styles.avatar, { backgroundColor: member.color || COLORS.primary }]}>
        <Text style={styles.avatarText}>{member.name.charAt(0).toUpperCase()}</Text>
      </View>

      {/* Info */}
      <View style={styles.crewInfo}>
        <View style={styles.nameRow}>
          <Text style={styles.crewName}>{member.name.toUpperCase()}</Text>
          {isCurrentUser && (
            <View style={styles.youBadge}>
              <Text style={styles.youBadgeText}>YOU</Text>
            </View>
          )}
        </View>
        <Text style={styles.crewEmail}>{member.email}</Text>
        <View style={styles.rolesRow}>
          {member.roles.map((role) => (
            <View
              key={role}
              style={[
                styles.roleBadge,
                role === USER_ROLES.CAPTAIN && styles.captainRoleBadge,
                role === USER_ROLES.EDITOR && styles.editorRoleBadge,
              ]}
            >
              <Text style={[
                styles.roleBadgeText,
                role === USER_ROLES.CAPTAIN && styles.captainRoleText,
                role === USER_ROLES.EDITOR && styles.editorRoleText,
              ]}>
                {role.toUpperCase()}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Actions - Only for Captain, not on self or other captains */}
      {isCaptain && !isMemberCaptain && !isCurrentUser && (
        <View style={styles.actionsColumn}>
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              styles.captainTransferButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => onTransferCaptain(member.id, member.name)}
          >
            <Text style={styles.actionButtonEmoji}>👑</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              isEditor ? styles.editorActiveButton : styles.editorButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleToggleEditor}
          >
            <Text style={[
              styles.actionButtonText,
              isEditor && styles.editorActiveText,
            ]}>
              {isEditor ? 'EDITOR' : '+EDIT'}
            </Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              styles.removeButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleRemove}
          >
            <Text style={styles.removeButtonText}>✕</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

interface PendingInviteItemProps {
  invite: SeasonInvite;
  onDelete: (inviteId: string) => void;
}

function PendingInviteItem({ invite, onDelete }: PendingInviteItemProps) {
  const handleDelete = () => {
    Alert.alert(
      'Delete Invite',
      `Delete invite for ${invite.email}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete(invite.id),
        },
      ]
    );
  };

  return (
    <View style={styles.inviteCard}>
      <View style={styles.inviteIcon}>
        <Text style={styles.inviteIconText}>📧</Text>
      </View>
      <View style={styles.inviteInfo}>
        <Text style={styles.inviteEmail}>{invite.email}</Text>
        <Text style={styles.inviteCode}>CODE: {invite.inviteCode}</Text>
      </View>
      <Pressable
        style={({ pressed }) => [
          styles.deleteButton,
          pressed && styles.buttonPressed,
        ]}
        onPress={handleDelete}
      >
        <Text style={styles.deleteButtonText}>DELETE</Text>
      </Pressable>
    </View>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function CrewManagementScreen() {
  const router = useRouter();
  const {
    currentSeason,
    crewMembers,
    pendingInvites,
    isCurrentUserCaptain,
    currentUserCrew,
    sendInvite,
    deleteInvite,
    removeCrewMember,
  } = useSeason();

  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [lastInviteCode, setLastInviteCode] = useState<string | null>(null);

  const handleSendInvite = async () => {
    if (!inviteEmail.trim()) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }

    setIsInviting(true);
    const result = await sendInvite({ email: inviteEmail.trim() });
    setIsInviting(false);

    if (result.success && result.inviteCode) {
      setLastInviteCode(result.inviteCode);
      setInviteEmail('');
    } else {
      Alert.alert('Error', result.error || 'Could not send invite');
    }
  };

  const handleChangeRole = async (memberId: string, newRoles: UserRole[]) => {
    const { seasonService } = await import('../../../src/features/season/services/seasonService');
    if (!currentSeason) return;

    const result = await seasonService.updateCrewMemberRoles(currentSeason.id, memberId, newRoles);
    if (!result.success) {
      Alert.alert('Error', result.error || 'Could not change role');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    const result = await removeCrewMember(memberId);
    if (!result.success) {
      Alert.alert('Error', result.error || 'Could not remove member');
    }
  };

  const handleDeleteInvite = async (inviteId: string) => {
    const result = await deleteInvite(inviteId);
    if (!result.success) {
      Alert.alert('Error', result.error || 'Could not delete invite');
    }
  };

  const handleTransferCaptain = (newCaptainId: string, newCaptainName: string) => {
    if (!currentSeason || !currentUserCrew) return;

    Alert.alert(
      'Transfer Captain Role',
      `You will transfer the Captain role to ${newCaptainName}.\n\nYou will become a regular Crew member.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Transfer',
          style: 'destructive',
          onPress: async () => {
            const { seasonService } = await import('../../../src/features/season/services/seasonService');

            const newCaptainResult = await seasonService.updateCrewMemberRoles(
              currentSeason.id,
              newCaptainId,
              [USER_ROLES.CAPTAIN, USER_ROLES.EDITOR]
            );

            if (!newCaptainResult.success) {
              Alert.alert('Error', newCaptainResult.error || 'Could not transfer Captain role');
              return;
            }

            const selfDemoteResult = await seasonService.updateCrewMemberRoles(
              currentSeason.id,
              currentUserCrew.id,
              [USER_ROLES.CREW]
            );

            if (!selfDemoteResult.success) {
              Alert.alert('Error', 'Captain role transferred but could not demote yourself.');
              return;
            }

            Alert.alert('Success', `${newCaptainName} is now Captain.`);
          },
        },
      ]
    );
  };

  const handleClearInviteCode = () => {
    setLastInviteCode(null);
  };

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
        <Text style={styles.headerTitle}>CREW MANAGEMENT</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Invite Section - Only for Captain */}
        {isCurrentUserCaptain && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>INVITE NEW MEMBER</Text>

            {lastInviteCode ? (
              <View style={styles.inviteCodeCard}>
                <Text style={styles.inviteCodeLabel}>INVITE CODE</Text>
                <Text style={styles.inviteCodeValue}>{lastInviteCode}</Text>
                <Text style={styles.inviteCodeHint}>Share this code with the new crew member</Text>
                <Pressable
                  style={({ pressed }) => [
                    styles.primaryButton,
                    pressed && styles.buttonPressed,
                  ]}
                  onPress={handleClearInviteCode}
                >
                  <Text style={styles.primaryButtonText}>DONE</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.inviteRow}>
                <View style={styles.inviteInputContainer}>
                  <BrutInput
                    placeholder="email@example.com"
                    value={inviteEmail}
                    onChangeText={setInviteEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isInviting}
                  />
                </View>
                <Pressable
                  style={({ pressed }) => [
                    styles.inviteButton,
                    (isInviting || !inviteEmail.trim()) && styles.buttonDisabled,
                    pressed && !isInviting && inviteEmail.trim() && styles.buttonPressed,
                  ]}
                  onPress={handleSendInvite}
                  disabled={isInviting || !inviteEmail.trim()}
                >
                  {isInviting ? (
                    <ActivityIndicator color={COLORS.foreground} size="small" />
                  ) : (
                    <Text style={styles.inviteButtonText}>INVITE</Text>
                  )}
                </Pressable>
              </View>
            )}
          </View>
        )}

        {/* Crew Members */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>CREW ({crewMembers.length})</Text>
          {crewMembers.map((member) => (
            <CrewMemberItem
              key={member.id}
              member={member}
              isCurrentUser={member.id === currentUserCrew?.id}
              isCaptain={isCurrentUserCaptain}
              onChangeRole={handleChangeRole}
              onRemove={handleRemoveMember}
              onTransferCaptain={handleTransferCaptain}
            />
          ))}
        </View>

        {/* Pending Invites */}
        {isCurrentUserCaptain && pendingInvites.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>PENDING ({pendingInvites.length})</Text>
            {pendingInvites.map((invite) => (
              <PendingInviteItem
                key={invite.id}
                invite={invite}
                onDelete={handleDeleteInvite}
              />
            ))}
          </View>
        )}

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

  // Sections
  section: {
    marginBottom: SPACING.lg,
  },
  sectionLabel: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
    letterSpacing: TYPOGRAPHY.letterSpacing.widest,
    marginBottom: SPACING.sm,
  },

  // Invite Section
  inviteRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  inviteInputContainer: {
    flex: 1,
  },
  inviteButton: {
    backgroundColor: COLORS.accent,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    paddingHorizontal: SPACING.lg,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: SPACING.md + SPACING.xs, // Align with input
    height: 44,
    ...SHADOWS.brutSm,
  },
  inviteButtonText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.foreground,
    textTransform: 'uppercase',
  },

  // Invite Code Card
  inviteCodeCard: {
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    padding: SPACING.lg,
    alignItems: 'center',
    ...SHADOWS.brut,
  },
  inviteCodeLabel: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
    marginBottom: SPACING.xs,
  },
  inviteCodeValue: {
    fontFamily: FONTS.mono,
    fontSize: 32,
    color: COLORS.primary,
    fontWeight: '700',
    letterSpacing: 4,
    marginBottom: SPACING.sm,
  },
  inviteCodeHint: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },

  // Primary Button
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xl,
  },
  primaryButtonText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
    textTransform: 'uppercase',
  },

  // Crew Card
  crewCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.brut,
  },

  // Avatar - SQUARE
  avatar: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.none, // SQUARE!
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  avatarText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.cardTitle,
    color: COLORS.foreground,
  },

  // Crew Info
  crewInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  crewName: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
  },
  youBadge: {
    backgroundColor: COLORS.accent,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
  },
  youBadgeText: {
    fontFamily: FONTS.mono,
    fontSize: 10,
    color: COLORS.foreground,
    fontWeight: '600',
  },
  crewEmail: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
    marginTop: 2,
  },
  rolesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },
  roleBadge: {
    backgroundColor: COLORS.muted,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
  },
  roleBadgeText: {
    fontFamily: FONTS.mono,
    fontSize: 10,
    color: COLORS.foreground,
  },
  captainRoleBadge: {
    backgroundColor: COLORS.primaryLight,
  },
  captainRoleText: {
    color: COLORS.foreground,
  },
  editorRoleBadge: {
    backgroundColor: COLORS.accent,
  },
  editorRoleText: {
    color: COLORS.foreground,
  },

  // Actions Column
  actionsColumn: {
    gap: SPACING.xs,
    alignItems: 'flex-end',
  },
  actionButton: {
    borderWidth: BORDERS.thin,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    minWidth: 60,
    alignItems: 'center',
  },
  actionButtonText: {
    fontFamily: FONTS.mono,
    fontSize: 10,
    color: COLORS.foreground,
  },
  actionButtonEmoji: {
    fontSize: 14,
  },
  captainTransferButton: {
    backgroundColor: COLORS.primaryLight,
  },
  editorButton: {
    backgroundColor: COLORS.muted,
  },
  editorActiveButton: {
    backgroundColor: COLORS.accent,
  },
  editorActiveText: {
    fontWeight: '600',
  },
  removeButton: {
    backgroundColor: COLORS.destructive,
  },
  removeButtonText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.card,
  },

  // Pending Invite Card
  inviteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
    borderRadius: BORDER_RADIUS.none,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.brutSm,
  },
  inviteIcon: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.none,
    backgroundColor: COLORS.muted,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.foreground,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  inviteIconText: {
    fontSize: 18,
  },
  inviteInfo: {
    flex: 1,
  },
  inviteEmail: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
  },
  inviteCode: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
    letterSpacing: 1,
  },
  deleteButton: {
    backgroundColor: COLORS.muted,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  deleteButtonText: {
    fontFamily: FONTS.mono,
    fontSize: 10,
    color: COLORS.destructive,
    fontWeight: '600',
  },

  // Common
  buttonPressed: {
    transform: ANIMATION.pressedTransform,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
