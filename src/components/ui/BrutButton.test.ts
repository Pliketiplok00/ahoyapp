/**
 * BrutButton Component Tests
 *
 * Tests for brutalist button styling logic.
 */

import {
  getVariantStyles,
  getSizeStyles,
  BASE_STYLES,
} from './BrutButton';
import { COLORS, BORDERS, BORDER_RADIUS, SPACING, TYPOGRAPHY } from '../../config/theme';

describe('BrutButton', () => {
  describe('getVariantStyles', () => {
    describe('primary variant', () => {
      const styles = getVariantStyles('primary');

      it('has dark (secondary) background', () => {
        expect(styles.bg).toBe(COLORS.secondary);
      });

      it('has white text', () => {
        expect(styles.text).toBe(COLORS.white);
      });
    });

    describe('blue variant', () => {
      const styles = getVariantStyles('blue');

      it('has primary (sky blue) background', () => {
        expect(styles.bg).toBe(COLORS.primary);
      });

      it('has foreground text', () => {
        expect(styles.text).toBe(COLORS.foreground);
      });
    });

    describe('accent variant', () => {
      const styles = getVariantStyles('accent');

      it('has accent (lime) background', () => {
        expect(styles.bg).toBe(COLORS.accent);
      });

      it('has foreground text', () => {
        expect(styles.text).toBe(COLORS.foreground);
      });
    });

    describe('secondary variant', () => {
      const styles = getVariantStyles('secondary');

      it('has card (white) background', () => {
        expect(styles.bg).toBe(COLORS.card);
      });

      it('has foreground text', () => {
        expect(styles.text).toBe(COLORS.foreground);
      });
    });

    it('returns secondary styles for unknown variant', () => {
      // @ts-expect-error - Testing invalid variant
      const styles = getVariantStyles('invalid');
      expect(styles.bg).toBe(COLORS.card);
      expect(styles.text).toBe(COLORS.foreground);
    });
  });

  describe('getSizeStyles', () => {
    describe('sm size', () => {
      const styles = getSizeStyles('sm');

      it('has compact padding', () => {
        expect(styles.container.paddingHorizontal).toBe(SPACING.sm);
        expect(styles.container.paddingVertical).toBe(SPACING.xs);
      });

      it('has label font size', () => {
        expect(styles.text.fontSize).toBe(TYPOGRAPHY.sizes.label);
      });
    });

    describe('md size (default)', () => {
      const styles = getSizeStyles('md');

      it('has standard padding', () => {
        expect(styles.container.paddingHorizontal).toBe(SPACING.lg);
        expect(styles.container.paddingVertical).toBe(SPACING.sm);
      });

      it('has body font size', () => {
        expect(styles.text.fontSize).toBe(TYPOGRAPHY.sizes.body);
      });
    });

    describe('lg size', () => {
      const styles = getSizeStyles('lg');

      it('has large padding', () => {
        expect(styles.container.paddingHorizontal).toBe(SPACING.xl);
        expect(styles.container.paddingVertical).toBe(SPACING.md);
      });

      it('has large font size', () => {
        expect(styles.text.fontSize).toBe(TYPOGRAPHY.sizes.large);
      });
    });

    it('returns md styles for unknown size', () => {
      // @ts-expect-error - Testing invalid size
      const styles = getSizeStyles('invalid');
      expect(styles.container.paddingHorizontal).toBe(SPACING.lg);
      expect(styles.text.fontSize).toBe(TYPOGRAPHY.sizes.body);
    });
  });

  describe('BASE_STYLES', () => {
    it('has zero border radius (brutalist)', () => {
      expect(BASE_STYLES.borderRadius).toBe(BORDER_RADIUS.none);
      expect(BASE_STYLES.borderRadius).toBe(0);
    });

    it('has correct border width', () => {
      expect(BASE_STYLES.borderWidth).toBe(BORDERS.normal);
      expect(BASE_STYLES.borderWidth).toBe(2);
    });

    it('has correct border color', () => {
      expect(BASE_STYLES.borderColor).toBe(COLORS.foreground);
    });

    it('is centered', () => {
      expect(BASE_STYLES.alignItems).toBe('center');
      expect(BASE_STYLES.justifyContent).toBe('center');
    });
  });

  describe('variant color values', () => {
    it('primary uses near-black (secondary) color', () => {
      expect(COLORS.secondary).toBe(COLORS.foreground);
    });

    it('blue uses sky blue (primary) color', () => {
      expect(COLORS.primary).toMatch(/^hsl\(/);
    });

    it('accent uses lime (accent) color', () => {
      expect(COLORS.accent).toMatch(/^hsl\(/);
    });

    it('secondary uses white (card) color', () => {
      expect(COLORS.card).toBe('hsl(0, 0%, 100%)');
    });
  });

  describe('typography', () => {
    it('label size is 12px', () => {
      expect(TYPOGRAPHY.sizes.label).toBe(12);
    });

    it('body size is 14px', () => {
      expect(TYPOGRAPHY.sizes.body).toBe(14);
    });

    it('large size is 18px', () => {
      expect(TYPOGRAPHY.sizes.large).toBe(18);
    });
  });

  describe('spacing', () => {
    it('xs is 4px', () => {
      expect(SPACING.xs).toBe(4);
    });

    it('sm is 8px', () => {
      expect(SPACING.sm).toBe(8);
    });

    it('md is 16px', () => {
      expect(SPACING.md).toBe(16);
    });

    it('lg is 24px', () => {
      expect(SPACING.lg).toBe(24);
    });

    it('xl is 32px', () => {
      expect(SPACING.xl).toBe(32);
    });
  });
});
