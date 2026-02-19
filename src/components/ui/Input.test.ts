/**
 * Input Component Tests
 *
 * Tests for input styling logic.
 */

import { getInputContainerStyles, getLabelColor } from './Input';
import { COLORS, BORDER_RADIUS, SPACING } from '../../config/theme';

describe('Input', () => {
  describe('getInputContainerStyles', () => {
    describe('base styles', () => {
      it('has correct border radius', () => {
        const styles = getInputContainerStyles('default', false, false, false);
        expect(styles.borderRadius).toBe(BORDER_RADIUS.md);
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
      it('has white background', () => {
        const styles = getInputContainerStyles('default', false, false, false);
        expect(styles.backgroundColor).toBe(COLORS.white);
      });

      it('has border', () => {
        const styles = getInputContainerStyles('default', false, false, false);
        expect(styles.borderWidth).toBe(1);
        expect(styles.borderColor).toBe(COLORS.border);
      });
    });

    describe('filled variant', () => {
      it('has surface background', () => {
        const styles = getInputContainerStyles('filled', false, false, false);
        expect(styles.backgroundColor).toBe(COLORS.surface);
      });

      it('has no border', () => {
        const styles = getInputContainerStyles('filled', false, false, false);
        expect(styles.borderWidth).toBe(0);
      });
    });

    describe('error state', () => {
      it('has error border color', () => {
        const styles = getInputContainerStyles('default', true, false, false);
        expect(styles.borderColor).toBe(COLORS.error);
        expect(styles.borderWidth).toBe(1);
      });

      it('applies error background for filled variant', () => {
        const styles = getInputContainerStyles('filled', true, false, false);
        expect(styles.backgroundColor).toBe(`${COLORS.error}10`);
      });

      it('keeps white background for default variant with error', () => {
        const styles = getInputContainerStyles('default', true, false, false);
        expect(styles.backgroundColor).toBe(COLORS.white);
      });
    });

    describe('focused state', () => {
      it('has coral border when focused', () => {
        const styles = getInputContainerStyles('default', false, true, false);
        expect(styles.borderColor).toBe(COLORS.coral);
        expect(styles.borderWidth).toBe(2);
      });

      it('focused takes precedence over default but not error', () => {
        // Focused without error
        const focusedStyles = getInputContainerStyles('default', false, true, false);
        expect(focusedStyles.borderColor).toBe(COLORS.coral);

        // Error takes precedence over focused
        const errorStyles = getInputContainerStyles('default', true, true, false);
        expect(errorStyles.borderColor).toBe(COLORS.error);
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
        expect(styles.borderColor).toBe(COLORS.error);
        expect(styles.opacity).toBe(0.5);
      });

      it('disabled with focus shows focus styling with reduced opacity', () => {
        const styles = getInputContainerStyles('default', false, true, true);
        expect(styles.borderColor).toBe(COLORS.coral);
        expect(styles.opacity).toBe(0.5);
      });
    });
  });

  describe('getLabelColor', () => {
    it('returns error color when has error', () => {
      expect(getLabelColor(true, false)).toBe(COLORS.error);
      expect(getLabelColor(true, true)).toBe(COLORS.error);
    });

    it('returns coral when focused without error', () => {
      expect(getLabelColor(false, true)).toBe(COLORS.coral);
    });

    it('returns secondary text color by default', () => {
      expect(getLabelColor(false, false)).toBe(COLORS.textSecondary);
    });
  });
});
