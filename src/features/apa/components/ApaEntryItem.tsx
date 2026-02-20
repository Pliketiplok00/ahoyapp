/**
 * ApaEntryItem Component
 *
 * Displays a single APA entry with amount, note, and date.
 * Supports delete action via swipe or button.
 *
 * @example
 * <ApaEntryItem entry={apaEntry} onDelete={handleDelete} />
 */

import { View, Text, StyleSheet, Pressable } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../../config/theme';
import { formatCurrency, formatDate } from '../../../utils/formatting';
import type { ApaEntry } from '../../../types/models';

interface ApaEntryItemProps {
  entry: ApaEntry;
  onDelete?: (entryId: string) => void;
  disabled?: boolean;
}

export function ApaEntryItem({ entry, onDelete, disabled = false }: ApaEntryItemProps) {
  const handleDelete = () => {
    if (!disabled && onDelete) {
      onDelete(entry.id);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.left}>
          <Text style={styles.amount}>{formatCurrency(entry.amount)}</Text>
          {entry.note && <Text style={styles.note}>{entry.note}</Text>}
        </View>
        <View style={styles.right}>
          <Text style={styles.date}>
            {formatDate(entry.createdAt.toDate())}
          </Text>
          {onDelete && !disabled && (
            <Pressable
              onPress={handleDelete}
              style={styles.deleteButton}
              hitSlop={8}
            >
              <Text style={styles.deleteText}>Delete</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: SPACING.md,
  },
  left: {
    flex: 1,
  },
  amount: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  note: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  right: {
    alignItems: 'flex-end',
  },
  date: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
  deleteButton: {
    marginTop: SPACING.xs,
    paddingVertical: SPACING.xs,
  },
  deleteText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.error,
    fontWeight: '500',
  },
});
