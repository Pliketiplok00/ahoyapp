/**
 * useSeasonStats Tests
 *
 * Tests for season statistics calculations.
 */

import { Timestamp } from 'firebase/firestore';
import { BOOKING_STATUS } from '../../../constants/bookingStatus';
import type { Booking, Expense } from '../../../types/models';

// Helper to create mock timestamps
function createTimestamp(date: Date): Timestamp {
  return {
    seconds: Math.floor(date.getTime() / 1000),
    nanoseconds: 0,
    toDate: () => date,
  } as Timestamp;
}

// Helper to create mock booking
function createMockBooking(overrides: Partial<Booking> = {}): Booking {
  const arrivalDate = new Date('2026-02-01');
  const departureDate = new Date('2026-02-07');
  return {
    id: 'booking-1',
    seasonId: 'season-1',
    arrivalDate: createTimestamp(arrivalDate),
    departureDate: createTimestamp(departureDate),
    departureMarina: 'Kaštela',
    arrivalMarina: 'Kaštela',
    guestCount: 6,
    status: BOOKING_STATUS.COMPLETED,
    apaTotal: 2000,
    tip: 500,
    reconciliation: null,
    createdBy: 'user-1',
    createdAt: createTimestamp(new Date()),
    updatedAt: createTimestamp(new Date()),
    ...overrides,
  } as Booking;
}

// Helper to create mock expense
function createMockExpense(overrides: Partial<Expense> = {}): Expense {
  return {
    id: 'expense-1',
    bookingId: 'booking-1',
    seasonId: 'season-1',
    amount: 100,
    date: createTimestamp(new Date()),
    category: 'food',
    merchant: 'Konzum',
    type: 'receipt',
    isComplete: true,
    createdBy: 'user-1',
    createdAt: createTimestamp(new Date()),
    updatedAt: createTimestamp(new Date()),
    syncStatus: 'synced',
    ...overrides,
  } as Expense;
}

// ============ Pure Calculation Functions (for testing) ============

/**
 * Calculate work days from bookings
 */
function calculateWorkDays(bookings: Booking[], today: Date = new Date()): number {
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
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
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
  seasonEnd: Date,
  today: Date = new Date()
): { progress: number; daysRemaining: number } {
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
 * Calculate top merchants from expenses
 */
interface TopMerchant {
  name: string;
  total: number;
  count: number;
}

function calculateTopMerchants(expenses: Expense[], limit: number = 5): TopMerchant[] {
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
      count: data.count,
    });
  }

  return merchants.sort((a, b) => b.total - a.total).slice(0, limit);
}

/**
 * Calculate average tip
 */
function calculateAverageTip(bookings: Booking[]): number {
  const withTips = bookings.filter(
    (b) => b.tip && b.tip > 0 && b.status !== BOOKING_STATUS.CANCELLED
  );
  if (withTips.length === 0) return 0;
  const totalTips = withTips.reduce((sum, b) => sum + (b.tip || 0), 0);
  return totalTips / withTips.length;
}

// ============ Tests ============

