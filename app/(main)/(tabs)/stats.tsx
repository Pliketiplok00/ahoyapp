/**
 * Stats Screen (Season Insights)
 *
 * Overview of season statistics: total APA, expenses,
 * tips, top merchants, booking comparisons.
 */

import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function StatsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
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
            <View style={styles.statItem}>
              <Text style={styles.statValue}>0,00 €</Text>
              <Text style={styles.statLabel}>Prosječna napojnica</Text>
            </View>
          </View>
        </View>

        {/* Placeholder */}
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>
            Season statistics will appear here once you have completed bookings.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#E85D3B',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  seasonCard: {
    backgroundColor: '#F5B800',
    padding: 24,
  },
  seasonTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    letterSpacing: 0.5,
    marginBottom: 16,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  statLabel: {
    fontSize: 12,
    color: '#4A4A4A',
    marginTop: 4,
  },
  placeholder: {
    padding: 24,
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 14,
    color: '#7A7A7A',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
