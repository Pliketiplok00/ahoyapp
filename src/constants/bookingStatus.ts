/**
 * Booking Status Constants
 *
 * Status values and their configurations for bookings.
 */

export const BOOKING_STATUS = {
  UPCOMING: 'upcoming',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  ARCHIVED: 'archived',
  CANCELLED: 'cancelled',
} as const;

export type BookingStatus = (typeof BOOKING_STATUS)[keyof typeof BOOKING_STATUS];

export const BOOKING_STATUS_CONFIG = {
  [BOOKING_STATUS.UPCOMING]: {
    label: 'Upcoming',
    labelHR: 'Nadolazeći',
    badgeText: 'za {days} d.',
    color: 'statusUpcoming',
    canEdit: true,
    canDelete: true,
    canEditAPA: true,
    canEditExpenses: true,
    canEditTip: true,
  },
  [BOOKING_STATUS.ACTIVE]: {
    label: 'Active',
    labelHR: 'u toku',
    color: 'statusActive',
    canEdit: true,
    canDelete: false,
    canEditAPA: true,
    canEditExpenses: true,
    canEditTip: true,
  },
  [BOOKING_STATUS.COMPLETED]: {
    label: 'Completed',
    labelHR: 'Završen',
    color: 'statusCompleted',
    canEdit: false,
    canDelete: false,
    canEditAPA: false,
    canEditExpenses: false,
    canEditTip: true, // Tip can be edited after completion
  },
  [BOOKING_STATUS.ARCHIVED]: {
    label: 'Archived',
    labelHR: 'Arhiviran',
    color: 'statusCompleted',
    canEdit: false,
    canDelete: false,
    canEditAPA: false,
    canEditExpenses: false,
    canEditTip: false,
  },
  [BOOKING_STATUS.CANCELLED]: {
    label: 'Cancelled',
    labelHR: 'Otkazan',
    color: 'statusCancelled',
    canEdit: false,
    canDelete: false,
    canEditAPA: false,
    canEditExpenses: false,
    canEditTip: false,
  },
} as const;

/**
 * Get status config by status value
 */
export function getStatusConfig(status: BookingStatus) {
  return BOOKING_STATUS_CONFIG[status];
}

/**
 * Check if booking can be edited
 */
export function canEditBooking(status: BookingStatus): boolean {
  return BOOKING_STATUS_CONFIG[status].canEdit;
}

/**
 * Check if booking can be deleted
 */
export function canDeleteBooking(status: BookingStatus): boolean {
  return BOOKING_STATUS_CONFIG[status].canDelete;
}
