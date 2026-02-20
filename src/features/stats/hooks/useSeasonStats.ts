/**
 * useSeasonStats Hook
 *
 * Aggregates season-wide statistics from bookings, expenses, and score data.
 * Used by the Stats screen to display season insights.
 */

import { useState, useEffect, useCallback } from 'react';
import { useSeasonStore } from '../../../stores/seasonStore';
import * as bookingService from '../../booking/services/bookingService';
import * as expenseService from '../../expense/services/expenseService';
import * as scoreService from '../../score/services/scoreService';
import { BOOKING_STATUS } from '../../../constants/bookingStatus';
import { formatCurrency } from '../../../utils/formatting';
import type { Booking, Expense, SeasonScoreStats } from '../../../types/models';

/**
 * Top booking (best tip or lowest spend)
 */
export interface TopBooking {
  id: string;
  label: string;
  value: number;
  formattedValue: string;
  dates: string;
}

/**
 * Top merchant by total spend
 */
export interface TopMerchant {
  name: string;
  total: number;
  formattedTotal: string;
  count: number;
}

/**
 * Season statistics
 */
export interface SeasonStats {
  // Booking stats
  totalBookings: number;
  completedBookings: number;
  upcomingBookings: number;
  activeBookings: number;
  totalGuests: number;

  // Financial stats
  totalApa: number;
  totalExpenses: number;
  totalTips: number;
  averageTip: number;

  // Time stats
  workDays: number;
  seasonProgress: number; // 0-100
  daysRemaining: number;
  daysUntilBreak: number | null;

  // Derived
  formattedTotalApa: string;
  formattedTotalExpenses: string;
  formattedTotalTips: string;
  formattedAverageTip: string;

  // Top items
  bestTipBooking: TopBooking | null;
  lowestSpendBooking: TopBooking | null;
  topMerchants: TopMerchant[];

  // Score stats
  scoreStats: SeasonScoreStats | null;
}

