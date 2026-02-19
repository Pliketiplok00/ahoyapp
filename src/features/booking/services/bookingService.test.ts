/**
 * Booking Service Tests
 *
 * Tests for booking CRUD operations and status management.
 * Uses mocked Firebase for unit testing.
 */

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';

// Mock Firebase Firestore
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn().mockResolvedValue(undefined),
  deleteDoc: jest.fn().mockResolvedValue(undefined),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  Timestamp: {
    fromDate: jest.fn((date: Date) => ({
      toDate: () => date,
      seconds: Math.floor(date.getTime() / 1000),
    })),
  },
  serverTimestamp: jest.fn(() => ({ _serverTimestamp: true })),
}));

// Mock Firebase config
jest.mock('../../../config/firebase', () => ({
  db: {},
}));

// Mock marinas config
jest.mock('../../../config/marinas', () => ({
  DEFAULT_MARINA: 'Kaštela',
}));

// Import after mocks
import {
  createBooking,
  getBooking,
  getSeasonBookings,
  updateBooking,
  deleteBooking,
  cancelBooking,
  completeBooking,
  archiveBooking,
  updateApaTotal,
  checkDateOverlap,
  getSeasonBookingStats,
} from './bookingService';
import { BOOKING_STATUS } from '../../../constants/bookingStatus';

// Helper to create mock Firestore doc
const createMockDoc = (id: string, data: Record<string, unknown>, exists = true) => ({
  id,
  exists: () => exists,
  data: () => data,
});

// Helper to create mock Firestore snapshot
const createMockSnapshot = (docs: Array<{ id: string; data: Record<string, unknown> }>) => ({
  docs: docs.map(({ id, data }) => createMockDoc(id, data)),
  forEach: function(cb: (doc: ReturnType<typeof createMockDoc>) => void) {
    this.docs.forEach(cb);
  },
  empty: docs.length === 0,
});

// Mock booking data
const mockBookingData = {
  seasonId: 'season-1',
  arrivalDate: { toDate: () => new Date('2026-07-15'), seconds: 1784160000 },
  departureDate: { toDate: () => new Date('2026-07-22'), seconds: 1784764800 },
  departureMarina: 'Kaštela',
  arrivalMarina: 'Kaštela',
  guestCount: 8,
  notes: 'VIP guests',
  status: BOOKING_STATUS.UPCOMING,
  apaTotal: 5000,
  tip: null,
  reconciliation: null,
  createdBy: 'user-1',
  createdAt: { toDate: () => new Date() },
  updatedAt: { toDate: () => new Date() },
};

