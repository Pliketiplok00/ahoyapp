/**
 * Booking Service
 *
 * Firestore CRUD operations for bookings.
 * Handles creation, updates, status changes, and queries.
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
import { db } from '../../../config/firebase';
import { BOOKING_STATUS, type BookingStatus } from '../../../constants/bookingStatus';
import type { Booking } from '../../../types/models';

// Collection reference
const BOOKINGS_COLLECTION = 'bookings';

/**
 * Result type for service operations
 */
interface ServiceResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Input for creating a new booking
 */
export interface CreateBookingInput {
  seasonId: string;
  arrivalDate: Date;
  departureDate: Date;
  departureMarina?: string;
  arrivalMarina?: string;
  guestCount: number;
  notes?: string;
  createdBy: string;
}

/**
 * Input for updating a booking
 */
export interface UpdateBookingInput {
  arrivalDate?: Date;
  departureDate?: Date;
  departureMarina?: string;
  arrivalMarina?: string;
  guestCount?: number;
  notes?: string;
  preferenceFileUrl?: string;
  preferenceFileName?: string;
  tip?: number;
}

/**
 * Create a new booking
 */
export async function createBooking(input: CreateBookingInput): Promise<ServiceResult<Booking>> {
  try {
    const now = serverTimestamp();

    const bookingData = {
      seasonId: input.seasonId,
      arrivalDate: Timestamp.fromDate(input.arrivalDate),
      departureDate: Timestamp.fromDate(input.departureDate),
      departureMarina: input.departureMarina || 'Kaštela',
      arrivalMarina: input.arrivalMarina || 'Kaštela',
      guestCount: input.guestCount,
      notes: input.notes || '',
      preferenceFileUrl: null,
      preferenceFileName: null,
      status: calculateStatus(input.arrivalDate, input.departureDate),
      apaTotal: 0,
      tip: null,
      reconciliation: null,
      createdBy: input.createdBy,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(collection(db, BOOKINGS_COLLECTION), bookingData);

    // Fetch the created document to return full data
    const createdDoc = await getDoc(docRef);
    const data = createdDoc.data();

    return {
      success: true,
      data: {
        id: docRef.id,
        ...data,
      } as Booking,
    };
  } catch (error) {
    console.error('Error creating booking:', error);
    return {
      success: false,
      error: 'Failed to create booking. Please try again.',
    };
  }
}

/**
 * Get a single booking by ID
 */
export async function getBooking(bookingId: string): Promise<ServiceResult<Booking>> {
  try {
    const docRef = doc(db, BOOKINGS_COLLECTION, bookingId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return {
        success: false,
        error: 'Booking not found',
      };
    }

    return {
      success: true,
      data: {
        id: docSnap.id,
        ...docSnap.data(),
      } as Booking,
    };
  } catch (error) {
    console.error('Error getting booking:', error);
    return {
      success: false,
      error: 'Failed to load booking',
    };
  }
}

/**
 * Get all bookings for a season
 */
export async function getSeasonBookings(seasonId: string): Promise<ServiceResult<Booking[]>> {
  try {
    const q = query(
      collection(db, BOOKINGS_COLLECTION),
      where('seasonId', '==', seasonId),
      orderBy('arrivalDate', 'asc')
    );

    const querySnapshot = await getDocs(q);
    const bookings: Booking[] = [];

    querySnapshot.forEach((doc) => {
      bookings.push({
        id: doc.id,
        ...doc.data(),
      } as Booking);
    });

    // Update statuses based on current date
    const updatedBookings = bookings.map(updateBookingStatus);

    return {
      success: true,
      data: updatedBookings,
    };
  } catch (error) {
    console.error('Error getting season bookings:', error);
    return {
      success: false,
      error: 'Failed to load bookings',
    };
  }
}

/**
 * Update a booking
 */
export async function updateBooking(
  bookingId: string,
  updates: UpdateBookingInput
): Promise<ServiceResult<Booking>> {
  try {
    const docRef = doc(db, BOOKINGS_COLLECTION, bookingId);

    // Prepare update data
    const updateData: Record<string, unknown> = {
      updatedAt: serverTimestamp(),
    };

    if (updates.arrivalDate) {
      updateData.arrivalDate = Timestamp.fromDate(updates.arrivalDate);
    }
    if (updates.departureDate) {
      updateData.departureDate = Timestamp.fromDate(updates.departureDate);
    }
    if (updates.departureMarina !== undefined) {
      updateData.departureMarina = updates.departureMarina;
    }
    if (updates.arrivalMarina !== undefined) {
      updateData.arrivalMarina = updates.arrivalMarina;
    }
    if (updates.guestCount !== undefined) {
      updateData.guestCount = updates.guestCount;
    }
    if (updates.notes !== undefined) {
      updateData.notes = updates.notes;
    }
    if (updates.preferenceFileUrl !== undefined) {
      updateData.preferenceFileUrl = updates.preferenceFileUrl;
    }
    if (updates.preferenceFileName !== undefined) {
      updateData.preferenceFileName = updates.preferenceFileName;
    }
    if (updates.tip !== undefined) {
      updateData.tip = updates.tip;
    }

    // Recalculate status if dates changed
    if (updates.arrivalDate || updates.departureDate) {
      const currentDoc = await getDoc(docRef);
      const currentData = currentDoc.data();
      const arrivalDate = updates.arrivalDate || currentData?.arrivalDate?.toDate();
      const departureDate = updates.departureDate || currentData?.departureDate?.toDate();
      updateData.status = calculateStatus(arrivalDate, departureDate);
    }

    await updateDoc(docRef, updateData);

    // Fetch updated document
    const updatedDoc = await getDoc(docRef);

    return {
      success: true,
      data: {
        id: bookingId,
        ...updatedDoc.data(),
      } as Booking,
    };
  } catch (error) {
    console.error('Error updating booking:', error);
    return {
      success: false,
      error: 'Failed to update booking',
    };
  }
}

/**
 * Delete a booking
 */
export async function deleteBooking(bookingId: string): Promise<ServiceResult> {
  try {
    const docRef = doc(db, BOOKINGS_COLLECTION, bookingId);

    // Check if booking exists and can be deleted
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return { success: false, error: 'Booking not found' };
    }

    const booking = docSnap.data() as Booking;
    if (booking.status !== BOOKING_STATUS.UPCOMING) {
      return { success: false, error: 'Only upcoming bookings can be deleted' };
    }

    await deleteDoc(docRef);

    return { success: true };
  } catch (error) {
    console.error('Error deleting booking:', error);
    return {
      success: false,
      error: 'Failed to delete booking',
    };
  }
}

