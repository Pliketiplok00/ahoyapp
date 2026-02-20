/**
 * Shopping List Screen (Placeholder)
 *
 * POST-MVP: Will display guest preference items for provisioning.
 * Currently shows "Coming soon" placeholder.
 */

import { View, Text, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../../../src/config/theme';
import { Screen } from '../../../../src/components/layout';

export default function ShoppingListScreen() {
  return (
    <Screen noPadding>
      <Stack.Screen options={{ title: 'Shopping List' }} />

      <View style={styles.container}>
        <View style={styles.placeholderCard}>
          <Text style={styles.icon}>{'\u{1F6D2}'}</Text>
          <Text style={styles.title}>Shopping List</Text>
          <Text style={styles.subtitle}>Coming soon</Text>
          <Text style={styles.description}>
            Track guest preferences and provisioning items for each booking.
          </Text>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  placeholderCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    width: '100%',
  },
  icon: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.coral,
    marginBottom: SPACING.md,
  },
  description: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
});
