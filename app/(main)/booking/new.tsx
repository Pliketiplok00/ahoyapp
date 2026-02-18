/**
 * New Booking Screen
 *
 * Create a new booking with arrival/departure dates,
 * guest count, notes, and preference PDF.
 */

import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NewBookingScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>New Booking</Text>
        <Text style={styles.placeholder}>
          New booking form - To be implemented in Phase 4
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
    marginBottom: 16,
  },
  placeholder: {
    fontSize: 14,
    color: '#7A7A7A',
    fontStyle: 'italic',
  },
});
