/**
 * useBookings Hook
 *
 * Manages booking list state and operations for the current season.
 * Provides filtering, sorting, and CRUD operations.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSeasonStore } from '../../../stores/seasonStore';
import * as bookingService from '../services/bookingService';
import { BOOKING_STATUS, type BookingStatus } from '../../../constants/bookingStatus';
import type { Booking } from '../../../types/models';

type SortOption = 'date-asc' | 'date-desc' | 'status' | 'guests';
type FilterOption = 'all' | BookingStatus;

interface UseBookingsReturn {
  // Data
  bookings: Booking[];
  activeBooking: Booking | null;
  upcomingBookings: Booking[];
  completedBookings: Booking[];

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
  createBooking: (input: bookingService.CreateBookingInput) => Promise<{ success: boolean; booking?: Booking; error?: string }>;
  deleteBooking: (bookingId: string) => Promise<{ success: boolean; error?: string }>;
  cancelBooking: (bookingId: string) => Promise<{ success: boolean; error?: string }>;
}

export function useBookings(): UseBookingsReturn {
  const { currentSeasonId } = useSeasonStore();

  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterOption>('all');
  const [sort, setSort] = useState<SortOption>('date-asc');

  /**
   * Fetch all bookings for current season
   */
  const fetchBookings = useCallback(async () => {
    if (!currentSeasonId) {
      setAllBookings([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await bookingService.getSeasonBookings(currentSeasonId);

    if (result.success && result.data) {
      setAllBookings(result.data);
    } else {
      setError(result.error || 'Failed to load bookings');
    }

    setIsLoading(false);
  }, [currentSeasonId]);

  // Fetch on mount and when season changes
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  /**
   * Filter and sort bookings
   */
  const bookings = useMemo(() => {
    let filtered = [...allBookings];

    // Apply filter
    if (filter !== 'all') {
      filtered = filtered.filter((b) => b.status === filter);
    }

    // Apply sort
    switch (sort) {
      case 'date-asc':
        filtered.sort((a, b) => a.arrivalDate.seconds - b.arrivalDate.seconds);
        break;
      case 'date-desc':
        filtered.sort((a, b) => b.arrivalDate.seconds - a.arrivalDate.seconds);
        break;
      case 'status':
        const statusOrder = [
          BOOKING_STATUS.ACTIVE,
          BOOKING_STATUS.UPCOMING,
          BOOKING_STATUS.COMPLETED,
          BOOKING_STATUS.ARCHIVED,
          BOOKING_STATUS.CANCELLED,
        ];
        filtered.sort((a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status));
        break;
      case 'guests':
        filtered.sort((a, b) => b.guestCount - a.guestCount);
        break;
    }

    return filtered;
  }, [allBookings, filter, sort]);

  /**
   * Get active booking (currently in progress)
   */
  const activeBooking = useMemo(() => {
    return allBookings.find((b) => b.status === BOOKING_STATUS.ACTIVE) || null;
  }, [allBookings]);

  /**
   * Get upcoming bookings sorted by date
   */
  const upcomingBookings = useMemo(() => {
    return allBookings
      .filter((b) => b.status === BOOKING_STATUS.UPCOMING)
      .sort((a, b) => a.arrivalDate.seconds - b.arrivalDate.seconds);
  }, [allBookings]);

  /**
   * Get completed bookings (including archived)
   */
  const completedBookings = useMemo(() => {
    return allBookings
      .filter(
        (b) => b.status === BOOKING_STATUS.COMPLETED || b.status === BOOKING_STATUS.ARCHIVED
      )
      .sort((a, b) => b.departureDate.seconds - a.departureDate.seconds);
  }, [allBookings]);

  /**
   * Create a new booking
   */
  const createBooking = useCallback(
    async (input: bookingService.CreateBookingInput) => {
      const result = await bookingService.createBooking(input);

      if (result.success && result.data) {
        setAllBookings((prev) => [...prev, result.data!]);
        return { success: true, booking: result.data };
      }

      return { success: false, error: result.error };
    },
    []
  );

  /**
   * Delete a booking
   */
  const deleteBooking = useCallback(async (bookingId: string) => {
    const result = await bookingService.deleteBooking(bookingId);

    if (result.success) {
      setAllBookings((prev) => prev.filter((b) => b.id !== bookingId));
      return { success: true };
    }

    return { success: false, error: result.error };
  }, []);

  /**
   * Cancel a booking
   */
  const cancelBooking = useCallback(async (bookingId: string) => {
    const result = await bookingService.cancelBooking(bookingId);

    if (result.success && result.data) {
      setAllBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? result.data! : b))
      );
      return { success: true };
    }

    return { success: false, error: result.error };
  }, []);

  return {
    bookings,
    activeBooking,
    upcomingBookings,
    completedBookings,
    isLoading,
    error,
    filter,
    setFilter,
    sort,
    setSort,
    refresh: fetchBookings,
    createBooking,
    deleteBooking,
    cancelBooking,
  };
}
