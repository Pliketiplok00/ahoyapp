/**
 * FAB Component Tests
 *
 * Tests for FAB styling logic.
 */

import { getFABSizeStyles } from './FAB';
import { TYPOGRAPHY, SHADOWS } from '../../config/theme';

describe('FAB', () => {
  describe('getFABSizeStyles', () => {
    describe('sm size', () => {
      const styles = getFABSizeStyles('sm');

      it('has 40x40 dimensions', () => {
        expect(styles.container.width).toBe(40);
        expect(styles.container.height).toBe(40);
      });

      it('uses cardTitle font size', () => {
        expect(styles.text.fontSize).toBe(TYPOGRAPHY.sizes.cardTitle);
      });

      it('uses brutSm shadow', () => {
        expect(styles.shadow).toEqual(SHADOWS.brutSm);
      });
    });

    describe('md size', () => {
      const styles = getFABSizeStyles('md');

      it('has 56x56 dimensions', () => {
        expect(styles.container.width).toBe(56);
        expect(styles.container.height).toBe(56);
      });

      it('uses sectionTitle font size', () => {
        expect(styles.text.fontSize).toBe(TYPOGRAPHY.sizes.sectionTitle);
      });

      it('uses brut shadow', () => {
        expect(styles.shadow).toEqual(SHADOWS.brut);
      });
    });

    describe('defaults', () => {
      it('defaults to md size', () => {
        // @ts-expect-error Testing default behavior
        const styles = getFABSizeStyles(undefined);
        expect(styles.container.width).toBe(56);
      });
    });
  });
});
