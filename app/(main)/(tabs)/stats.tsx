/**
 * Stats Screen (Season Insights)
 *
 * Overview of season statistics: total APA, expenses,
 * tips, top merchants, booking comparisons.
 */

import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Screen } from '../../../src/components/layout';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../../src/config/theme';

export default function StatsScreen() {
  return (
    <Screen noPadding edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Stats</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Season Overview */}
        <View style={styles.seasonCard}>
          <Text style={styles.seasonTitle}>SEZONA 2026</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Radni dani</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>0,00 €</Text>
              <Text style={styles.statLabel}>Prosječna napojnica</Text>
            </View>
          </View>
        </View>

        {/* Quick Stats Grid */}
        <View style={styles.quickStats}>
          <View style={styles.quickStatCard}>
            <Text style={styles.quickStatIcon}>📋</Text>
            <Text style={styles.quickStatValue}>0</Text>
            <Text style={styles.quickStatLabel}>Bookings</Text>
          </View>
          <View style={styles.quickStatCard}>
            <Text style={styles.quickStatIcon}>🧾</Text>
            <Text style={styles.quickStatValue}>0</Text>
            <Text style={styles.quickStatLabel}>Expenses</Text>
          </View>
          <View style={styles.quickStatCard}>
            <Text style={styles.quickStatIcon}>💰</Text>
            <Text style={styles.quickStatValue}>0,00 €</Text>
            <Text style={styles.quickStatLabel}>Total APA</Text>
          </View>
          <View style={styles.quickStatCard}>
            <Text style={styles.quickStatIcon}>💵</Text>
            <Text style={styles.quickStatValue}>0,00 €</Text>
            <Text style={styles.quickStatLabel}>Total Tips</Text>
          </View>
        </View>

        {/* Placeholder */}
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>
            Season statistics will appear here once you have completed bookings.
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
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  content: {
    flex: 1,
  },
  seasonCard: {
    backgroundColor: COLORS.warmYellow,
    padding: SPACING.lg,
  },
  seasonTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
    letterSpacing: 0.5,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  statValue: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  quickStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  quickStatCard: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
  },
  quickStatIcon: {
    fontSize: 28,
    marginBottom: SPACING.xs,
  },
  quickStatValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  quickStatLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  placeholder: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
