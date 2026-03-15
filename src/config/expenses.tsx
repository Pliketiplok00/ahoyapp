/**
 * Expense Configuration
 *
 * Categories, defaults, and expense-related settings.
 */

import React from 'react';
import { ForkKnife, GasPump, Anchor, Package, type IconProps } from 'phosphor-react-native';

export const EXPENSE_CATEGORIES = [
  { id: 'food', label: 'Food & Beverage', iconName: 'ForkKnife' as const },
  { id: 'fuel', label: 'Fuel', iconName: 'GasPump' as const },
  { id: 'mooring', label: 'Mooring', iconName: 'Anchor' as const },
  { id: 'other', label: 'Other', iconName: 'Package' as const },
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number]['id'];
export type CategoryIconName = (typeof EXPENSE_CATEGORIES)[number]['iconName'];

export const EXPENSE_DEFAULTS = {
  category: 'other' as ExpenseCategory,
  currency: 'EUR',
} as const;

/**
 * Get expense category by ID
 */
export function getExpenseCategory(id: ExpenseCategory) {
  return EXPENSE_CATEGORIES.find((cat) => cat.id === id);
}

/**
 * Render category icon component
 */
export function CategoryIcon({
  category,
  size = 20,
  color,
  weight = 'bold',
}: {
  category: ExpenseCategory;
  size?: number;
  color?: string;
  weight?: IconProps['weight'];
}) {
  switch (category) {
    case 'food':
      return <ForkKnife size={size} color={color} weight={weight} />;
    case 'fuel':
      return <GasPump size={size} color={color} weight={weight} />;
    case 'mooring':
      return <Anchor size={size} color={color} weight={weight} />;
    case 'other':
    default:
      return <Package size={size} color={color} weight={weight} />;
  }
}
