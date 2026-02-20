/**
 * Crew Management Screen
 *
 * View and manage crew members.
 * Captain can add/remove crew and change roles.
 */

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Header, HeaderTextAction } from '../../../src/components/layout';
import { Button } from '../../../src/components/ui';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../../src/config/theme';
import { useSeason } from '../../../src/features/season/hooks/useSeason';
import { USER_ROLES, type UserRole } from '../../../src/constants/userRoles';
import type { CrewMember, SeasonInvite } from '../../../src/features/season/types';

interface CrewMemberItemProps {
  member: CrewMember;
  isCurrentUser: boolean;
  isCaptain: boolean;
  onChangeRole: (memberId: string, newRoles: UserRole[]) => void;
  onRemove: (memberId: string) => void;
}

function CrewMemberItem({
  member,
  isCurrentUser,
  isCaptain,
  onChangeRole,
  onRemove,
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
      'Ukloni člana',
      `Jeste li sigurni da želite ukloniti ${member.name}?`,
      [
        { text: 'Odustani', style: 'cancel' },
        {
          text: 'Ukloni',
          style: 'destructive',
          onPress: () => onRemove(member.id),
        },
      ]
    );
  };

  return (
    <View style={styles.crewItem}>
      <View style={[styles.crewAvatar, { backgroundColor: member.color }]}>
        <Text style={styles.crewAvatarText}>{member.name.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={styles.crewInfo}>
        <View style={styles.crewNameRow}>
          <Text style={styles.crewName}>{member.name}</Text>
          {isCurrentUser && <Text style={styles.youBadge}>Vi</Text>}
        </View>
        <Text style={styles.crewEmail}>{member.email}</Text>
        <View style={styles.rolesRow}>
          {member.roles.map((role) => (
            <View
              key={role}
              style={[
                styles.roleBadge,
                role === USER_ROLES.CAPTAIN && styles.captainBadge,
                role === USER_ROLES.EDITOR && styles.editorBadge,
              ]}
            >
              <Text style={styles.roleBadgeText}>{role}</Text>
            </View>
          ))}
        </View>
      </View>
      {isCaptain && !isMemberCaptain && !isCurrentUser && (
        <View style={styles.crewActions}>
          <Pressable style={styles.actionButton} onPress={handleToggleEditor}>
            <Text style={styles.actionButtonText}>
              {isEditor ? 'Ukloni Editor' : 'Dodaj Editor'}
            </Text>
          </Pressable>
          <Pressable style={[styles.actionButton, styles.removeButton]} onPress={handleRemove}>
            <Text style={styles.removeButtonText}>Ukloni</Text>
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
      'Obriši pozivnicu',
      `Jeste li sigurni da želite obrisati pozivnicu za ${invite.email}?`,
      [
        { text: 'Odustani', style: 'cancel' },
        {
          text: 'Obriši',
          style: 'destructive',
          onPress: () => onDelete(invite.id),
        },
      ]
    );
  };

  return (
    <View style={styles.inviteItem}>
      <View style={styles.inviteIcon}>
        <Text>📧</Text>
      </View>
      <View style={styles.inviteInfo}>
        <Text style={styles.inviteEmail}>{invite.email}</Text>
        <Text style={styles.inviteCode}>Kod: {invite.inviteCode}</Text>
      </View>
      <Pressable style={styles.deleteInviteButton} onPress={handleDelete}>
        <Text style={styles.deleteInviteText}>Obriši</Text>
      </Pressable>
    </View>
  );
}

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

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [lastInviteCode, setLastInviteCode] = useState<string | null>(null);

  const handleSendInvite = async () => {
    if (!inviteEmail.trim()) {
      Alert.alert('Greška', 'Unesite email adresu');
      return;
    }

    setIsInviting(true);
    const result = await sendInvite({ email: inviteEmail.trim() });
    setIsInviting(false);

    if (result.success && result.inviteCode) {
      setLastInviteCode(result.inviteCode);
      setInviteEmail('');
    } else {
      Alert.alert('Greška', result.error || 'Nije moguće poslati pozivnicu');
    }
  };

  const handleChangeRole = async (memberId: string, newRoles: UserRole[]) => {
    const { seasonService } = await import('../../../src/features/season/services/seasonService');
    if (!currentSeason) return;

    const result = await seasonService.updateCrewMemberRoles(currentSeason.id, memberId, newRoles);
    if (!result.success) {
      Alert.alert('Greška', result.error || 'Nije moguće promijeniti ulogu');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    const result = await removeCrewMember(memberId);
    if (!result.success) {
      Alert.alert('Greška', result.error || 'Nije moguće ukloniti člana');
    }
  };

  const handleDeleteInvite = async (inviteId: string) => {
    const result = await deleteInvite(inviteId);
    if (!result.success) {
      Alert.alert('Greška', result.error || 'Nije moguće obrisati pozivnicu');
    }
  };

  return (
    <Screen noPadding>
      <Header
        title="Posada"
        showBack
        onBack={() => router.back()}
        rightAction={
          isCurrentUserCaptain
            ? <HeaderTextAction label="Pozovi" onPress={() => setShowInviteModal(true)} />
            : undefined
        }
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Crew Members */}
        <Text style={styles.sectionTitle}>ČLANOVI POSADE ({crewMembers.length})</Text>
        {crewMembers.map((member) => (
          <CrewMemberItem
            key={member.id}
            member={member}
            isCurrentUser={member.id === currentUserCrew?.id}
            isCaptain={isCurrentUserCaptain}
            onChangeRole={handleChangeRole}
            onRemove={handleRemoveMember}
          />
        ))}

        {/* Pending Invites */}
        {isCurrentUserCaptain && pendingInvites.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>NA ČEKANJU ({pendingInvites.length})</Text>
            {pendingInvites.map((invite) => (
              <PendingInviteItem
                key={invite.id}
                invite={invite}
                onDelete={handleDeleteInvite}
              />
            ))}
          </>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Invite Modal */}
      <Modal visible={showInviteModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Pozovi člana posade</Text>

            {lastInviteCode ? (
              <>
                <View style={styles.inviteCodeBox}>
                  <Text style={styles.inviteCodeLabel}>Pozivni kod:</Text>
                  <Text style={styles.inviteCodeValue}>{lastInviteCode}</Text>
                </View>
                <Text style={styles.inviteCodeHint}>
                  Podijelite ovaj kod s novim članom posade
                </Text>
                <Button
                  variant="primary"
                  onPress={() => {
                    setShowInviteModal(false);
                    setLastInviteCode(null);
                  }}
                  style={styles.modalButton}
                >
                  Zatvori
                </Button>
              </>
            ) : (
              <>
                <Text style={styles.modalLabel}>Email adresa</Text>
                <TextInput
                  style={styles.modalInput}
                  value={inviteEmail}
                  onChangeText={setInviteEmail}
                  placeholder="email@primjer.com"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <View style={styles.modalButtons}>
                  <Button
                    variant="ghost"
                    onPress={() => {
                      setShowInviteModal(false);
                      setInviteEmail('');
                    }}
                    style={styles.modalButtonHalf}
                  >
                    Odustani
                  </Button>
                  <Button
                    variant="primary"
                    onPress={handleSendInvite}
                    disabled={isInviting || !inviteEmail.trim()}
                    style={styles.modalButtonHalf}
                  >
                    {isInviting ? 'Šaljem...' : 'Pošalji'}
                  </Button>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  crewItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  crewAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  crewAvatarText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.white,
  },
  crewInfo: {
    flex: 1,
  },
  crewNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  crewName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  youBadge: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.coral,
    fontWeight: '600',
    backgroundColor: `${COLORS.coral}20`,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  crewEmail: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  rolesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },
  roleBadge: {
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.border,
  },
  captainBadge: {
    backgroundColor: `${COLORS.coral}20`,
  },
  editorBadge: {
    backgroundColor: `${COLORS.sageGreen}20`,
  },
  roleBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '500',
    color: COLORS.textSecondary,
    textTransform: 'capitalize',
  },
  crewActions: {
    gap: SPACING.xs,
  },
  actionButton: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.border,
  },
  actionButtonText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  removeButton: {
    backgroundColor: `${COLORS.error}15`,
  },
  removeButtonText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.error,
  },
  inviteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.warning,
  },
  inviteIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${COLORS.warning}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  inviteInfo: {
    flex: 1,
  },
  inviteEmail: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
  },
  inviteCode: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    fontFamily: 'monospace',
  },
  deleteInviteButton: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  deleteInviteText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.error,
  },
  bottomSpacer: {
    height: SPACING.xl,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  modalTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  modalLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  modalInput: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    fontSize: FONT_SIZES.lg,
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  modalButton: {
    marginTop: SPACING.md,
  },
  modalButtonHalf: {
    flex: 1,
  },
  inviteCodeBox: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  inviteCodeLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  inviteCodeValue: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.coral,
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  inviteCodeHint: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
});
