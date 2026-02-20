/**
 * APA Service Tests
 *
 * Tests for APA CRUD operations and reconciliation logic.
 * Uses mocked Firebase for unit testing.
 */

import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';

// Mock Firebase Firestore
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  addDoc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  Timestamp: {
    fromDate: jest.fn((date: Date) => ({
      toDate: () => date,
      seconds: Math.floor(date.getTime() / 1000),
      nanoseconds: 0,
    })),
    now: jest.fn(() => ({
      toDate: () => new Date(),
      seconds: Math.floor(Date.now() / 1000),
      nanoseconds: 0,
    })),
  },
  serverTimestamp: jest.fn(() => ({ _serverTimestamp: true })),
}));

// Mock Firebase config
jest.mock('../../../config/firebase', () => ({
  db: {},
}));

// Import after mocks
import {
  createApaEntry,
  getBookingApaEntries,
  getBookingApaTotal,
  deleteApaEntry,
  calculateReconciliation,
  saveReconciliation,
  isBookingReconciled,
  updateBookingApaTotal,
} from './apaService';

// Helper to create mock Firestore doc
const createMockDoc = (id: string, data: Record<string, unknown>) => ({
  id,
  exists: () => true,
  data: () => data,
});

// Helper to create mock Firestore snapshot
const createMockSnapshot = (
  docs: Array<{ id: string; data: Record<string, unknown> }>
) => ({
  docs: docs.map(({ id, data }) => createMockDoc(id, data)),
  forEach: function (cb: (doc: ReturnType<typeof createMockDoc>) => void) {
    this.docs.forEach(cb);
  },
  empty: docs.length === 0,
});

// Mock APA entry data
const mockApaEntryData = {
  bookingId: 'booking-1',
  amount: 500,
  note: 'Initial APA',
  createdBy: 'user-1',
  createdAt: { toDate: () => new Date(), seconds: Date.now() / 1000, nanoseconds: 0 },
};

