/**
 * Wish List Service
 *
 * CRUD operations for wish list items.
 * All crew members can create.
 * Only creator (or captain) can update/delete own items.
 *
 * Firestore path: seasons/{seasonId}/wishList/{itemId}
 */

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { logger } from '../../../utils/logger';
import type {
  WishListItem,
  CreateWishListInput,
  UpdateWishListInput,
  LogServiceResult,
  LogListResult,
} from '../types';

// ============ Collection Reference ============

function getWishListCollection(seasonId: string) {
  return collection(db, 'seasons', seasonId, 'wishList');
}

function getWishListDoc(seasonId: string, itemId: string) {
  return doc(db, 'seasons', seasonId, 'wishList', itemId);
}

// ============ Read Operations ============

/**
 * Get all wish list items for a season
 * Ordered by createdAt descending (newest first)
 */
export async function getWishList(
  seasonId: string
): Promise<LogListResult<WishListItem>> {
  try {
    logger.log('[WishListService] Fetching wish list for season:', seasonId);

    const q = query(
      getWishListCollection(seasonId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    const items: WishListItem[] = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as WishListItem[];

    logger.log('[WishListService] Fetched', items.length, 'items');

    return { success: true, data: items };
  } catch (error) {
    logger.error('[WishListService] Error fetching wish list:', error);
    return {
      success: false,
      data: [],
      error: (error as Error)?.message || 'Failed to fetch wish list',
    };
  }
}

/**
 * Get a single wish list item
 */
export async function getWishListItem(
  seasonId: string,
  itemId: string
): Promise<LogServiceResult<WishListItem>> {
  try {
    const docRef = getWishListDoc(seasonId, itemId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return { success: false, error: 'Item not found' };
    }

    return {
      success: true,
      data: { id: docSnap.id, ...docSnap.data() } as WishListItem,
    };
  } catch (error) {
    logger.error('[WishListService] Error fetching item:', error);
    return {
      success: false,
      error: (error as Error)?.message || 'Failed to fetch item',
    };
  }
}

// ============ Write Operations ============

/**
 * Create a new wish list item
 * All crew members can create
 */
export async function createWishItem(
  seasonId: string,
  userId: string,
  input: CreateWishListInput
): Promise<LogServiceResult<WishListItem>> {
  try {
    logger.log('[WishListService] Creating wish list item');

    const now = Timestamp.now();
    const data = {
      description: input.description.trim(),
      category: input.category,
      isDone: false,
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(getWishListCollection(seasonId), data);

    logger.log('[WishListService] Created item:', docRef.id);

    return {
      success: true,
      data: { id: docRef.id, ...data },
    };
  } catch (error) {
    logger.error('[WishListService] Error creating item:', error);
    return {
      success: false,
      error: (error as Error)?.message || 'Failed to create item',
    };
  }
}

/**
 * Update a wish list item
 * Only creator or captain can update
 */
export async function updateWishItem(
  seasonId: string,
  itemId: string,
  input: UpdateWishListInput
): Promise<LogServiceResult<WishListItem>> {
  try {
    logger.log('[WishListService] Updating item:', itemId);

    const docRef = getWishListDoc(seasonId, itemId);

    // Build update data (only include defined fields)
    const updateData: Record<string, unknown> = {
      updatedAt: serverTimestamp(),
    };

    if (input.description !== undefined) {
      updateData.description = input.description.trim();
    }
    if (input.category !== undefined) {
      updateData.category = input.category;
    }
    if (input.isDone !== undefined) {
      updateData.isDone = input.isDone;
    }

    await updateDoc(docRef, updateData);

    // Fetch updated document
    const result = await getWishListItem(seasonId, itemId);
    return result;
  } catch (error) {
    logger.error('[WishListService] Error updating item:', error);
    return {
      success: false,
      error: (error as Error)?.message || 'Failed to update item',
    };
  }
}

/**
 * Toggle the isDone status of a wish list item
 */
export async function toggleWishItemDone(
  seasonId: string,
  itemId: string
): Promise<LogServiceResult<WishListItem>> {
  try {
    // First get current state
    const current = await getWishListItem(seasonId, itemId);
    if (!current.success || !current.data) {
      return { success: false, error: current.error || 'Item not found' };
    }

    // Toggle and update
    return updateWishItem(seasonId, itemId, {
      isDone: !current.data.isDone,
    });
  } catch (error) {
    logger.error('[WishListService] Error toggling done status:', error);
    return {
      success: false,
      error: (error as Error)?.message || 'Failed to toggle done status',
    };
  }
}

/**
 * Delete a wish list item
 * Only creator or captain can delete
 */
export async function deleteWishItem(
  seasonId: string,
  itemId: string
): Promise<LogServiceResult<void>> {
  try {
    logger.log('[WishListService] Deleting item:', itemId);

    await deleteDoc(getWishListDoc(seasonId, itemId));

    return { success: true };
  } catch (error) {
    logger.error('[WishListService] Error deleting item:', error);
    return {
      success: false,
      error: (error as Error)?.message || 'Failed to delete item',
    };
  }
}
