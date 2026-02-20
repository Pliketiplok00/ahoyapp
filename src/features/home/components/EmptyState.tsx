/**
 * EmptyState Component
 *
 * Displayed when there are no bookings in the current season.
 */

import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../../config/theme';

interface EmptyStateProps {
  type: 'no-season' | 'no-bookings' | 'season-complete';
  testID?: string;
}

/**
 * Get empty state content based on type
 */
export function getEmptyStateContent(type: EmptyStateProps['type']): {
  icon: string;
  title: string;
  message: string;
  actionLabel?: string;
  actionRoute?: string;
} {
  switch (type) {
    case 'no-season':
      return {
        icon: '\u{1F4C5}', // Calendar
        title: 'No Active Season',
        message: 'Create a new season to start tracking your bookings.',
        actionLabel: 'Create Season',
        actionRoute: '/season/create',
      };
    case 'no-bookings':
      return {
        icon: '\u{26F5}', // Sailboat
        title: 'No Bookings Yet',
        message: 'Your booking radar is clear. Add your first booking to get started.',
        actionLabel: 'Add Booking',
        actionRoute: '/booking/new',
      };
    case 'season-complete':
      return {
        icon: '\u{1F3C6}', // Trophy
        title: 'Season Complete!',
        message: 'All bookings finished. Great work this season!',
      };
  }
}

export function EmptyState({ type, testID }: EmptyStateProps) {
  const router = useRouter();
  const content = getEmptyStateContent(type);

  const handleAction = () => {
    if (content.actionRoute) {
      router.push(content.actionRoute as never);
    }
  };

  return (
    <View style={styles.container} testID={testID}>
      <Text style={styles.icon}>{content.icon}</Text>
      <Text style={styles.title}>{content.title}</Text>
      <Text style={styles.message}>{content.message}</Text>

      {content.actionLabel && (
        <Pressable style={styles.actionButton} onPress={handleAction}>
          <Text style={styles.actionButtonText}>{content.actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  icon: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  message: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.lg,
  },
  actionButton: {
    backgroundColor: COLORS.coral,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  actionButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.white,
  },
});