/**
 * Cancel a booking
 */
export async function cancelBooking(bookingId: string): Promise<ServiceResult<Booking>> {
  try {
    const docRef = doc(db, BOOKINGS_COLLECTION, bookingId);

    await updateDoc(docRef, {
      status: BOOKING_STATUS.CANCELLED,
      updatedAt: serverTimestamp(),
    });

    const updatedDoc = await getDoc(docRef);

    return {
      success: true,
      data: {
        id: bookingId,
        ...updatedDoc.data(),
      } as Booking,
    };
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return {
      success: false,
      error: 'Failed to cancel booking',
    };
  }
}

/**
 * Update APA total for a booking
 */
export async function updateApaTotal(
  bookingId: string,
  apaTotal: number
): Promise<ServiceResult<Booking>> {
  try {
    const docRef = doc(db, BOOKINGS_COLLECTION, bookingId);

    await updateDoc(docRef, {
      apaTotal,
      updatedAt: serverTimestamp(),
    });

    const updatedDoc = await getDoc(docRef);

    return {
      success: true,
      data: {
        id: bookingId,
        ...updatedDoc.data(),
      } as Booking,
    };
  } catch (error) {
    console.error('Error updating APA total:', error);
    return {
      success: false,
      error: 'Failed to update APA',
    };
  }
}

/**
 * Complete a booking (after reconciliation)
 */
export async function completeBooking(
  bookingId: string,
  reconciliation: {
    expectedCash: number;
    actualCash: number;
    reconciledBy: string;
  }
): Promise<ServiceResult<Booking>> {
  try {
    const docRef = doc(db, BOOKINGS_COLLECTION, bookingId);

    const difference = reconciliation.actualCash - reconciliation.expectedCash;

    await updateDoc(docRef, {
      status: BOOKING_STATUS.COMPLETED,
      reconciliation: {
        expectedCash: reconciliation.expectedCash,
        actualCash: reconciliation.actualCash,
        difference,
        reconciledAt: serverTimestamp(),
        reconciledBy: reconciliation.reconciledBy,
      },
      updatedAt: serverTimestamp(),
    });

    const updatedDoc = await getDoc(docRef);

    return {
      success: true,
      data: {
        id: bookingId,
        ...updatedDoc.data(),
      } as Booking,
    };
  } catch (error) {
    console.error('Error completing booking:', error);
    return {
      success: false,
      error: 'Failed to complete booking',
    };
  }
}

/**
 * Archive a booking
 */
