/**
 * APA Service
 *
 * Firestore CRUD operations for APA (Advance Provisioning Allowance) entries.
 * Handles tracking cash advances from guests.
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
import type { ApaEntry, Booking } from '../../../types/models';

// ============ Types ============

export interface CreateApaEntryInput {
  bookingId: string;
  amount: number;
  note?: string;
  createdBy: string;
}

export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ============ CRUD Operations ============

/**
 * Create a new APA entry
 */
export async function createApaEntry(
  input: CreateApaEntryInput
): Promise<ServiceResult<ApaEntry>> {
  try {
    const entryData = {
      bookingId: input.bookingId,
      amount: input.amount,
      note: input.note || '',
      createdBy: input.createdBy,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'apaEntries'), entryData);

    const entry: ApaEntry = {
      id: docRef.id,
      bookingId: input.bookingId,
      amount: input.amount,
      note: input.note,
      createdBy: input.createdBy,
      createdAt: Timestamp.now(),
    };

    return { success: true, data: entry };
  } catch (error) {
    logger.error('Error creating APA entry:', error);
    return { success: false, error: 'Failed to add APA entry. Please try again.' };
  }
}

/**
 * Get all APA entries for a booking
 */
export async function getBookingApaEntries(
  bookingId: string
): Promise<ServiceResult<ApaEntry[]>> {
  try {
    const q = query(
      collection(db, 'apaEntries'),
      where('bookingId', '==', bookingId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    const entries: ApaEntry[] = [];

    snapshot.forEach((docSnap) => {
      entries.push({
        id: docSnap.id,
        ...docSnap.data(),
      } as ApaEntry);
    });

    return { success: true, data: entries };
  } catch (error) {
    logger.error('Error getting APA entries:', error);
    return { success: false, error: 'Failed to load APA entries' };
  }
}

/**
 * Get total APA amount for a booking
 */
export async function getBookingApaTotal(
  bookingId: string
): Promise<ServiceResult<number>> {
  try {
    const result = await getBookingApaEntries(bookingId);
    if (!result.success || !result.data) {
      return { success: false, error: result.error };
    }

    const total = result.data.reduce((sum, entry) => sum + entry.amount, 0);
    return { success: true, data: total };
  } catch (error) {
    logger.error('Error calculating APA total:', error);
    return { success: false, error: 'Failed to calculate APA total' };
  }
}

/**
 * Delete an APA entry
 */
export async function deleteApaEntry(
  entryId: string
): Promise<ServiceResult<void>> {
  try {
    const docRef = doc(db, 'apaEntries', entryId);
    await deleteDoc(docRef);
    return { success: true };
  } catch (error) {
    logger.error('Error deleting APA entry:', error);
    return { success: false, error: 'Failed to delete APA entry' };
  }
}

// ============ Reconciliation ============

export interface ReconciliationInput {
  bookingId: string;
  actualCash: number;
  reconciledBy: string;
}

export interface ReconciliationResult {
  apaTotal: number;
  expenseTotal: number;
  expectedCash: number;
  actualCash: number;
  difference: number;
  isBalanced: boolean;
}

/**
 * Calculate reconciliation for a booking
 */
export function calculateReconciliation(
  apaTotal: number,
  expenseTotal: number,
  actualCash: number
): ReconciliationResult {
  const expectedCash = apaTotal - expenseTotal;
  const difference = actualCash - expectedCash;
  const isBalanced = Math.abs(difference) < 0.01; // Allow for floating point errors

  return {
    apaTotal,
    expenseTotal,
    expectedCash,
    actualCash,
    difference,
    isBalanced,
  };
}

/**
 * Save reconciliation to booking
 */
export async function saveReconciliation(
  bookingId: string,
  input: ReconciliationInput,
  expenseTotal: number,
  apaTotal: number
): Promise<ServiceResult<ReconciliationResult>> {
  try {
    const result = calculateReconciliation(apaTotal, expenseTotal, input.actualCash);

    const reconciliationData = {
      expectedCash: result.expectedCash,
      actualCash: input.actualCash,
      difference: result.difference,
      reconciledAt: serverTimestamp(),
      reconciledBy: input.reconciledBy,
    };

    const bookingRef = doc(db, 'bookings', bookingId);
    await updateDoc(bookingRef, {
      reconciliation: reconciliationData,
      updatedAt: serverTimestamp(),
    });

    return { success: true, data: result };
  } catch (error) {
    logger.error('Error saving reconciliation:', error);
    return { success: false, error: 'Failed to save reconciliation' };
  }
}

/**
 * Check if booking is reconciled
 */
export async function isBookingReconciled(
  bookingId: string
): Promise<ServiceResult<boolean>> {
  try {
    const docRef = doc(db, 'bookings', bookingId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return { success: false, error: 'Booking not found' };
    }

    const booking = docSnap.data() as Booking;
    const isReconciled = !!booking.reconciliation;

    return { success: true, data: isReconciled };
  } catch (error) {
    logger.error('Error checking reconciliation status:', error);
    return { success: false, error: 'Failed to check reconciliation status' };
  }
}

/**
 * Update booking APA total (syncs with booking document)
 */
export async function updateBookingApaTotal(
  bookingId: string,
  apaTotal: number
): Promise<ServiceResult<void>> {
  try {
    const bookingRef = doc(db, 'bookings', bookingId);
    await updateDoc(bookingRef, {
      apaTotal,
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    logger.error('Error updating booking APA total:', error);
    return { success: false, error: 'Failed to update APA total' };
  }
}
