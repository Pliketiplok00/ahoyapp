/**
 * Booking Detail Screen
 *
 * View and manage a specific booking.
 * Shows booking info, APA, expenses, shopping list.
 */

import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Booking Detail</Text>
        <Text style={styles.id}>ID: {id}</Text>
        <Text style={styles.placeholder}>
          Booking detail screen - To be implemented in Phase 4
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
