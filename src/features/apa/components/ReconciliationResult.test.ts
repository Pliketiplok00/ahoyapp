/**
 * ReconciliationResult Tests
 *
 * Tests for reconciliation result display logic.
 */

import { getDifferenceColor, getDifferenceLabel, isAmountBalanced } from './ReconciliationResult';
import { COLORS } from '../../../config/theme';

describe('ReconciliationResult', () => {
  describe('getDifferenceColor', () => {
    it('returns success for balanced', () => {
      expect(getDifferenceColor(true, 0)).toBe(COLORS.success);
      expect(getDifferenceColor(true, 0.005)).toBe(COLORS.success);
    });

    it('returns success for surplus (positive difference)', () => {
      expect(getDifferenceColor(false, 100)).toBe(COLORS.success);
      expect(getDifferenceColor(false, 0.01)).toBe(COLORS.success);
    });

    it('returns error for shortage (negative difference)', () => {
      expect(getDifferenceColor(false, -100)).toBe(COLORS.error);
      expect(getDifferenceColor(false, -0.01)).toBe(COLORS.error);
    });
  });

  describe('getDifferenceLabel', () => {
    it('returns Balanced when balanced', () => {
      expect(getDifferenceLabel(true, 0)).toBe('Balanced');
      expect(getDifferenceLabel(true, 0.001)).toBe('Balanced');
    });

    it('returns Surplus for positive difference', () => {
      expect(getDifferenceLabel(false, 100)).toBe('Surplus');
      expect(getDifferenceLabel(false, 0.5)).toBe('Surplus');
    });

    it('returns Shortage for negative difference', () => {
      expect(getDifferenceLabel(false, -100)).toBe('Shortage');
      expect(getDifferenceLabel(false, -0.5)).toBe('Shortage');
    });

    it('returns Shortage for zero when not balanced flag', () => {
      // Edge case: if isBalanced is false but difference is 0
      expect(getDifferenceLabel(false, 0)).toBe('Shortage');
    });
  });

  describe('isAmountBalanced', () => {
    it('returns true for zero difference', () => {
      expect(isAmountBalanced(0)).toBe(true);
    });

    it('returns true for near-zero positive difference', () => {
      expect(isAmountBalanced(0.005)).toBe(true);
      expect(isAmountBalanced(0.009)).toBe(true);
    });

    it('returns true for near-zero negative difference', () => {
      expect(isAmountBalanced(-0.005)).toBe(true);
      expect(isAmountBalanced(-0.009)).toBe(true);
    });

    it('returns false for differences at threshold', () => {
      expect(isAmountBalanced(0.01)).toBe(false);
      expect(isAmountBalanced(-0.01)).toBe(false);
    });

    it('returns false for large differences', () => {
      expect(isAmountBalanced(100)).toBe(false);
      expect(isAmountBalanced(-100)).toBe(false);
      expect(isAmountBalanced(0.5)).toBe(false);
    });
  });
});
