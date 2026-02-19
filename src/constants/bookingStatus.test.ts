/**
 * Booking Status Tests
 *
 * Tests for booking status constants and helper functions.
 */

import {
  BOOKING_STATUS,
  BOOKING_STATUS_CONFIG,
  getStatusConfig,
  canEditBooking,
  canDeleteBooking,
  type BookingStatus,
} from './bookingStatus';

describe('BOOKING_STATUS', () => {
  it('defines upcoming status', () => {
    expect(BOOKING_STATUS.UPCOMING).toBe('upcoming');
  });

  it('defines active status', () => {
    expect(BOOKING_STATUS.ACTIVE).toBe('active');
  });

  it('defines completed status', () => {
    expect(BOOKING_STATUS.COMPLETED).toBe('completed');
  });

  it('defines archived status', () => {
    expect(BOOKING_STATUS.ARCHIVED).toBe('archived');
  });

  it('defines cancelled status', () => {
    expect(BOOKING_STATUS.CANCELLED).toBe('cancelled');
  });

  it('has exactly 5 statuses', () => {
    expect(Object.keys(BOOKING_STATUS)).toHaveLength(5);
  });
});

describe('BOOKING_STATUS_CONFIG', () => {
  describe('structure', () => {
    it('has config for all statuses', () => {
      Object.values(BOOKING_STATUS).forEach((status) => {
        expect(BOOKING_STATUS_CONFIG[status]).toBeDefined();
      });
    });

    it('each config has required fields', () => {
      Object.values(BOOKING_STATUS_CONFIG).forEach((config) => {
        expect(config.label).toBeDefined();
        expect(config.labelHR).toBeDefined();
        expect(config.color).toBeDefined();
        expect(typeof config.canEdit).toBe('boolean');
        expect(typeof config.canDelete).toBe('boolean');
        expect(typeof config.canEditAPA).toBe('boolean');
        expect(typeof config.canEditExpenses).toBe('boolean');
        expect(typeof config.canEditTip).toBe('boolean');
      });
    });
  });

  describe('upcoming config', () => {
    const config = BOOKING_STATUS_CONFIG[BOOKING_STATUS.UPCOMING];

    it('has correct label', () => {
      expect(config.label).toBe('Upcoming');
      expect(config.labelHR).toBe('Nadolazeći');
    });

    it('allows editing', () => {
      expect(config.canEdit).toBe(true);
    });

    it('allows deletion', () => {
      expect(config.canDelete).toBe(true);
    });

    it('allows APA editing', () => {
      expect(config.canEditAPA).toBe(true);
    });

    it('allows expense editing', () => {
      expect(config.canEditExpenses).toBe(true);
    });

    it('allows tip editing', () => {
      expect(config.canEditTip).toBe(true);
    });
  });

  describe('active config', () => {
    const config = BOOKING_STATUS_CONFIG[BOOKING_STATUS.ACTIVE];

    it('has correct label', () => {
      expect(config.label).toBe('Active');
      expect(config.labelHR).toBe('u toku');
    });

    it('allows editing', () => {
      expect(config.canEdit).toBe(true);
    });

    it('does NOT allow deletion', () => {
      expect(config.canDelete).toBe(false);
    });

    it('allows APA editing', () => {
      expect(config.canEditAPA).toBe(true);
    });

    it('allows expense editing', () => {
      expect(config.canEditExpenses).toBe(true);
    });

    it('allows tip editing', () => {
      expect(config.canEditTip).toBe(true);
    });
  });

  describe('completed config', () => {
    const config = BOOKING_STATUS_CONFIG[BOOKING_STATUS.COMPLETED];

    it('has correct label', () => {
      expect(config.label).toBe('Completed');
      expect(config.labelHR).toBe('Završen');
    });

    it('does NOT allow editing', () => {
      expect(config.canEdit).toBe(false);
    });

    it('does NOT allow deletion', () => {
      expect(config.canDelete).toBe(false);
    });

    it('does NOT allow APA editing', () => {
      expect(config.canEditAPA).toBe(false);
    });

    it('does NOT allow expense editing', () => {
      expect(config.canEditExpenses).toBe(false);
    });

    it('allows tip editing (can add tip after charter)', () => {
      expect(config.canEditTip).toBe(true);
    });
  });

  describe('archived config', () => {
    const config = BOOKING_STATUS_CONFIG[BOOKING_STATUS.ARCHIVED];

    it('has correct label', () => {
      expect(config.label).toBe('Archived');
      expect(config.labelHR).toBe('Arhiviran');
    });

    it('does NOT allow any editing', () => {
      expect(config.canEdit).toBe(false);
      expect(config.canDelete).toBe(false);
      expect(config.canEditAPA).toBe(false);
      expect(config.canEditExpenses).toBe(false);
      expect(config.canEditTip).toBe(false);
    });
  });

  describe('cancelled config', () => {
    const config = BOOKING_STATUS_CONFIG[BOOKING_STATUS.CANCELLED];

    it('has correct label', () => {
      expect(config.label).toBe('Cancelled');
      expect(config.labelHR).toBe('Otkazan');
    });

    it('does NOT allow any editing', () => {
      expect(config.canEdit).toBe(false);
      expect(config.canDelete).toBe(false);
      expect(config.canEditAPA).toBe(false);
      expect(config.canEditExpenses).toBe(false);
      expect(config.canEditTip).toBe(false);
    });
  });
});

