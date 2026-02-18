/**
 * Core Data Models
 *
 * TypeScript interfaces for all data entities.
 */

import type { BookingStatus } from '../constants/bookingStatus';
import type { UserRole } from '../constants/userRoles';
import type { ExpenseCategory } from '../config/expenses';

// ============ Firebase Timestamp ============

/**
 * Firebase Timestamp type (placeholder until Firebase is fully integrated)
 */
export interface Timestamp {
  seconds: number;
  nanoseconds: number;
  toDate(): Date;
}

// ============ Season ============

export interface Season {
  id: string;
  boatName: string;
  name: string;
  startDate: Timestamp;
  endDate: Timestamp;
  currency: string;
  tipSplitType: 'equal' | 'custom';
  tipSplitConfig?: Record<string, number>; // userId -> percentage
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============ User ============

export interface User {
  id: string;
  email: string;
  name: string;
  color: string;
  roles: UserRole[];
  seasonId: string;
  createdAt: Timestamp;
}

export interface UserPrivateData {
  userId: string;
  guestDayRate?: number;
  nonGuestDayRate?: number;
  contractStart?: Timestamp;
  contractEnd?: Timestamp;
}

// ============ Booking ============

export interface Booking {
  id: string;
  seasonId: string;
  arrivalDate: Timestamp;
  departureDate: Timestamp;
  departureMarina: string; // Default: "Kaštela"
  arrivalMarina: string; // Default: "Kaštela"
  guestCount: number;
  notes?: string; // Crew-private notes
  preferenceFileUrl?: string;
  preferenceFileName?: string;
  status: BookingStatus;
  apaTotal: number;
  tip?: number;
  reconciliation?: Reconciliation;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Reconciliation {
  expectedCash: number;
  actualCash: number;
  difference: number;
  reconciledAt: Timestamp;
  reconciledBy: string;
}

// ============ APA Entry ============

export interface ApaEntry {
  id: string;
  bookingId: string;
  amount: number;
  note?: string;
  createdBy: string;
  createdAt: Timestamp;
}

// ============ Expense ============

export interface Expense {
  id: string;
  bookingId: string;
  seasonId: string;
  amount: number;
  date: Timestamp;
  category: ExpenseCategory;
  merchant: string;
  note?: string;
  receiptUrl?: string;
  receiptLocalPath?: string; // For offline
  type: 'receipt' | 'no-receipt';
  location?: GeoPoint;
  ocrStatus?: 'pending' | 'completed' | 'failed';
  ocrData?: OCRResult;
  isComplete: boolean;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  syncStatus: 'synced' | 'pending' | 'error';
}

export interface OCRResult {
  extractedAmount?: number;
  extractedMerchant?: string;
  extractedDate?: string;
  confidence: number;
  rawText: string;
}

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

// ============ Shopping ============

export interface ShoppingItem {
  id: string;
  bookingId: string;
  name: string;
  isPurchased: boolean;
  purchasedBy?: string;
  purchasedAt?: Timestamp;
  createdBy: string;
  createdAt: Timestamp;
}

// ============ Manual Work Day ============

export interface ManualWorkDay {
  id: string;
  userId: string;
  seasonId: string;
  startDate: Timestamp;
  endDate: Timestamp;
  rateType: 'guest' | 'non-guest';
  note?: string;
  createdAt: Timestamp;
}

// ============ Notification Settings ============

export interface NotificationSettings {
  userId: string;
  closingReminder: boolean;
  bookingStartReminder: boolean;
  dayOffReminder: boolean;
  prefListReminder: boolean;
}

// ============ Sync Status ============

export interface SyncState {
  isOnline: boolean;
  pendingExpenses: number;
  pendingImages: number;
  lastSyncAt: Date | null;
}
