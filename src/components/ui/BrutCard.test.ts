/**
 * BrutCard Component Tests
 *
 * Tests for brutalist card styling logic.
 */

import {
  getVariantBackground,
  getShadow,
  getPadding,
  BASE_STYLES,
} from './BrutCard';
import { COLORS, SHADOWS, BORDERS, BORDER_RADIUS, SPACING } from '../../config/theme';

describe('BrutCard', () => {
  describe('getVariantBackground', () => {
    it('returns card color for default variant', () => {
      expect(getVariantBackground('default')).toBe(COLORS.card);
    });

    it('returns primary color for primary variant', () => {
      expect(getVariantBackground('primary')).toBe(COLORS.primary);
    });

    it('returns accent color for accent variant', () => {
      expect(getVariantBackground('accent')).toBe(COLORS.accent);
    });

    it('returns pink color for pink variant', () => {
      expect(getVariantBackground('pink')).toBe(COLORS.pink);
    });

    it('returns amber color for amber variant', () => {
      expect(getVariantBackground('amber')).toBe(COLORS.heroAmber);
    });

    it('returns teal color for teal variant', () => {
      expect(getVariantBackground('teal')).toBe(COLORS.heroTeal);
    });

    it('returns card color for unknown variant', () => {
      // @ts-expect-error - Testing invalid variant
      expect(getVariantBackground('invalid')).toBe(COLORS.card);
    });
  });

  describe('getShadow', () => {
    it('returns brutSm shadow for sm size', () => {
      const shadow = getShadow('sm');
      expect(shadow).toEqual(SHADOWS.brutSm);
    });

    it('returns brut shadow for md size (default)', () => {
      const shadow = getShadow('md');
      expect(shadow).toEqual(SHADOWS.brut);
    });

    it('returns brutLg shadow for lg size', () => {
      const shadow = getShadow('lg');
      expect(shadow).toEqual(SHADOWS.brutLg);
    });

    it('returns brut shadow for unknown size', () => {
      // @ts-expect-error - Testing invalid size
      expect(getShadow('invalid')).toEqual(SHADOWS.brut);
    });
  });

  describe('getPadding', () => {
    it('returns spacing value for spacing key', () => {
      expect(getPadding('xs')).toBe(SPACING.xs);
      expect(getPadding('sm')).toBe(SPACING.sm);
      expect(getPadding('md')).toBe(SPACING.md);
      expect(getPadding('lg')).toBe(SPACING.lg);
      expect(getPadding('xl')).toBe(SPACING.xl);
    });

    it('returns numeric value for number input', () => {
      expect(getPadding(0)).toBe(0);
      expect(getPadding(10)).toBe(10);
      expect(getPadding(24)).toBe(24);
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

    it('has correct border color', () => {
      expect(BASE_STYLES.borderColor).toBe(COLORS.foreground);
    });

    it('has card background color', () => {
      expect(BASE_STYLES.backgroundColor).toBe(COLORS.card);
    });
  });

  describe('shadow properties (brutalist)', () => {
    it('all shadow variants have zero radius (no blur)', () => {
      expect(SHADOWS.brutSm.shadowRadius).toBe(0);
      expect(SHADOWS.brut.shadowRadius).toBe(0);
      expect(SHADOWS.brutLg.shadowRadius).toBe(0);
    });

    it('all shadow variants have full opacity', () => {
      expect(SHADOWS.brutSm.shadowOpacity).toBe(1);
      expect(SHADOWS.brut.shadowOpacity).toBe(1);
      expect(SHADOWS.brutLg.shadowOpacity).toBe(1);
    });

    it('brutSm has 2px offset', () => {
      expect(SHADOWS.brutSm.shadowOffset).toEqual({ width: 2, height: 2 });
    });

    it('brut has 4px offset', () => {
      expect(SHADOWS.brut.shadowOffset).toEqual({ width: 4, height: 4 });
    });

    it('brutLg has 6px offset', () => {
      expect(SHADOWS.brutLg.shadowOffset).toEqual({ width: 6, height: 6 });
    });
  });

  describe('variant color values', () => {
    it('all hero colors are defined', () => {
      expect(COLORS.primary).toBeDefined();
      expect(COLORS.accent).toBeDefined();
      expect(COLORS.pink).toBeDefined();
      expect(COLORS.heroAmber).toBeDefined();
      expect(COLORS.heroTeal).toBeDefined();
    });

    it('hero colors use HSL format', () => {
      expect(COLORS.primary).toMatch(/^hsl\(/);
      expect(COLORS.accent).toMatch(/^hsl\(/);
      expect(COLORS.pink).toMatch(/^hsl\(/);
      expect(COLORS.heroAmber).toMatch(/^hsl\(/);
      expect(COLORS.heroTeal).toMatch(/^hsl\(/);
    });
  });
});
