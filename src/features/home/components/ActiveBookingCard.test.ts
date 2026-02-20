/**
 * ActiveBookingCard Tests
 *
 * Tests for day progress and APA calculations.
 */

// Mock expo-router to avoid JSX parsing issues
jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() })),
}));

// Mock marinas config
jest.mock('../../../config/marinas', () => ({
  getMarinaBadge: jest.fn(() => null),
}));

import { calculateDayProgress, calculateApaProgress } from './ActiveBookingCard';

describe('ActiveBookingCard', () => {
  describe('calculateDayProgress', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('calculates day progress correctly', () => {
      jest.setSystemTime(new Date('2024-06-03'));
      const arrival = new Date('2024-06-01');
      const departure = new Date('2024-06-08');

      const result = calculateDayProgress(arrival, departure);

      expect(result.currentDay).toBe(3);
      expect(result.totalDays).toBe(8);
      expect(result.daysLeft).toBe(5);
    });

    it('returns day 1 when booking just started', () => {
      jest.setSystemTime(new Date('2024-06-01'));
      const arrival = new Date('2024-06-01');
      const departure = new Date('2024-06-08');

      const result = calculateDayProgress(arrival, departure);

      expect(result.currentDay).toBe(1);
    });

    it('returns last day when on departure date', () => {
      jest.setSystemTime(new Date('2024-06-08'));
      const arrival = new Date('2024-06-01');
      const departure = new Date('2024-06-08');

      const result = calculateDayProgress(arrival, departure);

      expect(result.currentDay).toBe(8);
      expect(result.daysLeft).toBe(0);
    });

    it('caps current day at total days', () => {
      jest.setSystemTime(new Date('2024-06-15'));
      const arrival = new Date('2024-06-01');
      const departure = new Date('2024-06-08');

      const result = calculateDayProgress(arrival, departure);

      expect(result.currentDay).toBe(8);
      expect(result.daysLeft).toBe(0);
    });

    it('handles single day booking', () => {
      jest.setSystemTime(new Date('2024-06-01'));
      const arrival = new Date('2024-06-01');
      const departure = new Date('2024-06-01');

      const result = calculateDayProgress(arrival, departure);

      expect(result.currentDay).toBe(1);
      expect(result.totalDays).toBe(1);
      expect(result.daysLeft).toBe(0);
    });

    it('handles dates before booking starts', () => {
      jest.setSystemTime(new Date('2024-05-25'));
      const arrival = new Date('2024-06-01');
      const departure = new Date('2024-06-08');

      const result = calculateDayProgress(arrival, departure);

      expect(result.currentDay).toBe(1); // Minimum is 1
      expect(result.totalDays).toBe(8);
    });
  });

  describe('calculateApaProgress', () => {
    it('calculates percentage correctly', () => {
      expect(calculateApaProgress(2500, 5000)).toBe(50);
      expect(calculateApaProgress(0, 5000)).toBe(0);
      expect(calculateApaProgress(5000, 5000)).toBe(100);
    });

    it('caps at 100%', () => {
      expect(calculateApaProgress(6000, 5000)).toBe(100);
    });

    it('returns 0 for 0 total', () => {
      expect(calculateApaProgress(100, 0)).toBe(0);
    });

    it('handles negative spent gracefully', () => {
      expect(calculateApaProgress(-100, 5000)).toBe(0);
    });

    it('calculates various percentages correctly', () => {
      expect(calculateApaProgress(1000, 4000)).toBe(25);
      expect(calculateApaProgress(3000, 4000)).toBe(75);
      expect(calculateApaProgress(100, 1000)).toBe(10);
    });
  });
});