describe('bookingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset doc mock
    (doc as jest.Mock).mockImplementation((...args) => ({
      id: args[args.length - 1] || 'mock-doc-id',
      path: args.join('/'),
    }));
    (collection as jest.Mock).mockImplementation((...args) => ({
      path: args.join('/'),
    }));
  });

  // ============ Create Booking ============

  describe('createBooking', () => {
    it('creates booking with correct data structure', async () => {
      const mockDocRef = { id: 'new-booking-id' };
      (addDoc as jest.Mock).mockResolvedValueOnce(mockDocRef);
      (getDoc as jest.Mock).mockResolvedValueOnce(createMockDoc('new-booking-id', mockBookingData));

      const input = {
        seasonId: 'season-1',
        arrivalDate: new Date('2026-07-15'),
        departureDate: new Date('2026-07-22'),
        guestCount: 8,
        notes: 'VIP guests',
        createdBy: 'user-1',
      };

      const result = await createBooking(input);

      expect(result.success).toBe(true);
      expect(result.data?.id).toBe('new-booking-id');
      expect(addDoc).toHaveBeenCalled();
    });

    it('uses DEFAULT_MARINA when marina not specified', async () => {
      const mockDocRef = { id: 'new-booking-id' };
      (addDoc as jest.Mock).mockResolvedValueOnce(mockDocRef);
      (getDoc as jest.Mock).mockResolvedValueOnce(createMockDoc('new-booking-id', mockBookingData));

      const input = {
        seasonId: 'season-1',
        arrivalDate: new Date('2026-07-15'),
        departureDate: new Date('2026-07-22'),
        guestCount: 8,
        createdBy: 'user-1',
      };

      await createBooking(input);

      const addDocCall = (addDoc as jest.Mock).mock.calls[0];
      const bookingData = addDocCall[1];
      expect(bookingData.departureMarina).toBe('Kaštela');
      expect(bookingData.arrivalMarina).toBe('Kaštela');
    });

    it('sets initial apaTotal to 0', async () => {
      const mockDocRef = { id: 'new-booking-id' };
      (addDoc as jest.Mock).mockResolvedValueOnce(mockDocRef);
      (getDoc as jest.Mock).mockResolvedValueOnce(createMockDoc('new-booking-id', mockBookingData));

      const input = {
        seasonId: 'season-1',
        arrivalDate: new Date('2026-07-15'),
        departureDate: new Date('2026-07-22'),
        guestCount: 8,
        createdBy: 'user-1',
      };

      await createBooking(input);

      const addDocCall = (addDoc as jest.Mock).mock.calls[0];
      const bookingData = addDocCall[1];
      expect(bookingData.apaTotal).toBe(0);
      expect(bookingData.tip).toBeNull();
    });

    it('calculates status based on dates', async () => {
      const mockDocRef = { id: 'new-booking-id' };
      (addDoc as jest.Mock).mockResolvedValueOnce(mockDocRef);
      (getDoc as jest.Mock).mockResolvedValueOnce(createMockDoc('new-booking-id', mockBookingData));

      // Future dates should result in 'upcoming' status
      const input = {
        seasonId: 'season-1',
        arrivalDate: new Date('2099-07-15'),
        departureDate: new Date('2099-07-22'),
        guestCount: 8,
        createdBy: 'user-1',
      };

      await createBooking(input);

      const addDocCall = (addDoc as jest.Mock).mock.calls[0];
      const bookingData = addDocCall[1];
      expect(bookingData.status).toBe(BOOKING_STATUS.UPCOMING);
    });

    it('handles Firebase errors gracefully', async () => {
      (addDoc as jest.Mock).mockRejectedValueOnce(new Error('Firebase error'));

      const input = {
        seasonId: 'season-1',
        arrivalDate: new Date('2026-07-15'),
        departureDate: new Date('2026-07-22'),
        guestCount: 8,
        createdBy: 'user-1',
      };

      const result = await createBooking(input);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to create booking. Please try again.');
    });
  });

  // ============ Get Booking ============

  describe('getBooking', () => {
    it('returns booking when found', async () => {
      (getDoc as jest.Mock).mockResolvedValueOnce(createMockDoc('booking-1', mockBookingData));

      const result = await getBooking('booking-1');

      expect(result.success).toBe(true);
      expect(result.data?.id).toBe('booking-1');
      expect(result.data?.guestCount).toBe(8);
    });

    it('returns error when booking not found', async () => {
      (getDoc as jest.Mock).mockResolvedValueOnce(createMockDoc('booking-1', {}, false));

      const result = await getBooking('booking-1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Booking not found');
    });

    it('handles errors gracefully', async () => {
      (getDoc as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await getBooking('booking-1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to load booking');
    });
  });

  // ============ Get Season Bookings ============

  describe('getSeasonBookings', () => {
    it('returns all bookings for season', async () => {
      const mockBookings = [
        { id: 'b1', data: { ...mockBookingData, guestCount: 6 } },
        { id: 'b2', data: { ...mockBookingData, guestCount: 10 } },
      ];
      (getDocs as jest.Mock).mockResolvedValueOnce(createMockSnapshot(mockBookings));

      const result = await getSeasonBookings('season-1');

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(query).toHaveBeenCalled();
      expect(where).toHaveBeenCalledWith('seasonId', '==', 'season-1');
      expect(orderBy).toHaveBeenCalledWith('arrivalDate', 'asc');
    });

    it('returns empty array on error', async () => {
      (getDocs as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await getSeasonBookings('season-1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to load bookings');
    });
  });

  // ============ Update Booking ============

  describe('updateBooking', () => {
    it('updates booking with provided fields', async () => {
      (getDoc as jest.Mock).mockResolvedValue(createMockDoc('booking-1', mockBookingData));

      const result = await updateBooking('booking-1', { guestCount: 10 });

      expect(result.success).toBe(true);
      expect(updateDoc).toHaveBeenCalled();
    });

    it('converts dates to Timestamps', async () => {
      (getDoc as jest.Mock).mockResolvedValue(createMockDoc('booking-1', mockBookingData));

      const newDate = new Date('2026-08-01');
      await updateBooking('booking-1', { arrivalDate: newDate });

      expect(Timestamp.fromDate).toHaveBeenCalledWith(newDate);
    });

    it('recalculates status when dates change', async () => {
      (getDoc as jest.Mock).mockResolvedValue(createMockDoc('booking-1', mockBookingData));

      await updateBooking('booking-1', { arrivalDate: new Date('2099-08-01') });

      const updateCall = (updateDoc as jest.Mock).mock.calls[0];
      const updateData = updateCall[1];
      expect(updateData.status).toBeDefined();
    });

    it('handles errors gracefully', async () => {
      (updateDoc as jest.Mock).mockRejectedValueOnce(new Error('Update failed'));

      const result = await updateBooking('booking-1', { guestCount: 10 });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to update booking');
    });
  });

  // ============ Delete Booking ============

  describe('deleteBooking', () => {
    it('deletes upcoming booking', async () => {
      const upcomingBooking = { ...mockBookingData, status: BOOKING_STATUS.UPCOMING };
      (getDoc as jest.Mock).mockResolvedValueOnce(createMockDoc('booking-1', upcomingBooking));

      const result = await deleteBooking('booking-1');

      expect(result.success).toBe(true);
      expect(deleteDoc).toHaveBeenCalled();
    });

    it('refuses to delete non-upcoming booking', async () => {
      const activeBooking = { ...mockBookingData, status: BOOKING_STATUS.ACTIVE };
      (getDoc as jest.Mock).mockResolvedValueOnce(createMockDoc('booking-1', activeBooking));

      const result = await deleteBooking('booking-1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Only upcoming bookings can be deleted');
      expect(deleteDoc).not.toHaveBeenCalled();
    });

    it('returns error when booking not found', async () => {
      (getDoc as jest.Mock).mockResolvedValueOnce(createMockDoc('booking-1', {}, false));

      const result = await deleteBooking('booking-1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Booking not found');
    });

    it('handles errors gracefully', async () => {
      (getDoc as jest.Mock).mockRejectedValueOnce(new Error('Error'));

      const result = await deleteBooking('booking-1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to delete booking');
    });
  });

  // ============ Cancel Booking ============

  describe('cancelBooking', () => {
    it('sets status to cancelled', async () => {
      const cancelledData = { ...mockBookingData, status: BOOKING_STATUS.CANCELLED };
      (getDoc as jest.Mock).mockResolvedValueOnce(createMockDoc('booking-1', cancelledData));

      const result = await cancelBooking('booking-1');

      expect(result.success).toBe(true);
      expect(updateDoc).toHaveBeenCalled();

      const updateCall = (updateDoc as jest.Mock).mock.calls[0];
      const updateData = updateCall[1];
      expect(updateData.status).toBe(BOOKING_STATUS.CANCELLED);
    });

    it('handles errors gracefully', async () => {
      (updateDoc as jest.Mock).mockRejectedValueOnce(new Error('Error'));

      const result = await cancelBooking('booking-1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to cancel booking');
    });
  });

  // ============ Complete Booking ============

  describe('completeBooking', () => {
    it('sets status to completed with reconciliation data', async () => {
      const completedData = { ...mockBookingData, status: BOOKING_STATUS.COMPLETED };
      (getDoc as jest.Mock).mockResolvedValueOnce(createMockDoc('booking-1', completedData));

      const result = await completeBooking('booking-1', {
        expectedCash: 1000,
        actualCash: 1050,
        reconciledBy: 'user-1',
      });

      expect(result.success).toBe(true);
      expect(updateDoc).toHaveBeenCalled();

      const updateCall = (updateDoc as jest.Mock).mock.calls[0];
      const updateData = updateCall[1];
      expect(updateData.status).toBe(BOOKING_STATUS.COMPLETED);
      expect(updateData.reconciliation.expectedCash).toBe(1000);
      expect(updateData.reconciliation.actualCash).toBe(1050);
      expect(updateData.reconciliation.difference).toBe(50);
    });

    it('calculates negative difference correctly', async () => {
      const completedData = { ...mockBookingData, status: BOOKING_STATUS.COMPLETED };
      (getDoc as jest.Mock).mockResolvedValueOnce(createMockDoc('booking-1', completedData));

      await completeBooking('booking-1', {
        expectedCash: 1000,
        actualCash: 900,
        reconciledBy: 'user-1',
      });

      const updateCall = (updateDoc as jest.Mock).mock.calls[0];
      const updateData = updateCall[1];
      expect(updateData.reconciliation.difference).toBe(-100);
    });

    it('handles errors gracefully', async () => {
      (updateDoc as jest.Mock).mockRejectedValueOnce(new Error('Error'));

      const result = await completeBooking('booking-1', {
        expectedCash: 1000,
        actualCash: 1000,
        reconciledBy: 'user-1',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to complete booking');
    });
  });

  // ============ Archive Booking ============

  describe('archiveBooking', () => {
    it('sets status to archived', async () => {
      const archivedData = { ...mockBookingData, status: BOOKING_STATUS.ARCHIVED };
      (getDoc as jest.Mock).mockResolvedValueOnce(createMockDoc('booking-1', archivedData));

      const result = await archiveBooking('booking-1');

      expect(result.success).toBe(true);
      expect(updateDoc).toHaveBeenCalled();

      const updateCall = (updateDoc as jest.Mock).mock.calls[0];
      const updateData = updateCall[1];
      expect(updateData.status).toBe(BOOKING_STATUS.ARCHIVED);
    });

    it('handles errors gracefully', async () => {
      (updateDoc as jest.Mock).mockRejectedValueOnce(new Error('Error'));

      const result = await archiveBooking('booking-1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to archive booking');
    });
  });

  // ============ Update APA Total ============

  describe('updateApaTotal', () => {
    it('updates APA total amount', async () => {
      const updatedData = { ...mockBookingData, apaTotal: 7500 };
      (getDoc as jest.Mock).mockResolvedValueOnce(createMockDoc('booking-1', updatedData));

      const result = await updateApaTotal('booking-1', 7500);

      expect(result.success).toBe(true);
      expect(updateDoc).toHaveBeenCalled();

      const updateCall = (updateDoc as jest.Mock).mock.calls[0];
      const updateData = updateCall[1];
      expect(updateData.apaTotal).toBe(7500);
    });

    it('handles errors gracefully', async () => {
      (updateDoc as jest.Mock).mockRejectedValueOnce(new Error('Error'));

      const result = await updateApaTotal('booking-1', 7500);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to update APA');
    });
  });

  // ============ Check Date Overlap ============

  describe('checkDateOverlap', () => {
    it('detects overlapping bookings', async () => {
      const existingBooking = {
        id: 'existing-1',
        data: {
          ...mockBookingData,
          arrivalDate: { toDate: () => new Date('2026-07-15'), seconds: 1784160000 },
          departureDate: { toDate: () => new Date('2026-07-22'), seconds: 1784764800 },
        },
      };
      (getDocs as jest.Mock).mockResolvedValueOnce(createMockSnapshot([existingBooking]));

      const result = await checkDateOverlap(
        'season-1',
        new Date('2026-07-18'),
        new Date('2026-07-25')
      );

      expect(result.success).toBe(true);
      expect(result.data?.hasOverlap).toBe(true);
    });

    it('returns no overlap for non-overlapping dates', async () => {
      const existingBooking = {
        id: 'existing-1',
        data: {
          ...mockBookingData,
          arrivalDate: { toDate: () => new Date('2026-07-15'), seconds: 1784160000 },
          departureDate: { toDate: () => new Date('2026-07-22'), seconds: 1784764800 },
        },
      };
      (getDocs as jest.Mock).mockResolvedValueOnce(createMockSnapshot([existingBooking]));

      const result = await checkDateOverlap(
        'season-1',
        new Date('2026-08-01'),
        new Date('2026-08-08')
      );

      expect(result.success).toBe(true);
      expect(result.data?.hasOverlap).toBe(false);
    });

    it('excludes specified booking from overlap check', async () => {
      const existingBooking = {
        id: 'existing-1',
        data: {
          ...mockBookingData,
          arrivalDate: { toDate: () => new Date('2026-07-15'), seconds: 1784160000 },
          departureDate: { toDate: () => new Date('2026-07-22'), seconds: 1784764800 },
        },
      };
      (getDocs as jest.Mock).mockResolvedValueOnce(createMockSnapshot([existingBooking]));

      const result = await checkDateOverlap(
        'season-1',
        new Date('2026-07-18'),
        new Date('2026-07-25'),
        'existing-1' // Exclude this booking
      );

      expect(result.success).toBe(true);
      expect(result.data?.hasOverlap).toBe(false);
    });

    it('ignores cancelled bookings', async () => {
      const cancelledBooking = {
        id: 'cancelled-1',
        data: {
          ...mockBookingData,
          status: BOOKING_STATUS.CANCELLED,
          arrivalDate: { toDate: () => new Date('2026-07-15'), seconds: 1784160000 },
          departureDate: { toDate: () => new Date('2026-07-22'), seconds: 1784764800 },
        },
      };
      (getDocs as jest.Mock).mockResolvedValueOnce(createMockSnapshot([cancelledBooking]));

      const result = await checkDateOverlap(
        'season-1',
        new Date('2026-07-18'),
        new Date('2026-07-25')
      );

      expect(result.success).toBe(true);
      expect(result.data?.hasOverlap).toBe(false);
    });
  });

  // ============ Get Season Booking Stats ============

  describe('getSeasonBookingStats', () => {
    it('calculates correct statistics', async () => {
      // Use COMPLETED status to avoid status recalculation based on dates
      const bookings = [
        {
          id: 'b1',
          data: {
            ...mockBookingData,
            status: BOOKING_STATUS.COMPLETED,
            guestCount: 6,
            apaTotal: 3000,
            tip: 500,
          },
        },
        {
          id: 'b2',
          data: {
            ...mockBookingData,
            status: BOOKING_STATUS.COMPLETED,
            guestCount: 8,
            apaTotal: 5000,
            tip: 200,
          },
        },
        {
          id: 'b3',
          data: {
            ...mockBookingData,
            status: BOOKING_STATUS.ARCHIVED,
            guestCount: 10,
            apaTotal: 7000,
            tip: 1000,
          },
        },
      ];
      (getDocs as jest.Mock).mockResolvedValueOnce(createMockSnapshot(bookings));

      const result = await getSeasonBookingStats('season-1');

      expect(result.success).toBe(true);
      expect(result.data?.total).toBe(3);
      expect(result.data?.completed).toBe(3); // 2 completed + 1 archived
      expect(result.data?.totalGuests).toBe(24);
      expect(result.data?.totalApa).toBe(15000);
      expect(result.data?.totalTips).toBe(1700);
    });

    it('excludes cancelled bookings from stats', async () => {
      const bookings = [
        {
          id: 'b1',
          data: { ...mockBookingData, status: BOOKING_STATUS.UPCOMING, guestCount: 6 },
        },
        {
          id: 'b2',
          data: { ...mockBookingData, status: BOOKING_STATUS.CANCELLED, guestCount: 8 },
        },
      ];
      (getDocs as jest.Mock).mockResolvedValueOnce(createMockSnapshot(bookings));

      const result = await getSeasonBookingStats('season-1');

      expect(result.success).toBe(true);
      expect(result.data?.total).toBe(1);
      expect(result.data?.totalGuests).toBe(6);
    });

    it('handles errors gracefully', async () => {
      (getDocs as jest.Mock).mockRejectedValueOnce(new Error('Error'));

      const result = await getSeasonBookingStats('season-1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to get booking stats');
    });
  });
});

// TODO Phase 11: Firebase Emulator integration tests
// - Test actual booking creation end-to-end
// - Test status transitions
// - Test concurrent booking modifications
