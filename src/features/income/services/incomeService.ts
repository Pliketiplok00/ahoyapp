/**
 * Income Service
 *
 * Firestore CRUD operations for personal income tracking.
 * PRIVATE: All data is stored under user's own document path.
 *
 * Firestore paths:
 * - users/{userId}/incomeSettings/{seasonId}
 * - users/{userId}/workDays/{workDayId}
 */

import { logger } from '../../../utils/logger';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../../config/firebase';
import type {
  IncomeSettings,
  IncomeSettingsInput,
  WorkDay,
  WorkDayInput,
  IncomeSummary,
  SuggestedWorkDay,
} from '../types';
import { EMPTY_SUMMARY } from '../types';
import type { Booking } from '../../../types/models';
import { BOOKING_STATUS } from '../../../constants/bookingStatus';

// ============ Types ============

export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ============ Income Settings ============

/**
 * Get user's income settings for a season
 */
export async function getIncomeSettings(
  userId: string,
  seasonId: string
): Promise<ServiceResult<IncomeSettings | null>> {
  try {
    const docRef = doc(db, 'users', userId, 'incomeSettings', seasonId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return { success: true, data: null };
    }

    const data = docSnap.data();
    return {
      success: true,
      data: {
        id: docSnap.id,
        seasonId,
        userId,
        guestDayRate: data.guestDayRate || 0,
        nonGuestDayRate: data.nonGuestDayRate || 0,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      } as IncomeSettings,
    };
  } catch (error) {
    logger.error('[Income] Error getting settings:', error);
    return { success: false, error: 'Nije moguće učitati postavke' };
  }
}

/**
 * Save user's income settings for a season
 */
export async function saveIncomeSettings(
  input: IncomeSettingsInput
): Promise<ServiceResult<IncomeSettings>> {
  try {
    const docRef = doc(db, 'users', input.userId, 'incomeSettings', input.seasonId);

    const data = {
      guestDayRate: input.guestDayRate,
      nonGuestDayRate: input.nonGuestDayRate,
      updatedAt: serverTimestamp(),
    };

    // Check if exists for createdAt
    const existing = await getDoc(docRef);
    if (!existing.exists()) {
      (data as Record<string, unknown>).createdAt = serverTimestamp();
    }

    await setDoc(docRef, data, { merge: true });

    const settings: IncomeSettings = {
      id: input.seasonId,
      seasonId: input.seasonId,
      userId: input.userId,
      guestDayRate: input.guestDayRate,
      nonGuestDayRate: input.nonGuestDayRate,
      createdAt: existing.exists() ? existing.data()?.createdAt : Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    logger.log('[Income] Settings saved');
    return { success: true, data: settings };
  } catch (error) {
    logger.error('[Income] Error saving settings:', error);
    return { success: false, error: 'Nije moguće spremiti postavke' };
  }
}

// ============ Work Days ============

/**
 * Get all work days for a user in a season
 */
export async function getWorkDays(
  userId: string,
  seasonId: string
): Promise<ServiceResult<WorkDay[]>> {
  try {
    const q = query(
      collection(db, 'users', userId, 'workDays'),
      where('seasonId', '==', seasonId),
      orderBy('date', 'desc')
    );

    const snapshot = await getDocs(q);
    const workDays: WorkDay[] = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      workDays.push({
        id: docSnap.id,
        seasonId: data.seasonId,
        userId,
        date: data.date,
        type: data.type,
        bookingId: data.bookingId,
        earnings: data.earnings || 0,
        note: data.note,
        createdAt: data.createdAt,
      } as WorkDay);
    });

    return { success: true, data: workDays };
  } catch (error) {
    logger.error('[Income] Error getting work days:', error);
    return { success: false, error: 'Nije moguće učitati radne dane' };
  }
}

/**
 * Add a new work day
 */
export async function addWorkDay(
  input: WorkDayInput,
  settings: IncomeSettings | null
): Promise<ServiceResult<WorkDay>> {
  try {
    // Calculate earnings based on type and settings
    const rate = input.type === 'guest'
      ? (settings?.guestDayRate || 0)
      : (settings?.nonGuestDayRate || 0);

    const workDayData = {
      seasonId: input.seasonId,
      userId: input.userId,
      date: Timestamp.fromDate(input.date),
      type: input.type,
      bookingId: input.bookingId || null,
      earnings: rate,
      note: input.note || '',
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(
      collection(db, 'users', input.userId, 'workDays'),
      workDayData
    );

    const workDay: WorkDay = {
      id: docRef.id,
      seasonId: input.seasonId,
      userId: input.userId,
      date: Timestamp.fromDate(input.date),
      type: input.type,
      bookingId: input.bookingId,
      earnings: rate,
      note: input.note,
      createdAt: Timestamp.now(),
    };

    logger.log('[Income] Work day added:', docRef.id);
    return { success: true, data: workDay };
  } catch (error) {
    logger.error('[Income] Error adding work day:', error);
    return { success: false, error: 'Nije moguće dodati radni dan' };
  }
}

/**
 * Delete a work day
 */
export async function deleteWorkDay(
  userId: string,
  workDayId: string
): Promise<ServiceResult<void>> {
  try {
    await deleteDoc(doc(db, 'users', userId, 'workDays', workDayId));
    logger.log('[Income] Work day deleted:', workDayId);
    return { success: true };
  } catch (error) {
    logger.error('[Income] Error deleting work day:', error);
    return { success: false, error: 'Nije moguće obrisati radni dan' };
  }
}

/**
 * Check if a work day already exists for a specific date
 */
export async function workDayExistsForDate(
  userId: string,
  seasonId: string,
  date: Date
): Promise<ServiceResult<boolean>> {
  try {
    // Get start and end of day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const q = query(
      collection(db, 'users', userId, 'workDays'),
      where('seasonId', '==', seasonId),
      where('date', '>=', Timestamp.fromDate(startOfDay)),
      where('date', '<=', Timestamp.fromDate(endOfDay))
    );

    const snapshot = await getDocs(q);
    return { success: true, data: !snapshot.empty };
  } catch (error) {
    logger.error('[Income] Error checking work day:', error);
    return { success: false, error: 'Greška pri provjeri' };
  }
}

