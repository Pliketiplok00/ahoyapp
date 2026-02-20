/**
 * AddScoreEntry Component Tests
 *
 * Tests for score entry form logic.
 */

import { getPointButtonStyle, formatPointValue } from './AddScoreEntry';
import { COLORS } from '../../../config/theme';

describe('AddScoreEntry', () => {
  describe('getPointButtonStyle', () => {
    describe('positive points', () => {
      it('returns success colors when selected', () => {
        const style = getPointButtonStyle(3, true);
        expect(style.backgroundColor).toBe(COLORS.success);
        expect(style.textColor).toBe(COLORS.white);
      });

      it('returns transparent success when not selected', () => {
        const style = getPointButtonStyle(2, false);
        expect(style.backgroundColor).toBe(`${COLORS.success}20`);
        expect(style.textColor).toBe(COLORS.success);
      });

      it('handles +1 correctly', () => {
        const selected = getPointButtonStyle(1, true);
        const unselected = getPointButtonStyle(1, false);

        expect(selected.backgroundColor).toBe(COLORS.success);
        expect(unselected.textColor).toBe(COLORS.success);
      });
    });

    describe('negative points', () => {
      it('returns error colors when selected', () => {
        const style = getPointButtonStyle(-3, true);
        expect(style.backgroundColor).toBe(COLORS.error);
        expect(style.textColor).toBe(COLORS.white);
      });

      it('returns transparent error when not selected', () => {
        const style = getPointButtonStyle(-2, false);
        expect(style.backgroundColor).toBe(`${COLORS.error}20`);
        expect(style.textColor).toBe(COLORS.error);
      });

      it('handles -1 correctly', () => {
        const selected = getPointButtonStyle(-1, true);
        const unselected = getPointButtonStyle(-1, false);

        expect(selected.backgroundColor).toBe(COLORS.error);
        expect(unselected.textColor).toBe(COLORS.error);
      });
    });
  });

  describe('formatPointValue', () => {
    it('formats positive points with plus sign', () => {
      expect(formatPointValue(1)).toBe('+1');
      expect(formatPointValue(2)).toBe('+2');
      expect(formatPointValue(3)).toBe('+3');
    });

    it('formats negative points with minus sign', () => {
      expect(formatPointValue(-1)).toBe('-1');
      expect(formatPointValue(-2)).toBe('-2');
      expect(formatPointValue(-3)).toBe('-3');
    });

    it('formats zero without sign', () => {
      expect(formatPointValue(0)).toBe('0');
    });
  });

  describe('valid score point values', () => {
    const validPoints = [-3, -2, -1, 1, 2, 3];

    it('handles all valid point values for selected state', () => {
      for (const points of validPoints) {
        const style = getPointButtonStyle(points, true);
        expect(style.backgroundColor).toBeTruthy();
        expect(style.textColor).toBeTruthy();
      }
    });

    it('handles all valid point values for unselected state', () => {
      for (const points of validPoints) {
        const style = getPointButtonStyle(points, false);
        expect(style.backgroundColor).toBeTruthy();
        expect(style.textColor).toBeTruthy();
      }
    });

    it('formats all valid point values correctly', () => {
      expect(formatPointValue(-3)).toBe('-3');
      expect(formatPointValue(-2)).toBe('-2');
      expect(formatPointValue(-1)).toBe('-1');
      expect(formatPointValue(1)).toBe('+1');
      expect(formatPointValue(2)).toBe('+2');
      expect(formatPointValue(3)).toBe('+3');
    });
  });

  describe('button state transitions', () => {
    it('changes style when selection changes for positive', () => {
      const unselected = getPointButtonStyle(2, false);
      const selected = getPointButtonStyle(2, true);

      expect(unselected.backgroundColor).not.toBe(selected.backgroundColor);
      expect(unselected.textColor).not.toBe(selected.textColor);
    });

    it('changes style when selection changes for negative', () => {
      const unselected = getPointButtonStyle(-2, false);
      const selected = getPointButtonStyle(-2, true);

      expect(unselected.backgroundColor).not.toBe(selected.backgroundColor);
      expect(unselected.textColor).not.toBe(selected.textColor);
    });
  });
});
