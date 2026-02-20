/**
 * Screen Component
 *
 * Neo-brutalist screen wrapper providing consistent layout.
 * Handles safe area, background color, and optional scroll behavior.
 *
 * @see docs/Ahoy_DESIGN_RULES.md - Screen Layout
 * @see docs/Ahoy_UI_ELEMENTS.md - Global Shell
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
import { COLORS, SPACING } from '../../config/theme';

/**
 * Screen props interface
 */
interface ScreenProps {
  /** Screen content */
  children: ReactNode;
  /** Optional header component (e.g., PageHeader) */
  header?: ReactNode;
  /** Enable scrolling (default: false) */
  scrollable?: boolean;
  /** Add horizontal padding (default: true) */
  padded?: boolean;
  /** @deprecated Use padded={false} instead */
  noPadding?: boolean;
  /** Background color (default: COLORS.background) */
  backgroundColor?: string;
  /** Custom style for the container */
  style?: ViewStyle;
  /** Safe area edges to respect (default: all) */
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}

/**
 * Screen - Neo-brutalist screen wrapper
 *
 * @example
 * // Basic screen with padding
 * <Screen>
 *   <Text>Content</Text>
 * </Screen>
 *
 * @example
 * // Scrollable screen with header
 * <Screen
 *   header={<PageHeader title="Settings" onBack={() => router.back()} />}
 *   scrollable
 * >
 *   <Text>Scrollable content</Text>
 * </Screen>
 *
 * @example
 * // Screen without padding (for full-width content)
 * <Screen padded={false}>
 *   <Image style={{ width: '100%' }} />
 * </Screen>
 */
export function Screen({
  children,
  header,
  scrollable = false,
  padded = true,
  noPadding,
  backgroundColor = COLORS.background,
  style,
  edges = ['top', 'bottom', 'left', 'right'],
}: ScreenProps) {
  // Handle backwards compatibility: noPadding takes precedence if specified
  const shouldPad = noPadding !== undefined ? !noPadding : padded;

  const contentStyle = [
    styles.content,
    shouldPad && styles.padded,
    style,
  ];

  const scrollContentStyle = [
    styles.scrollContent,
    shouldPad && styles.padded,
  ];

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor }]}
      edges={edges}
      testID="screen"
    >
      <StatusBar barStyle="dark-content" />

      {/* Optional header */}
      {header}

      {/* Content */}
      {scrollable ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={scrollContentStyle}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          testID="screen-scroll"
        >
          {children}
        </ScrollView>
      ) : (
        <View style={contentStyle} testID="screen-content">
          {children}
        </View>
      )}
    </SafeAreaView>
  );
}

/**
 * Base styles (exported for testing)
 */
export const SCREEN_STYLES = {
  backgroundColor: COLORS.background,
  paddingHorizontal: SPACING.md,
} as const;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: SCREEN_STYLES.backgroundColor,
  },
  content: {
    flex: 1,
  },
  padded: {
    paddingHorizontal: SCREEN_STYLES.paddingHorizontal,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
