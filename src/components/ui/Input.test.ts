/**
 * Input Component Tests
 *
 * Tests for input styling logic (Brutalist).
 */

import { getInputContainerStyles, getLabelColor } from './Input';
import { COLORS, BORDER_RADIUS, SPACING, BORDERS } from '../../config/theme';

describe('Input', () => {
  describe('getInputContainerStyles', () => {
    describe('base styles', () => {
      it('has no border radius (brutalist)', () => {
        const styles = getInputContainerStyles('default', false, false, false);
        expect(styles.borderRadius).toBe(BORDER_RADIUS.none);
      });

      it('has minimum height', () => {
        const styles = getInputContainerStyles('default', false, false, false);
        expect(styles.minHeight).toBe(48);
      });

      it('has horizontal padding', () => {
        const styles = getInputContainerStyles('default', false, false, false);
        expect(styles.paddingHorizontal).toBe(SPACING.md);
      });
    });

    describe('default variant', () => {
      it('has card background', () => {
        const styles = getInputContainerStyles('default', false, false, false);
        expect(styles.backgroundColor).toBe(COLORS.card);
      });

      it('has border (brutalist)', () => {
        const styles = getInputContainerStyles('default', false, false, false);
        expect(styles.borderWidth).toBe(BORDERS.normal);
        expect(styles.borderColor).toBe(COLORS.foreground);
      });
    });

    describe('filled variant', () => {
      it('has muted background', () => {
        const styles = getInputContainerStyles('filled', false, false, false);
        expect(styles.backgroundColor).toBe(COLORS.muted);
      });

      it('has thin border (brutalist)', () => {
        const styles = getInputContainerStyles('filled', false, false, false);
        expect(styles.borderWidth).toBe(BORDERS.thin);
        expect(styles.borderColor).toBe(COLORS.foreground);
      });
    });

    describe('error state', () => {
      it('has destructive border color', () => {
        const styles = getInputContainerStyles('default', true, false, false);
        expect(styles.borderColor).toBe(COLORS.destructive);
        expect(styles.borderWidth).toBe(BORDERS.normal);
      });

      it('applies card background for all variants with error', () => {
        const defaultStyles = getInputContainerStyles('default', true, false, false);
        const filledStyles = getInputContainerStyles('filled', true, false, false);
        expect(defaultStyles.backgroundColor).toBe(COLORS.card);
        expect(filledStyles.backgroundColor).toBe(COLORS.card);
      });
    });

    describe('focused state', () => {
      it('has accent border when focused', () => {
        const styles = getInputContainerStyles('default', false, true, false);
        expect(styles.borderColor).toBe(COLORS.accent);
        expect(styles.borderWidth).toBe(BORDERS.heavy);
      });

      it('focused takes precedence over default but not error', () => {
        // Focused without error
        const focusedStyles = getInputContainerStyles('default', false, true, false);
        expect(focusedStyles.borderColor).toBe(COLORS.accent);

        // Error takes precedence over focused
        const errorStyles = getInputContainerStyles('default', true, true, false);
        expect(errorStyles.borderColor).toBe(COLORS.destructive);
      });
    });

    describe('disabled state', () => {
      it('reduces opacity when disabled', () => {
        const styles = getInputContainerStyles('default', false, false, true);
        expect(styles.opacity).toBe(0.5);
      });

      it('has full opacity when not disabled', () => {
        const styles = getInputContainerStyles('default', false, false, false);
        expect(styles.opacity).toBe(1);
      });
    });

    describe('state combinations', () => {
      it('disabled with error shows error styling with reduced opacity', () => {
        const styles = getInputContainerStyles('default', true, false, true);
        expect(styles.borderColor).toBe(COLORS.destructive);
        expect(styles.opacity).toBe(0.5);
      });

      it('disabled with focus shows focus styling with reduced opacity', () => {
        const styles = getInputContainerStyles('default', false, true, true);
        expect(styles.borderColor).toBe(COLORS.accent);
        expect(styles.opacity).toBe(0.5);
      });
    });
  });

  describe('getLabelColor', () => {
    it('returns destructive color when has error', () => {
      expect(getLabelColor(true, false)).toBe(COLORS.destructive);
      expect(getLabelColor(true, true)).toBe(COLORS.destructive);
    });

    it('returns accent when focused without error', () => {
      expect(getLabelColor(false, true)).toBe(COLORS.accent);
    });

    it('returns muted foreground color by default', () => {
      expect(getLabelColor(false, false)).toBe(COLORS.mutedForeground);
    });
  });
});
