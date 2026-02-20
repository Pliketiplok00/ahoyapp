/**
 * BookingStatusBadge Component Tests
 *
 * Tests for booking status badge styling logic (Brutalist).
 */

import {
  getStatusBadgeColor,
  getStatusLabel,
  getBadgeSizeStyles,
} from './BookingStatusBadge';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, BORDERS } from '../../config/theme';
import { BOOKING_STATUS } from '../../constants/bookingStatus';

describe('BookingStatusBadge', () => {
  describe('getStatusBadgeColor', () => {
    it('returns statusUpcoming color for upcoming', () => {
      expect(getStatusBadgeColor(BOOKING_STATUS.UPCOMING)).toBe(COLORS.statusUpcoming);
    });

    it('returns statusActive color for active', () => {
      expect(getStatusBadgeColor(BOOKING_STATUS.ACTIVE)).toBe(COLORS.statusActive);
    });

    it('returns statusCompleted color for completed', () => {
      expect(getStatusBadgeColor(BOOKING_STATUS.COMPLETED)).toBe(COLORS.statusCompleted);
    });

    it('returns statusCompleted color for archived', () => {
      expect(getStatusBadgeColor(BOOKING_STATUS.ARCHIVED)).toBe(COLORS.statusCompleted);
    });

    it('returns statusCancelled color for cancelled', () => {
      expect(getStatusBadgeColor(BOOKING_STATUS.CANCELLED)).toBe(COLORS.statusCancelled);
    });
  });

  describe('getStatusLabel', () => {
    describe('Croatian labels', () => {
      it('returns "Nadolazeći" for upcoming', () => {
        expect(getStatusLabel(BOOKING_STATUS.UPCOMING, true)).toBe('Nadolazeći');
      });

      it('returns "u toku" for active', () => {
        expect(getStatusLabel(BOOKING_STATUS.ACTIVE, true)).toBe('u toku');
      });

      it('returns "Završen" for completed', () => {
        expect(getStatusLabel(BOOKING_STATUS.COMPLETED, true)).toBe('Završen');
      });

      it('returns "Arhiviran" for archived', () => {
        expect(getStatusLabel(BOOKING_STATUS.ARCHIVED, true)).toBe('Arhiviran');
      });

      it('returns "Otkazan" for cancelled', () => {
        expect(getStatusLabel(BOOKING_STATUS.CANCELLED, true)).toBe('Otkazan');
      });
    });

    describe('English labels', () => {
      it('returns "Upcoming" for upcoming', () => {
        expect(getStatusLabel(BOOKING_STATUS.UPCOMING, false)).toBe('Upcoming');
      });

      it('returns "Active" for active', () => {
        expect(getStatusLabel(BOOKING_STATUS.ACTIVE, false)).toBe('Active');
      });

      it('returns "Completed" for completed', () => {
        expect(getStatusLabel(BOOKING_STATUS.COMPLETED, false)).toBe('Completed');
      });

      it('returns "Archived" for archived', () => {
        expect(getStatusLabel(BOOKING_STATUS.ARCHIVED, false)).toBe('Archived');
      });

      it('returns "Cancelled" for cancelled', () => {
        expect(getStatusLabel(BOOKING_STATUS.CANCELLED, false)).toBe('Cancelled');
      });
    });

    describe('with daysUntil', () => {
      it('returns Croatian format with days for upcoming', () => {
        expect(getStatusLabel(BOOKING_STATUS.UPCOMING, true, 5)).toBe('za 5 d.');
      });

      it('returns English format with days for upcoming', () => {
        expect(getStatusLabel(BOOKING_STATUS.UPCOMING, false, 5)).toBe('in 5d');
      });

      it('ignores daysUntil for non-upcoming status', () => {
        expect(getStatusLabel(BOOKING_STATUS.ACTIVE, true, 5)).toBe('u toku');
      });

      it('handles 0 days', () => {
        expect(getStatusLabel(BOOKING_STATUS.UPCOMING, true, 0)).toBe('za 0 d.');
      });

      it('handles 1 day', () => {
        expect(getStatusLabel(BOOKING_STATUS.UPCOMING, true, 1)).toBe('za 1 d.');
      });
    });
  });

  describe('getBadgeSizeStyles', () => {
    describe('sm size', () => {
      const styles = getBadgeSizeStyles('sm');

      it('has correct container padding', () => {
        expect(styles.container.paddingHorizontal).toBe(SPACING.xs);
        expect(styles.container.paddingVertical).toBe(2);
      });

      it('has no border radius (brutalist)', () => {
        expect(styles.container.borderRadius).toBe(BORDER_RADIUS.none);
      });

      it('has border (brutalist)', () => {
        expect(styles.container.borderWidth).toBe(BORDERS.thin);
        expect(styles.container.borderColor).toBe(COLORS.foreground);
      });

      it('has xs font size', () => {
        expect(styles.text.fontSize).toBe(FONT_SIZES.xs);
      });
    });

    describe('md size', () => {
      const styles = getBadgeSizeStyles('md');

      it('has correct container padding', () => {
        expect(styles.container.paddingHorizontal).toBe(SPACING.sm);
        expect(styles.container.paddingVertical).toBe(SPACING.xs);
      });

      it('has no border radius (brutalist)', () => {
        expect(styles.container.borderRadius).toBe(BORDER_RADIUS.none);
      });

      it('has border (brutalist)', () => {
        expect(styles.container.borderWidth).toBe(BORDERS.thin);
        expect(styles.container.borderColor).toBe(COLORS.foreground);
      });

      it('has sm font size', () => {
        expect(styles.text.fontSize).toBe(FONT_SIZES.sm);
      });
    });

    describe('lg size', () => {
      const styles = getBadgeSizeStyles('lg');

      it('has correct container padding', () => {
        expect(styles.container.paddingHorizontal).toBe(SPACING.md);
        expect(styles.container.paddingVertical).toBe(SPACING.sm);
      });

      it('has no border radius (brutalist)', () => {
        expect(styles.container.borderRadius).toBe(BORDER_RADIUS.none);
      });

      it('has border (brutalist)', () => {
        expect(styles.container.borderWidth).toBe(BORDERS.thin);
        expect(styles.container.borderColor).toBe(COLORS.foreground);
      });

      it('has md font size', () => {
        expect(styles.text.fontSize).toBe(FONT_SIZES.md);
      });
    });
  });

  describe('status and size combinations', () => {
    it('upcoming sm badge', () => {
      const color = getStatusBadgeColor(BOOKING_STATUS.UPCOMING);
      const label = getStatusLabel(BOOKING_STATUS.UPCOMING, true, 3);
      const size = getBadgeSizeStyles('sm');

      expect(color).toBe(COLORS.statusUpcoming);
      expect(label).toBe('za 3 d.');
      expect(size.text.fontSize).toBe(FONT_SIZES.xs);
    });

    it('active lg badge', () => {
      const color = getStatusBadgeColor(BOOKING_STATUS.ACTIVE);
      const label = getStatusLabel(BOOKING_STATUS.ACTIVE, true);
      const size = getBadgeSizeStyles('lg');

      expect(color).toBe(COLORS.statusActive);
      expect(label).toBe('u toku');
      expect(size.text.fontSize).toBe(FONT_SIZES.md);
    });
  });
});
