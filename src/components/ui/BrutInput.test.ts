/**
 * BrutInput Component Tests
 *
 * Tests for brutalist input styling logic.
 */

import {
  getSizeStyles,
  getStateStyles,
  BASE_STYLES,
} from './BrutInput';
import { COLORS, BORDERS, BORDER_RADIUS, SPACING, TYPOGRAPHY } from '../../config/theme';

describe('BrutInput', () => {
  describe('getSizeStyles', () => {
    describe('sm size', () => {
      const styles = getSizeStyles('sm');

      it('has compact horizontal padding on text (TextInput)', () => {
        // Padding must be on TextInput, not container, for proper touch handling
        expect(styles.text.paddingHorizontal).toBe(SPACING.sm);
      });

      it('has compact vertical padding on text (TextInput)', () => {
        expect(styles.text.paddingVertical).toBe(SPACING.xs);
      });

      it('has label font size', () => {
        expect(styles.text.fontSize).toBe(TYPOGRAPHY.sizes.label);
      });
    });

    describe('md size (default)', () => {
      const styles = getSizeStyles('md');

      it('has standard horizontal padding on text (TextInput)', () => {
        // Padding must be on TextInput, not container, for proper touch handling
        expect(styles.text.paddingHorizontal).toBe(SPACING.md);
      });

      it('has standard vertical padding on text (TextInput)', () => {
        expect(styles.text.paddingVertical).toBe(SPACING.sm);
      });

      it('has body font size', () => {
        expect(styles.text.fontSize).toBe(TYPOGRAPHY.sizes.body);
      });
    });

    describe('lg size', () => {
      const styles = getSizeStyles('lg');

      it('has large horizontal padding on text (TextInput)', () => {
        // Padding must be on TextInput, not container, for proper touch handling
        expect(styles.text.paddingHorizontal).toBe(SPACING.lg);
      });

      it('has large vertical padding on text (TextInput)', () => {
        expect(styles.text.paddingVertical).toBe(SPACING.md);
      });

      it('has large font size', () => {
        expect(styles.text.fontSize).toBe(TYPOGRAPHY.sizes.large);
      });
    });

    it('returns md styles for unknown size', () => {
      // @ts-expect-error - Testing invalid size
      const styles = getSizeStyles('invalid');
      expect(styles.text.paddingHorizontal).toBe(SPACING.md);
      expect(styles.text.fontSize).toBe(TYPOGRAPHY.sizes.body);
    });
  });

  describe('getStateStyles (simplified - no focus styling)', () => {
    // Note: Focus styling removed for reliability. getStateStyles is now minimal.
    describe('default state', () => {
      const styles = getStateStyles('default');

      it('has foreground border color', () => {
        expect(styles.borderColor).toBe(COLORS.foreground);
      });

      it('has card background', () => {
        expect(styles.backgroundColor).toBe(COLORS.card);
      });
    });

    describe('error state', () => {
      const styles = getStateStyles('error');

      it('has destructive border color', () => {
        expect(styles.borderColor).toBe(COLORS.destructive);
      });

      it('has card background', () => {
        expect(styles.backgroundColor).toBe(COLORS.card);
      });
    });

    it('returns default styles for any state (simplified)', () => {
      const defaultStyles = getStateStyles('default');
      const focusedStyles = getStateStyles('focused');
      const disabledStyles = getStateStyles('disabled');

      // All non-error states return same border/background (simplified)
      expect(defaultStyles.borderColor).toBe(COLORS.foreground);
      expect(focusedStyles.borderColor).toBe(COLORS.foreground);
      expect(disabledStyles.borderColor).toBe(COLORS.foreground);
      expect(defaultStyles.backgroundColor).toBe(COLORS.card);
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
  });

  // Note: Focus state behavior tests removed - focus styling disabled for reliability
  // Can be re-added post-MVP when we solve the re-render issues

  describe('color values', () => {
    it('foreground is near-black', () => {
      expect(COLORS.foreground).toBe('hsl(220, 25%, 8%)');
    });

    it('card is white', () => {
      expect(COLORS.card).toBe('hsl(0, 0%, 100%)');
    });

    it('primaryLight is light blue', () => {
      expect(COLORS.primaryLight).toBe('hsl(196, 90%, 90%)');
    });

    it('destructive is red', () => {
      expect(COLORS.destructive).toMatch(/^hsl\(0,/);
    });

    it('muted is light cream', () => {
      expect(COLORS.muted).toMatch(/^hsl\(/);
    });
  });

  describe('typography values', () => {
    it('label is 12px', () => {
      expect(TYPOGRAPHY.sizes.label).toBe(12);
    });

    it('body is 14px', () => {
      expect(TYPOGRAPHY.sizes.body).toBe(14);
    });

    it('large is 18px', () => {
      expect(TYPOGRAPHY.sizes.large).toBe(18);
    });
  });

  describe('spacing values', () => {
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
  });
});
