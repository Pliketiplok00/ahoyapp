/**
 * Card Component Tests
 *
 * Tests for card styling logic (Brutalist).
 */

import { getCardVariantStyles, getCardPadding } from './Card';
import { COLORS, SPACING, BORDER_RADIUS, BORDERS, SHADOWS } from '../../config/theme';

describe('Card', () => {
  describe('getCardVariantStyles', () => {
    describe('base styles', () => {
      it('has no border radius for all variants (brutalist)', () => {
        expect(getCardVariantStyles('elevated').borderRadius).toBe(BORDER_RADIUS.none);
        expect(getCardVariantStyles('outlined').borderRadius).toBe(BORDER_RADIUS.none);
        expect(getCardVariantStyles('filled').borderRadius).toBe(BORDER_RADIUS.none);
      });

      it('has overflow hidden for all variants', () => {
        expect(getCardVariantStyles('elevated').overflow).toBe('hidden');
        expect(getCardVariantStyles('outlined').overflow).toBe('hidden');
        expect(getCardVariantStyles('filled').overflow).toBe('hidden');
      });
    });

    describe('elevated variant', () => {
      const styles = getCardVariantStyles('elevated');

      it('has card background', () => {
        expect(styles.backgroundColor).toBe(COLORS.card);
      });

      it('has border (brutalist)', () => {
        expect(styles.borderWidth).toBe(BORDERS.normal);
        expect(styles.borderColor).toBe(COLORS.foreground);
      });

      it('has brutalist shadow', () => {
        expect(styles.shadowColor).toBe(SHADOWS.brut.shadowColor);
        expect(styles.shadowOffset).toEqual(SHADOWS.brut.shadowOffset);
        expect(styles.shadowOpacity).toBe(SHADOWS.brut.shadowOpacity);
        expect(styles.shadowRadius).toBe(SHADOWS.brut.shadowRadius);
      });
    });

    describe('outlined variant', () => {
      const styles = getCardVariantStyles('outlined');

      it('has card background', () => {
        expect(styles.backgroundColor).toBe(COLORS.card);
      });

      it('has border (brutalist)', () => {
        expect(styles.borderWidth).toBe(BORDERS.normal);
        expect(styles.borderColor).toBe(COLORS.foreground);
      });

      it('has no shadow', () => {
        expect(styles.elevation).toBeUndefined();
      });
    });

    describe('filled variant', () => {
      const styles = getCardVariantStyles('filled');

      it('has muted background', () => {
        expect(styles.backgroundColor).toBe(COLORS.muted);
      });

      it('has thin border (brutalist)', () => {
        expect(styles.borderWidth).toBe(BORDERS.thin);
        expect(styles.borderColor).toBe(COLORS.foreground);
      });

      it('has no shadow', () => {
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

      expect(variant.backgroundColor).toBe(COLORS.card);
      expect(variant.borderWidth).toBe(BORDERS.normal);
      expect(padding).toBe(SPACING.lg);
    });

    it('outlined card with no padding', () => {
      const variant = getCardVariantStyles('outlined');
      const padding = getCardPadding('none');

      expect(variant.borderWidth).toBe(BORDERS.normal);
      expect(padding).toBe(0);
    });

    it('filled card with sm padding', () => {
      const variant = getCardVariantStyles('filled');
      const padding = getCardPadding('sm');

      expect(variant.backgroundColor).toBe(COLORS.muted);
      expect(padding).toBe(SPACING.sm);
    });
  });
});
