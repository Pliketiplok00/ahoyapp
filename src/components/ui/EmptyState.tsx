/**
 * EmptyState Component (Brutalist)
 *
 * Neo-brutalist empty state display.
 * Used when there's no content to show.
 *
 * @example
 * <EmptyState
 *   icon="⛵"
 *   title="No bookings yet"
 *   subtitle="Add your first booking to get started"
 *   actionLabel="+ Add Booking"
 *   onAction={handleAdd}
 * />
 */

import React, { ReactNode } from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle } from 'react-native';
import {
  COLORS,
  SHADOWS,
  BORDERS,
  SPACING,
  TYPOGRAPHY,
  FONTS,
  BORDER_RADIUS,
  ANIMATION,
} from '../../config/theme';

export interface EmptyStateProps {
  /** Icon emoji, character, or React element (Phosphor icon) */
  icon: string | ReactNode;
  /** Title text */
  title: string;
  /** Optional subtitle/description */
  subtitle?: string;
  /** Optional action button label */
  actionLabel?: string;
  /** Action button handler */
  onAction?: () => void;
  /** Custom container style */
  style?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
}

/**
 * Brutalist empty state with centered content.
 */
export function EmptyState({
  icon,
  title,
  subtitle,
  actionLabel,
  onAction,
  style,
  testID,
}: EmptyStateProps) {
  const isStringIcon = typeof icon === 'string';

  return (
    <View style={[styles.container, style]} testID={testID}>
      {isStringIcon ? (
        <Text style={styles.icon}>{icon}</Text>
      ) : (
        <View style={styles.iconContainer}>{icon}</View>
      )}
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {actionLabel && onAction && (
        <Pressable
          style={({ pressed }) => [
            styles.actionButton,
            pressed && styles.pressed,
          ]}
          onPress={onAction}
        >
          <Text style={styles.actionButtonText}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

/**
 * Get icon for common empty state types.
 */
export function getEmptyStateIcon(type: 'bookings' | 'season' | 'expenses' | 'crew'): string {
  switch (type) {
    case 'bookings':
      return '⛵';
    case 'season':
      return '🚢';
    case 'expenses':
      return '💰';
    case 'crew':
      return '👥';
    default:
      return '📭';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl * 2,
    gap: SPACING.lg,
  },
  icon: {
    fontSize: 64,
  },
  iconContainer: {
    marginBottom: SPACING.sm,
  },
  title: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.sectionTitle,
    color: COLORS.foreground,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.mutedForeground,
    textAlign: 'center',
  },
  actionButton: {
    backgroundColor: COLORS.secondary,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    ...SHADOWS.brut,
  },
  actionButtonText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.white,
    textTransform: 'uppercase',
  },
  pressed: {
    transform: ANIMATION.pressedTransform,
  },
});
