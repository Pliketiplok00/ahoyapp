/**
 * NextBookingCard Tests
 *
 * Tests for days until calculations and formatting.
 */

// Mock expo-router to avoid JSX parsing issues
jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() })),
}));

// Mock marinas config
jest.mock('../../../config/marinas', () => ({
  getMarinaBadge: jest.fn(() => null),
}));

import {
  calculateDaysUntil,
  formatDaysUntilHR,
  formatDaysUntilEN,
} from './NextBookingCard';

describe('NextBookingCard', () => {
  describe('calculateDaysUntil', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('calculates days until correctly', () => {
      jest.setSystemTime(new Date('2024-06-10'));
      const arrivalDate = new Date('2024-06-15');

      expect(calculateDaysUntil(arrivalDate)).toBe(5);
    });

    it('returns 0 for today', () => {
      jest.setSystemTime(new Date('2024-06-15'));
      const arrivalDate = new Date('2024-06-15');

      expect(calculateDaysUntil(arrivalDate)).toBe(0);
    });

    it('returns 1 for tomorrow', () => {
      jest.setSystemTime(new Date('2024-06-14'));
      const arrivalDate = new Date('2024-06-15');

      expect(calculateDaysUntil(arrivalDate)).toBe(1);
    });

    it('returns 0 for past dates', () => {
      jest.setSystemTime(new Date('2024-06-20'));
      const arrivalDate = new Date('2024-06-15');

      expect(calculateDaysUntil(arrivalDate)).toBe(0);
    });

    it('handles large gaps correctly', () => {
      jest.setSystemTime(new Date('2024-06-01'));
      const arrivalDate = new Date('2024-07-01');

      expect(calculateDaysUntil(arrivalDate)).toBe(30);
    });

    it('ignores time components', () => {
      jest.setSystemTime(new Date('2024-06-14T23:59:59'));
      const arrivalDate = new Date('2024-06-15T00:00:01');

      expect(calculateDaysUntil(arrivalDate)).toBe(1);
    });
  });

  describe('formatDaysUntilHR', () => {
    it('formats today correctly', () => {
      expect(formatDaysUntilHR(0)).toBe('danas');
    });

    it('formats tomorrow correctly', () => {
      expect(formatDaysUntilHR(1)).toBe('sutra');
    });

    it('formats 2 days correctly', () => {
      expect(formatDaysUntilHR(2)).toBe('za 2 d.');
    });

    it('formats multiple days correctly', () => {
      expect(formatDaysUntilHR(5)).toBe('za 5 d.');
      expect(formatDaysUntilHR(10)).toBe('za 10 d.');
      expect(formatDaysUntilHR(30)).toBe('za 30 d.');
    });
  });

  describe('formatDaysUntilEN', () => {
    it('formats today correctly', () => {
      expect(formatDaysUntilEN(0)).toBe('today');
    });

    it('formats tomorrow correctly', () => {
      expect(formatDaysUntilEN(1)).toBe('tomorrow');
    });

    it('formats 2 days correctly', () => {
      expect(formatDaysUntilEN(2)).toBe('in 2d');
    });

    it('formats multiple days correctly', () => {
      expect(formatDaysUntilEN(5)).toBe('in 5d');
      expect(formatDaysUntilEN(10)).toBe('in 10d');
      expect(formatDaysUntilEN(30)).toBe('in 30d');
    });
  });
});