// ============ Summary ============

/**
 * Calculate income summary from work days
 */
export function calculateSummary(
  workDays: WorkDay[],
  settings: IncomeSettings | null
): IncomeSummary {
  if (workDays.length === 0) {
    return EMPTY_SUMMARY;
  }

  const guestDays = workDays.filter((wd) => wd.type === 'guest');
  const nonGuestDays = workDays.filter((wd) => wd.type === 'non-guest');

  // Calculate earnings (use stored earnings or recalculate from rates)
  const guestEarnings = guestDays.reduce((sum, wd) => {
    return sum + (wd.earnings > 0 ? wd.earnings : (settings?.guestDayRate || 0));
  }, 0);

  const nonGuestEarnings = nonGuestDays.reduce((sum, wd) => {
    return sum + (wd.earnings > 0 ? wd.earnings : (settings?.nonGuestDayRate || 0));
  }, 0);

  return {
    totalEarnings: guestEarnings + nonGuestEarnings,
    guestDays: guestDays.length,
    guestEarnings,
    nonGuestDays: nonGuestDays.length,
    nonGuestEarnings,
    totalDays: workDays.length,
  };
}

/**
 * Recalculate earnings for all work days when settings change
 * (Updates local array only - does not persist to Firestore)
 */
export function recalculateWorkDayEarnings(
  workDays: WorkDay[],
  settings: IncomeSettings
): WorkDay[] {
  return workDays.map((wd) => ({
    ...wd,
    earnings: wd.type === 'guest' ? settings.guestDayRate : settings.nonGuestDayRate,
  }));
}

// ============ Suggestions ============

/**
 * Extract booking name from notes (first line)
 */
function extractBookingName(notes?: string): string {
  if (!notes) return 'Charter';
  const firstLine = notes.split('\n')[0].trim();
  return firstLine || 'Charter';
}

/**
 * Get all dates in a range (inclusive)
 */
function getDateRange(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = [];
  const current = new Date(startDate);
  current.setHours(12, 0, 0, 0); // Normalize to noon to avoid DST issues

  const end = new Date(endDate);
  end.setHours(12, 0, 0, 0);

  while (current <= end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

/**
 * Check if two dates are the same day
 */
function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Generate suggested work days from bookings
 * Filters out dates that already have work day entries
 */
export function getSuggestedWorkDays(
  bookings: Booking[],
  existingWorkDays: WorkDay[]
): SuggestedWorkDay[] {
  const suggestions: SuggestedWorkDay[] = [];
  const today = new Date();
  today.setHours(23, 59, 59, 999); // Include today

  // Get existing work day dates for quick lookup
  const existingDates = existingWorkDays.map((wd) => {
    const date = wd.date.toDate();
    date.setHours(12, 0, 0, 0);
    return date.getTime();
  });

  // Process completed and active bookings only
  const relevantBookings = bookings.filter(
    (b) =>
      b.status === BOOKING_STATUS.COMPLETED ||
      b.status === BOOKING_STATUS.ACTIVE ||
      b.status === BOOKING_STATUS.ARCHIVED
  );

  for (const booking of relevantBookings) {
    const arrivalDate = booking.arrivalDate.toDate();
    const departureDate = booking.departureDate.toDate();
    const bookingName = extractBookingName(booking.notes);

    // Get all dates in this booking's range
    const bookingDates = getDateRange(arrivalDate, departureDate);

    for (const date of bookingDates) {
      // Skip future dates
      if (date > today) continue;

      // Skip if work day already exists for this date
      const dateTime = new Date(date);
      dateTime.setHours(12, 0, 0, 0);
      if (existingDates.includes(dateTime.getTime())) continue;

      // Skip if we already have a suggestion for this date
      const alreadySuggested = suggestions.some((s) => isSameDay(s.date, date));
      if (alreadySuggested) continue;

      suggestions.push({
        date,
        bookingId: booking.id,
        bookingName,
        type: 'guest', // Booking days are guest days
      });
    }
  }

  // Sort by date descending (most recent first)
  suggestions.sort((a, b) => b.date.getTime() - a.date.getTime());

  // Limit to reasonable number
  return suggestions.slice(0, 30);
}
