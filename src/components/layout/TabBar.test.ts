/**
 * TabBar Component Tests
 *
 * Tests for brutalist tab bar styling logic.
 */

import { getTabColor, TAB_BAR_STYLES } from './TabBar';
import { COLORS, BORDERS, LAYOUT, BORDER_RADIUS } from '../../config/theme';

describe('TabBar', () => {
  describe('getTabColor', () => {
    it('returns primary color when focused', () => {
      expect(getTabColor(true)).toBe(COLORS.primary);
    });

    it('returns mutedForeground color when not focused', () => {
      expect(getTabColor(false)).toBe(COLORS.mutedForeground);
    });
  });

  describe('TAB_BAR_STYLES', () => {
    it('has correct height (72px)', () => {
      expect(TAB_BAR_STYLES.height).toBe(LAYOUT.tabBarHeight);
      expect(TAB_BAR_STYLES.height).toBe(72);
    });

    it('has card (white) background', () => {
      expect(TAB_BAR_STYLES.backgroundColor).toBe(COLORS.card);
    });

    it('has heavy border top (3px)', () => {
      expect(TAB_BAR_STYLES.borderTopWidth).toBe(BORDERS.heavy);
      expect(TAB_BAR_STYLES.borderTopWidth).toBe(3);
    });

    it('has foreground border color', () => {
      expect(TAB_BAR_STYLES.borderTopColor).toBe(COLORS.foreground);
    });

    it('has zero border radius (brutalist)', () => {
      expect(TAB_BAR_STYLES.borderRadius).toBe(BORDER_RADIUS.none);
      expect(TAB_BAR_STYLES.borderRadius).toBe(0);
    });
  });

  describe('color values', () => {
    it('primary is sky blue HSL', () => {
      expect(COLORS.primary).toMatch(/^hsl\(/);
    });

    it('mutedForeground is mid-grey HSL', () => {
      expect(COLORS.mutedForeground).toMatch(/^hsl\(/);
    });

    it('card is white HSL', () => {
      expect(COLORS.card).toBe('hsl(0, 0%, 100%)');
    });

    it('foreground is near-black HSL', () => {
      expect(COLORS.foreground).toBe('hsl(220, 25%, 8%)');
    });
  });

  describe('layout values', () => {
    it('tabBarHeight is 72px', () => {
      expect(LAYOUT.tabBarHeight).toBe(72);
    });
  });

  describe('border values', () => {
    it('heavy border is 3px', () => {
      expect(BORDERS.heavy).toBe(3);
    });
  });
});
