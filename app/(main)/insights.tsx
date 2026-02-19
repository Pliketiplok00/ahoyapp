/**
 * Insights Screen
 *
 * Detailed season insights and analytics.
 * Calendar view, merchant breakdown, booking comparisons.
 */

import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../src/config/theme';

export default function InsightsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Season Insights</Text>
        <Text style={styles.placeholder}>
          Detailed insights - To be implemented in Post-MVP
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
    marginBottom: 16,
  },
  placeholder: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
});
