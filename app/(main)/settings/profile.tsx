/**
 * Profile Settings Screen (Brutalist)
 *
 * View user profile information.
 * Shows email (read-only), name, role, and avatar color.
 */

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
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
} from '@/config/theme';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useSeason } from '@/features/season/hooks/useSeason';

export default function ProfileScreen() {
  const router = useRouter();
  const { firebaseUser } = useAuth();
  const { currentUserCrew, currentSeason } = useSeason();

  // User data
  const userEmail = firebaseUser?.email || 'anonymous@user';
  const userName = currentUserCrew?.name || firebaseUser?.email?.split('@')[0] || 'Korisnik';
  const userColor = currentUserCrew?.color || COLORS.primary;
  const userRoles = currentUserCrew?.roles?.join(', ') || 'Crew';
  const boatName = currentSeason?.boatName || 'N/A';
  const seasonName = currentSeason?.name || 'N/A';
  const avatarInitial = userName.charAt(0).toUpperCase();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>PROFIL</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={[styles.avatar, { backgroundColor: userColor }]}>
            <Text style={styles.avatarText}>{avatarInitial}</Text>
          </View>
          <Text style={styles.userName}>{userName.toUpperCase()}</Text>
          <Text style={styles.userRole}>{userRoles}</Text>
        </View>

        {/* Info Section */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>PODACI O KORISNIKU</Text>

          {/* Email */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>EMAIL ADRESA</Text>
            <View style={styles.readOnlyField}>
              <Text style={styles.readOnlyText}>{userEmail}</Text>
            </View>
          </View>

          {/* Display Name */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>IME ZA PRIKAZ</Text>
            <View style={styles.readOnlyField}>
              <Text style={styles.readOnlyText}>{userName}</Text>
            </View>
          </View>

          {/* Role */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>ULOGA</Text>
            <View style={styles.readOnlyField}>
              <Text style={styles.readOnlyText}>{userRoles.toUpperCase()}</Text>
            </View>
            <Text style={styles.fieldHint}>
              Ulogu može promijeniti samo kapetan
            </Text>
          </View>
        </View>

        {/* Season Info */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>TRENUTNA SEZONA</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>BROD</Text>
            <View style={styles.readOnlyField}>
              <Text style={styles.readOnlyText}>{boatName}</Text>
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>SEZONA</Text>
            <View style={styles.readOnlyField}>
              <Text style={styles.readOnlyText}>{seasonName}</Text>
            </View>
          </View>
        </View>

        {/* Avatar Color Info */}
        <View style={styles.infoBox}>
          <Text style={styles.infoBoxTitle}>O BOJI AVATARA</Text>
          <Text style={styles.infoBoxText}>
            Boja avatara se automatski dodjeljuje svakom članu posade i koristi se
            za označavanje aktivnosti na shopping listi i drugim dijelovima aplikacije.
          </Text>
        </View>

        {/* Bottom spacing */}
        <View style={{ height: SPACING.xxl * 2 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
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
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  headerTitle: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.cardTitle,
    color: COLORS.foreground,
  },
  headerSpacer: {
    width: 40,
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
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.cardTitle,
    color: COLORS.foreground,
  },

  // ScrollView
  scrollView: {
    flex: 1,
    padding: SPACING.md,
  },

  // Avatar Section
  avatarSection: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    marginBottom: SPACING.md,
    ...SHADOWS.brut,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: BORDER_RADIUS.none,
    borderWidth: BORDERS.heavy,
    borderColor: COLORS.foreground,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.brut,
  },
  avatarText: {
    fontFamily: FONTS.display,
    fontSize: 48,
    color: COLORS.white,
  },
  userName: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.sectionTitle,
    color: COLORS.foreground,
    marginTop: SPACING.md,
  },
  userRole: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.mutedForeground,
    marginTop: SPACING.xxs,
  },

  // Form Section
  formSection: {
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.brut,
  },
  sectionTitle: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
    letterSpacing: 1,
    marginBottom: SPACING.md,
  },

  // Field Group
  fieldGroup: {
    marginBottom: SPACING.md,
  },
  fieldLabel: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.foreground,
    letterSpacing: 0.5,
    marginBottom: SPACING.xs,
  },
  fieldHint: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.meta,
    color: COLORS.mutedForeground,
    marginTop: SPACING.xs,
  },

  // Read-only Field
  readOnlyField: {
    backgroundColor: COLORS.muted,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.mutedForeground,
    borderRadius: BORDER_RADIUS.none,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  readOnlyText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
  },

  // Info Box
  infoBox: {
    backgroundColor: COLORS.muted,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    padding: SPACING.md,
  },
  infoBoxTitle: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.foreground,
    letterSpacing: 0.5,
    marginBottom: SPACING.xs,
  },
  infoBoxText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.mutedForeground,
    lineHeight: 20,
  },

  // Pressed
  pressed: {
    transform: ANIMATION.pressedTransform,
  },
});
