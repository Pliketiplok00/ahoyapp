/**
 * useApa Hook
 *
 * Manages APA (Advance Provisioning Allowance) state for a booking.
 * Tracks total APA received and provides add/delete operations.
 *
 * @returns { entries, total, loading, error, addEntry, deleteEntry, refresh }
 *
 * @example
 * const { total, entries, addEntry } = useApa(bookingId);
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import * as apaService from '../services/apaService';
import type { ApaEntry } from '../../../types/models';

interface UseApaReturn {
  // Data
  entries: ApaEntry[];
  total: number;

  // State
  isLoading: boolean;
  error: string | null;
  isAdding: boolean;

  // Actions
  addEntry: (amount: number, note?: string) => Promise<{ success: boolean; error?: string }>;
  deleteEntry: (entryId: string) => Promise<{ success: boolean; error?: string }>;
  refresh: () => Promise<void>;
}

export function useApa(bookingId: string, userId: string): UseApaReturn {
  const [entries, setEntries] = useState<ApaEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all APA entries for the booking
   */
  const fetchEntries = useCallback(async () => {
    if (!bookingId) {
      setEntries([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await apaService.getBookingApaEntries(bookingId);

    if (result.success && result.data) {
      setEntries(result.data);
    } else {
      setError(result.error || 'Failed to load APA entries');
    }

    setIsLoading(false);
  }, [bookingId]);

  // Fetch on mount and when booking changes
  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  /**
   * Calculate total APA
   */
  const total = useMemo(() => {
    return entries.reduce((sum, entry) => sum + entry.amount, 0);
  }, [entries]);

  /**
   * Add a new APA entry
   */
  const addEntry = useCallback(
    async (amount: number, note?: string) => {
      if (!userId) {
        return { success: false, error: 'User not authenticated' };
      }

      setIsAdding(true);

      const result = await apaService.createApaEntry({
        bookingId,
        amount,
        note,
        createdBy: userId,
      });

      setIsAdding(false);

      if (result.success && result.data) {
        setEntries((prev) => [result.data!, ...prev]);
        return { success: true };
      }

      return { success: false, error: result.error };
    },
    [bookingId, userId]
  );

  /**
   * Delete an APA entry
   */
  const deleteEntry = useCallback(async (entryId: string) => {
    const result = await apaService.deleteApaEntry(entryId);

    if (result.success) {
      setEntries((prev) => prev.filter((e) => e.id !== entryId));
      return { success: true };
    }

    return { success: false, error: result.error };
  }, []);

  return {
    entries,
    total,
    isLoading,
    error,
    isAdding,
    addEntry,
    deleteEntry,
    refresh: fetchEntries,
  };
}
