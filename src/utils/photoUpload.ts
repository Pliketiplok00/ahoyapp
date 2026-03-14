/**
 * Photo Upload Utility
 *
 * Shared utility for uploading photos to Firebase Storage.
 * Used by receipt upload, defect log, and storage map.
 */

import { logger } from './logger';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';

// ============ Types ============

export interface PhotoUploadResult {
  success: boolean;
  downloadUrl?: string;
  storagePath?: string;
  error?: string;
}

export interface PhotoUploadMetadata {
  [key: string]: string;
}

// ============ Upload Function ============

/**
 * Upload a photo to Firebase Storage
 *
 * @param localUri - Local file URI (file://)
 * @param storagePath - Full path in Firebase Storage (e.g., 'defectLog/season123/entry456/1234567890.jpg')
 * @param metadata - Optional custom metadata
 * @returns Download URL for the uploaded image
 */
export async function uploadPhoto(
  localUri: string,
  storagePath: string,
  metadata?: PhotoUploadMetadata
): Promise<PhotoUploadResult> {
  try {
    logger.log('[PhotoUpload] Starting upload to:', storagePath);

    // Read file as blob
    const response = await fetch(localUri);
    const blob = await response.blob();

    logger.log('[PhotoUpload] Blob size:', blob.size, 'bytes');

    // Create storage reference
    const storageRef = ref(storage, storagePath);

    // Upload with metadata
    await uploadBytes(storageRef, blob, {
      contentType: 'image/jpeg',
      customMetadata: metadata,
    });

    logger.log('[PhotoUpload] Upload complete');

    // Get download URL
    const downloadUrl = await getDownloadURL(storageRef);
    logger.log('[PhotoUpload] Download URL obtained');

    return {
      success: true,
      downloadUrl,
      storagePath,
    };
  } catch (error) {
    logger.error('[PhotoUpload] Error uploading photo:', error);
    return {
      success: false,
      error: (error as Error)?.message || 'Failed to upload photo',
    };
  }
}

/**
 * Upload photo in background (fire and forget, with callback)
 *
 * Use this for non-blocking upload that updates state after completion.
 */
export async function uploadPhotoInBackground(
  localUri: string,
  storagePath: string,
  metadata?: PhotoUploadMetadata,
  onComplete?: (result: PhotoUploadResult) => void
): Promise<void> {
  try {
    const result = await uploadPhoto(localUri, storagePath, metadata);

    if (onComplete) {
      onComplete(result);
    }
  } catch (error) {
    logger.error('[PhotoUpload] Background upload error:', error);

    if (onComplete) {
      onComplete({
        success: false,
        error: (error as Error)?.message || 'Background upload failed',
      });
    }
  }
}

/**
 * Generate a storage path for log photos
 *
 * @param type - Type of log ('defectLog' | 'storageMap')
 * @param seasonId - Season ID
 * @param entryId - Entry ID
 * @returns Storage path string
 */
export function generateLogPhotoPath(
  type: 'defectLog' | 'storageMap',
  seasonId: string,
  entryId: string
): string {
  const timestamp = Date.now();
  return `${type}/${seasonId}/${entryId}/${timestamp}.jpg`;
}
