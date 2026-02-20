/**
 * Screen Component Tests
 *
 * Tests for brutalist screen wrapper styling.
 */

import { SCREEN_STYLES } from './Screen';
import { COLORS, SPACING } from '../../config/theme';

describe('Screen', () => {
  describe('SCREEN_STYLES', () => {
    it('uses background color from theme', () => {
      expect(SCREEN_STYLES.backgroundColor).toBe(COLORS.background);
    });

    it('uses md spacing for horizontal padding', () => {
      expect(SCREEN_STYLES.paddingHorizontal).toBe(SPACING.md);
      expect(SCREEN_STYLES.paddingHorizontal).toBe(16);
    });
  });

  describe('theme values', () => {
    it('background is warm cream HSL', () => {
      expect(COLORS.background).toBe('hsl(55, 30%, 94%)');
    });

    it('SPACING.md is 16px', () => {
      expect(SPACING.md).toBe(16);
    });
  });
});
