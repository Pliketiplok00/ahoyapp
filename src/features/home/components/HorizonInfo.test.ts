/**
 * HorizonInfo Tests
 *
 * Tests for horizon status calculation and messaging.
 */

import { Timestamp } from 'firebase/firestore';
import {
  calculateDaysBetween,
  getHorizonStatus,
  getHorizonMessage,
  getHorizonIcon,
} from './HorizonInfo';
import type { Booking } from '../../../types/models';

// Create a mock Timestamp
const createMockTimestamp = (date: Date) => ({
  toDate: () => date,
  seconds: Math.floor(date.getTime() / 1000),
  nanoseconds: 0,
});

// Create mock booking
const createMockBooking = (arrivalDate: Date, departureDate: Date): Booking => ({
  id: 'booking-1',
  seasonId: 'season-1',
  arrivalDate: createMockTimestamp(arrivalDate) as Timestamp,
  departureDate: createMockTimestamp(departureDate) as Timestamp,
  arrivalMarina: 'split',
  departureMarina: 'split',
  guestCount: 8,
  status: 'active',
  apaTotal: 5000,
  createdBy: 'user-1',
  createdAt: createMockTimestamp(new Date()) as Timestamp,
  updatedAt: createMockTimestamp(new Date()) as Timestamp,
});

