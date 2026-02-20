/**
 * PageHeader Component Tests
 *
 * Tests for brutalist page header styling logic.
 */

import {
  getVariantBackground,
  getVariantTitleColor,
  PAGE_HEADER_STYLES,
  BACK_BUTTON_STYLES,
} from './PageHeader';
import {
  COLORS,
  BORDERS,
  LAYOUT,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
} from '../../config/theme';

describe('PageHeader', () => {
  describe('getVariantBackground', () => {
    it('returns background color for default variant', () => {
      expect(getVariantBackground('default')).toBe(COLORS.background);
    });

    it('returns primary color for primary variant', () => {
      expect(getVariantBackground('primary')).toBe(COLORS.primary);
    });
  });

  describe('getVariantTitleColor', () => {
    it('returns foreground color for default variant', () => {
      expect(getVariantTitleColor('default')).toBe(COLORS.foreground);
    });

    it('returns card (white) color for primary variant', () => {
      expect(getVariantTitleColor('primary')).toBe(COLORS.card);
    });
  });

  describe('PAGE_HEADER_STYLES', () => {
    it('has correct height (56px)', () => {
      expect(PAGE_HEADER_STYLES.height).toBe(LAYOUT.headerHeight);
      expect(PAGE_HEADER_STYLES.height).toBe(56);
    });

    it('has background (off-white) background', () => {
      expect(PAGE_HEADER_STYLES.backgroundColor).toBe(COLORS.background);
    });

    it('has heavy border bottom (3px)', () => {
      expect(PAGE_HEADER_STYLES.borderBottomWidth).toBe(BORDERS.heavy);
      expect(PAGE_HEADER_STYLES.borderBottomWidth).toBe(3);
    });

    it('has foreground border color', () => {
      expect(PAGE_HEADER_STYLES.borderBottomColor).toBe(COLORS.foreground);
    });

    it('has zero border radius (brutalist)', () => {
      expect(PAGE_HEADER_STYLES.borderRadius).toBe(BORDER_RADIUS.none);
      expect(PAGE_HEADER_STYLES.borderRadius).toBe(0);
    });

    it('has md horizontal padding', () => {
      expect(PAGE_HEADER_STYLES.paddingHorizontal).toBe(SPACING.md);
      expect(PAGE_HEADER_STYLES.paddingHorizontal).toBe(16);
    });
  });

  describe('BACK_BUTTON_STYLES', () => {
    it('has correct size (36px)', () => {
      expect(BACK_BUTTON_STYLES.size).toBe(36);
    });

    it('has card (white) background', () => {
      expect(BACK_BUTTON_STYLES.backgroundColor).toBe(COLORS.card);
    });

    it('has normal border (2px)', () => {
      expect(BACK_BUTTON_STYLES.borderWidth).toBe(BORDERS.normal);
      expect(BACK_BUTTON_STYLES.borderWidth).toBe(2);
    });

    it('has foreground border color', () => {
      expect(BACK_BUTTON_STYLES.borderColor).toBe(COLORS.foreground);
    });

    it('has zero border radius (brutalist)', () => {
      expect(BACK_BUTTON_STYLES.borderRadius).toBe(BORDER_RADIUS.none);
      expect(BACK_BUTTON_STYLES.borderRadius).toBe(0);
    });
  });

  describe('color values', () => {
    it('background is warm cream HSL', () => {
      expect(COLORS.background).toBe('hsl(55, 30%, 94%)');
    });

    it('primary is sky blue HSL', () => {
      expect(COLORS.primary).toMatch(/^hsl\(/);
    });

    it('foreground is near-black HSL', () => {
      expect(COLORS.foreground).toBe('hsl(220, 25%, 8%)');
    });

    it('card is white HSL', () => {
      expect(COLORS.card).toBe('hsl(0, 0%, 100%)');
    });
  });

  describe('layout values', () => {
    it('headerHeight is 56px', () => {
      expect(LAYOUT.headerHeight).toBe(56);
    });
  });

  describe('shadow values', () => {
    it('brutSm shadow has correct offset', () => {
      expect(SHADOWS.brutSm.shadowOffset).toEqual({ width: 2, height: 2 });
    });

    it('brutSm shadow has zero radius (brutalist)', () => {
      expect(SHADOWS.brutSm.shadowRadius).toBe(0);
    });
  });
});
