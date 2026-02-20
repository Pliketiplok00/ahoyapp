/**
 * useReconciliation Hook
 *
 * Handles end-of-booking cash reconciliation.
 * Calculates expected vs actual cash and saves result.
 *
 * @returns { result, calculate, save, isReconciled, loading, error }
 *
 * @example
 * const { result, calculate, save } = useReconciliation(bookingId);
 * const preview = calculate(actualCash);
 * await save(actualCash);
 */

import { useState, useEffect, useCallback } from 'react';
import * as apaService from '../services/apaService';
import { getBookingExpenseTotal } from '../../expense/services/expenseService';
import type { Reconciliation } from '../../../types/models';

export interface ReconciliationPreview {
  apaTotal: number;
  expenseTotal: number;
  expectedCash: number;
  actualCash: number;
  difference: number;
  isBalanced: boolean;
}

interface UseReconciliationReturn {
  // Data
  apaTotal: number;
  expenseTotal: number;
  expectedCash: number;
  existingReconciliation: Reconciliation | null;
  isReconciled: boolean;

  // State
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  // Actions
  calculate: (actualCash: number) => ReconciliationPreview;
  save: (actualCash: number) => Promise<{ success: boolean; result?: ReconciliationPreview; error?: string }>;
  refresh: () => Promise<void>;
}

export function useReconciliation(
  bookingId: string,
  userId: string,
  existingReconciliation?: Reconciliation | null
): UseReconciliationReturn {
  const [apaTotal, setApaTotal] = useState(0);
  const [expenseTotal, setExpenseTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch totals for the booking
   */
  const fetchTotals = useCallback(async () => {
    if (!bookingId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch APA total and expense total in parallel
      const [apaResult, expenseResult] = await Promise.all([
        apaService.getBookingApaTotal(bookingId),
        getBookingExpenseTotal(bookingId),
      ]);

      if (apaResult.success && apaResult.data !== undefined) {
        setApaTotal(apaResult.data);
      }

      if (expenseResult.success && expenseResult.data !== undefined) {
        setExpenseTotal(expenseResult.data);
      }

      if (!apaResult.success || !expenseResult.success) {
        setError('Failed to load booking totals');
      }
    } catch (err) {
      setError('Failed to load booking totals');
    }

    setIsLoading(false);
  }, [bookingId]);

  // Fetch on mount
  useEffect(() => {
    fetchTotals();
  }, [fetchTotals]);

  /**
   * Calculate expected cash
   */
  const expectedCash = apaTotal - expenseTotal;

  /**
   * Check if already reconciled
   */
  const isReconciled = !!existingReconciliation;

  /**
   * Preview reconciliation calculation
   */
  const calculate = useCallback(
    (actualCash: number): ReconciliationPreview => {
      const difference = actualCash - expectedCash;
      const isBalanced = Math.abs(difference) < 0.01;

      return {
        apaTotal,
        expenseTotal,
        expectedCash,
        actualCash,
        difference,
        isBalanced,
      };
    },
    [apaTotal, expenseTotal, expectedCash]
  );

  /**
   * Save reconciliation to booking
   */
  const save = useCallback(
    async (actualCash: number) => {
      if (!userId) {
        return { success: false, error: 'User not authenticated' };
      }

      setIsSaving(true);

      const result = await apaService.saveReconciliation(
        bookingId,
        { bookingId, actualCash, reconciledBy: userId },
        expenseTotal,
        apaTotal
      );

      setIsSaving(false);

      if (result.success && result.data) {
        return { success: true, result: result.data };
      }

      return { success: false, error: result.error };
    },
    [bookingId, userId, apaTotal, expenseTotal]
  );

  return {
    apaTotal,
    expenseTotal,
    expectedCash,
    existingReconciliation: existingReconciliation || null,
    isReconciled,
    isLoading,
    isSaving,
    error,
    calculate,
    save,
    refresh: fetchTotals,
  };
}
