/**
 * Login Screen
 *
 * Magic link email authentication.
 * User enters email, receives magic link, taps to authenticate.
 */

import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Ahoy</Text>
        <Text style={styles.subtitle}>Yacht Crew Expense Tracking</Text>
        <Text style={styles.placeholder}>Login screen - To be implemented in Phase 1</Text>
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
    fontSize: 48,
    fontWeight: 'bold',
    color: '#E85D3B',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#4A4A4A',
    marginBottom: 48,
  },
  placeholder: {
    fontSize: 14,
    color: '#7A7A7A',
  },
});
