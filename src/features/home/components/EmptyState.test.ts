/**
 * EmptyState Tests
 *
 * Tests for empty state content generation.
 */

// Mock expo-router to avoid JSX parsing issues
jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() })),
}));

import { getEmptyStateContent } from './EmptyState';

describe('EmptyState', () => {
  describe('getEmptyStateContent', () => {
    describe('no-season type', () => {
      it('returns correct content', () => {
        const content = getEmptyStateContent('no-season');

        expect(content.icon).toBe('\u{1F4C5}');
        expect(content.title).toBe('No Active Season');
        expect(content.message).toBe('Create a new season to start tracking your bookings.');
        expect(content.actionLabel).toBe('Create Season');
        expect(content.actionRoute).toBe('/season/create');
      });

      it('has valid action route', () => {
        const content = getEmptyStateContent('no-season');

        expect(content.actionRoute).toMatch(/^\/season\//);
      });
    });

    describe('no-bookings type', () => {
      it('returns correct content', () => {
        const content = getEmptyStateContent('no-bookings');

        expect(content.icon).toBe('\u{26F5}');
        expect(content.title).toBe('No Bookings Yet');
        expect(content.message).toBe('Your booking radar is clear. Add your first booking to get started.');
        expect(content.actionLabel).toBe('Add Booking');
        expect(content.actionRoute).toBe('/booking/new');
      });

      it('has valid action route', () => {
        const content = getEmptyStateContent('no-bookings');

        expect(content.actionRoute).toMatch(/^\/booking\//);
      });
    });

    describe('season-complete type', () => {
      it('returns correct content', () => {
        const content = getEmptyStateContent('season-complete');

        expect(content.icon).toBe('\u{1F3C6}');
        expect(content.title).toBe('Season Complete!');
        expect(content.message).toBe('All bookings finished. Great work this season!');
      });

      it('has no action button', () => {
        const content = getEmptyStateContent('season-complete');

        expect(content.actionLabel).toBeUndefined();
        expect(content.actionRoute).toBeUndefined();
      });
    });

    it('all types have required fields', () => {
      const types = ['no-season', 'no-bookings', 'season-complete'] as const;

      for (const type of types) {
        const content = getEmptyStateContent(type);
        expect(content.icon).toBeDefined();
        expect(content.title).toBeDefined();
        expect(content.message).toBeDefined();
        expect(content.icon.length).toBeGreaterThan(0);
        expect(content.title.length).toBeGreaterThan(0);
        expect(content.message.length).toBeGreaterThan(0);
      }
    });

    it('actionable types have action properties', () => {
      const actionableTypes = ['no-season', 'no-bookings'] as const;

      for (const type of actionableTypes) {
        const content = getEmptyStateContent(type);
        expect(content.actionLabel).toBeDefined();
        expect(content.actionRoute).toBeDefined();
        expect(content.actionLabel!.length).toBeGreaterThan(0);
        expect(content.actionRoute!.startsWith('/')).toBe(true);
      }
    });
  });
});
