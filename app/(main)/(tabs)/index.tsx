/**
 * Home Screen (Booking Radar)
 *
 * Main dashboard showing active booking, upcoming bookings,
 * and horizon information (days off, season progress).
 */

import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Ahoy, Crew!</Text>
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
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7A7A7A',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  emptyCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#7A7A7A',
    textAlign: 'center',
  },
  horizonInfo: {
    backgroundColor: '#F0F9F0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
  },
  horizonText: {
    fontSize: 14,
    color: '#4A4A4A',
  },
  placeholder: {
    fontSize: 14,
    color: '#7A7A7A',
    fontStyle: 'italic',
  },
});
