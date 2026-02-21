/**
 * useOfflineSync Hook
 *
 * Manages offline sync operations.
 * Monitors network state and processes pending uploads when online.
 */

import { logger } from '../utils/logger';
import { useEffect, useCallback, useRef } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';
import { useSyncStore, type PendingUpload } from '../stores/syncStore';

const MAX_RETRY_COUNT = 3;
const RETRY_DELAY_MS = 5000;

interface UseOfflineSyncReturn {
  isOnline: boolean;
  syncStatus: 'synced' | 'pending' | 'syncing' | 'error';
  pendingCount: number;
  syncError: string | null;
  processPendingUploads: () => Promise<void>;
  retryFailedUpload: (id: string) => Promise<boolean>;
}

export function useOfflineSync(): UseOfflineSyncReturn {
  const {
    isOnline,
    syncStatus,
    pendingCount,
    syncError,
    pendingUploads,
    setOnline,
    setSyncStatus,
    removePendingUpload,
    incrementRetry,
    setLastSyncAt,
  } = useSyncStore();

  const processingRef = useRef(false);

  /**
   * Upload a single pending item
   */
  const processUpload = useCallback(
    async (upload: PendingUpload): Promise<boolean> => {
      try {
        if (upload.type === 'expense-receipt' && upload.localPath) {
          // Upload receipt image to Firebase Storage
          const response = await fetch(upload.localPath);
          const blob = await response.blob();

          const storageRef = ref(
            storage,
            `receipts/${upload.data.bookingId}/${upload.data.expenseId}`
          );

          await uploadBytes(storageRef, blob);
          const downloadUrl = await getDownloadURL(storageRef);

          // Update the expense with the download URL
          // This would need to call the expense service
          logger.log('Uploaded receipt:', downloadUrl);
        }

        // Remove from pending queue on success
        removePendingUpload(upload.id);
        return true;
      } catch (error) {
        logger.error(`Failed to process upload ${upload.id}:`, error);

        if (upload.retryCount >= MAX_RETRY_COUNT) {
          // Too many retries - mark as permanently failed
          incrementRetry(upload.id, 'Max retry attempts exceeded');
          return false;
        }

        incrementRetry(
          upload.id,
          error instanceof Error ? error.message : 'Upload failed'
        );
        return false;
      }
    },
    [removePendingUpload, incrementRetry]
  );

  /**
   * Process all pending uploads
   */
  const processPendingUploads = useCallback(async () => {
    if (processingRef.current || !isOnline || pendingUploads.length === 0) {
      return;
    }

    processingRef.current = true;
    setSyncStatus('syncing');

    let hasErrors = false;

    for (const upload of pendingUploads) {
      // Skip items with too many retries
      if (upload.retryCount > MAX_RETRY_COUNT) {
        hasErrors = true;
        continue;
      }

      const success = await processUpload(upload);
      if (!success) {
        hasErrors = true;
        // Wait before processing next item
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      }
    }

    processingRef.current = false;

    // Update status
    const remainingUploads = useSyncStore.getState().pendingUploads;
    if (remainingUploads.length === 0) {
      setSyncStatus('synced');
      setLastSyncAt(Date.now());
    } else if (hasErrors) {
      setSyncStatus('error', 'Some uploads failed');
    } else {
      setSyncStatus('pending');
    }
  }, [isOnline, pendingUploads, processUpload, setSyncStatus, setLastSyncAt]);

  /**
   * Retry a specific failed upload
   */
  const retryFailedUpload = useCallback(
    async (id: string): Promise<boolean> => {
      const upload = pendingUploads.find((u) => u.id === id);
      if (!upload || !isOnline) {
        return false;
      }

      // Reset retry count for manual retry
      useSyncStore.getState().updatePendingUpload(id, { retryCount: 0, lastError: undefined });

      return processUpload(upload);
    },
    [pendingUploads, isOnline, processUpload]
  );

  /**
   * Monitor network state changes
   */
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const wasOffline = !isOnline;
      const nowOnline = state.isConnected ?? false;

      setOnline(nowOnline);

      // If coming back online and have pending uploads, start syncing
      if (wasOffline && nowOnline && pendingUploads.length > 0) {
        processPendingUploads();
      }
    });

    return () => unsubscribe();
  }, [isOnline, pendingUploads.length, setOnline, processPendingUploads]);

  /**
   * Initial network check
   */
  useEffect(() => {
    NetInfo.fetch().then((state) => {
      setOnline(state.isConnected ?? false);
    });
  }, [setOnline]);

  return {
    isOnline,
    syncStatus,
    pendingCount,
    syncError,
    processPendingUploads,
    retryFailedUpload,
  };
}
