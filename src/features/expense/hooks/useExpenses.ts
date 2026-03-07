/**
 * useExpenses Hook
 *
 * Manages expense list state for a booking.
 * Provides filtering, totals, and CRUD operations.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import * as expenseService from '../services/expenseService';
import { uploadReceiptImage } from '../services/receiptUploadService';
import { logger } from '../../../utils/logger';
import type { Expense } from '../../../types/models';
import type { ExpenseCategory } from '../../../config/expenses';

type FilterOption = 'all' | ExpenseCategory;
type SortOption = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';

interface UseExpensesReturn {
  // Data
  expenses: Expense[];
  totalAmount: number;
  byCategory: Record<string, number>;

  // State
  isLoading: boolean;
  error: string | null;

  // Filters & Sort
  filter: FilterOption;
  setFilter: (filter: FilterOption) => void;
  sort: SortOption;
  setSort: (sort: SortOption) => void;

  // Actions
  refresh: () => Promise<void>;
  createExpense: (
    input: Omit<expenseService.CreateExpenseInput, 'bookingId' | 'seasonId'>
  ) => Promise<{ success: boolean; expense?: Expense; error?: string }>;
  updateExpense: (
    expenseId: string,
    input: expenseService.UpdateExpenseInput
  ) => Promise<{ success: boolean; error?: string }>;
  deleteExpense: (expenseId: string) => Promise<{ success: boolean; error?: string }>;
}

export function useExpenses(
  bookingId: string,
  seasonId: string
): UseExpensesReturn {
  const [allExpenses, setAllExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterOption>('all');
  const [sort, setSort] = useState<SortOption>('date-desc');

  /**
   * Fetch all expenses for the booking
   */
  const fetchExpenses = useCallback(async () => {
    if (!bookingId) {
      setAllExpenses([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await expenseService.getBookingExpenses(bookingId);

    if (result.success && result.data) {
      setAllExpenses(result.data);
    } else {
      setError(result.error || 'Failed to load expenses');
    }

    setIsLoading(false);
  }, [bookingId]);

  // Fetch on mount and when booking changes
  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  /**
   * Filter and sort expenses
   */
  const expenses = useMemo(() => {
    let filtered = [...allExpenses];

    // Apply filter
    if (filter !== 'all') {
      filtered = filtered.filter((e) => e.category === filter);
    }

    // Apply sort
    switch (sort) {
      case 'date-desc':
        filtered.sort((a, b) => b.date.seconds - a.date.seconds);
        break;
      case 'date-asc':
        filtered.sort((a, b) => a.date.seconds - b.date.seconds);
        break;
      case 'amount-desc':
        filtered.sort((a, b) => b.amount - a.amount);
        break;
      case 'amount-asc':
        filtered.sort((a, b) => a.amount - b.amount);
        break;
    }

    return filtered;
  }, [allExpenses, filter, sort]);

  /**
   * Calculate total amount
   */
  const totalAmount = useMemo(() => {
    return allExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [allExpenses]);

  /**
   * Group by category
   */
  const byCategory = useMemo(() => {
    const grouped: Record<string, number> = {};
    allExpenses.forEach((e) => {
      grouped[e.category] = (grouped[e.category] || 0) + e.amount;
    });
    return grouped;
  }, [allExpenses]);

  /**
   * Create a new expense
   *
   * If the expense has a receipt image (receiptLocalPath), this function will:
   * 1. Create the expense in Firestore
   * 2. Upload the receipt to Firebase Storage in the background
   * 3. Update the expense with the download URL when upload completes
   */
  const createExpense = useCallback(
    async (input: Omit<expenseService.CreateExpenseInput, 'bookingId' | 'seasonId'>) => {
      const result = await expenseService.createExpense({
        ...input,
        bookingId,
        seasonId,
      });

      if (result.success && result.data) {
        const expense = result.data;
        setAllExpenses((prev) => [expense, ...prev]);

        // If there's a receipt image, upload it to Firebase Storage
        if (input.receiptLocalPath && expense.id) {
          logger.log('[useExpenses] Starting receipt upload for expense:', expense.id);

          // Upload in background - don't block the UI
          uploadReceiptImage(input.receiptLocalPath, seasonId, bookingId, expense.id)
            .then(async (uploadResult) => {
              if (uploadResult.success && uploadResult.downloadUrl) {
                logger.log('[useExpenses] Receipt uploaded, updating expense with URL');

                // Update expense with the download URL
                const updateResult = await expenseService.updateExpense(expense.id, {
                  receiptUrl: uploadResult.downloadUrl,
                  syncStatus: 'synced',
                });

                if (updateResult.success && updateResult.data) {
                  // Update local state with the new URL
                  setAllExpenses((prev) =>
                    prev.map((e) => (e.id === expense.id ? updateResult.data! : e))
                  );
                  logger.log('[useExpenses] Expense updated with receiptUrl');
                }
              } else {
                logger.error('[useExpenses] Receipt upload failed:', uploadResult.error);
                // Mark as error state but don't fail the expense creation
                await expenseService.updateExpense(expense.id, {
                  syncStatus: 'error',
                });
              }
            })
            .catch((error) => {
              logger.error('[useExpenses] Receipt upload error:', error);
            });
        }

        return { success: true, expense };
      }

      return { success: false, error: result.error };
    },
    [bookingId, seasonId]
  );

  /**
   * Update an expense
   */
  const updateExpense = useCallback(
    async (expenseId: string, input: expenseService.UpdateExpenseInput) => {
      const result = await expenseService.updateExpense(expenseId, input);

      if (result.success && result.data) {
        setAllExpenses((prev) =>
          prev.map((e) => (e.id === expenseId ? result.data! : e))
        );
        return { success: true };
      }

      return { success: false, error: result.error };
    },
    []
  );

  /**
   * Delete an expense
   */
  const deleteExpense = useCallback(async (expenseId: string) => {
    const result = await expenseService.deleteExpense(expenseId);

    if (result.success) {
      setAllExpenses((prev) => prev.filter((e) => e.id !== expenseId));
      return { success: true };
    }

    return { success: false, error: result.error };
  }, []);

  return {
    expenses,
    totalAmount,
    byCategory,
    isLoading,
    error,
    filter,
    setFilter,
    sort,
    setSort,
    refresh: fetchExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
  };
}
