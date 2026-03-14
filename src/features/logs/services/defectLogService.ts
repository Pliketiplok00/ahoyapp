/**
 * Defect Log Service
 *
 * CRUD operations for defect log entries.
 * Only captain can create/update/delete.
 * All crew members can read.
 *
 * Firestore path: seasons/{seasonId}/defectLog/{entryId}
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
import { uploadPhoto, generateLogPhotoPath } from '../../../utils/photoUpload';
import type {
  DefectLogEntry,
  CreateDefectLogInput,
  UpdateDefectLogInput,
  LogServiceResult,
  LogListResult,
} from '../types';

// ============ Collection Reference ============

function getDefectLogCollection(seasonId: string) {
  return collection(db, 'seasons', seasonId, 'defectLog');
}

function getDefectLogDoc(seasonId: string, entryId: string) {
  return doc(db, 'seasons', seasonId, 'defectLog', entryId);
}

// ============ Read Operations ============

/**
 * Get all defect log entries for a season
 * Ordered by createdAt descending (newest first)
 */
export async function getDefectLogs(
  seasonId: string
): Promise<LogListResult<DefectLogEntry>> {
  try {
    logger.log('[DefectLogService] Fetching defect logs for season:', seasonId);

    const q = query(
      getDefectLogCollection(seasonId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    const entries: DefectLogEntry[] = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as DefectLogEntry[];

    logger.log('[DefectLogService] Fetched', entries.length, 'entries');

    return { success: true, data: entries };
  } catch (error) {
    logger.error('[DefectLogService] Error fetching defect logs:', error);
    return {
      success: false,
      data: [],
      error: (error as Error)?.message || 'Failed to fetch defect logs',
    };
  }
}

/**
 * Get a single defect log entry
 */
export async function getDefectLogEntry(
  seasonId: string,
  entryId: string
): Promise<LogServiceResult<DefectLogEntry>> {
  try {
    const docRef = getDefectLogDoc(seasonId, entryId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return { success: false, error: 'Entry not found' };
    }

    return {
      success: true,
      data: { id: docSnap.id, ...docSnap.data() } as DefectLogEntry,
    };
  } catch (error) {
    logger.error('[DefectLogService] Error fetching entry:', error);
    return {
      success: false,
      error: (error as Error)?.message || 'Failed to fetch entry',
    };
  }
}

// ============ Write Operations (Captain Only) ============

/**
 * Create a new defect log entry
 * Only captain can call this
 */
export async function createDefectLog(
  seasonId: string,
  userId: string,
  input: CreateDefectLogInput
): Promise<LogServiceResult<DefectLogEntry>> {
  try {
    logger.log('[DefectLogService] Creating defect log entry');

    const now = Timestamp.now();
    const data = {
      description: input.description.trim(),
      location: input.location.trim(),
      priority: input.priority,
      status: 'reported' as const,
      photos: input.photos || [],
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(getDefectLogCollection(seasonId), data);

    logger.log('[DefectLogService] Created entry:', docRef.id);

    return {
      success: true,
      data: { id: docRef.id, ...data },
    };
  } catch (error) {
    logger.error('[DefectLogService] Error creating entry:', error);
    return {
      success: false,
      error: (error as Error)?.message || 'Failed to create entry',
    };
  }
}

/**
 * Update a defect log entry
 * Only captain can call this
 */
export async function updateDefectLog(
  seasonId: string,
  entryId: string,
  input: UpdateDefectLogInput
): Promise<LogServiceResult<DefectLogEntry>> {
  try {
    logger.log('[DefectLogService] Updating entry:', entryId);

    const docRef = getDefectLogDoc(seasonId, entryId);

    // Build update data (only include defined fields)
    const updateData: Record<string, unknown> = {
      updatedAt: serverTimestamp(),
    };

    if (input.description !== undefined) {
      updateData.description = input.description.trim();
    }
    if (input.location !== undefined) {
      updateData.location = input.location.trim();
    }
    if (input.priority !== undefined) {
      updateData.priority = input.priority;
    }
    if (input.status !== undefined) {
      updateData.status = input.status;
    }
    if (input.photos !== undefined) {
      updateData.photos = input.photos;
    }

    await updateDoc(docRef, updateData);

    // Fetch updated document
    const result = await getDefectLogEntry(seasonId, entryId);
    return result;
  } catch (error) {
    logger.error('[DefectLogService] Error updating entry:', error);
    return {
      success: false,
      error: (error as Error)?.message || 'Failed to update entry',
    };
  }
}

/**
 * Delete a defect log entry
 * Only captain can call this
 */
export async function deleteDefectLog(
  seasonId: string,
  entryId: string
): Promise<LogServiceResult<void>> {
  try {
    logger.log('[DefectLogService] Deleting entry:', entryId);

    await deleteDoc(getDefectLogDoc(seasonId, entryId));

    return { success: true };
  } catch (error) {
    logger.error('[DefectLogService] Error deleting entry:', error);
    return {
      success: false,
      error: (error as Error)?.message || 'Failed to delete entry',
    };
  }
}

// ============ Photo Upload ============

/**
 * Upload a photo for a defect log entry
 * Returns the download URL
 */
export async function uploadDefectPhoto(
  seasonId: string,
  entryId: string,
  localUri: string
): Promise<LogServiceResult<string>> {
  try {
    const storagePath = generateLogPhotoPath('defectLog', seasonId, entryId);

    const result = await uploadPhoto(localUri, storagePath, {
      seasonId,
      entryId,
      type: 'defectLog',
    });

    if (!result.success || !result.downloadUrl) {
      return { success: false, error: result.error || 'Upload failed' };
    }

    return { success: true, data: result.downloadUrl };
  } catch (error) {
    logger.error('[DefectLogService] Error uploading photo:', error);
    return {
      success: false,
      error: (error as Error)?.message || 'Failed to upload photo',
    };
  }
}
