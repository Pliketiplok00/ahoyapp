/**
 * Button Component Tests
 *
 * Tests for button styling logic (Brutalist).
 */

import {
  getButtonStyles,
  getButtonTextColor,
  getButtonSizeStyles,
  getButtonTextSize,
} from './Button';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, BORDERS } from '../../config/theme';

describe('Button', () => {
  describe('getButtonStyles', () => {
    describe('variants', () => {
      it('primary variant has accent background', () => {
        const styles = getButtonStyles('primary', false);
        expect(styles.backgroundColor).toBe(COLORS.accent);
      });

      it('secondary variant has muted background', () => {
        const styles = getButtonStyles('secondary', false);
        expect(styles.backgroundColor).toBe(COLORS.muted);
      });

      it('outline variant has transparent background with border', () => {
        const styles = getButtonStyles('outline', false);
        expect(styles.backgroundColor).toBe('transparent');
        expect(styles.borderWidth).toBe(BORDERS.normal);
        expect(styles.borderColor).toBe(COLORS.foreground);
      });

      it('ghost variant has transparent background', () => {
        const styles = getButtonStyles('ghost', false);
        expect(styles.backgroundColor).toBe('transparent');
      });
    });

    describe('disabled state', () => {
      it('sets opacity to 0.5 when disabled', () => {
        const styles = getButtonStyles('primary', true);
        expect(styles.opacity).toBe(0.5);
      });

      it('sets opacity to 1 when not disabled', () => {
        const styles = getButtonStyles('primary', false);
        expect(styles.opacity).toBe(1);
      });
    });

    describe('base styles', () => {
      it('has no border radius (brutalist)', () => {
        const styles = getButtonStyles('primary', false);
        expect(styles.borderRadius).toBe(BORDER_RADIUS.none);
      });

      it('has border (brutalist)', () => {
        const styles = getButtonStyles('primary', false);
        expect(styles.borderWidth).toBe(BORDERS.normal);
        expect(styles.borderColor).toBe(COLORS.foreground);
      });

      it('centers content', () => {
        const styles = getButtonStyles('primary', false);
        expect(styles.alignItems).toBe('center');
        expect(styles.justifyContent).toBe('center');
      });
    });
  });

  describe('getButtonTextColor', () => {
    it('returns foreground for primary variant', () => {
      expect(getButtonTextColor('primary')).toBe(COLORS.foreground);
    });

    it('returns foreground for secondary variant', () => {
      expect(getButtonTextColor('secondary')).toBe(COLORS.foreground);
    });

    it('returns foreground for outline variant', () => {
      expect(getButtonTextColor('outline')).toBe(COLORS.foreground);
    });

    it('returns foreground for ghost variant', () => {
      expect(getButtonTextColor('ghost')).toBe(COLORS.foreground);
    });
  });

  describe('getButtonSizeStyles', () => {
    describe('sm size', () => {
      it('has correct padding', () => {
        const styles = getButtonSizeStyles('sm');
        expect(styles.paddingVertical).toBe(SPACING.xs);
        expect(styles.paddingHorizontal).toBe(SPACING.md);
      });

      it('has minimum height 32', () => {
        const styles = getButtonSizeStyles('sm');
        expect(styles.minHeight).toBe(32);
      });
    });

    describe('md size', () => {
      it('has correct padding', () => {
        const styles = getButtonSizeStyles('md');
        expect(styles.paddingVertical).toBe(SPACING.sm);
        expect(styles.paddingHorizontal).toBe(SPACING.lg);
      });

      it('has minimum height 44', () => {
        const styles = getButtonSizeStyles('md');
        expect(styles.minHeight).toBe(44);
      });
    });

    describe('lg size', () => {
      it('has correct padding', () => {
        const styles = getButtonSizeStyles('lg');
        expect(styles.paddingVertical).toBe(SPACING.md);
        expect(styles.paddingHorizontal).toBe(SPACING.xl);
      });

      it('has minimum height 56', () => {
        const styles = getButtonSizeStyles('lg');
        expect(styles.minHeight).toBe(56);
      });
    });
  });

  describe('getButtonTextSize', () => {
    it('returns sm font size for sm button', () => {
      expect(getButtonTextSize('sm')).toBe(FONT_SIZES.sm);
    });

    it('returns md font size for md button', () => {
      expect(getButtonTextSize('md')).toBe(FONT_SIZES.md);
    });

    it('returns lg font size for lg button', () => {
      expect(getButtonTextSize('lg')).toBe(FONT_SIZES.lg);
    });
  });

  describe('style combinations', () => {
    it('primary sm has correct style combination', () => {
      const buttonStyles = getButtonStyles('primary', false);
      const sizeStyles = getButtonSizeStyles('sm');
      const textColor = getButtonTextColor('primary');
      const textSize = getButtonTextSize('sm');

      expect(buttonStyles.backgroundColor).toBe(COLORS.accent);
      expect(sizeStyles.minHeight).toBe(32);
      expect(textColor).toBe(COLORS.foreground);
      expect(textSize).toBe(FONT_SIZES.sm);
    });

    it('outline lg disabled has correct style combination', () => {
      const buttonStyles = getButtonStyles('outline', true);
      const sizeStyles = getButtonSizeStyles('lg');
      const textColor = getButtonTextColor('outline');
      const textSize = getButtonTextSize('lg');

      expect(buttonStyles.backgroundColor).toBe('transparent');
      expect(buttonStyles.borderColor).toBe(COLORS.foreground);
      expect(buttonStyles.opacity).toBe(0.5);
      expect(sizeStyles.minHeight).toBe(56);
      expect(textColor).toBe(COLORS.foreground);
      expect(textSize).toBe(FONT_SIZES.lg);
    });
  });
});