describe('HorizonInfo', () => {
  describe('calculateDaysBetween', () => {
    it('calculates positive difference correctly', () => {
      const date1 = new Date('2024-06-01');
      const date2 = new Date('2024-06-08');

      expect(calculateDaysBetween(date1, date2)).toBe(7);
    });

    it('calculates negative difference correctly', () => {
      const date1 = new Date('2024-06-08');
      const date2 = new Date('2024-06-01');

      expect(calculateDaysBetween(date1, date2)).toBe(-7);
    });

    it('returns 0 for same date', () => {
      const date1 = new Date('2024-06-01');
      const date2 = new Date('2024-06-01');

      expect(calculateDaysBetween(date1, date2)).toBe(0);
    });

    it('ignores time components', () => {
      const date1 = new Date('2024-06-01T08:00:00');
      const date2 = new Date('2024-06-01T20:00:00');

      expect(calculateDaysBetween(date1, date2)).toBe(0);
    });

    it('handles month boundaries', () => {
      const date1 = new Date('2024-05-30');
      const date2 = new Date('2024-06-02');

      expect(calculateDaysBetween(date1, date2)).toBe(3);
    });
  });

  describe('getHorizonStatus', () => {
    it('returns season-start when no bookings', () => {
      const result = getHorizonStatus(null, null);

      expect(result.type).toBe('season-start');
      expect(result.daysOff).toBe(0);
    });

    it('returns season-start when only next booking', () => {
      const next = createMockBooking(
        new Date('2024-06-15'),
        new Date('2024-06-22')
      );

      const result = getHorizonStatus(null, next);

      expect(result.type).toBe('season-start');
      expect(result.daysOff).toBe(0);
    });

    it('returns no-upcoming when only active booking', () => {
      const active = createMockBooking(
        new Date('2024-06-01'),
        new Date('2024-06-08')
      );

      const result = getHorizonStatus(active, null);

      expect(result.type).toBe('no-upcoming');
      expect(result.daysOff).toBe(0);
    });

    it('returns back-to-back for same day transition', () => {
      const active = createMockBooking(
        new Date('2024-06-01'),
        new Date('2024-06-08')
      );
      const next = createMockBooking(
        new Date('2024-06-08'),
        new Date('2024-06-15')
      );

      const result = getHorizonStatus(active, next);

      expect(result.type).toBe('back-to-back');
      expect(result.daysOff).toBe(0);
    });

    it('returns back-to-back for 1 day gap', () => {
      const active = createMockBooking(
        new Date('2024-06-01'),
        new Date('2024-06-08')
      );
      const next = createMockBooking(
        new Date('2024-06-09'),
        new Date('2024-06-16')
      );

      const result = getHorizonStatus(active, next);

      expect(result.type).toBe('back-to-back');
    });

    it('returns days-off for gap > 1 day', () => {
      const active = createMockBooking(
        new Date('2024-06-01'),
        new Date('2024-06-08')
      );
      const next = createMockBooking(
        new Date('2024-06-15'),
        new Date('2024-06-22')
      );

      const result = getHorizonStatus(active, next);

      expect(result.type).toBe('days-off');
      expect(result.daysOff).toBe(6); // June 9-14 = 6 days
    });

    it('calculates 2 days off correctly', () => {
      const active = createMockBooking(
        new Date('2024-06-01'),
        new Date('2024-06-08')
      );
      const next = createMockBooking(
        new Date('2024-06-11'),
        new Date('2024-06-18')
      );

      const result = getHorizonStatus(active, next);

      expect(result.type).toBe('days-off');
      expect(result.daysOff).toBe(2); // June 9-10 = 2 days
    });
  });

  describe('getHorizonMessage', () => {
    it('returns Croatian days off message (singular)', () => {
      const status = { type: 'days-off' as const, daysOff: 1 };

      expect(getHorizonMessage(status, true)).toBe('1 dan pauze nakon ovog bookinga');
    });

    it('returns Croatian days off message (plural)', () => {
      const status = { type: 'days-off' as const, daysOff: 5 };

      expect(getHorizonMessage(status, true)).toBe('5 dana pauze nakon ovog bookinga');
    });

    it('returns English days off message (singular)', () => {
      const status = { type: 'days-off' as const, daysOff: 1 };

      expect(getHorizonMessage(status, false)).toBe('1 day off after this booking');
    });

    it('returns English days off message (plural)', () => {
      const status = { type: 'days-off' as const, daysOff: 5 };

      expect(getHorizonMessage(status, false)).toBe('5 days off after this booking');
    });

    it('returns back-to-back message', () => {
      const status = { type: 'back-to-back' as const, daysOff: 0 };

      expect(getHorizonMessage(status, true)).toBe('Back-to-back bookings!');
      expect(getHorizonMessage(status, false)).toBe('Back-to-back bookings!');
    });

    it('returns no-upcoming message (Croatian)', () => {
      const status = { type: 'no-upcoming' as const, daysOff: 0 };

      expect(getHorizonMessage(status, true)).toBe('Nema nadolazećih bookinga');
    });

    it('returns no-upcoming message (English)', () => {
      const status = { type: 'no-upcoming' as const, daysOff: 0 };

      expect(getHorizonMessage(status, false)).toBe('No upcoming bookings');
    });

    it('returns season-start message (Croatian)', () => {
      const status = { type: 'season-start' as const, daysOff: 0 };

      expect(getHorizonMessage(status, true)).toBe('Sezona spremna za početak');
    });

    it('returns season-start message (English)', () => {
      const status = { type: 'season-start' as const, daysOff: 0 };

      expect(getHorizonMessage(status, false)).toBe('Season ready to start');
    });
  });

  describe('getHorizonIcon', () => {
    it('returns green circle for days-off', () => {
      const status = { type: 'days-off' as const, daysOff: 5 };

      expect(getHorizonIcon(status)).toBe('\u{1F7E2}');
    });

    it('returns red circle for back-to-back', () => {
      const status = { type: 'back-to-back' as const, daysOff: 0 };

      expect(getHorizonIcon(status)).toBe('\u{1F534}');
    });

    it('returns chart for no-upcoming', () => {
      const status = { type: 'no-upcoming' as const, daysOff: 0 };

      expect(getHorizonIcon(status)).toBe('\u{1F4CA}');
    });

    it('returns chart for season-start', () => {
      const status = { type: 'season-start' as const, daysOff: 0 };

      expect(getHorizonIcon(status)).toBe('\u{1F4CA}');
    });
  });
});
