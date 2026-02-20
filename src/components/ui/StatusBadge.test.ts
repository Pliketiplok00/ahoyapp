/**
 * StatusBadge Component Tests (Brutalist)
 *
 * Tests for brutalist status badge styling logic.
 */

import { getStatusColor } from './StatusBadge';
import { COLORS } from '../../config/theme';

describe('StatusBadge (Brutalist)', () => {
  describe('getStatusColor', () => {
    it('returns accent color for accent variant', () => {
      expect(getStatusColor('accent')).toBe(COLORS.accent);
    });

    it('returns pink color for pink variant', () => {
      expect(getStatusColor('pink')).toBe(COLORS.pink);
    });

    it('returns primary color for primary variant', () => {
      expect(getStatusColor('primary')).toBe(COLORS.primary);
    });

    it('returns muted color for muted variant', () => {
      expect(getStatusColor('muted')).toBe(COLORS.muted);
    });

    it('defaults to accent for unknown variant', () => {
      // @ts-expect-error Testing default behavior
      expect(getStatusColor('unknown')).toBe(COLORS.accent);
    });
  });

  describe('color values', () => {
    it('accent is lime green', () => {
      expect(getStatusColor('accent')).toBe('hsl(80, 70%, 52%)');
    });

    it('pink is hot pink', () => {
      expect(getStatusColor('pink')).toBe('hsl(330, 90%, 55%)');
    });

    it('primary is sky blue', () => {
      expect(getStatusColor('primary')).toBe('hsl(196, 90%, 55%)');
    });

    it('muted is muted cream', () => {
      expect(getStatusColor('muted')).toBe('hsl(55, 20%, 88%)');
    });
  });
});
