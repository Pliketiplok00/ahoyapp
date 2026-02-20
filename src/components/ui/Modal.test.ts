/**
 * Modal Component Tests
 *
 * Tests for modal styling logic (Brutalist).
 */

import {
  getModalSizeStyles,
  getModalPositionStyles,
  getContentBorderRadius,
} from './Modal';
import { BORDER_RADIUS } from '../../config/theme';

describe('Modal', () => {
  describe('getModalSizeStyles', () => {
    describe('sm size', () => {
      const styles = getModalSizeStyles('sm');

      it('has 80% width', () => {
        expect(styles.width).toBe('80%');
      });

      it('has max width 320', () => {
        expect(styles.maxWidth).toBe(320);
      });
    });

    describe('md size', () => {
      const styles = getModalSizeStyles('md');

      it('has 90% width', () => {
        expect(styles.width).toBe('90%');
      });

      it('has max width 480', () => {
        expect(styles.maxWidth).toBe(480);
      });
    });

    describe('lg size', () => {
      const styles = getModalSizeStyles('lg');

      it('has 95% width', () => {
        expect(styles.width).toBe('95%');
      });

      it('has max width 640', () => {
        expect(styles.maxWidth).toBe(640);
      });
    });

    describe('full size', () => {
      const styles = getModalSizeStyles('full');

      it('has 100% width', () => {
        expect(styles.width).toBe('100%');
      });

      it('has 100% height', () => {
        expect(styles.height).toBe('100%');
      });
    });
  });

  describe('getModalPositionStyles', () => {
    describe('center position', () => {
      const styles = getModalPositionStyles('center');

      it('justifies content to center', () => {
        expect(styles.justifyContent).toBe('center');
      });

      it('aligns items to center', () => {
        expect(styles.alignItems).toBe('center');
      });
    });

    describe('bottom position', () => {
      const styles = getModalPositionStyles('bottom');

      it('justifies content to flex-end', () => {
        expect(styles.justifyContent).toBe('flex-end');
      });

      it('aligns items to center', () => {
        expect(styles.alignItems).toBe('center');
      });
    });
  });

  describe('getContentBorderRadius', () => {
    describe('brutalist - no border radius', () => {
      it('has no border radius for full size', () => {
        const centerStyles = getContentBorderRadius('center', 'full');
        const bottomStyles = getContentBorderRadius('bottom', 'full');

        expect(centerStyles.borderRadius).toBe(BORDER_RADIUS.none);
        expect(bottomStyles.borderRadius).toBe(BORDER_RADIUS.none);
      });

      it('has no border radius for center position', () => {
        const styles = getContentBorderRadius('center', 'md');
        expect(styles.borderRadius).toBe(BORDER_RADIUS.none);
      });

      it('has no border radius for bottom position', () => {
        const styles = getContentBorderRadius('bottom', 'md');
        expect(styles.borderRadius).toBe(BORDER_RADIUS.none);
      });

      it('has no border radius for any size/position combination', () => {
        const sizes = ['sm', 'md', 'lg', 'full'] as const;
        const positions = ['center', 'bottom'] as const;

        for (const size of sizes) {
          for (const position of positions) {
            const styles = getContentBorderRadius(position, size);
            expect(styles.borderRadius).toBe(BORDER_RADIUS.none);
          }
        }
      });
    });
  });

  describe('size and position combinations', () => {
    it('sm center modal', () => {
      const size = getModalSizeStyles('sm');
      const position = getModalPositionStyles('center');
      const radius = getContentBorderRadius('center', 'sm');

      expect(size.maxWidth).toBe(320);
      expect(position.justifyContent).toBe('center');
      expect(radius.borderRadius).toBe(BORDER_RADIUS.none);
    });

    it('lg bottom modal', () => {
      const size = getModalSizeStyles('lg');
      const position = getModalPositionStyles('bottom');
      const radius = getContentBorderRadius('bottom', 'lg');

      expect(size.maxWidth).toBe(640);
      expect(position.justifyContent).toBe('flex-end');
      expect(radius.borderRadius).toBe(BORDER_RADIUS.none);
    });

    it('full center modal (like fullscreen dialog)', () => {
      const size = getModalSizeStyles('full');
      const position = getModalPositionStyles('center');
      const radius = getContentBorderRadius('center', 'full');

      expect(size.width).toBe('100%');
      expect(size.height).toBe('100%');
      expect(position.justifyContent).toBe('center');
      expect(radius.borderRadius).toBe(BORDER_RADIUS.none);
    });
  });
});
