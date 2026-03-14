/**
 * Logs Feature Types
 *
 * Types for the three log types:
 * - Defect Log (captain only)
 * - Wish List (all crew)
 * - Storage Map (per-user with visibility)
 *
 * @see docs/AHOYCREW_TODO.md - ZAPISNICI section
 */

import { Timestamp } from 'firebase/firestore';

// ============================================
// DEFECT LOG
// ============================================

/**
 * Priority levels for defect entries
 */
export const DEFECT_PRIORITIES = ['high', 'normal', 'low'] as const;
export type DefectPriority = (typeof DEFECT_PRIORITIES)[number];

/**
 * Status values for defect entries
 */
export const DEFECT_STATUSES = ['reported', 'in_progress', 'resolved'] as const;
export type DefectStatus = (typeof DEFECT_STATUSES)[number];

/**
 * Defect log entry - captain only can create/edit
 */
export interface DefectLogEntry {
  id: string;
  description: string;
  location: string;
  priority: DefectPriority;
  status: DefectStatus;
  photos: string[]; // Firebase Storage URLs
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Input for creating a defect log entry
 */
export interface CreateDefectLogInput {
  description: string;
  location: string;
  priority: DefectPriority;
  photos?: string[];
}

/**
 * Input for updating a defect log entry
 */
export interface UpdateDefectLogInput {
  description?: string;
  location?: string;
  priority?: DefectPriority;
  status?: DefectStatus;
  photos?: string[];
}

// ============================================
// WISH LIST
// ============================================

/**
 * Categories for wish list items
 */
export const WISH_CATEGORIES = ['kitchen', 'service', 'deck', 'cabins', 'other'] as const;
export type WishCategory = (typeof WISH_CATEGORIES)[number];

/**
 * Wish list item - all crew can create, only creator can edit/delete
 */
export interface WishListItem {
  id: string;
  description: string;
  category: WishCategory;
  isDone: boolean;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Input for creating a wish list item
 */
export interface CreateWishListInput {
  description: string;
  category: WishCategory;
}

/**
 * Input for updating a wish list item
 */
export interface UpdateWishListInput {
  description?: string;
  category?: WishCategory;
  isDone?: boolean;
}

// ============================================
// STORAGE MAP
// ============================================

/**
 * Storage map entry - per-user with visibility toggle
 */
export interface StorageMapEntry {
  id: string;
  item: string;
  location: string;
  quantity: number;
  photos: string[]; // Firebase Storage URLs (optional)
  isPublic: boolean;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Input for creating a storage map entry
 */
export interface CreateStorageMapInput {
  item: string;
  location: string;
  quantity: number;
  photos?: string[];
  isPublic?: boolean;
}

/**
 * Input for updating a storage map entry
 */
export interface UpdateStorageMapInput {
  item?: string;
  location?: string;
  quantity?: number;
  photos?: string[];
  isPublic?: boolean;
}

// ============================================
// SERVICE RESULT TYPES
// ============================================

export interface LogServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface LogListResult<T> {
  success: boolean;
  data: T[];
  error?: string;
}
