/**
 * Entry Redirect
 *
 * Initial entry point - renders nothing.
 * AuthGuard in _layout.tsx handles all routing logic.
 */

import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS } from '../src/config/theme';

export default function Index() {
  // AuthGuard in _layout.tsx handles all navigation
  // This screen just shows a loading state until redirect happens
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={COLORS.coral} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.card,
  },
});