describe('getStatusConfig', () => {
  it('returns config for upcoming', () => {
    const config = getStatusConfig(BOOKING_STATUS.UPCOMING);
    expect(config.label).toBe('Upcoming');
  });

  it('returns config for active', () => {
    const config = getStatusConfig(BOOKING_STATUS.ACTIVE);
    expect(config.label).toBe('Active');
  });

  it('returns config for completed', () => {
    const config = getStatusConfig(BOOKING_STATUS.COMPLETED);
    expect(config.label).toBe('Completed');
  });

  it('returns config for archived', () => {
    const config = getStatusConfig(BOOKING_STATUS.ARCHIVED);
    expect(config.label).toBe('Archived');
  });

  it('returns config for cancelled', () => {
    const config = getStatusConfig(BOOKING_STATUS.CANCELLED);
    expect(config.label).toBe('Cancelled');
  });
});

describe('canEditBooking', () => {
  it('returns true for upcoming bookings', () => {
    expect(canEditBooking(BOOKING_STATUS.UPCOMING)).toBe(true);
  });

  it('returns true for active bookings', () => {
    expect(canEditBooking(BOOKING_STATUS.ACTIVE)).toBe(true);
  });

  it('returns false for completed bookings', () => {
    expect(canEditBooking(BOOKING_STATUS.COMPLETED)).toBe(false);
  });

  it('returns false for archived bookings', () => {
    expect(canEditBooking(BOOKING_STATUS.ARCHIVED)).toBe(false);
  });

  it('returns false for cancelled bookings', () => {
    expect(canEditBooking(BOOKING_STATUS.CANCELLED)).toBe(false);
  });
});

describe('canDeleteBooking', () => {
  it('returns true ONLY for upcoming bookings', () => {
    expect(canDeleteBooking(BOOKING_STATUS.UPCOMING)).toBe(true);
  });

  it('returns false for active bookings', () => {
    expect(canDeleteBooking(BOOKING_STATUS.ACTIVE)).toBe(false);
  });

  it('returns false for completed bookings', () => {
    expect(canDeleteBooking(BOOKING_STATUS.COMPLETED)).toBe(false);
  });

  it('returns false for archived bookings', () => {
    expect(canDeleteBooking(BOOKING_STATUS.ARCHIVED)).toBe(false);
  });

  it('returns false for cancelled bookings', () => {
    expect(canDeleteBooking(BOOKING_STATUS.CANCELLED)).toBe(false);
  });
});

describe('status lifecycle rules', () => {
  it('only upcoming bookings can be deleted', () => {
    const deletableStatuses = Object.values(BOOKING_STATUS).filter(
      (status) => BOOKING_STATUS_CONFIG[status].canDelete
    );
    expect(deletableStatuses).toEqual([BOOKING_STATUS.UPCOMING]);
  });

  it('only upcoming and active can be edited', () => {
    const editableStatuses = Object.values(BOOKING_STATUS).filter(
      (status) => BOOKING_STATUS_CONFIG[status].canEdit
    );
    expect(editableStatuses).toEqual([BOOKING_STATUS.UPCOMING, BOOKING_STATUS.ACTIVE]);
  });

  it('tips can be edited for upcoming, active, and completed', () => {
    const tipEditableStatuses = Object.values(BOOKING_STATUS).filter(
      (status) => BOOKING_STATUS_CONFIG[status].canEditTip
    );
    expect(tipEditableStatuses).toEqual([
      BOOKING_STATUS.UPCOMING,
      BOOKING_STATUS.ACTIVE,
      BOOKING_STATUS.COMPLETED,
    ]);
  });

  it('archived and cancelled are fully locked', () => {
    const lockedStatuses = [BOOKING_STATUS.ARCHIVED, BOOKING_STATUS.CANCELLED];

    lockedStatuses.forEach((status) => {
      const config = BOOKING_STATUS_CONFIG[status];
      expect(config.canEdit).toBe(false);
      expect(config.canDelete).toBe(false);
      expect(config.canEditAPA).toBe(false);
      expect(config.canEditExpenses).toBe(false);
      expect(config.canEditTip).toBe(false);
    });
  });
});
