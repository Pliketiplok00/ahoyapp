/**
 * Storage Map Service
 *
 * CRUD operations for storage map entries.
 * Each crew member manages their own entries.
 * Visibility toggle: private (only author) or public (all crew can read).
 *
 * Firestore path: seasons/{seasonId}/storageMap/{entryId}
 *
 * NOTE: Due to Firestore query limitations with the visibility rule,
 * we use TWO separate queries and merge results client-side:
 * 1. All entries by current user (own entries, public + private)
 * 2. Public entries by other users (where isPublic === true AND createdBy !== userId)
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
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { logger } from '../../../utils/logger';
import { uploadPhoto, generateLogPhotoPath } from '../../../utils/photoUpload';
import type {
  StorageMapEntry,
  CreateStorageMapInput,
  UpdateStorageMapInput,
  LogServiceResult,
  LogListResult,
} from '../types';

// ============ Collection Reference ============

function getStorageMapCollection(seasonId: string) {
  return collection(db, 'seasons', seasonId, 'storageMap');
}

function getStorageMapDoc(seasonId: string, entryId: string) {
  return doc(db, 'seasons', seasonId, 'storageMap', entryId);
}

// ============ Read Operations ============

/**
 * Get all storage map entries visible to the current user
 *
 * Uses two queries to work with Firestore security rules:
 * 1. All own entries (createdBy === userId)
 * 2. Public entries by others (isPublic === true AND createdBy !== userId)
 *
 * Results are merged and returned with own entries first.
 */
export async function getStorageMap(
  seasonId: string,
  userId: string
): Promise<LogListResult<StorageMapEntry>> {
  try {
    logger.log('[StorageMapService] Fetching storage map for season:', seasonId);

    // Query 1: All entries by current user
    const ownQuery = query(
      getStorageMapCollection(seasonId),
      where('createdBy', '==', userId),
      orderBy('createdAt', 'desc')
    );

    // Query 2: Public entries by others
    const othersPublicQuery = query(
      getStorageMapCollection(seasonId),
      where('isPublic', '==', true),
      where('createdBy', '!=', userId)
    );

    // Execute both queries in parallel
    const [ownSnapshot, othersSnapshot] = await Promise.all([
      getDocs(ownQuery),
      getDocs(othersPublicQuery),
    ]);

    // Map to entries
    const ownEntries: StorageMapEntry[] = ownSnapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as StorageMapEntry[];

    const othersEntries: StorageMapEntry[] = othersSnapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as StorageMapEntry[];

    // Sort others by createdAt (descending)
    othersEntries.sort((a, b) => {
      const aTime = a.createdAt?.toMillis() || 0;
      const bTime = b.createdAt?.toMillis() || 0;
      return bTime - aTime;
    });

    // Combine: own entries first, then others
    const allEntries = [...ownEntries, ...othersEntries];

    logger.log(
      '[StorageMapService] Fetched',
      ownEntries.length,
      'own entries,',
      othersEntries.length,
      'others public'
    );

    return { success: true, data: allEntries };
  } catch (error) {
    logger.error('[StorageMapService] Error fetching storage map:', error);
    return {
      success: false,
      data: [],
      error: (error as Error)?.message || 'Failed to fetch storage map',
    };
  }
}

/**
 * Get only the current user's entries
 */
