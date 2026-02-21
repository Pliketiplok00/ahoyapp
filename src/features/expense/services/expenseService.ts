/**
 * Expense Service
 *
 * Firestore CRUD operations for expenses.
 * Handles receipt capture, OCR data, and sync status.
 */

import { logger } from '../../../utils/logger';
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
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../../config/firebase';
import type { Expense, OCRResult } from '../../../types/models';
import type { ExpenseCategory } from '../../../config/expenses';

// ============ Types ============

export interface CreateExpenseInput {
  bookingId: string;
  seasonId: string;
  amount: number;
  date: Date;
  category: ExpenseCategory;
  merchant: string;
  note?: string;
  receiptLocalPath?: string;
  type: 'receipt' | 'no-receipt';
  createdBy: string;
}

export interface UpdateExpenseInput {
  amount?: number;
  date?: Date;
  category?: ExpenseCategory;
  merchant?: string;
  note?: string;
  receiptUrl?: string;
  ocrStatus?: 'pending' | 'completed' | 'failed';
  ocrData?: OCRResult;
  isComplete?: boolean;
  syncStatus?: 'synced' | 'pending' | 'error';
}

export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ============ CRUD Operations ============

/**
 * Create a new expense
 */
export async function createExpense(
  input: CreateExpenseInput
): Promise<ServiceResult<Expense>> {
  try {
    // Build expense data - omit undefined fields (Firestore rejects undefined)
    const expenseData: Record<string, unknown> = {
      bookingId: input.bookingId,
      seasonId: input.seasonId,
      amount: input.amount,
      date: Timestamp.fromDate(input.date),
      category: input.category,
      merchant: input.merchant,
      note: input.note || '',
      type: input.type,
      isComplete: input.type === 'no-receipt',
      createdBy: input.createdBy,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      syncStatus: 'pending' as const,
    };

    // Only add optional fields if they have values
    if (input.receiptLocalPath) {
      expenseData.receiptLocalPath = input.receiptLocalPath;
    }
    if (input.type === 'receipt') {
      expenseData.ocrStatus = 'pending';
    }

    const docRef = await addDoc(collection(db, 'expenses'), expenseData);

    const expense: Expense = {
      id: docRef.id,
      bookingId: input.bookingId,
      seasonId: input.seasonId,
      amount: input.amount,
      date: Timestamp.fromDate(input.date),
      category: input.category,
      merchant: input.merchant,
      note: input.note,
      receiptLocalPath: input.receiptLocalPath,
      type: input.type,
      ocrStatus: input.type === 'receipt' ? 'pending' : undefined,
      isComplete: input.type === 'no-receipt',
      createdBy: input.createdBy,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      syncStatus: 'pending' as const,
    };

    return { success: true, data: expense };
  } catch (error) {
    logger.error('Error creating expense:', error);
    return { success: false, error: 'Failed to create expense. Please try again.' };
  }
}

/**
 * Get a single expense by ID
 */
export async function getExpense(
  expenseId: string
): Promise<ServiceResult<Expense>> {
  try {
    const docRef = doc(db, 'expenses', expenseId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return { success: false, error: 'Expense not found' };
    }

    const expense: Expense = {
      id: docSnap.id,
      ...docSnap.data(),
    } as Expense;

    return { success: true, data: expense };
  } catch (error) {
    logger.error('Error getting expense:', error);
    return { success: false, error: 'Failed to load expense' };
  }
}

/**
 * Get all expenses for a booking
 */
export async function getBookingExpenses(
  bookingId: string
): Promise<ServiceResult<Expense[]>> {
  try {
    const q = query(
      collection(db, 'expenses'),
      where('bookingId', '==', bookingId),
      orderBy('date', 'desc')
    );

    const snapshot = await getDocs(q);
    const expenses: Expense[] = [];

    snapshot.forEach((docSnap) => {
      expenses.push({
        id: docSnap.id,
        ...docSnap.data(),
      } as Expense);
    });

    return { success: true, data: expenses };
  } catch (error) {
    logger.error('Error getting booking expenses:', error);
    return { success: false, error: 'Failed to load expenses' };
  }
}

/**
 * Get all expenses for a season
 * Note: Sorting done client-side to avoid requiring Firestore composite index
 */
export async function getSeasonExpenses(
  seasonId: string
): Promise<ServiceResult<Expense[]>> {
  try {
    // Simple query without orderBy to avoid needing composite index
    const q = query(
      collection(db, 'expenses'),
      where('seasonId', '==', seasonId)
    );

    const snapshot = await getDocs(q);
    const expenses: Expense[] = [];

    snapshot.forEach((docSnap) => {
      expenses.push({
        id: docSnap.id,
        ...docSnap.data(),
      } as Expense);
    });

    // Sort client-side by date descending
    expenses.sort((a, b) => b.date.seconds - a.date.seconds);

    return { success: true, data: expenses };
  } catch (error) {
    logger.error('Error getting season expenses:', error);
    return { success: false, error: 'Failed to load season expenses' };
  }
}

