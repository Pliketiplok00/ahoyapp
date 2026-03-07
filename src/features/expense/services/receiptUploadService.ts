/**
 * Receipt Upload Service
 *
 * Uploads receipt images to Firebase Storage.
 * Storage path: receipts/{seasonId}/{bookingId}/{expenseId}.jpg
 */

import { logger } from '../../../utils/logger';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../../config/firebase';

// ============ Types ============

export interface UploadReceiptResult {
  success: boolean;
  downloadUrl?: string;
  storagePath?: string;
  error?: string;
}

// ============ Upload Function ============

/**
 * Upload a receipt image to Firebase Storage
 *
 * @param localUri - Local file URI (file://)
 * @param seasonId - Season ID for organizing receipts
 * @param bookingId - Booking ID for organizing receipts
 * @param expenseId - Expense ID for unique filename
 * @returns Download URL for the uploaded image
 */
export async function uploadReceiptImage(
  localUri: string,
  seasonId: string,
  bookingId: string,
  expenseId: string
): Promise<UploadReceiptResult> {
  try {
    logger.log('[ReceiptUpload] Starting upload for expense:', expenseId);

    // Generate storage path
    const timestamp = Date.now();
    const storagePath = `receipts/${seasonId}/${bookingId}/${expenseId}_${timestamp}.jpg`;

    logger.log('[ReceiptUpload] Storage path:', storagePath);

    // Read file as blob
    const response = await fetch(localUri);
    const blob = await response.blob();

    logger.log('[ReceiptUpload] Blob size:', blob.size, 'bytes');

    // Create storage reference
    const storageRef = ref(storage, storagePath);

    // Upload with metadata
    await uploadBytes(storageRef, blob, {
      contentType: 'image/jpeg',
      customMetadata: {
        seasonId,
        bookingId,
        expenseId,
      },
    });

    logger.log('[ReceiptUpload] Upload complete');

    // Get download URL
    const downloadUrl = await getDownloadURL(storageRef);
    logger.log('[ReceiptUpload] Download URL obtained');

    return {
      success: true,
      downloadUrl,
      storagePath,
    };
  } catch (error) {
    logger.error('[ReceiptUpload] Error uploading receipt:', error);
    return {
      success: false,
      error: (error as Error)?.message || 'Failed to upload receipt image',
    };
  }
}

/**
 * Upload receipt in background (fire and forget, with callback)
 *
 * Use this for non-blocking upload that updates the expense after completion.
 */
export async function uploadReceiptInBackground(
  localUri: string,
  seasonId: string,
  bookingId: string,
  expenseId: string,
  onComplete?: (result: UploadReceiptResult) => void
): Promise<void> {
  try {
    const result = await uploadReceiptImage(localUri, seasonId, bookingId, expenseId);

    if (onComplete) {
      onComplete(result);
    }
  } catch (error) {
    logger.error('[ReceiptUpload] Background upload error:', error);

    if (onComplete) {
      onComplete({
        success: false,
        error: (error as Error)?.message || 'Background upload failed',
      });
    }
  }
}
