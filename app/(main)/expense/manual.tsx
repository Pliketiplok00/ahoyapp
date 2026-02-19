/**
 * Manual Entry Screen
 *
 * Create expense without receipt (no-receipt entry).
 * Generates digital paragon.
 */

import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../../src/config/theme';

export default function ManualEntryScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Manual Entry</Text>
        <Text style={styles.subtitle}>No receipt</Text>
        <Text style={styles.placeholder}>
          Manual entry form - To be implemented in Phase 6
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textMuted,
    marginBottom: 16,
  },
  placeholder: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
});
