/**
 * BrutBadge Component Tests
 *
 * Tests for brutalist badge styling logic.
 */

import {
  getVariantStyles,
  getSizeStyles,
  BASE_STYLES,
} from './BrutBadge';
import { COLORS, SHADOWS, BORDERS, BORDER_RADIUS, SPACING, TYPOGRAPHY } from '../../config/theme';

describe('BrutBadge', () => {
  describe('getVariantStyles', () => {
    describe('default variant', () => {
      const styles = getVariantStyles('default');

      it('has card (white) background', () => {
        expect(styles.bg).toBe(COLORS.card);
      });

      it('has foreground text', () => {
        expect(styles.text).toBe(COLORS.foreground);
      });
    });

    describe('primary variant', () => {
      const styles = getVariantStyles('primary');

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

    describe('pink variant', () => {
      const styles = getVariantStyles('pink');

      it('has pink background', () => {
        expect(styles.bg).toBe(COLORS.pink);
      });

      it('has foreground text', () => {
        expect(styles.text).toBe(COLORS.foreground);
      });
    });

    describe('amber variant', () => {
      const styles = getVariantStyles('amber');

      it('has amber background', () => {
        expect(styles.bg).toBe(COLORS.heroAmber);
      });

      it('has foreground text', () => {
        expect(styles.text).toBe(COLORS.foreground);
      });
    });

    describe('muted variant', () => {
      const styles = getVariantStyles('muted');

      it('has muted background', () => {
        expect(styles.bg).toBe(COLORS.muted);
      });

      it('has foreground text', () => {
        expect(styles.text).toBe(COLORS.foreground);
      });
    });

    describe('active status variant', () => {
      const styles = getVariantStyles('active');

      it('has active status background', () => {
        expect(styles.bg).toBe(COLORS.status.activeBg);
      });

      it('has active status text color', () => {
        expect(styles.text).toBe(COLORS.status.active);
      });
    });

    describe('upcoming status variant', () => {
      const styles = getVariantStyles('upcoming');

      it('has upcoming status background', () => {
        expect(styles.bg).toBe(COLORS.status.upcomingBg);
      });

      it('has foreground text', () => {
        expect(styles.text).toBe(COLORS.foreground);
      });
    });

    describe('completed status variant', () => {
      const styles = getVariantStyles('completed');

      it('has completed status background', () => {
        expect(styles.bg).toBe(COLORS.status.completedBg);
      });

      it('has completed status text color', () => {
        expect(styles.text).toBe(COLORS.status.completed);
      });
    });

    describe('error variant', () => {
      const styles = getVariantStyles('error');

      it('has cancelled/error status background', () => {
        expect(styles.bg).toBe(COLORS.status.cancelledBg);
      });

      it('has destructive text color', () => {
        expect(styles.text).toBe(COLORS.destructive);
      });
    });

    it('returns default styles for unknown variant', () => {
      // @ts-expect-error - Testing invalid variant
      const styles = getVariantStyles('invalid');
      expect(styles.bg).toBe(COLORS.card);
      expect(styles.text).toBe(COLORS.foreground);
    });
  });

  describe('getSizeStyles', () => {
    describe('sm size', () => {
      const styles = getSizeStyles('sm');

      it('has xs horizontal padding', () => {
        expect(styles.container.paddingHorizontal).toBe(SPACING.xs);
      });

      it('has xxs vertical padding', () => {
        expect(styles.container.paddingVertical).toBe(SPACING.xxs);
      });

      it('has meta font size (10px)', () => {
        expect(styles.text.fontSize).toBe(TYPOGRAPHY.sizes.meta);
      });
    });

    describe('md size (default)', () => {
      const styles = getSizeStyles('md');

      it('has sm horizontal padding', () => {
        expect(styles.container.paddingHorizontal).toBe(SPACING.sm);
      });

      it('has xs vertical padding', () => {
        expect(styles.container.paddingVertical).toBe(SPACING.xs);
      });

      it('has label font size (12px)', () => {
        expect(styles.text.fontSize).toBe(TYPOGRAPHY.sizes.label);
      });
    });

    it('returns md styles for unknown size', () => {
      // @ts-expect-error - Testing invalid size
      const styles = getSizeStyles('invalid');
      expect(styles.container.paddingHorizontal).toBe(SPACING.sm);
      expect(styles.text.fontSize).toBe(TYPOGRAPHY.sizes.label);
    });
  });

  describe('BASE_STYLES', () => {
    it('has zero border radius (brutalist)', () => {
      expect(BASE_STYLES.borderRadius).toBe(BORDER_RADIUS.none);
      expect(BASE_STYLES.borderRadius).toBe(0);
    });

    it('has thin border width (1.5px)', () => {
      expect(BASE_STYLES.borderWidth).toBe(BORDERS.thin);
      expect(BASE_STYLES.borderWidth).toBe(1.5);
    });

    it('has foreground border color', () => {
      expect(BASE_STYLES.borderColor).toBe(COLORS.foreground);
    });
  });

  describe('badge shadow (brutSm)', () => {
    it('has 2px offset', () => {
      expect(SHADOWS.brutSm.shadowOffset).toEqual({ width: 2, height: 2 });
    });

    it('has zero radius (no blur)', () => {
      expect(SHADOWS.brutSm.shadowRadius).toBe(0);
    });

    it('has full opacity', () => {
      expect(SHADOWS.brutSm.shadowOpacity).toBe(1);
    });
  });

  describe('status colors', () => {
    it('active has light blue background', () => {
      expect(COLORS.status.activeBg).toMatch(/^hsl\(/);
    });

    it('upcoming has light green background', () => {
      expect(COLORS.status.upcomingBg).toMatch(/^hsl\(/);
    });

    it('completed has light grey background', () => {
      expect(COLORS.status.completedBg).toMatch(/^hsl\(/);
    });

    it('cancelled has light red background', () => {
      expect(COLORS.status.cancelledBg).toMatch(/^hsl\(/);
    });
  });

  describe('typography', () => {
    it('meta size is 10px', () => {
      expect(TYPOGRAPHY.sizes.meta).toBe(10);
    });

    it('label size is 12px', () => {
      expect(TYPOGRAPHY.sizes.label).toBe(12);
    });

    it('wide letter spacing is 0.05', () => {
      expect(TYPOGRAPHY.letterSpacing.wide).toBe(0.05);
    });
  });

  describe('spacing', () => {
    it('xxs is 2px', () => {
      expect(SPACING.xxs).toBe(2);
    });

    it('xs is 4px', () => {
      expect(SPACING.xs).toBe(4);
    });

    it('sm is 8px', () => {
      expect(SPACING.sm).toBe(8);
    });
  });
});
