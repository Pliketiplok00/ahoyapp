/**
 * SeasonProgress Tests
 *
 * Tests for season progress calculations.
 */

import { calculateSeasonProgress, getProgressColor } from './SeasonProgress';
import { COLORS } from '../../../config/theme';

describe('SeasonProgress', () => {
  describe('calculateSeasonProgress', () => {
    it('calculates percentage correctly', () => {
      expect(calculateSeasonProgress(5, 10)).toBe(50);
      expect(calculateSeasonProgress(0, 10)).toBe(0);
      expect(calculateSeasonProgress(10, 10)).toBe(100);
      expect(calculateSeasonProgress(3, 12)).toBe(25);
    });

    it('returns 0 for 0 total', () => {
      expect(calculateSeasonProgress(0, 0)).toBe(0);
      expect(calculateSeasonProgress(5, 0)).toBe(0);
    });

    it('caps at 100%', () => {
      expect(calculateSeasonProgress(15, 10)).toBe(100);
    });

    it('handles negative values gracefully', () => {
      expect(calculateSeasonProgress(-5, 10)).toBe(0);
    });

    it('handles decimal results', () => {
      const result = calculateSeasonProgress(1, 3);
      expect(result).toBeCloseTo(33.33, 1);
    });

    it('calculates small percentages', () => {
      expect(calculateSeasonProgress(1, 100)).toBe(1);
      expect(calculateSeasonProgress(1, 1000)).toBe(0.1);
    });

    it('calculates large counts correctly', () => {
      expect(calculateSeasonProgress(50, 100)).toBe(50);
      expect(calculateSeasonProgress(99, 100)).toBe(99);
    });
  });

  describe('getProgressColor', () => {
    it('returns success color at 90%+', () => {
      expect(getProgressColor(90)).toBe(COLORS.success);
      expect(getProgressColor(95)).toBe(COLORS.success);
      expect(getProgressColor(100)).toBe(COLORS.success);
    });

    it('returns sageGreen at 50-89%', () => {
      expect(getProgressColor(50)).toBe(COLORS.sageGreen);
      expect(getProgressColor(75)).toBe(COLORS.sageGreen);
      expect(getProgressColor(89)).toBe(COLORS.sageGreen);
    });

    it('returns steelBlue below 50%', () => {
      expect(getProgressColor(0)).toBe(COLORS.steelBlue);
      expect(getProgressColor(25)).toBe(COLORS.steelBlue);
      expect(getProgressColor(49)).toBe(COLORS.steelBlue);
    });

    it('handles boundary conditions', () => {
      expect(getProgressColor(49.9)).toBe(COLORS.steelBlue);
      expect(getProgressColor(50)).toBe(COLORS.sageGreen);
      expect(getProgressColor(89.9)).toBe(COLORS.sageGreen);
      expect(getProgressColor(90)).toBe(COLORS.success);
    });
  });
});