describe('useSeasonStats calculations', () => {
  describe('calculateWorkDays', () => {
    it('calculates days for completed booking', () => {
      const booking = createMockBooking({
        arrivalDate: createTimestamp(new Date('2026-02-01')),
        departureDate: createTimestamp(new Date('2026-02-07')),
        status: BOOKING_STATUS.COMPLETED,
      });
      const today = new Date('2026-02-20');
      expect(calculateWorkDays([booking], today)).toBe(7);
    });

    it('calculates days for multiple bookings', () => {
      const booking1 = createMockBooking({
        id: 'booking-1',
        arrivalDate: createTimestamp(new Date('2026-02-01')),
        departureDate: createTimestamp(new Date('2026-02-03')),
        status: BOOKING_STATUS.COMPLETED,
      });
      const booking2 = createMockBooking({
        id: 'booking-2',
        arrivalDate: createTimestamp(new Date('2026-02-10')),
        departureDate: createTimestamp(new Date('2026-02-12')),
        status: BOOKING_STATUS.COMPLETED,
      });
      const today = new Date('2026-02-20');
      expect(calculateWorkDays([booking1, booking2], today)).toBe(6); // 3 + 3 days
    });

    it('excludes cancelled bookings', () => {
      const booking = createMockBooking({
        status: BOOKING_STATUS.CANCELLED,
      });
      const today = new Date('2026-02-20');
      expect(calculateWorkDays([booking], today)).toBe(0);
    });

    it('only counts days up to today for active booking', () => {
      const booking = createMockBooking({
        arrivalDate: createTimestamp(new Date('2026-02-01')),
        departureDate: createTimestamp(new Date('2026-02-10')),
        status: BOOKING_STATUS.ACTIVE,
      });
      const today = new Date('2026-02-05');
      expect(calculateWorkDays([booking], today)).toBe(5);
    });

    it('does not count upcoming bookings', () => {
      const booking = createMockBooking({
        arrivalDate: createTimestamp(new Date('2026-02-10')),
        departureDate: createTimestamp(new Date('2026-02-15')),
        status: BOOKING_STATUS.UPCOMING,
      });
      const today = new Date('2026-02-05');
      expect(calculateWorkDays([booking], today)).toBe(0);
    });

    it('handles zero bookings', () => {
      expect(calculateWorkDays([], new Date())).toBe(0);
    });

    it('handles single day booking', () => {
      const booking = createMockBooking({
        arrivalDate: createTimestamp(new Date('2026-02-01')),
        departureDate: createTimestamp(new Date('2026-02-01')),
        status: BOOKING_STATUS.COMPLETED,
      });
      const today = new Date('2026-02-05');
      expect(calculateWorkDays([booking], today)).toBe(1);
    });
  });

  describe('calculateSeasonProgress', () => {
    it('calculates progress at start of season', () => {
      const start = new Date('2026-04-01');
      const end = new Date('2026-10-31');
      const today = new Date('2026-04-01');
      const result = calculateSeasonProgress(start, end, today);
      expect(result.progress).toBeCloseTo(0, 0);
      expect(result.daysRemaining).toBe(213);
    });

    it('calculates progress at mid season', () => {
      const start = new Date('2026-01-01');
      const end = new Date('2026-12-31');
      const today = new Date('2026-07-01');
      const result = calculateSeasonProgress(start, end, today);
      expect(result.progress).toBeGreaterThan(45);
      expect(result.progress).toBeLessThan(55);
    });

    it('calculates progress at end of season', () => {
      const start = new Date('2026-04-01');
      const end = new Date('2026-10-31');
      const today = new Date('2026-10-31');
      const result = calculateSeasonProgress(start, end, today);
      expect(result.progress).toBe(100);
      expect(result.daysRemaining).toBe(0);
    });

    it('caps progress at 100%', () => {
      const start = new Date('2026-01-01');
      const end = new Date('2026-06-30');
      const today = new Date('2026-12-01');
      const result = calculateSeasonProgress(start, end, today);
      expect(result.progress).toBe(100);
      expect(result.daysRemaining).toBe(0);
    });

    it('handles progress before season starts', () => {
      const start = new Date('2026-04-01');
      const end = new Date('2026-10-31');
      const today = new Date('2026-03-01');
      const result = calculateSeasonProgress(start, end, today);
      expect(result.progress).toBe(0);
      expect(result.daysRemaining).toBeGreaterThan(213);
    });
  });

  describe('calculateTopMerchants', () => {
    it('returns empty array for no expenses', () => {
      expect(calculateTopMerchants([])).toEqual([]);
    });

    it('groups expenses by merchant', () => {
      const expenses = [
        createMockExpense({ merchant: 'Konzum', amount: 100 }),
        createMockExpense({ merchant: 'Konzum', amount: 50 }),
        createMockExpense({ merchant: 'Spar', amount: 75 }),
      ];
      const result = calculateTopMerchants(expenses);
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Konzum');
      expect(result[0].total).toBe(150);
      expect(result[0].count).toBe(2);
      expect(result[1].name).toBe('Spar');
      expect(result[1].total).toBe(75);
      expect(result[1].count).toBe(1);
    });

    it('sorts by total descending', () => {
      const expenses = [
        createMockExpense({ merchant: 'A', amount: 50 }),
        createMockExpense({ merchant: 'B', amount: 200 }),
        createMockExpense({ merchant: 'C', amount: 100 }),
      ];
      const result = calculateTopMerchants(expenses);
      expect(result[0].name).toBe('B');
      expect(result[1].name).toBe('C');
      expect(result[2].name).toBe('A');
    });

    it('respects limit parameter', () => {
      const expenses = [
        createMockExpense({ merchant: 'A', amount: 50 }),
        createMockExpense({ merchant: 'B', amount: 100 }),
        createMockExpense({ merchant: 'C', amount: 150 }),
        createMockExpense({ merchant: 'D', amount: 200 }),
        createMockExpense({ merchant: 'E', amount: 250 }),
        createMockExpense({ merchant: 'F', amount: 300 }),
      ];
      const result = calculateTopMerchants(expenses, 3);
      expect(result).toHaveLength(3);
      expect(result[0].name).toBe('F');
      expect(result[2].name).toBe('D');
    });

    it('handles missing merchant name', () => {
      const expenses = [
        createMockExpense({ merchant: '', amount: 100 }),
      ];
      const result = calculateTopMerchants(expenses);
      expect(result[0].name).toBe('Unknown');
    });

    it('calculates correct count for single merchant', () => {
      const expenses = [
        createMockExpense({ merchant: 'Konzum', amount: 10 }),
        createMockExpense({ merchant: 'Konzum', amount: 20 }),
        createMockExpense({ merchant: 'Konzum', amount: 30 }),
        createMockExpense({ merchant: 'Konzum', amount: 40 }),
      ];
      const result = calculateTopMerchants(expenses);
      expect(result[0].count).toBe(4);
      expect(result[0].total).toBe(100);
    });
  });

  describe('calculateAverageTip', () => {
    it('returns 0 for no bookings', () => {
      expect(calculateAverageTip([])).toBe(0);
    });

    it('returns 0 when no bookings have tips', () => {
      const bookings = [
        createMockBooking({ tip: undefined }),
        createMockBooking({ tip: 0 }),
      ];
      expect(calculateAverageTip(bookings)).toBe(0);
    });

    it('calculates average for bookings with tips', () => {
      const bookings = [
        createMockBooking({ id: '1', tip: 100 }),
        createMockBooking({ id: '2', tip: 200 }),
        createMockBooking({ id: '3', tip: 300 }),
      ];
      expect(calculateAverageTip(bookings)).toBe(200);
    });

    it('excludes bookings without tips from average', () => {
      const bookings = [
        createMockBooking({ id: '1', tip: 100 }),
        createMockBooking({ id: '2', tip: undefined }),
        createMockBooking({ id: '3', tip: 200 }),
        createMockBooking({ id: '4', tip: 0 }),
      ];
      // Only 2 bookings with tips, total 300
      expect(calculateAverageTip(bookings)).toBe(150);
    });

    it('excludes cancelled bookings', () => {
      const bookings = [
        createMockBooking({ id: '1', tip: 100, status: BOOKING_STATUS.COMPLETED }),
        createMockBooking({ id: '2', tip: 500, status: BOOKING_STATUS.CANCELLED }),
        createMockBooking({ id: '3', tip: 200, status: BOOKING_STATUS.COMPLETED }),
      ];
      // Only 2 non-cancelled bookings, total 300
      expect(calculateAverageTip(bookings)).toBe(150);
    });

    it('handles single booking with tip', () => {
      const bookings = [createMockBooking({ tip: 500 })];
      expect(calculateAverageTip(bookings)).toBe(500);
    });
  });

  describe('booking statistics', () => {
    it('counts bookings by status', () => {
      const bookings = [
        createMockBooking({ id: '1', status: BOOKING_STATUS.COMPLETED }),
        createMockBooking({ id: '2', status: BOOKING_STATUS.COMPLETED }),
        createMockBooking({ id: '3', status: BOOKING_STATUS.ACTIVE }),
        createMockBooking({ id: '4', status: BOOKING_STATUS.UPCOMING }),
        createMockBooking({ id: '5', status: BOOKING_STATUS.UPCOMING }),
        createMockBooking({ id: '6', status: BOOKING_STATUS.CANCELLED }),
      ];

      const activeBookings = bookings.filter(
        (b) => b.status !== BOOKING_STATUS.CANCELLED
      );
      const completed = activeBookings.filter(
        (b) => b.status === BOOKING_STATUS.COMPLETED
      );
      const active = activeBookings.filter(
        (b) => b.status === BOOKING_STATUS.ACTIVE
      );
      const upcoming = activeBookings.filter(
        (b) => b.status === BOOKING_STATUS.UPCOMING
      );

      expect(activeBookings).toHaveLength(5);
      expect(completed).toHaveLength(2);
      expect(active).toHaveLength(1);
      expect(upcoming).toHaveLength(2);
    });

    it('calculates total APA', () => {
      const bookings = [
        createMockBooking({ id: '1', apaTotal: 1000 }),
        createMockBooking({ id: '2', apaTotal: 2000 }),
        createMockBooking({ id: '3', apaTotal: 3000 }),
      ];
      const totalApa = bookings.reduce((sum, b) => sum + b.apaTotal, 0);
      expect(totalApa).toBe(6000);
    });

    it('calculates total guests', () => {
      const bookings = [
        createMockBooking({ id: '1', guestCount: 6 }),
        createMockBooking({ id: '2', guestCount: 8 }),
        createMockBooking({ id: '3', guestCount: 4 }),
      ];
      const totalGuests = bookings.reduce((sum, b) => sum + b.guestCount, 0);
      expect(totalGuests).toBe(18);
    });

    it('calculates total tips', () => {
      const bookings = [
        createMockBooking({ id: '1', tip: 100 }),
        createMockBooking({ id: '2', tip: 200 }),
        createMockBooking({ id: '3', tip: undefined }),
      ];
      const totalTips = bookings.reduce((sum, b) => sum + (b.tip || 0), 0);
      expect(totalTips).toBe(300);
    });
  });

  describe('expense statistics', () => {
    it('calculates total expenses', () => {
      const expenses = [
        createMockExpense({ amount: 100 }),
        createMockExpense({ amount: 200 }),
        createMockExpense({ amount: 50.50 }),
      ];
      const total = expenses.reduce((sum, e) => sum + e.amount, 0);
      expect(total).toBe(350.50);
    });

    it('groups expenses by booking', () => {
      const expenses = [
        createMockExpense({ bookingId: 'b1', amount: 100 }),
        createMockExpense({ bookingId: 'b1', amount: 50 }),
        createMockExpense({ bookingId: 'b2', amount: 200 }),
      ];

      const expensesByBooking = new Map<string, number>();
      for (const expense of expenses) {
        const current = expensesByBooking.get(expense.bookingId) || 0;
        expensesByBooking.set(expense.bookingId, current + expense.amount);
      }

      expect(expensesByBooking.get('b1')).toBe(150);
      expect(expensesByBooking.get('b2')).toBe(200);
    });
  });

  describe('best and lowest bookings', () => {
    it('finds booking with best tip', () => {
      const bookings = [
        createMockBooking({ id: '1', tip: 100 }),
        createMockBooking({ id: '2', tip: 500 }),
        createMockBooking({ id: '3', tip: 200 }),
      ];

      const withTips = bookings.filter((b) => b.tip && b.tip > 0);
      const best = withTips.reduce((max, b) =>
        (b.tip || 0) > (max.tip || 0) ? b : max
      );

      expect(best.id).toBe('2');
      expect(best.tip).toBe(500);
    });

    it('returns null when no tips exist', () => {
      const bookings = [
        createMockBooking({ id: '1', tip: undefined }),
        createMockBooking({ id: '2', tip: 0 }),
      ];

      const withTips = bookings.filter((b) => b.tip && b.tip > 0);
      expect(withTips).toHaveLength(0);
    });

    it('finds booking with lowest spend', () => {
      const expensesByBooking = new Map([
        ['1', 1000],
        ['2', 500],
        ['3', 750],
      ]);

      const bookings = [
        createMockBooking({ id: '1', status: BOOKING_STATUS.COMPLETED }),
        createMockBooking({ id: '2', status: BOOKING_STATUS.COMPLETED }),
        createMockBooking({ id: '3', status: BOOKING_STATUS.COMPLETED }),
      ];

      const completed = bookings.filter(
        (b) =>
          b.status === BOOKING_STATUS.COMPLETED &&
          expensesByBooking.has(b.id)
      );

      const lowest = completed.reduce((min, b) => {
        const minSpend = expensesByBooking.get(min.id) || Infinity;
        const bSpend = expensesByBooking.get(b.id) || Infinity;
        return bSpend < minSpend ? b : min;
      });

      expect(lowest.id).toBe('2');
    });
  });

  describe('date formatting', () => {
    it('formats date as short HR format', () => {
      const formatDateShort = (date: Date): string => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        return `${day}.${month}.`;
      };

      expect(formatDateShort(new Date('2026-02-15'))).toBe('15.02.');
      expect(formatDateShort(new Date('2026-12-01'))).toBe('01.12.');
      expect(formatDateShort(new Date('2026-01-05'))).toBe('05.01.');
    });
  });
});
