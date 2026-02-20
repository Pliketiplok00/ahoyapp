/**
 * ExpenseItem Tests
 *
 * Tests for expense item display logic.
 */

import { getSyncIndicator, getTypeBadge } from './ExpenseItem';
import { COLORS } from '../../../config/theme';

describe('ExpenseItem', () => {
  describe('getSyncIndicator', () => {
    it('returns green check for synced', () => {
      const result = getSyncIndicator('synced');

      expect(result.icon).toBe('\u{2705}');
      expect(result.color).toBe(COLORS.success);
    });

    it('returns sync icon for pending', () => {
      const result = getSyncIndicator('pending');

      expect(result.icon).toBe('\u{1F504}');
      expect(result.color).toBe(COLORS.warning);
    });

    it('returns warning for error', () => {
      const result = getSyncIndicator('error');

      expect(result.icon).toBe('\u{26A0}');
      expect(result.color).toBe(COLORS.error);
    });
  });

  describe('getTypeBadge', () => {
    it('returns receipt badge for receipt type', () => {
      const result = getTypeBadge('receipt');

      expect(result.label).toBe('Receipt');
      expect(result.color).toBe(COLORS.sageGreen);
    });

    it('returns manual badge for no-receipt type', () => {
      const result = getTypeBadge('no-receipt');

      expect(result.label).toBe('Manual');
      expect(result.color).toBe(COLORS.steelBlue);
    });
  });
});
