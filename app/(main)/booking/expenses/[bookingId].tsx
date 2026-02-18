/**
 * Expenses List Screen
 *
 * APA overview and expenses list for a specific booking.
 */

import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ExpensesScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>APA & Expenses</Text>
        <Text style={styles.id}>Booking: {bookingId}</Text>
        <Text style={styles.placeholder}>
          Expenses screen - To be implemented in Phase 6
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    color: '#1A1A1A',
    marginBottom: 8,
  },
  id: {
    fontSize: 14,
    color: '#7A7A7A',
    marginBottom: 16,
  },
  placeholder: {
    fontSize: 14,
    color: '#7A7A7A',
    fontStyle: 'italic',
  },
});