export async function getOwnStorageEntries(
  seasonId: string,
  userId: string
): Promise<LogListResult<StorageMapEntry>> {
  try {
    const q = query(
      getStorageMapCollection(seasonId),
      where('createdBy', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    const entries: StorageMapEntry[] = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as StorageMapEntry[];

    return { success: true, data: entries };
  } catch (error) {
    logger.error('[StorageMapService] Error fetching own entries:', error);
    return {
      success: false,
      data: [],
      error: (error as Error)?.message || 'Failed to fetch own entries',
    };
  }
}

/**
 * Get a single storage map entry
 */
export async function getStorageMapEntry(
  seasonId: string,
  entryId: string
): Promise<LogServiceResult<StorageMapEntry>> {
  try {
    const docRef = getStorageMapDoc(seasonId, entryId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return { success: false, error: 'Entry not found' };
    }

    return {
      success: true,
      data: { id: docSnap.id, ...docSnap.data() } as StorageMapEntry,
    };
  } catch (error) {
    logger.error('[StorageMapService] Error fetching entry:', error);
    return {
      success: false,
      error: (error as Error)?.message || 'Failed to fetch entry',
    };
  }
}

// ============ Write Operations ============

/**
 * Create a new storage map entry
 */
export async function createStorageEntry(
  seasonId: string,
  userId: string,
  input: CreateStorageMapInput
): Promise<LogServiceResult<StorageMapEntry>> {
  try {
    logger.log('[StorageMapService] Creating storage entry');

    const now = Timestamp.now();
    const data = {
      item: input.item.trim(),
      location: input.location.trim(),
      quantity: input.quantity,
      photos: input.photos || [],
      isPublic: input.isPublic ?? false,
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(getStorageMapCollection(seasonId), data);

    logger.log('[StorageMapService] Created entry:', docRef.id);

    return {
      success: true,
      data: { id: docRef.id, ...data },
    };
  } catch (error) {
    logger.error('[StorageMapService] Error creating entry:', error);
    return {
      success: false,
      error: (error as Error)?.message || 'Failed to create entry',
    };
  }
}

/**
 * Update a storage map entry
 * Only the creator can update
 */
export async function updateStorageEntry(
  seasonId: string,
  entryId: string,
  input: UpdateStorageMapInput
): Promise<LogServiceResult<StorageMapEntry>> {
  try {
    logger.log('[StorageMapService] Updating entry:', entryId);

    const docRef = getStorageMapDoc(seasonId, entryId);

    // Build update data (only include defined fields)
    const updateData: Record<string, unknown> = {
      updatedAt: serverTimestamp(),
    };

    if (input.item !== undefined) {
      updateData.item = input.item.trim();
    }
    if (input.location !== undefined) {
      updateData.location = input.location.trim();
    }
    if (input.quantity !== undefined) {
      updateData.quantity = input.quantity;
    }
    if (input.photos !== undefined) {
      updateData.photos = input.photos;
    }
    if (input.isPublic !== undefined) {
      updateData.isPublic = input.isPublic;
    }

    await updateDoc(docRef, updateData);

    // Fetch updated document
    const result = await getStorageMapEntry(seasonId, entryId);
    return result;
  } catch (error) {
    logger.error('[StorageMapService] Error updating entry:', error);
    return {
      success: false,
      error: (error as Error)?.message || 'Failed to update entry',
    };
  }
}

/**
 * Toggle visibility of a storage entry
 */
export async function toggleStorageVisibility(
  seasonId: string,
  entryId: string
): Promise<LogServiceResult<StorageMapEntry>> {
  try {
    // First get current state
    const current = await getStorageMapEntry(seasonId, entryId);
    if (!current.success || !current.data) {
      return { success: false, error: current.error || 'Entry not found' };
    }

    // Toggle and update
    return updateStorageEntry(seasonId, entryId, {
      isPublic: !current.data.isPublic,
    });
  } catch (error) {
    logger.error('[StorageMapService] Error toggling visibility:', error);
    return {
      success: false,
      error: (error as Error)?.message || 'Failed to toggle visibility',
    };
  }
}

/**
 * Delete a storage map entry
 * Only the creator can delete
 */
export async function deleteStorageEntry(
  seasonId: string,
  entryId: string
): Promise<LogServiceResult<void>> {
  try {
    logger.log('[StorageMapService] Deleting entry:', entryId);

    await deleteDoc(getStorageMapDoc(seasonId, entryId));

    return { success: true };
  } catch (error) {
    logger.error('[StorageMapService] Error deleting entry:', error);
    return {
      success: false,
      error: (error as Error)?.message || 'Failed to delete entry',
    };
  }
}

// ============ Photo Upload ============

/**
 * Upload a photo for a storage map entry
 * Returns the download URL
 */
export async function uploadStoragePhoto(
  seasonId: string,
  entryId: string,
  localUri: string
): Promise<LogServiceResult<string>> {
  try {
    const storagePath = generateLogPhotoPath('storageMap', seasonId, entryId);

    const result = await uploadPhoto(localUri, storagePath, {
      seasonId,
      entryId,
      type: 'storageMap',
    });

    if (!result.success || !result.downloadUrl) {
      return { success: false, error: result.error || 'Upload failed' };
    }

    return { success: true, data: result.downloadUrl };
  } catch (error) {
    logger.error('[StorageMapService] Error uploading photo:', error);
    return {
      success: false,
      error: (error as Error)?.message || 'Failed to upload photo',
    };
  }
}

// ============ Season Transfer ============

/**
 * Transfer storage entries to a new season
 * Copies all entries from current user to the target season
 */
export async function transferToNewSeason(
  fromSeasonId: string,
  toSeasonId: string,
  userId: string
): Promise<LogServiceResult<number>> {
  try {
    logger.log(
      '[StorageMapService] Transferring entries from',
      fromSeasonId,
      'to',
      toSeasonId
    );

    // Get all own entries from source season
    const ownEntries = await getOwnStorageEntries(fromSeasonId, userId);
    if (!ownEntries.success) {
      return { success: false, error: ownEntries.error };
    }

    if (ownEntries.data.length === 0) {
      return { success: true, data: 0 };
    }

    // Use batch write for efficiency
    const batch = writeBatch(db);
    const now = Timestamp.now();

    for (const entry of ownEntries.data) {
      const newDocRef = doc(getStorageMapCollection(toSeasonId));
      batch.set(newDocRef, {
        item: entry.item,
        location: entry.location,
        quantity: entry.quantity,
        photos: entry.photos || [],
        isPublic: entry.isPublic,
        createdBy: userId,
        createdAt: now,
        updatedAt: now,
      });
    }

    await batch.commit();

    logger.log(
      '[StorageMapService] Transferred',
      ownEntries.data.length,
      'entries'
    );

    return { success: true, data: ownEntries.data.length };
  } catch (error) {
    logger.error('[StorageMapService] Error transferring entries:', error);
    return {
      success: false,
      error: (error as Error)?.message || 'Failed to transfer entries',
    };
  }
}
