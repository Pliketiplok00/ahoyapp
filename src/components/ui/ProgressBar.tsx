/**
 * ProgressBar Component
 *
 * Neo-brutalist progress bar.
 * Used for APA spending, season progress, etc.
 *
 * @example
 * <ProgressBar progress={45} />
 * <ProgressBar progress={75} fillColor={COLORS.accent} />
 */

import React from 'react';
import { View, StyleSheet, ViewStyle, DimensionValue } from 'react-native';
import {
  COLORS,
  SPACING,
  BORDER_RADIUS,
} from '../../config/theme';

export interface ProgressBarProps {
  /** Progress percentage (0-100) */
  progress: number;
  /** Track background color */
  trackColor?: string;
  /** Fill color */
  fillColor?: string;
  /** Height of the bar */
  height?: number;
  /** Custom container style */
  style?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
}

/**
 * Clamp progress value between 0 and 100.
 */
export function clampProgress(value: number): number {
  return Math.max(0, Math.min(100, value));
}

/**
 * Get fill width as percentage string.
 */
export function getProgressWidth(progress: number): string {
  return `${clampProgress(progress)}%`;
}

/**
 * Brutalist progress bar with sharp corners.
 */
export function ProgressBar({
  progress,
  trackColor = COLORS.foreground,
  fillColor = COLORS.primary,
  height = SPACING.md,
  style,
  testID,
}: ProgressBarProps) {
  const clampedProgress = clampProgress(progress);
  const widthPercent = `${clampedProgress}%` as DimensionValue;

  return (
    <View
      style={[styles.track, { backgroundColor: trackColor, height }, style]}
      testID={testID}
    >
      <View
        style={[
          styles.fill,
          { backgroundColor: fillColor, width: widthPercent },
        ]}
        testID={testID ? `${testID}-fill` : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    borderRadius: BORDER_RADIUS.none,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: BORDER_RADIUS.none,
  },
});
