/**
 * Logs Tab Screen (Placeholder)
 *
 * Zapisnici - logs and records for crew.
 * Will include: Defect Log, Wish List, Storage Map.
 */

import { View, Text, StyleSheet } from 'react-native';
import { ClipboardList } from 'lucide-react-native';
import {
  COLORS,
  SPACING,
  FONTS,
  TYPOGRAPHY,
  BORDERS,
  BORDER_RADIUS,
  SHADOWS,
} from '@/config/theme';
import { useAppTranslation } from '@/i18n';
import { AhoyLogo } from '@/components/ui';

export default function LogsScreen() {
  const { t } = useAppTranslation();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <AhoyLogo />
        <Text style={styles.headerTitle}>{t('nav.logs')}</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <ClipboardList size={48} color={COLORS.primary} strokeWidth={2} />
        </View>
        <Text style={styles.title}>{t('nav.logs')}</Text>
        <Text style={styles.subtitle}>{t('placeholder.comingSoon')}</Text>
        <Text style={styles.description}>{t('placeholder.logsDescription')}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
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
    marginTop: SPACING.xs,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  iconContainer: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    marginBottom: SPACING.lg,
    ...SHADOWS.brut,
  },
  title: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.sectionTitle,
    color: COLORS.foreground,
    letterSpacing: TYPOGRAPHY.letterSpacing.wide,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.cardTitle,
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  description: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.mutedForeground,
    textAlign: 'center',
  },
});
