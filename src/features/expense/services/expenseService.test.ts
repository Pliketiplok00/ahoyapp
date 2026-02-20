/**
 * Expense Service Tests
 *
 * Tests for expense CRUD operations.
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
    })),
    now: jest.fn(() => ({
      toDate: () => new Date(),
      seconds: Math.floor(Date.now() / 1000),
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
  createExpense,
  getExpense,
  getBookingExpenses,
  updateExpense,
  deleteExpense,
  getBookingExpenseTotal,
  getBookingExpensesByCategory,
} from './expenseService';

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

// Mock expense data
const mockExpenseData = {
  bookingId: 'booking-1',
  seasonId: 'season-1',
  amount: 50.00,
  date: { toDate: () => new Date(), seconds: Date.now() / 1000 },
  category: 'food',
  merchant: 'Konzum',
  note: 'Groceries',
  receiptUrl: null,
  receiptLocalPath: null,
  type: 'receipt',
  location: null,
  ocrStatus: 'pending',
  ocrData: null,
  isComplete: false,
  createdBy: 'user-1',
  createdAt: { toDate: () => new Date(), seconds: Date.now() / 1000 },
  updatedAt: { toDate: () => new Date(), seconds: Date.now() / 1000 },
  syncStatus: 'pending',
};

describe('expenseService', () => {
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

  // ============ Create Expense ============

  describe('createExpense', () => {
    it('creates expense with correct data', async () => {
      const mockDocRef = { id: 'new-expense-id' };
      (addDoc as jest.Mock).mockResolvedValueOnce(mockDocRef);

      const input = {
        bookingId: 'booking-1',
        seasonId: 'season-1',
        amount: 50.00,
        date: new Date(),
        category: 'food' as const,
        merchant: 'Konzum',
        note: 'Groceries',
        type: 'receipt' as const,
        createdBy: 'user-1',
      };

      const result = await createExpense(input);

      expect(result.success).toBe(true);
      expect(result.data?.id).toBe('new-expense-id');
      expect(addDoc).toHaveBeenCalled();
    });

    it('creates no-receipt expense as complete', async () => {
      const mockDocRef = { id: 'new-expense-id' };
      (addDoc as jest.Mock).mockResolvedValueOnce(mockDocRef);

      const input = {
        bookingId: 'booking-1',
        seasonId: 'season-1',
        amount: 25.00,
        date: new Date(),
        category: 'other' as const,
        merchant: 'Tip',
        type: 'no-receipt' as const,
        createdBy: 'user-1',
      };

      const result = await createExpense(input);

      expect(result.success).toBe(true);
      const addDocCall = (addDoc as jest.Mock).mock.calls[0];
      const expenseData = addDocCall[1];
      expect(expenseData.isComplete).toBe(true);
      expect(expenseData.ocrStatus).toBeUndefined();
    });

    it('handles Firebase errors gracefully', async () => {
      (addDoc as jest.Mock).mockRejectedValueOnce(new Error('Firebase error'));

      const result = await createExpense({
        bookingId: 'booking-1',
        seasonId: 'season-1',
        amount: 50.00,
        date: new Date(),
        category: 'food',
        merchant: 'Test',
        type: 'receipt',
        createdBy: 'user-1',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to create expense. Please try again.');
    });
  });

  // ============ Get Expense ============

  describe('getExpense', () => {
    it('returns expense when found', async () => {
      (getDoc as jest.Mock).mockResolvedValueOnce({
        exists: () => true,
        id: 'expense-1',
        data: () => mockExpenseData,
      });

      const result = await getExpense('expense-1');

      expect(result.success).toBe(true);
      expect(result.data?.id).toBe('expense-1');
    });

    it('returns error when not found', async () => {
      (getDoc as jest.Mock).mockResolvedValueOnce({
        exists: () => false,
      });

      const result = await getExpense('nonexistent');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Expense not found');
    });

    it('handles errors gracefully', async () => {
      (getDoc as jest.Mock).mockRejectedValueOnce(new Error('Error'));

      const result = await getExpense('expense-1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to load expense');
    });
  });

  // ============ Get Booking Expenses ============

  describe('getBookingExpenses', () => {
    it('returns all expenses for booking', async () => {
      const mockExpenses = [
        { id: 'e1', data: { ...mockExpenseData, amount: 50 } },
        { id: 'e2', data: { ...mockExpenseData, amount: 75 } },
      ];
      (getDocs as jest.Mock).mockResolvedValueOnce(
        createMockSnapshot(mockExpenses)
      );

      const result = await getBookingExpenses('booking-1');

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(query).toHaveBeenCalled();
      expect(where).toHaveBeenCalledWith('bookingId', '==', 'booking-1');
      expect(orderBy).toHaveBeenCalledWith('date', 'desc');
    });

    it('returns empty array when no expenses', async () => {
      (getDocs as jest.Mock).mockResolvedValueOnce(createMockSnapshot([]));

      const result = await getBookingExpenses('booking-1');

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(0);
    });

    it('handles errors gracefully', async () => {
      (getDocs as jest.Mock).mockRejectedValueOnce(new Error('Error'));

      const result = await getBookingExpenses('booking-1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to load expenses');
    });
  });

  // ============ Update Expense ============

  describe('updateExpense', () => {
    it('updates expense fields', async () => {
      (updateDoc as jest.Mock).mockResolvedValueOnce(undefined);
      (getDoc as jest.Mock).mockResolvedValueOnce({
        exists: () => true,
        id: 'expense-1',
        data: () => ({ ...mockExpenseData, amount: 75 }),
      });

      const result = await updateExpense('expense-1', { amount: 75 });

      expect(result.success).toBe(true);
      expect(updateDoc).toHaveBeenCalled();
    });

    it('handles errors gracefully', async () => {
      (updateDoc as jest.Mock).mockRejectedValueOnce(new Error('Error'));

      const result = await updateExpense('expense-1', { amount: 75 });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to update expense');
    });
  });

  // ============ Delete Expense ============

  describe('deleteExpense', () => {
    it('deletes expense successfully', async () => {
      (deleteDoc as jest.Mock).mockResolvedValueOnce(undefined);

      const result = await deleteExpense('expense-1');

      expect(result.success).toBe(true);
      expect(deleteDoc).toHaveBeenCalled();
    });

    it('handles errors gracefully', async () => {
      (deleteDoc as jest.Mock).mockRejectedValueOnce(new Error('Error'));

      const result = await deleteExpense('expense-1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to delete expense');
    });
  });

  // ============ Get Booking Expense Total ============

  describe('getBookingExpenseTotal', () => {
    it('calculates total correctly', async () => {
      const mockExpenses = [
        { id: 'e1', data: { ...mockExpenseData, amount: 50 } },
        { id: 'e2', data: { ...mockExpenseData, amount: 75 } },
        { id: 'e3', data: { ...mockExpenseData, amount: 25 } },
      ];
      (getDocs as jest.Mock).mockResolvedValueOnce(
        createMockSnapshot(mockExpenses)
      );

      const result = await getBookingExpenseTotal('booking-1');

      expect(result.success).toBe(true);
      expect(result.data).toBe(150);
    });

    it('returns 0 for no expenses', async () => {
      (getDocs as jest.Mock).mockResolvedValueOnce(createMockSnapshot([]));

      const result = await getBookingExpenseTotal('booking-1');

      expect(result.success).toBe(true);
      expect(result.data).toBe(0);
    });
  });

  // ============ Get Booking Expenses By Category ============

  describe('getBookingExpensesByCategory', () => {
    it('groups expenses by category', async () => {
      const mockExpenses = [
        { id: 'e1', data: { ...mockExpenseData, category: 'food', amount: 50 } },
        { id: 'e2', data: { ...mockExpenseData, category: 'food', amount: 30 } },
        { id: 'e3', data: { ...mockExpenseData, category: 'fuel', amount: 100 } },
      ];
      (getDocs as jest.Mock).mockResolvedValueOnce(
        createMockSnapshot(mockExpenses)
      );

      const result = await getBookingExpensesByCategory('booking-1');

      expect(result.success).toBe(true);
      expect(result.data?.food).toBe(80);
      expect(result.data?.fuel).toBe(100);
    });

    it('returns empty object for no expenses', async () => {
      (getDocs as jest.Mock).mockResolvedValueOnce(createMockSnapshot([]));

      const result = await getBookingExpensesByCategory('booking-1');

      expect(result.success).toBe(true);
      expect(result.data).toEqual({});
    });
  });
});