export async function archiveBooking(bookingId: string): Promise<ServiceResult<Booking>> {
  try {
    const docRef = doc(db, BOOKINGS_COLLECTION, bookingId);

    await updateDoc(docRef, {
      status: BOOKING_STATUS.ARCHIVED,
      updatedAt: serverTimestamp(),
    });

    const updatedDoc = await getDoc(docRef);

    return {
      success: true,
      data: {
        id: bookingId,
        ...updatedDoc.data(),
      } as Booking,
    };
  } catch (error) {
    console.error('Error archiving booking:', error);
    return {
      success: false,
      error: 'Failed to archive booking',
    };
  }
}

// ============ Helper Functions ============

/**
 * Calculate booking status based on dates
 */
function calculateStatus(arrivalDate: Date, departureDate: Date): BookingStatus {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const arrival = new Date(arrivalDate.getFullYear(), arrivalDate.getMonth(), arrivalDate.getDate());
  const departure = new Date(departureDate.getFullYear(), departureDate.getMonth(), departureDate.getDate());

  if (today < arrival) {
    return BOOKING_STATUS.UPCOMING;
  } else if (today >= arrival && today <= departure) {
    return BOOKING_STATUS.ACTIVE;
  } else {
    // After departure but not yet reconciled
    return BOOKING_STATUS.ACTIVE; // Stays active until manually completed
  }
}

/**
 * Update booking status based on current date (for display)
 */
function updateBookingStatus(booking: Booking): Booking {
  // Don't update completed, cancelled, or archived bookings
  if (
    booking.status === BOOKING_STATUS.COMPLETED ||
    booking.status === BOOKING_STATUS.CANCELLED ||
    booking.status === BOOKING_STATUS.ARCHIVED
  ) {
    return booking;
  }

  const arrivalDate = booking.arrivalDate.toDate();
  const departureDate = booking.departureDate.toDate();
  const newStatus = calculateStatus(arrivalDate, departureDate);

  if (newStatus !== booking.status) {
    return { ...booking, status: newStatus };
  }

  return booking;
}

/**
 * Check for date overlaps with existing bookings
 */
export async function checkDateOverlap(
  seasonId: string,
  arrivalDate: Date,
  departureDate: Date,
  excludeBookingId?: string
): Promise<ServiceResult<{ hasOverlap: boolean; overlappingBooking?: Booking }>> {
  try {
    const result = await getSeasonBookings(seasonId);
    if (!result.success || !result.data) {
      return { success: false, error: 'Failed to check date overlap' };
    }

    const bookings = result.data.filter(
      (b) =>
        b.id !== excludeBookingId &&
        b.status !== BOOKING_STATUS.CANCELLED
    );

    for (const booking of bookings) {
      const bookingArrival = booking.arrivalDate.toDate();
      const bookingDeparture = booking.departureDate.toDate();

      // Check if dates overlap
      if (arrivalDate <= bookingDeparture && departureDate >= bookingArrival) {
        return {
          success: true,
          data: { hasOverlap: true, overlappingBooking: booking },
        };
      }
    }

    return {
      success: true,
      data: { hasOverlap: false },
    };
  } catch (error) {
    console.error('Error checking date overlap:', error);
    return {
      success: false,
      error: 'Failed to check date overlap',
    };
  }
}

/**
 * Get booking statistics for a season
 */
export async function getSeasonBookingStats(seasonId: string): Promise<
  ServiceResult<{
    total: number;
    upcoming: number;
    active: number;
    completed: number;
    totalGuests: number;
    totalApa: number;
    totalTips: number;
  }>
> {
  try {
    const result = await getSeasonBookings(seasonId);
    if (!result.success || !result.data) {
      return { success: false, error: 'Failed to get booking stats' };
    }

    const bookings = result.data.filter((b) => b.status !== BOOKING_STATUS.CANCELLED);

    const stats = {
      total: bookings.length,
      upcoming: bookings.filter((b) => b.status === BOOKING_STATUS.UPCOMING).length,
      active: bookings.filter((b) => b.status === BOOKING_STATUS.ACTIVE).length,
      completed: bookings.filter(
        (b) => b.status === BOOKING_STATUS.COMPLETED || b.status === BOOKING_STATUS.ARCHIVED
      ).length,
      totalGuests: bookings.reduce((sum, b) => sum + b.guestCount, 0),
      totalApa: bookings.reduce((sum, b) => sum + b.apaTotal, 0),
      totalTips: bookings.reduce((sum, b) => sum + (b.tip || 0), 0),
    };

    return { success: true, data: stats };
  } catch (error) {
    console.error('Error getting booking stats:', error);
    return {
      success: false,
      error: 'Failed to get booking statistics',
    };
  }
}
