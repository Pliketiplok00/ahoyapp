/**
 * SeasonCalendar Tests
 */

import {
  generateCalendarMonths,
  timestampToDate,
  isDateInBooking,
  DAY_NAMES,
  MONTH_NAMES,
} from '../utils/calendarUtils';
import type { Season, Booking, Timestamp } from '../../../types/models';

// Helper to create mock Timestamp
function createTimestamp(date: Date): Timestamp {
  return {
    seconds: Math.floor(date.getTime() / 1000),
    nanoseconds: 0,
    toDate: () => date,
  };
}

// Mock season for testing
function createMockSeason(startDate: Date, endDate: Date): Season {
  return {
    id: 'season-1',
    boatName: 'Test Boat',
    name: 'Test Season 2026',
    startDate: createTimestamp(startDate),
    endDate: createTimestamp(endDate),
    currency: 'EUR',
    tipSplitType: 'equal',
    createdBy: 'user-1',
    createdAt: createTimestamp(new Date()),
    updatedAt: createTimestamp(new Date()),
  };
}

// Mock booking for testing
function createMockBooking(
  id: string,
  arrivalDate: Date,
  departureDate: Date,
  status: 'active' | 'upcoming' | 'completed' = 'upcoming'
): Booking {
  return {
    id,
    seasonId: 'season-1',
    arrivalDate: createTimestamp(arrivalDate),
    departureDate: createTimestamp(departureDate),
    departureMarina: 'Kaštela',
    arrivalMarina: 'Kaštela',
    guestCount: 6,
    status,
    apaTotal: 10000,
    createdBy: 'user-1',
    createdAt: createTimestamp(new Date()),
    updatedAt: createTimestamp(new Date()),
  };
}

