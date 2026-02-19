/**
 * Home Screen (Booking Radar)
 *
 * Main dashboard showing active booking, upcoming bookings,
 * and horizon information (days off, season progress).
 */

import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../../src/config/theme';
import { Screen } from '../../../src/components/layout';

export default function HomeScreen() {
  return (
    <Screen noPadding edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Ahoy, Crew!</Text>
        <Text style={styles.boatName}>M/Y Example Boat</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Active Booking Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ACTIVE BOOKING</Text>
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>⛵</Text>
            <Text style={styles.emptyTitle}>No active booking</Text>
            <Text style={styles.emptySubtitle}>
              Add your first booking to get started
            </Text>
          </View>
        </View>

        {/* Horizon Info */}
        <View style={styles.horizonInfo}>
          <Text style={styles.horizonText}>📊 Season ready to start</Text>
        </View>

        {/* Next Up */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>NEXT UP</Text>
          <Text style={styles.placeholder}>
            Upcoming bookings will appear here
          </Text>
        </View>
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
  greeting: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  boatName: {
    fontSize: FONT_SIZES.md,
    color: COLORS.white,
    opacity: 0.9,
    marginTop: SPACING.xs,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
  },
  emptyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  horizonInfo: {
    backgroundColor: `${COLORS.success}15`,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  horizonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  placeholder: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
});
