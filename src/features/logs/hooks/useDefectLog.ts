/**
 * useDefectLog Hook
 *
 * Manages defect log entries for the current season.
 * Only captain can create/update/delete entries.
 * All crew members can read.
 */

import { useState, useCallback, useEffect } from 'react';
import { useSeason } from '../../season/hooks/useSeason';
import { useAuthStore } from '../../../stores/authStore';
import { logger } from '../../../utils/logger';
import * as defectLogService from '../services/defectLogService';
import type {
  DefectLogEntry,
  CreateDefectLogInput,
  UpdateDefectLogInput,
} from '../types';

export interface UseDefectLogReturn {
  /** All defect log entries */
  entries: DefectLogEntry[];
  /** Loading state */
  isLoading: boolean;
  /** Error message if any */
  error: string | null;
  /** Whether current user can edit (captain only) */
  canEdit: boolean;
  /** Refresh entries from server */
  refresh: () => Promise<void>;
  /** Create a new entry (captain only) */
  createEntry: (input: CreateDefectLogInput) => Promise<boolean>;
  /** Update an existing entry (captain only) */
  updateEntry: (entryId: string, input: UpdateDefectLogInput) => Promise<boolean>;
  /** Delete an entry (captain only) */
  deleteEntry: (entryId: string) => Promise<boolean>;
  /** Upload a photo and get download URL */
  uploadPhoto: (entryId: string, localUri: string) => Promise<string | null>;
}

export function useDefectLog(): UseDefectLogReturn {
  const { currentSeasonId, isCurrentUserCaptain } = useSeason();
  const { firebaseUser } = useAuthStore();
  const userId = firebaseUser?.uid;

  const [entries, setEntries] = useState<DefectLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch entries on mount and when season changes
  const refresh = useCallback(async () => {
    if (!currentSeasonId) {
      setEntries([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const result = await defectLogService.getDefectLogs(currentSeasonId);

      if (result.success) {
        setEntries(result.data);
      } else {
        setError(result.error || 'Failed to fetch defect logs');
      }
    } catch (err) {
      logger.error('[useDefectLog] Error refreshing:', err);
      setError((err as Error)?.message || 'Failed to fetch defect logs');
    } finally {
      setIsLoading(false);
    }
  }, [currentSeasonId]);

  // Initial fetch
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Create entry (captain only)
  const createEntry = useCallback(
    async (input: CreateDefectLogInput): Promise<boolean> => {
      if (!currentSeasonId || !userId) {
        setError('Not authenticated');
        return false;
      }

      if (!isCurrentUserCaptain) {
        setError('Only captain can create defect log entries');
        return false;
      }

      try {
        setError(null);

        const result = await defectLogService.createDefectLog(
          currentSeasonId,
          userId,
          input
        );

        if (result.success && result.data) {
          setEntries((prev) => [result.data!, ...prev]);
          return true;
        } else {
          setError(result.error || 'Failed to create entry');
          return false;
        }
      } catch (err) {
        logger.error('[useDefectLog] Error creating entry:', err);
        setError((err as Error)?.message || 'Failed to create entry');
        return false;
      }
    },
    [currentSeasonId, userId, isCurrentUserCaptain]
  );

  // Update entry (captain only)
  const updateEntry = useCallback(
    async (entryId: string, input: UpdateDefectLogInput): Promise<boolean> => {
      if (!currentSeasonId) {
        setError('No season selected');
        return false;
      }

      if (!isCurrentUserCaptain) {
        setError('Only captain can update defect log entries');
        return false;
      }

      try {
        setError(null);

        const result = await defectLogService.updateDefectLog(
          currentSeasonId,
          entryId,
          input
        );

        if (result.success && result.data) {
          setEntries((prev) =>
            prev.map((e) => (e.id === entryId ? result.data! : e))
          );
          return true;
        } else {
          setError(result.error || 'Failed to update entry');
          return false;
        }
      } catch (err) {
        logger.error('[useDefectLog] Error updating entry:', err);
        setError((err as Error)?.message || 'Failed to update entry');
        return false;
      }
    },
    [currentSeasonId, isCurrentUserCaptain]
  );

  // Delete entry (captain only)
  const deleteEntry = useCallback(
    async (entryId: string): Promise<boolean> => {
      if (!currentSeasonId) {
        setError('No season selected');
        return false;
      }

      if (!isCurrentUserCaptain) {
        setError('Only captain can delete defect log entries');
        return false;
      }

      try {
        setError(null);

        const result = await defectLogService.deleteDefectLog(
          currentSeasonId,
          entryId
        );

        if (result.success) {
          setEntries((prev) => prev.filter((e) => e.id !== entryId));
          return true;
        } else {
          setError(result.error || 'Failed to delete entry');
          return false;
        }
      } catch (err) {
        logger.error('[useDefectLog] Error deleting entry:', err);
        setError((err as Error)?.message || 'Failed to delete entry');
        return false;
      }
    },
    [currentSeasonId, isCurrentUserCaptain]
  );

  // Upload photo
  const uploadPhoto = useCallback(
    async (entryId: string, localUri: string): Promise<string | null> => {
      if (!currentSeasonId) {
        setError('No season selected');
        return null;
      }

      try {
        const result = await defectLogService.uploadDefectPhoto(
          currentSeasonId,
          entryId,
          localUri
        );

        if (result.success && result.data) {
          return result.data;
        } else {
          setError(result.error || 'Failed to upload photo');
          return null;
        }
      } catch (err) {
        logger.error('[useDefectLog] Error uploading photo:', err);
        setError((err as Error)?.message || 'Failed to upload photo');
        return null;
      }
    },
    [currentSeasonId]
  );

  return {
    entries,
    isLoading,
    error,
    canEdit: isCurrentUserCaptain,
    refresh,
    createEntry,
    updateEntry,
    deleteEntry,
    uploadPhoto,
  };
}
