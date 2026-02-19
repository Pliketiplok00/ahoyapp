/**
 * Screen Component
 *
 * Reusable wrapper for all screens providing consistent layout.
 * Handles safe area, background color, and optional scroll behavior.
 */

import { ReactNode } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ViewStyle,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../config/theme';

interface ScreenProps {
  children: ReactNode;
  /** Enable scrolling (default: false) */
  scroll?: boolean;
  /** Background color (default: white) */
  backgroundColor?: string;
  /** Remove default padding (default: false) */
  noPadding?: boolean;
  /** Custom style for the container */
  style?: ViewStyle;
  /** Safe area edges to respect (default: all) */
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}

export function Screen({
  children,
  scroll = false,
  backgroundColor = COLORS.background,
  noPadding = false,
  style,
  edges = ['top', 'bottom', 'left', 'right'],
}: ScreenProps) {
  const containerStyle = [
    styles.container,
    { backgroundColor },
    !noPadding && styles.padding,
    style,
  ];

  const content = scroll ? (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={[styles.scrollContent, !noPadding && styles.padding]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={containerStyle}>{children}</View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]} edges={edges}>
      <StatusBar barStyle="dark-content" />
      {scroll ? content : <View style={containerStyle}>{children}</View>}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  padding: {
    paddingHorizontal: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
