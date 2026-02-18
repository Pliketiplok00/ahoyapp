/**
 * Expense Configuration
 *
 * Categories, defaults, and expense-related settings.
 */

export const EXPENSE_CATEGORIES = [
  { id: 'food', label: 'Food & Beverage', icon: 'utensils', emoji: '🍕' },
  { id: 'fuel', label: 'Fuel', icon: 'fuel', emoji: '⛽' },
  { id: 'mooring', label: 'Mooring', icon: 'anchor', emoji: '⚓' },
  { id: 'other', label: 'Other', icon: 'ellipsis', emoji: '📦' },
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number]['id'];

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
 * Get category emoji for display
 */
export function getCategoryEmoji(id: ExpenseCategory): string {
  return getExpenseCategory(id)?.emoji || '📦';
}
