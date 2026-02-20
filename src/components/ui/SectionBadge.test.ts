/**
 * SectionBadge Component Tests
 *
 * Tests for badge styling logic.
 */

import { getBadgeColor } from './SectionBadge';
import { COLORS } from '../../config/theme';

describe('SectionBadge', () => {
  describe('getBadgeColor', () => {
    it('returns accent color for accent variant', () => {
      expect(getBadgeColor('accent')).toBe(COLORS.accent);
    });

    it('returns pink color for pink variant', () => {
      expect(getBadgeColor('pink')).toBe(COLORS.pink);
    });

    it('defaults to accent for unspecified variant', () => {
      // @ts-expect-error Testing default behavior
      expect(getBadgeColor(undefined)).toBe(COLORS.accent);
    });
  });

  describe('style values', () => {
    it('accent uses lime green (COLORS.accent)', () => {
      const color = getBadgeColor('accent');
      expect(color).toBe('hsl(80, 70%, 52%)');
    });

    it('pink uses hot pink (COLORS.pink)', () => {
      const color = getBadgeColor('pink');
      expect(color).toBe('hsl(330, 90%, 55%)');
    });
  });
});
