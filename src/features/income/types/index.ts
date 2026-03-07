/**
 * Income Types
 *
 * Type definitions for personal income tracking.
 * PRIVATE: Each user can only access their own income data.
 */

import type { Timestamp } from '../../../types/models';

// ============ Income Settings ============

/**
 * User's income rate settings for a season
 */
export interface IncomeSettings {
  id: string;
  seasonId: string;
  userId: string;
  /** Daily rate when guests are on board (€) */
  guestDayRate: number;
  /** Daily rate when no guests (€) */
  nonGuestDayRate: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Input for creating/updating income settings
 */
export interface IncomeSettingsInput {
  seasonId: string;
  userId: string;
  guestDayRate: number;
  nonGuestDayRate: number;
}

// ============ Work Day ============

/**
 * Type of work day
 */
export type WorkDayType = 'guest' | 'non-guest';

/**
 * A single work day entry
 */
export interface WorkDay {
  id: string;
  seasonId: string;
  userId: string;
  date: Timestamp;
  type: WorkDayType;
  /** Associated booking ID (for guest days) */
  bookingId?: string;
  /** Calculated earnings for this day */
  earnings: number;
  note?: string;
  createdAt: Timestamp;
}

/**
 * Input for creating a work day
 */
export interface WorkDayInput {
  seasonId: string;
  userId: string;
  date: Date;
  type: WorkDayType;
  bookingId?: string;
  note?: string;
}

// ============ Summary ============

/**
 * Aggregated income summary for a season
 */
export interface IncomeSummary {
  totalEarnings: number;
  guestDays: number;
  guestEarnings: number;
  nonGuestDays: number;
  nonGuestEarnings: number;
  totalDays: number;
}

// ============ State ============

/**
 * Income feature state
 */
export interface IncomeState {
  settings: IncomeSettings | null;
  workDays: WorkDay[];
  summary: IncomeSummary;
  isLoading: boolean;
  error: string | null;
}

/**
 * Default empty summary
 */
export const EMPTY_SUMMARY: IncomeSummary = {
  totalEarnings: 0,
  guestDays: 0,
  guestEarnings: 0,
  nonGuestDays: 0,
  nonGuestEarnings: 0,
  totalDays: 0,
};

// ============ Suggestions ============

/**
 * A suggested work day based on booking dates
 */
export interface SuggestedWorkDay {
  date: Date;
  bookingId: string;
  bookingName: string;
  type: WorkDayType;
}