describe('SeasonCalendar', () => {
  describe('DAY_NAMES', () => {
    it('should have 7 Croatian day names', () => {
      expect(DAY_NAMES).toHaveLength(7);
    });

    it('should start with PON (Monday)', () => {
      expect(DAY_NAMES[0]).toBe('PON');
    });

    it('should end with NED (Sunday)', () => {
      expect(DAY_NAMES[6]).toBe('NED');
    });

    it('should have all Croatian day abbreviations', () => {
      expect(DAY_NAMES).toEqual(['PON', 'UTO', 'SRI', 'ČET', 'PET', 'SUB', 'NED']);
    });
  });

  describe('MONTH_NAMES', () => {
    it('should have 12 Croatian month names', () => {
      expect(MONTH_NAMES).toHaveLength(12);
    });

    it('should start with SIJEČANJ (January)', () => {
      expect(MONTH_NAMES[0]).toBe('SIJEČANJ');
    });

    it('should end with PROSINAC (December)', () => {
      expect(MONTH_NAMES[11]).toBe('PROSINAC');
    });

    it('should have VELJAČA as February', () => {
      expect(MONTH_NAMES[1]).toBe('VELJAČA');
    });

    it('should have SRPANJ as July', () => {
      expect(MONTH_NAMES[6]).toBe('SRPANJ');
    });
  });

  describe('timestampToDate', () => {
    it('should convert Timestamp with toDate method', () => {
      const originalDate = new Date('2026-05-15');
      const timestamp = createTimestamp(originalDate);
      const result = timestampToDate(timestamp);
      expect(result.getTime()).toBe(originalDate.getTime());
    });

    it('should convert Timestamp using seconds', () => {
      const originalDate = new Date('2026-07-20');
      const timestamp: Timestamp = {
        seconds: Math.floor(originalDate.getTime() / 1000),
        nanoseconds: 0,
        toDate: undefined as unknown as () => Date,
      };
      const result = timestampToDate(timestamp);
      // Allow 1 second tolerance due to millisecond truncation
      expect(Math.abs(result.getTime() - originalDate.getTime())).toBeLessThan(1000);
    });
  });

  describe('isDateInBooking', () => {
    const booking = createMockBooking(
      'booking-1',
      new Date('2026-05-15'),
      new Date('2026-05-22')
    );

    it('should return true for arrival date', () => {
      expect(isDateInBooking(new Date('2026-05-15'), booking)).toBe(true);
    });

    it('should return true for departure date', () => {
      expect(isDateInBooking(new Date('2026-05-22'), booking)).toBe(true);
    });

    it('should return true for middle date', () => {
      expect(isDateInBooking(new Date('2026-05-18'), booking)).toBe(true);
    });

    it('should return false for date before booking', () => {
      expect(isDateInBooking(new Date('2026-05-14'), booking)).toBe(false);
    });

    it('should return false for date after booking', () => {
      expect(isDateInBooking(new Date('2026-05-23'), booking)).toBe(false);
    });
  });

  describe('generateCalendarMonths', () => {
    it('should generate months for a single-month season', () => {
      const season = createMockSeason(
        new Date('2026-05-01'),
        new Date('2026-05-31')
      );
      const months = generateCalendarMonths(season, []);

      expect(months).toHaveLength(1);
      expect(months[0].year).toBe(2026);
      expect(months[0].month).toBe(4); // May is index 4
    });

    it('should generate months for a multi-month season', () => {
      const season = createMockSeason(
        new Date('2026-05-01'),
        new Date('2026-09-30')
      );
      const months = generateCalendarMonths(season, []);

      expect(months).toHaveLength(5); // May, June, July, Aug, Sep
      expect(months[0].month).toBe(4); // May
      expect(months[4].month).toBe(8); // September
    });

    it('should have days array that is multiple of 7', () => {
      const season = createMockSeason(
        new Date('2026-05-01'),
        new Date('2026-05-31')
      );
      const months = generateCalendarMonths(season, []);

      months.forEach((month) => {
        expect(month.days.length % 7).toBe(0);
      });
    });

    it('should mark days with bookings', () => {
      const season = createMockSeason(
        new Date('2026-05-01'),
        new Date('2026-05-31')
      );
      const booking = createMockBooking(
        'booking-1',
        new Date('2026-05-15'),
        new Date('2026-05-22')
      );
      const months = generateCalendarMonths(season, [booking]);

      // Find day 15
      const day15 = months[0].days.find(
        (d) => d.isCurrentMonth && d.dayOfMonth === 15
      );
      expect(day15?.bookings).toHaveLength(1);
      expect(day15?.bookings[0].id).toBe('booking-1');

      // Find day 10 (no booking)
      const day10 = months[0].days.find(
        (d) => d.isCurrentMonth && d.dayOfMonth === 10
      );
      expect(day10?.bookings).toHaveLength(0);
    });

    it('should handle booking spanning two months', () => {
      const season = createMockSeason(
        new Date('2026-05-01'),
        new Date('2026-06-30')
      );
      const booking = createMockBooking(
        'booking-1',
        new Date('2026-05-28'),
        new Date('2026-06-05')
      );
      const months = generateCalendarMonths(season, [booking]);

      // May 28 should have booking
      const may28 = months[0].days.find(
        (d) => d.isCurrentMonth && d.dayOfMonth === 28
      );
      expect(may28?.bookings).toHaveLength(1);

      // June 5 should have booking
      const june5 = months[1].days.find(
        (d) => d.isCurrentMonth && d.dayOfMonth === 5
      );
      expect(june5?.bookings).toHaveLength(1);
    });

    it('should handle multiple bookings on overlapping days', () => {
      const season = createMockSeason(
        new Date('2026-05-01'),
        new Date('2026-05-31')
      );
      const booking1 = createMockBooking(
        'booking-1',
        new Date('2026-05-10'),
        new Date('2026-05-15')
      );
      const booking2 = createMockBooking(
        'booking-2',
        new Date('2026-05-15'),
        new Date('2026-05-20')
      );
      const months = generateCalendarMonths(season, [booking1, booking2]);

      // May 15 should have both bookings (overlap day)
      const may15 = months[0].days.find(
        (d) => d.isCurrentMonth && d.dayOfMonth === 15
      );
      expect(may15?.bookings).toHaveLength(2);
    });

    it('should handle empty bookings array', () => {
      const season = createMockSeason(
        new Date('2026-05-01'),
        new Date('2026-05-31')
      );
      const months = generateCalendarMonths(season, []);

      expect(months).toHaveLength(1);
      months[0].days.forEach((day) => {
        expect(day.bookings).toHaveLength(0);
      });
    });

    it('should mark other month days correctly', () => {
      const season = createMockSeason(
        new Date('2026-05-01'),
        new Date('2026-05-31')
      );
      const months = generateCalendarMonths(season, []);

      // First day might be from previous month
      const firstDays = months[0].days.filter((d) => !d.isCurrentMonth);
      // Last days might be from next month
      const hasOtherMonthDays = firstDays.length > 0;

      // May 2026 starts on Friday, so we should have 4 previous month days (Mon-Thu)
      if (hasOtherMonthDays) {
        expect(firstDays.some((d) => d.dayOfMonth > 20)).toBe(true); // April days
      }
    });

    it('should handle booking starting before season', () => {
      const season = createMockSeason(
        new Date('2026-05-15'),
        new Date('2026-05-31')
      );
      const booking = createMockBooking(
        'booking-1',
        new Date('2026-05-10'), // Before season start
        new Date('2026-05-20')
      );
      const months = generateCalendarMonths(season, [booking]);

      // Day 15 (season start) should still show booking
      const day15 = months[0].days.find(
        (d) => d.isCurrentMonth && d.dayOfMonth === 15
      );
      expect(day15?.bookings).toHaveLength(1);
    });
  });

  describe('calendar grid structure', () => {
    it('should have 7 days per row', () => {
      const season = createMockSeason(
        new Date('2026-05-01'),
        new Date('2026-05-31')
      );
      const months = generateCalendarMonths(season, []);

      // Grid should have complete rows
      expect(months[0].days.length % 7).toBe(0);
    });

    it('should generate at least 4 weeks for any month', () => {
      const season = createMockSeason(
        new Date('2026-02-01'), // February
        new Date('2026-02-28')
      );
      const months = generateCalendarMonths(season, []);

      expect(months[0].days.length).toBeGreaterThanOrEqual(28);
    });
  });
});
