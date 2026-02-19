/**
 * useBooking Hook
 *
 * Manages single booking state and operations.
 * Used on booking detail and edit screens.
 */

import { useState, useEffect, useCallback } from 'react';
import * as bookingService from '../services/bookingService';
import type { Booking } from '../../../types/models';

interface UseBookingReturn {
  // Data
  booking: Booking | null;

  // State
  isLoading: boolean;
  error: string | null;

  // Actions
  refresh: () => Promise<void>;
  update: (updates: bookingService.UpdateBookingInput) => Promise<{ success: boolean; error?: string }>;
  updateApa: (amount: number) => Promise<{ success: boolean; error?: string }>;
  cancel: () => Promise<{ success: boolean; error?: string }>;
  complete: (reconciliation: {
    expectedCash: number;
    actualCash: number;
    reconciledBy: string;
  }) => Promise<{ success: boolean; error?: string }>;
  archive: () => Promise<{ success: boolean; error?: string }>;
}

export function useBooking(bookingId: string | null): UseBookingReturn {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch booking data
   */
  const fetchBooking = useCallback(async () => {
    if (!bookingId) {
      setBooking(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await bookingService.getBooking(bookingId);

    if (result.success && result.data) {
      setBooking(result.data);
    } else {
      setError(result.error || 'Failed to load booking');
    }

    setIsLoading(false);
  }, [bookingId]);

  // Fetch on mount and when ID changes
  useEffect(() => {
    fetchBooking();
  }, [fetchBooking]);

  /**
   * Update booking
   */
  const update = useCallback(
    async (updates: bookingService.UpdateBookingInput) => {
      if (!bookingId) return { success: false, error: 'No booking ID' };

      const result = await bookingService.updateBooking(bookingId, updates);

      if (result.success && result.data) {
        setBooking(result.data);
        return { success: true };
      }

      return { success: false, error: result.error };
    },
    [bookingId]
  );

  /**
   * Update APA total
   */
  const updateApa = useCallback(
    async (amount: number) => {
      if (!bookingId) return { success: false, error: 'No booking ID' };

      const result = await bookingService.updateApaTotal(bookingId, amount);

      if (result.success && result.data) {
        setBooking(result.data);
        return { success: true };
      }

      return { success: false, error: result.error };
    },
    [bookingId]
  );

  /**
   * Cancel booking
   */
  const cancel = useCallback(async () => {
    if (!bookingId) return { success: false, error: 'No booking ID' };

    const result = await bookingService.cancelBooking(bookingId);

    if (result.success && result.data) {
      setBooking(result.data);
      return { success: true };
    }

    return { success: false, error: result.error };
  }, [bookingId]);

  /**
   * Complete booking with reconciliation
   */
  const complete = useCallback(
    async (reconciliation: {
      expectedCash: number;
      actualCash: number;
      reconciledBy: string;
    }) => {
      if (!bookingId) return { success: false, error: 'No booking ID' };

      const result = await bookingService.completeBooking(bookingId, reconciliation);

      if (result.success && result.data) {
        setBooking(result.data);
        return { success: true };
      }

      return { success: false, error: result.error };
    },
    [bookingId]
  );

  /**
   * Archive booking
   */
  const archive = useCallback(async () => {
    if (!bookingId) return { success: false, error: 'No booking ID' };

    const result = await bookingService.archiveBooking(bookingId);

    if (result.success && result.data) {
      setBooking(result.data);
      return { success: true };
    }

    return { success: false, error: result.error };
  }, [bookingId]);

  return {
    booking,
    isLoading,
    error,
    refresh: fetchBooking,
    update,
    updateApa,
    cancel,
    complete,
    archive,
  };
}
