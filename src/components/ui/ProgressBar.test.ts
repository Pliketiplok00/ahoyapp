/**
 * ProgressBar Component Tests
 *
 * Tests for progress bar logic.
 */

import { clampProgress, getProgressWidth } from './ProgressBar';

describe('ProgressBar', () => {
  describe('clampProgress', () => {
    it('returns same value for valid progress (0-100)', () => {
      expect(clampProgress(50)).toBe(50);
    });

    it('returns 0 for negative values', () => {
      expect(clampProgress(-10)).toBe(0);
    });

    it('returns 100 for values over 100', () => {
      expect(clampProgress(150)).toBe(100);
    });

    it('handles boundary values', () => {
      expect(clampProgress(0)).toBe(0);
      expect(clampProgress(100)).toBe(100);
    });

    it('handles decimal values', () => {
      expect(clampProgress(45.5)).toBe(45.5);
    });
  });

  describe('getProgressWidth', () => {
    it('returns percentage string for valid progress', () => {
      expect(getProgressWidth(50)).toBe('50%');
    });

    it('clamps negative values to 0%', () => {
      expect(getProgressWidth(-20)).toBe('0%');
    });

    it('clamps values over 100 to 100%', () => {
      expect(getProgressWidth(200)).toBe('100%');
    });

    it('handles zero', () => {
      expect(getProgressWidth(0)).toBe('0%');
    });

    it('handles 100', () => {
      expect(getProgressWidth(100)).toBe('100%');
    });

    it('handles decimal values', () => {
      expect(getProgressWidth(33.33)).toBe('33.33%');
    });
  });
});