describe('apaService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (doc as jest.Mock).mockImplementation((...args) => ({
      id: args[args.length - 1] || 'mock-doc-id',
      path: args.join('/'),
    }));
    (collection as jest.Mock).mockImplementation((...args) => ({
      path: args.join('/'),
    }));
  });

  // ============ Create APA Entry ============

  describe('createApaEntry', () => {
    it('creates APA entry with correct data', async () => {
      const mockDocRef = { id: 'new-apa-id' };
      (addDoc as jest.Mock).mockResolvedValueOnce(mockDocRef);

      const input = {
        bookingId: 'booking-1',
        amount: 500,
        note: 'Initial APA',
        createdBy: 'user-1',
      };

      const result = await createApaEntry(input);

      expect(result.success).toBe(true);
      expect(result.data?.id).toBe('new-apa-id');
      expect(result.data?.amount).toBe(500);
      expect(addDoc).toHaveBeenCalled();
    });

    it('creates APA entry without note', async () => {
      const mockDocRef = { id: 'new-apa-id' };
      (addDoc as jest.Mock).mockResolvedValueOnce(mockDocRef);

      const input = {
        bookingId: 'booking-1',
        amount: 200,
        createdBy: 'user-1',
      };

      const result = await createApaEntry(input);

      expect(result.success).toBe(true);
      expect(result.data?.note).toBeUndefined();
    });

    it('handles Firebase errors gracefully', async () => {
      (addDoc as jest.Mock).mockRejectedValueOnce(new Error('Firebase error'));

      const result = await createApaEntry({
        bookingId: 'booking-1',
        amount: 500,
        createdBy: 'user-1',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to add APA entry. Please try again.');
    });
  });

  // ============ Get Booking APA Entries ============

  describe('getBookingApaEntries', () => {
    it('returns all APA entries for booking', async () => {
      const mockEntries = [
        { id: 'apa-1', data: { ...mockApaEntryData, amount: 500 } },
        { id: 'apa-2', data: { ...mockApaEntryData, amount: 300 } },
      ];
      (getDocs as jest.Mock).mockResolvedValueOnce(
        createMockSnapshot(mockEntries)
      );

      const result = await getBookingApaEntries('booking-1');

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(query).toHaveBeenCalled();
      expect(where).toHaveBeenCalledWith('bookingId', '==', 'booking-1');
      expect(orderBy).toHaveBeenCalledWith('createdAt', 'desc');
    });

    it('returns empty array when no entries', async () => {
      (getDocs as jest.Mock).mockResolvedValueOnce(createMockSnapshot([]));

      const result = await getBookingApaEntries('booking-1');

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(0);
    });

    it('handles errors gracefully', async () => {
      (getDocs as jest.Mock).mockRejectedValueOnce(new Error('Error'));

      const result = await getBookingApaEntries('booking-1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to load APA entries');
    });
  });

  // ============ Get Booking APA Total ============

  describe('getBookingApaTotal', () => {
    it('calculates total correctly', async () => {
      const mockEntries = [
        { id: 'apa-1', data: { ...mockApaEntryData, amount: 500 } },
        { id: 'apa-2', data: { ...mockApaEntryData, amount: 300 } },
        { id: 'apa-3', data: { ...mockApaEntryData, amount: 200 } },
      ];
      (getDocs as jest.Mock).mockResolvedValueOnce(
        createMockSnapshot(mockEntries)
      );

      const result = await getBookingApaTotal('booking-1');

      expect(result.success).toBe(true);
      expect(result.data).toBe(1000);
    });

    it('returns 0 for no entries', async () => {
      (getDocs as jest.Mock).mockResolvedValueOnce(createMockSnapshot([]));

      const result = await getBookingApaTotal('booking-1');

      expect(result.success).toBe(true);
      expect(result.data).toBe(0);
    });
  });

  // ============ Delete APA Entry ============

  describe('deleteApaEntry', () => {
    it('deletes APA entry successfully', async () => {
      (deleteDoc as jest.Mock).mockResolvedValueOnce(undefined);

      const result = await deleteApaEntry('apa-1');

      expect(result.success).toBe(true);
      expect(deleteDoc).toHaveBeenCalled();
    });

    it('handles errors gracefully', async () => {
      (deleteDoc as jest.Mock).mockRejectedValueOnce(new Error('Error'));

      const result = await deleteApaEntry('apa-1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to delete APA entry');
    });
  });

  // ============ Calculate Reconciliation ============

  describe('calculateReconciliation', () => {
    it('calculates when balanced', () => {
      const result = calculateReconciliation(1000, 300, 700);

      expect(result.apaTotal).toBe(1000);
      expect(result.expenseTotal).toBe(300);
      expect(result.expectedCash).toBe(700);
      expect(result.actualCash).toBe(700);
      expect(result.difference).toBe(0);
      expect(result.isBalanced).toBe(true);
    });

    it('calculates with surplus', () => {
      const result = calculateReconciliation(1000, 300, 800);

      expect(result.expectedCash).toBe(700);
      expect(result.actualCash).toBe(800);
      expect(result.difference).toBe(100);
      expect(result.isBalanced).toBe(false);
    });

    it('calculates with shortage', () => {
      const result = calculateReconciliation(1000, 300, 600);

      expect(result.expectedCash).toBe(700);
      expect(result.actualCash).toBe(600);
      expect(result.difference).toBe(-100);
      expect(result.isBalanced).toBe(false);
    });

    it('handles near-zero as balanced', () => {
      const result = calculateReconciliation(1000, 300, 700.005);

      expect(result.isBalanced).toBe(true);
    });
  });

  // ============ Save Reconciliation ============

  describe('saveReconciliation', () => {
    it('saves reconciliation to booking', async () => {
      (updateDoc as jest.Mock).mockResolvedValueOnce(undefined);

      const result = await saveReconciliation(
        'booking-1',
        {
          bookingId: 'booking-1',
          actualCash: 700,
          reconciledBy: 'user-1',
        },
        300,
        1000
      );

      expect(result.success).toBe(true);
      expect(result.data?.isBalanced).toBe(true);
      expect(updateDoc).toHaveBeenCalled();
    });

    it('handles save errors', async () => {
      (updateDoc as jest.Mock).mockRejectedValueOnce(new Error('Update failed'));

      const result = await saveReconciliation(
        'booking-1',
        {
          bookingId: 'booking-1',
          actualCash: 700,
          reconciledBy: 'user-1',
        },
        300,
        1000
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to save reconciliation');
    });
  });

  // ============ Is Booking Reconciled ============

  describe('isBookingReconciled', () => {
    it('returns true for reconciled booking', async () => {
      (getDoc as jest.Mock).mockResolvedValueOnce({
        exists: () => true,
        data: () => ({
          reconciliation: {
            expectedCash: 700,
            actualCash: 700,
            difference: 0,
          },
        }),
      });

      const result = await isBookingReconciled('booking-1');

      expect(result.success).toBe(true);
      expect(result.data).toBe(true);
    });

    it('returns false for non-reconciled booking', async () => {
      (getDoc as jest.Mock).mockResolvedValueOnce({
        exists: () => true,
        data: () => ({}),
      });

      const result = await isBookingReconciled('booking-2');

      expect(result.success).toBe(true);
      expect(result.data).toBe(false);
    });

    it('handles non-existent booking', async () => {
      (getDoc as jest.Mock).mockResolvedValueOnce({
        exists: () => false,
      });

      const result = await isBookingReconciled('booking-nonexistent');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Booking not found');
    });
  });

  // ============ Update Booking APA Total ============

  describe('updateBookingApaTotal', () => {
    it('updates booking APA total', async () => {
      (updateDoc as jest.Mock).mockResolvedValueOnce(undefined);

      const result = await updateBookingApaTotal('booking-1', 1500);

      expect(result.success).toBe(true);
      expect(updateDoc).toHaveBeenCalled();
    });

    it('handles update errors', async () => {
      (updateDoc as jest.Mock).mockRejectedValueOnce(new Error('Update failed'));

      const result = await updateBookingApaTotal('booking-1', 1500);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to update APA total');
    });
  });
});