interface UseSeasonStatsReturn {
  stats: SeasonStats | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Calculate work days from bookings (days where booking was active)
 */
function calculateWorkDays(bookings: Booking[]): number {
  const today = new Date();
  let totalDays = 0;

  for (const booking of bookings) {
    if (booking.status === BOOKING_STATUS.CANCELLED) continue;

    const arrival = booking.arrivalDate.toDate();
    const departure = booking.departureDate.toDate();

    // Only count days up to today for active bookings
    const endDate =
      booking.status === BOOKING_STATUS.ACTIVE && departure > today
        ? today
        : departure;

    // Only count if booking has started
    if (arrival <= today) {
      const startDate = arrival;
      const diffTime = endDate.getTime() - startDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Include both start and end
      totalDays += Math.max(0, diffDays);
    }
  }

  return totalDays;
}

/**
 * Calculate season progress percentage
 */
function calculateSeasonProgress(
  seasonStart: Date,
  seasonEnd: Date
): { progress: number; daysRemaining: number } {
  const today = new Date();
  const totalDays = Math.ceil(
    (seasonEnd.getTime() - seasonStart.getTime()) / (1000 * 60 * 60 * 24)
  );
  const elapsedDays = Math.ceil(
    (today.getTime() - seasonStart.getTime()) / (1000 * 60 * 60 * 24)
  );

  const progress = Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100));
  const daysRemaining = Math.max(
    0,
    Math.ceil((seasonEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  );

  return { progress, daysRemaining };
}

/**
 * Calculate days until next break (gap between bookings)
 */
function calculateDaysUntilBreak(bookings: Booking[]): number | null {
  const today = new Date();
  const todayTime = today.getTime();

  // Find active booking
  const activeBooking = bookings.find(
    (b) => b.status === BOOKING_STATUS.ACTIVE
  );
  if (!activeBooking) return null;

  const activeEnd = activeBooking.departureDate.toDate();

  // Find next upcoming booking after active
  const upcomingBookings = bookings
    .filter(
      (b) =>
        b.status === BOOKING_STATUS.UPCOMING &&
        b.arrivalDate.toDate().getTime() > activeEnd.getTime()
    )
    .sort((a, b) => a.arrivalDate.seconds - b.arrivalDate.seconds);

  if (upcomingBookings.length === 0) {
    // No upcoming bookings, break starts after active
    return Math.max(
      0,
      Math.ceil((activeEnd.getTime() - todayTime) / (1000 * 60 * 60 * 24))
    );
  }

  const nextBooking = upcomingBookings[0];
  const nextStart = nextBooking.arrivalDate.toDate();
  const gapDays = Math.ceil(
    (nextStart.getTime() - activeEnd.getTime()) / (1000 * 60 * 60 * 24)
  );

  // If there's a gap, return days until break starts
  if (gapDays > 1) {
    return Math.max(
      0,
      Math.ceil((activeEnd.getTime() - todayTime) / (1000 * 60 * 60 * 24))
    );
  }

  // Back-to-back, no break
  return null;
}

/**
 * Calculate top merchants from expenses
 */
function calculateTopMerchants(
  expenses: Expense[],
  limit: number = 5
): TopMerchant[] {
  const merchantTotals = new Map<string, { total: number; count: number }>();

  for (const expense of expenses) {
    const merchant = expense.merchant || 'Unknown';
    const current = merchantTotals.get(merchant) || { total: 0, count: 0 };
    merchantTotals.set(merchant, {
      total: current.total + expense.amount,
      count: current.count + 1,
    });
  }

  const merchants: TopMerchant[] = [];
  for (const [name, data] of merchantTotals) {
    merchants.push({
      name,
      total: data.total,
      formattedTotal: formatCurrency(data.total),
      count: data.count,
    });
  }

  // Sort by total descending and limit
  return merchants.sort((a, b) => b.total - a.total).slice(0, limit);
}

/**
 * Find best tip booking
 */
function findBestTipBooking(bookings: Booking[]): TopBooking | null {
  const withTips = bookings.filter(
    (b) =>
      b.tip &&
      b.tip > 0 &&
      b.status !== BOOKING_STATUS.CANCELLED
  );

  if (withTips.length === 0) return null;

  const best = withTips.reduce((max, b) =>
    (b.tip || 0) > (max.tip || 0) ? b : max
  );

  const arrival = best.arrivalDate.toDate();
  const departure = best.departureDate.toDate();

  return {
    id: best.id,
    label: 'Best tip',
    value: best.tip || 0,
    formattedValue: formatCurrency(best.tip || 0),
    dates: `${formatDateShort(arrival)} - ${formatDateShort(departure)}`,
  };
}

/**
 * Find lowest spend booking (by total expenses)
 */
function findLowestSpendBooking(
  bookings: Booking[],
  expensesByBooking: Map<string, number>
): TopBooking | null {
  const completed = bookings.filter(
    (b) =>
      (b.status === BOOKING_STATUS.COMPLETED ||
        b.status === BOOKING_STATUS.ARCHIVED) &&
      expensesByBooking.has(b.id) &&
      (expensesByBooking.get(b.id) || 0) > 0
  );

  if (completed.length === 0) return null;

  const lowest = completed.reduce((min, b) => {
    const minSpend = expensesByBooking.get(min.id) || Infinity;
    const bSpend = expensesByBooking.get(b.id) || Infinity;
    return bSpend < minSpend ? b : min;
  });

  const spend = expensesByBooking.get(lowest.id) || 0;
  const arrival = lowest.arrivalDate.toDate();
  const departure = lowest.departureDate.toDate();

  return {
    id: lowest.id,
    label: 'Lowest spend',
    value: spend,
    formattedValue: formatCurrency(spend),
    dates: `${formatDateShort(arrival)} - ${formatDateShort(departure)}`,
  };
}

/**
 * Format date as short string (DD.MM.)
 */
function formatDateShort(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  return `${day}.${month}.`;
}

/**
 * Hook for season statistics
 */
export function useSeasonStats(): UseSeasonStatsReturn {
  const { currentSeasonId, currentSeason, crewMembers } = useSeasonStore();

  const [stats, setStats] = useState<SeasonStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch and calculate all statistics
   */
  const fetchStats = useCallback(async () => {
    if (!currentSeasonId || !currentSeason) {
      setStats(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch all data in parallel
      const [bookingsResult, expensesResult] = await Promise.all([
        bookingService.getSeasonBookings(currentSeasonId),
        expenseService.getSeasonExpenses(currentSeasonId),
      ]);

      if (!bookingsResult.success || !bookingsResult.data) {
        throw new Error(bookingsResult.error || 'Failed to load bookings');
      }

      if (!expensesResult.success || !expensesResult.data) {
        throw new Error(expensesResult.error || 'Failed to load expenses');
      }

      const bookings = bookingsResult.data;
      const expenses = expensesResult.data;

      // Calculate expenses by booking
      const expensesByBooking = new Map<string, number>();
      for (const expense of expenses) {
        const current = expensesByBooking.get(expense.bookingId) || 0;
        expensesByBooking.set(expense.bookingId, current + expense.amount);
      }

      // Filter out cancelled bookings for stats
      const activeBookings = bookings.filter(
        (b) => b.status !== BOOKING_STATUS.CANCELLED
      );

      // Basic counts
      const completedBookings = activeBookings.filter(
        (b) =>
          b.status === BOOKING_STATUS.COMPLETED ||
          b.status === BOOKING_STATUS.ARCHIVED
      );
      const upcomingBookings = activeBookings.filter(
        (b) => b.status === BOOKING_STATUS.UPCOMING
      );
      const currentlyActive = activeBookings.filter(
        (b) => b.status === BOOKING_STATUS.ACTIVE
      );

      // Financial totals
      const totalApa = activeBookings.reduce((sum, b) => sum + b.apaTotal, 0);
      const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
      const totalTips = activeBookings.reduce((sum, b) => sum + (b.tip || 0), 0);
      const bookingsWithTips = activeBookings.filter(
        (b) => b.tip && b.tip > 0
      ).length;
      const averageTip = bookingsWithTips > 0 ? totalTips / bookingsWithTips : 0;

      // Time calculations
      const workDays = calculateWorkDays(activeBookings);
      const seasonStart = currentSeason.startDate.toDate();
      const seasonEnd = currentSeason.endDate.toDate();
      const { progress, daysRemaining } = calculateSeasonProgress(
        seasonStart,
        seasonEnd
      );
      const daysUntilBreak = calculateDaysUntilBreak(activeBookings);

      // Top items
      const topMerchants = calculateTopMerchants(expenses);
      const bestTipBooking = findBestTipBooking(activeBookings);
      const lowestSpendBooking = findLowestSpendBooking(
        activeBookings,
        expensesByBooking
      );

      // Score stats (fetch separately as it needs booking IDs)
      let scoreStats: SeasonScoreStats | null = null;
      if (crewMembers.length > 0 && activeBookings.length > 0) {
        const bookingIds = activeBookings.map((b) => b.id);
        const scoreResult = await scoreService.getSeasonScoreStats(
          bookingIds,
          crewMembers
        );
        if (scoreResult.success && scoreResult.data) {
          scoreStats = scoreResult.data;
        }
      }

      setStats({
        // Booking stats
        totalBookings: activeBookings.length,
        completedBookings: completedBookings.length,
        upcomingBookings: upcomingBookings.length,
        activeBookings: currentlyActive.length,
        totalGuests: activeBookings.reduce((sum, b) => sum + b.guestCount, 0),

        // Financial stats
        totalApa,
        totalExpenses,
        totalTips,
        averageTip,

        // Time stats
        workDays,
        seasonProgress: Math.round(progress),
        daysRemaining,
        daysUntilBreak,

        // Formatted values
        formattedTotalApa: formatCurrency(totalApa),
        formattedTotalExpenses: formatCurrency(totalExpenses),
        formattedTotalTips: formatCurrency(totalTips),
        formattedAverageTip: formatCurrency(averageTip),

        // Top items
        bestTipBooking,
        lowestSpendBooking,
        topMerchants,

        // Score stats
        scoreStats,
      });
    } catch (err) {
      console.error('Error fetching season stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to load statistics');
    } finally {
      setIsLoading(false);
    }
  }, [currentSeasonId, currentSeason, crewMembers]);

  // Fetch on mount and when dependencies change
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    error,
    refresh: fetchStats,
  };
}