/**
 * Update an expense
 */
export async function updateExpense(
  expenseId: string,
  input: UpdateExpenseInput
): Promise<ServiceResult<Expense>> {
  try {
    const docRef = doc(db, 'expenses', expenseId);

    const updateData: Record<string, unknown> = {
      updatedAt: serverTimestamp(),
    };

    if (input.amount !== undefined) updateData.amount = input.amount;
    if (input.date !== undefined) updateData.date = Timestamp.fromDate(input.date);
    if (input.category !== undefined) updateData.category = input.category;
    if (input.merchant !== undefined) updateData.merchant = input.merchant;
    if (input.note !== undefined) updateData.note = input.note;
    if (input.receiptUrl !== undefined) updateData.receiptUrl = input.receiptUrl;
    if (input.ocrStatus !== undefined) updateData.ocrStatus = input.ocrStatus;
    if (input.ocrData !== undefined) updateData.ocrData = input.ocrData;
    if (input.isComplete !== undefined) updateData.isComplete = input.isComplete;
    if (input.syncStatus !== undefined) updateData.syncStatus = input.syncStatus;

    await updateDoc(docRef, updateData);

    // Fetch updated document
    const result = await getExpense(expenseId);
    return result;
  } catch (error) {
    logger.error('Error updating expense:', error);
    return { success: false, error: 'Failed to update expense' };
  }
}

/**
 * Delete an expense
 */
export async function deleteExpense(
  expenseId: string
): Promise<ServiceResult<void>> {
  try {
    const docRef = doc(db, 'expenses', expenseId);
    await deleteDoc(docRef);
    return { success: true };
  } catch (error) {
    logger.error('Error deleting expense:', error);
    return { success: false, error: 'Failed to delete expense' };
  }
}

// ============ Statistics ============

/**
 * Calculate total expenses for a booking
 */
export async function getBookingExpenseTotal(
  bookingId: string
): Promise<ServiceResult<number>> {
  try {
    const result = await getBookingExpenses(bookingId);
    if (!result.success || !result.data) {
      return { success: false, error: result.error };
    }

    const total = result.data.reduce((sum, expense) => sum + expense.amount, 0);
    return { success: true, data: total };
  } catch (error) {
    logger.error('Error calculating expense total:', error);
    return { success: false, error: 'Failed to calculate total' };
  }
}

/**
 * Get expenses grouped by category for a booking
 */
export async function getBookingExpensesByCategory(
  bookingId: string
): Promise<ServiceResult<Record<string, number>>> {
  try {
    const result = await getBookingExpenses(bookingId);
    if (!result.success || !result.data) {
      return { success: false, error: result.error };
    }

    const byCategory: Record<string, number> = {};
    result.data.forEach((expense) => {
      const cat = expense.category;
      byCategory[cat] = (byCategory[cat] || 0) + expense.amount;
    });

    return { success: true, data: byCategory };
  } catch (error) {
    logger.error('Error grouping expenses by category:', error);
    return { success: false, error: 'Failed to group expenses' };
  }
}

/**
 * Get pending sync expenses (for offline support)
 */
export async function getPendingExpenses(
  seasonId: string
): Promise<ServiceResult<Expense[]>> {
  try {
    const q = query(
      collection(db, 'expenses'),
      where('seasonId', '==', seasonId),
      where('syncStatus', '==', 'pending')
    );

    const snapshot = await getDocs(q);
    const expenses: Expense[] = [];

    snapshot.forEach((docSnap) => {
      expenses.push({
        id: docSnap.id,
        ...docSnap.data(),
      } as Expense);
    });

    return { success: true, data: expenses };
  } catch (error) {
    logger.error('Error getting pending expenses:', error);
    return { success: false, error: 'Failed to load pending expenses' };
  }
}

/**
 * Mark expense as synced
 */
export async function markExpenseSynced(
  expenseId: string,
  receiptUrl?: string
): Promise<ServiceResult<void>> {
  try {
    const docRef = doc(db, 'expenses', expenseId);

    const updateData: Record<string, unknown> = {
      syncStatus: 'synced',
      updatedAt: serverTimestamp(),
    };

    if (receiptUrl) {
      updateData.receiptUrl = receiptUrl;
    }

    await updateDoc(docRef, updateData);
    return { success: true };
  } catch (error) {
    logger.error('Error marking expense synced:', error);
    return { success: false, error: 'Failed to mark expense synced' };
  }
}
