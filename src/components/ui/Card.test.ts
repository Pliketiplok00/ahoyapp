/**
 * Card Component Tests
 *
 * Tests for card styling logic.
 */

import { getCardVariantStyles, getCardPadding } from './Card';
import { COLORS, SPACING, BORDER_RADIUS } from '../../config/theme';

describe('Card', () => {
  describe('getCardVariantStyles', () => {
    describe('base styles', () => {
      it('has border radius for all variants', () => {
        expect(getCardVariantStyles('elevated').borderRadius).toBe(BORDER_RADIUS.lg);
        expect(getCardVariantStyles('outlined').borderRadius).toBe(BORDER_RADIUS.lg);
        expect(getCardVariantStyles('filled').borderRadius).toBe(BORDER_RADIUS.lg);
      });

      it('has overflow hidden for all variants', () => {
        expect(getCardVariantStyles('elevated').overflow).toBe('hidden');
        expect(getCardVariantStyles('outlined').overflow).toBe('hidden');
        expect(getCardVariantStyles('filled').overflow).toBe('hidden');
      });
    });

    describe('elevated variant', () => {
      const styles = getCardVariantStyles('elevated');

      it('has white background', () => {
        expect(styles.backgroundColor).toBe(COLORS.white);
      });

      it('has shadow', () => {
        expect(styles.shadowColor).toBe('#000');
        expect(styles.shadowOffset).toEqual({ width: 0, height: 2 });
        expect(styles.shadowOpacity).toBe(0.1);
        expect(styles.shadowRadius).toBe(8);
        expect(styles.elevation).toBe(3);
      });
    });

    describe('outlined variant', () => {
      const styles = getCardVariantStyles('outlined');

      it('has white background', () => {
        expect(styles.backgroundColor).toBe(COLORS.white);
      });

      it('has border', () => {
        expect(styles.borderWidth).toBe(1);
        expect(styles.borderColor).toBe(COLORS.border);
      });

      it('has no shadow', () => {
        expect(styles.shadowColor).toBeUndefined();
        expect(styles.elevation).toBeUndefined();
      });
    });

    describe('filled variant', () => {
      const styles = getCardVariantStyles('filled');

      it('has surface background', () => {
        expect(styles.backgroundColor).toBe(COLORS.surface);
      });

      it('has no border', () => {
        expect(styles.borderWidth).toBeUndefined();
      });

      it('has no shadow', () => {
        expect(styles.shadowColor).toBeUndefined();
        expect(styles.elevation).toBeUndefined();
      });
    });
  });

  describe('getCardPadding', () => {
    it('returns 0 for none', () => {
      expect(getCardPadding('none')).toBe(0);
    });

    it('returns sm spacing for sm', () => {
      expect(getCardPadding('sm')).toBe(SPACING.sm);
    });

    it('returns md spacing for md', () => {
      expect(getCardPadding('md')).toBe(SPACING.md);
    });

    it('returns lg spacing for lg', () => {
      expect(getCardPadding('lg')).toBe(SPACING.lg);
    });
  });

  describe('style combinations', () => {
    it('elevated card with lg padding', () => {
      const variant = getCardVariantStyles('elevated');
      const padding = getCardPadding('lg');

      expect(variant.backgroundColor).toBe(COLORS.white);
      expect(variant.elevation).toBe(3);
      expect(padding).toBe(SPACING.lg);
    });

    it('outlined card with no padding', () => {
      const variant = getCardVariantStyles('outlined');
      const padding = getCardPadding('none');

      expect(variant.borderWidth).toBe(1);
      expect(padding).toBe(0);
    });

    it('filled card with sm padding', () => {
      const variant = getCardVariantStyles('filled');
      const padding = getCardPadding('sm');

      expect(variant.backgroundColor).toBe(COLORS.surface);
      expect(padding).toBe(SPACING.sm);
    });
  });
});
