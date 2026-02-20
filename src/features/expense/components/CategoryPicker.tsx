/**
 * CategoryPicker Component
 *
 * Horizontal picker for selecting expense category.
 * Shows category emoji and label.
 */

import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../../config/theme';
import { EXPENSE_CATEGORIES, type ExpenseCategory } from '../../../config/expenses';

interface CategoryPickerProps {
  value: ExpenseCategory;
  onChange: (category: ExpenseCategory) => void;
  testID?: string;
}

export function CategoryPicker({ value, onChange, testID }: CategoryPickerProps) {
  return (
    <View testID={testID}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {EXPENSE_CATEGORIES.map((category) => {
          const isSelected = value === category.id;

          return (
            <Pressable
              key={category.id}
              style={[
                styles.categoryButton,
                isSelected && styles.categoryButtonSelected,
              ]}
              onPress={() => onChange(category.id)}
              testID={`category-${category.id}`}
            >
              <Text style={styles.categoryEmoji}>{category.emoji}</Text>
              <Text
                style={[
                  styles.categoryLabel,
                  isSelected && styles.categoryLabelSelected,
                ]}
              >
                {category.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

/**
 * Compact category chip for display only
 */
export function CategoryChip({
  category,
  testID,
}: {
  category: ExpenseCategory;
  testID?: string;
}) {
  const categoryData = EXPENSE_CATEGORIES.find((c) => c.id === category);

  if (!categoryData) return null;

  return (
    <View style={styles.chip} testID={testID}>
      <Text style={styles.chipEmoji}>{categoryData.emoji}</Text>
      <Text style={styles.chipLabel}>{categoryData.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryButtonSelected: {
    backgroundColor: `${COLORS.coral}15`,
    borderColor: COLORS.coral,
  },
  categoryEmoji: {
    fontSize: 20,
    marginRight: SPACING.xs,
  },
  categoryLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  categoryLabelSelected: {
    color: COLORS.coral,
    fontWeight: '600',
  },
  // Chip styles
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
  },
  chipEmoji: {
    fontSize: FONT_SIZES.sm,
    marginRight: 4,
  },
  chipLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
});
