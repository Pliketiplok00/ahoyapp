/**
 * SyncIndicator Component
 *
 * Displays sync status for real-time data.
 */

import { View, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../config/theme';

export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error' | 'pending';
export type IndicatorVariant = 'dot' | 'pill' | 'icon-only';

interface SyncIndicatorProps {
  status: SyncStatus;
  variant?: IndicatorVariant;
  /** Show label next to indicator */
  showLabel?: boolean;
  /** Use Croatian labels */
  useCroatian?: boolean;
  /** Number of pending items (optional) */
  pendingCount?: number;
  style?: ViewStyle;
  testID?: string;
}

/**
 * Get indicator color based on sync status
 */
export function getSyncStatusColor(status: SyncStatus): string {
  switch (status) {
    case 'synced':
      return COLORS.success;
    case 'syncing':
      return COLORS.info;
    case 'pending':
      return COLORS.warning;
    case 'offline':
      return COLORS.warning;
    case 'error':
      return COLORS.error;
    default:
      return COLORS.textMuted;
  }
}

/**
 * Get status label
 */
export function getSyncStatusLabel(
  status: SyncStatus,
  useCroatian: boolean,
  pendingCount?: number
): string {
  const labels = {
    synced: useCroatian ? 'Sinkronizirano' : 'Synced',
    syncing: useCroatian ? 'Sinkronizacija...' : 'Syncing...',
    pending: useCroatian
      ? `Na čekanju${pendingCount ? ` (${pendingCount})` : ''}`
      : `Pending${pendingCount ? ` (${pendingCount})` : ''}`,
    offline: useCroatian ? 'Offline' : 'Offline',
    error: useCroatian ? 'Greška' : 'Error',
  };
  return labels[status];
}

/**
 * Get indicator size based on variant
 */
export function getIndicatorSize(variant: IndicatorVariant): number {
  switch (variant) {
    case 'dot':
      return 8;
    case 'pill':
      return 10;
    case 'icon-only':
      return 16;
    default:
      return 8;
  }
}

/**
 * Get variant container styles
 */
export function getVariantStyles(variant: IndicatorVariant, color: string): ViewStyle {
  const baseStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
  };

  switch (variant) {
    case 'dot':
      return baseStyle;
    case 'pill':
      return {
        ...baseStyle,
        backgroundColor: `${color}15`,
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.xs,
        borderRadius: BORDER_RADIUS.full,
      };
    case 'icon-only':
      return baseStyle;
    default:
      return baseStyle;
  }
}

export function SyncIndicator({
  status,
  variant = 'dot',
  showLabel = true,
  useCroatian = true,
  pendingCount,
  style,
  testID,
}: SyncIndicatorProps) {
  const color = getSyncStatusColor(status);
  const label = getSyncStatusLabel(status, useCroatian, pendingCount);
  const dotSize = getIndicatorSize(variant);
  const variantStyles = getVariantStyles(variant, color);

  const renderIndicator = () => {
    if (status === 'syncing') {
      return (
        <ActivityIndicator
          size="small"
          color={color}
          style={styles.spinner}
        />
      );
    }

    return (
      <View
        style={[
          styles.dot,
          {
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            backgroundColor: color,
          },
        ]}
      />
    );
  };

  return (
    <View style={[variantStyles, style]} testID={testID}>
      {renderIndicator()}
      {showLabel && variant !== 'icon-only' && (
        <Text style={[styles.label, { color: variant === 'pill' ? color : COLORS.textSecondary }]}>
          {label}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  dot: {
    marginRight: SPACING.xs,
  },
  spinner: {
    marginRight: SPACING.xs,
  },
  label: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '500',
  },
});
