/**
 * ExpenseSummary Tests
 *
 * Tests for APA usage calculations.
 */

import { calculateApaUsage, getProgressColor } from './ExpenseSummary';
import { COLORS } from '../../../config/theme';

describe('ExpenseSummary', () => {
  describe('calculateApaUsage', () => {
    it('calculates percentage correctly', () => {
      expect(calculateApaUsage(2500, 5000)).toBe(50);
      expect(calculateApaUsage(0, 5000)).toBe(0);
      expect(calculateApaUsage(5000, 5000)).toBe(100);
    });

    it('returns 0 for 0 total', () => {
      expect(calculateApaUsage(100, 0)).toBe(0);
      expect(calculateApaUsage(0, 0)).toBe(0);
    });

    it('caps at 100%', () => {
      expect(calculateApaUsage(6000, 5000)).toBe(100);
      expect(calculateApaUsage(10000, 5000)).toBe(100);
    });

    it('handles negative spent gracefully', () => {
      expect(calculateApaUsage(-100, 5000)).toBe(0);
    });

    it('calculates various percentages correctly', () => {
      expect(calculateApaUsage(1000, 4000)).toBe(25);
      expect(calculateApaUsage(3000, 4000)).toBe(75);
      expect(calculateApaUsage(100, 1000)).toBe(10);
      expect(calculateApaUsage(900, 1000)).toBe(90);
    });
  });

  describe('getProgressColor', () => {
    it('returns error color at 90%+', () => {
      expect(getProgressColor(90)).toBe(COLORS.error);
      expect(getProgressColor(95)).toBe(COLORS.error);
      expect(getProgressColor(100)).toBe(COLORS.error);
    });

    it('returns warning color at 75-89%', () => {
      expect(getProgressColor(75)).toBe(COLORS.warning);
      expect(getProgressColor(80)).toBe(COLORS.warning);
      expect(getProgressColor(89)).toBe(COLORS.warning);
    });

    it('returns sageGreen below 75%', () => {
      expect(getProgressColor(0)).toBe(COLORS.sageGreen);
      expect(getProgressColor(50)).toBe(COLORS.sageGreen);
      expect(getProgressColor(74)).toBe(COLORS.sageGreen);
    });

    it('handles boundary conditions', () => {
      expect(getProgressColor(74.9)).toBe(COLORS.sageGreen);
      expect(getProgressColor(75)).toBe(COLORS.warning);
      expect(getProgressColor(89.9)).toBe(COLORS.warning);
      expect(getProgressColor(90)).toBe(COLORS.error);
    });
  });
});
