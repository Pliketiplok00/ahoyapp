/**
 * EmptyState Component Tests
 *
 * Tests for EmptyState helper functions.
 */

import { getEmptyStateIcon } from './EmptyState';

describe('EmptyState', () => {
  describe('getEmptyStateIcon', () => {
    it('returns boat emoji for bookings type', () => {
      expect(getEmptyStateIcon('bookings')).toBe('⛵');
    });

    it('returns ship emoji for season type', () => {
      expect(getEmptyStateIcon('season')).toBe('🚢');
    });

    it('returns money bag emoji for expenses type', () => {
      expect(getEmptyStateIcon('expenses')).toBe('💰');
    });

    it('returns people emoji for crew type', () => {
      expect(getEmptyStateIcon('crew')).toBe('👥');
    });

    it('returns mailbox emoji for unknown type', () => {
      // @ts-expect-error Testing default behavior
      expect(getEmptyStateIcon('unknown')).toBe('📭');
    });
  });
});
