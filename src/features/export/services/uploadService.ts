/**
 * Upload Service
 *
 * Uploads exports to Firebase Storage and returns shareable download URLs.
 * Storage path: exports/{seasonId}/{bookingId}/{timestamp}_{filename}
 */

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../../config/firebase';

// ============ Types ============

export interface UploadResult {
  success: boolean;
  downloadUrl?: string;
  storagePath?: string;
  error?: string;
}

// ============ Helpers ============

/**
 * Generate timestamp string for unique filenames
 */
function getTimestamp(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const mins = String(now.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}_${hours}${mins}`;
}

/**
 * Sanitize filename for storage (remove special chars)
 */
export function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9-_.]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .replace(/-\./g, '.'); // Remove hyphen before dot (file-.xlsx → file.xlsx)
}

/**
 * Generate storage path for export
 */
export function generateStoragePath(
  seasonId: string,
  bookingId: string,
  filename: string
): string {
  const timestamp = getTimestamp();
  const sanitized = sanitizeFilename(filename);
  return `exports/${seasonId}/${bookingId}/${timestamp}_${sanitized}`;
}

// ============ Upload Functions ============

/**
 * Upload file to Firebase Storage
 *
 * @param localUri - Local file URI (file://)
 * @param storagePath - Full path in Firebase Storage
 * @returns Download URL for sharing
 */
export async function uploadToStorage(
  localUri: string,
  storagePath: string
): Promise<UploadResult> {
  try {
    console.log('[Upload] Starting upload to:', storagePath);

    // Read file as blob
    const response = await fetch(localUri);
    const blob = await response.blob();

    console.log('[Upload] Blob size:', blob.size, 'bytes');

    // Create storage reference
    const storageRef = ref(storage, storagePath);

    // Upload
    await uploadBytes(storageRef, blob);
    console.log('[Upload] Upload complete');

    // Get download URL
    const downloadUrl = await getDownloadURL(storageRef);
    console.log('[Upload] Download URL:', downloadUrl.slice(0, 50) + '...');

    return {
      success: true,
      downloadUrl,
      storagePath,
    };
  } catch (error) {
    console.error('[Upload] Error:', error);
    return {
      success: false,
      error: (error as Error)?.message || 'Upload failed',
    };
  }
}

/**
 * Upload export file with auto-generated path
 *
 * @param localUri - Local file URI
 * @param seasonId - Season ID
 * @param bookingId - Booking ID
 * @param filename - Original filename (will be sanitized)
 * @returns Download URL for sharing
 */
export async function uploadExport(
  localUri: string,
  seasonId: string,
  bookingId: string,
  filename: string
): Promise<UploadResult> {
  const storagePath = generateStoragePath(seasonId, bookingId, filename);
  return uploadToStorage(localUri, storagePath);
}
