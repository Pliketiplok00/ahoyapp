/**
 * useStorageMap Hook
 *
 * Manages storage map entries for the current season.
 * Each crew member manages their own entries.
 * Visibility toggle: private (only author) or public (all crew can read).
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useSeason } from '../../season/hooks/useSeason';
import { useAuthStore } from '../../../stores/authStore';
import { logger } from '../../../utils/logger';
import * as storageMapService from '../services/storageMapService';
import type {
  StorageMapEntry,
  CreateStorageMapInput,
  UpdateStorageMapInput,
} from '../types';

export interface UseStorageMapReturn {
  /** All visible entries (own + public from others) */
  entries: StorageMapEntry[];
  /** Own entries only */
  ownEntries: StorageMapEntry[];
  /** Others' public entries */
  othersEntries: StorageMapEntry[];
  /** Loading state */
  isLoading: boolean;
  /** Error message if any */
  error: string | null;
  /** Refresh entries from server */
  refresh: () => Promise<void>;
  /** Create a new entry */
  createEntry: (input: CreateStorageMapInput) => Promise<boolean>;
  /** Update an existing entry (own only) */
  updateEntry: (entryId: string, input: UpdateStorageMapInput) => Promise<boolean>;
  /** Toggle visibility (public/private) */
  toggleVisibility: (entryId: string) => Promise<boolean>;
  /** Delete an entry (own only) */
  deleteEntry: (entryId: string) => Promise<boolean>;
  /** Upload a photo and get download URL */
  uploadPhoto: (entryId: string, localUri: string) => Promise<string | null>;
  /** Transfer entries to a new season */
  transferToSeason: (targetSeasonId: string) => Promise<number>;
  /** Check if current user owns an entry */
  isOwnEntry: (entry: StorageMapEntry) => boolean;
}

export function useStorageMap(): UseStorageMapReturn {
  const { currentSeasonId } = useSeason();
  const { firebaseUser } = useAuthStore();
  const userId = firebaseUser?.uid;

  const [entries, setEntries] = useState<StorageMapEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if current user owns an entry
  const isOwnEntry = useCallback(
    (entry: StorageMapEntry): boolean => {
      if (!userId) return false;
      return entry.createdBy === userId;
    },
    [userId]
  );

  // Derived: own entries and others' entries
  const { ownEntries, othersEntries } = useMemo(() => {
    const own: StorageMapEntry[] = [];
    const others: StorageMapEntry[] = [];

    for (const entry of entries) {
      if (entry.createdBy === userId) {
        own.push(entry);
      } else {
        others.push(entry);
      }
    }

    return { ownEntries: own, othersEntries: others };
  }, [entries, userId]);

  // Fetch entries on mount and when season changes
  const refresh = useCallback(async () => {
    if (!currentSeasonId || !userId) {
      setEntries([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const result = await storageMapService.getStorageMap(
        currentSeasonId,
        userId
      );

      if (result.success) {
        setEntries(result.data);
      } else {
        setError(result.error || 'Failed to fetch storage map');
      }
    } catch (err) {
      logger.error('[useStorageMap] Error refreshing:', err);
      setError((err as Error)?.message || 'Failed to fetch storage map');
    } finally {
      setIsLoading(false);
    }
  }, [currentSeasonId, userId]);

  // Initial fetch
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Create entry
  const createEntry = useCallback(
    async (input: CreateStorageMapInput): Promise<boolean> => {
      if (!currentSeasonId || !userId) {
        setError('Not authenticated');
        return false;
      }

      try {
        setError(null);

        const result = await storageMapService.createStorageEntry(
          currentSeasonId,
          userId,
          input
        );

        if (result.success && result.data) {
          // Add to beginning of list (own entries first)
          setEntries((prev) => [result.data!, ...prev]);
          return true;
        } else {
          setError(result.error || 'Failed to create entry');
          return false;
        }
      } catch (err) {
        logger.error('[useStorageMap] Error creating entry:', err);
        setError((err as Error)?.message || 'Failed to create entry');
        return false;
      }
    },
    [currentSeasonId, userId]
  );

  // Update entry (own only)
  const updateEntry = useCallback(
    async (entryId: string, input: UpdateStorageMapInput): Promise<boolean> => {
      if (!currentSeasonId) {
        setError('No season selected');
        return false;
      }

      // Check ownership
      const entry = entries.find((e) => e.id === entryId);
      if (entry && !isOwnEntry(entry)) {
        setError('You can only edit your own entries');
        return false;
      }

      try {
        setError(null);

        const result = await storageMapService.updateStorageEntry(
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
        logger.error('[useStorageMap] Error updating entry:', err);
        setError((err as Error)?.message || 'Failed to update entry');
        return false;
      }
    },
    [currentSeasonId, entries, isOwnEntry]
  );

  // Toggle visibility
  const toggleVisibility = useCallback(
    async (entryId: string): Promise<boolean> => {
      if (!currentSeasonId) {
        setError('No season selected');
        return false;
      }

      // Check ownership
      const entry = entries.find((e) => e.id === entryId);
      if (entry && !isOwnEntry(entry)) {
        setError('You can only edit your own entries');
        return false;
      }

      try {
        setError(null);

        const result = await storageMapService.toggleStorageVisibility(
          currentSeasonId,
          entryId
        );

        if (result.success && result.data) {
          setEntries((prev) =>
            prev.map((e) => (e.id === entryId ? result.data! : e))
          );
          return true;
        } else {
          setError(result.error || 'Failed to toggle visibility');
          return false;
        }
      } catch (err) {
        logger.error('[useStorageMap] Error toggling visibility:', err);
        setError((err as Error)?.message || 'Failed to toggle visibility');
        return false;
      }
    },
    [currentSeasonId, entries, isOwnEntry]
  );

  // Delete entry (own only)
  const deleteEntry = useCallback(
    async (entryId: string): Promise<boolean> => {
      if (!currentSeasonId) {
        setError('No season selected');
        return false;
      }

      // Check ownership
      const entry = entries.find((e) => e.id === entryId);
      if (entry && !isOwnEntry(entry)) {
        setError('You can only delete your own entries');
        return false;
      }

      try {
        setError(null);

        const result = await storageMapService.deleteStorageEntry(
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
        logger.error('[useStorageMap] Error deleting entry:', err);
        setError((err as Error)?.message || 'Failed to delete entry');
        return false;
      }
    },
    [currentSeasonId, entries, isOwnEntry]
  );

  // Upload photo
  const uploadPhoto = useCallback(
    async (entryId: string, localUri: string): Promise<string | null> => {
      if (!currentSeasonId) {
        setError('No season selected');
        return null;
      }

      try {
        const result = await storageMapService.uploadStoragePhoto(
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
        logger.error('[useStorageMap] Error uploading photo:', err);
        setError((err as Error)?.message || 'Failed to upload photo');
        return null;
      }
    },
    [currentSeasonId]
  );

  // Transfer to new season
  const transferToSeason = useCallback(
    async (targetSeasonId: string): Promise<number> => {
      if (!currentSeasonId || !userId) {
        setError('Not authenticated');
        return 0;
      }

      try {
        setError(null);

        const result = await storageMapService.transferToNewSeason(
          currentSeasonId,
          targetSeasonId,
          userId
        );

        if (result.success && result.data !== undefined) {
          return result.data;
        } else {
          setError(result.error || 'Failed to transfer entries');
          return 0;
        }
      } catch (err) {
        logger.error('[useStorageMap] Error transferring entries:', err);
        setError((err as Error)?.message || 'Failed to transfer entries');
        return 0;
      }
    },
    [currentSeasonId, userId]
  );

  return {
    entries,
    ownEntries,
    othersEntries,
    isLoading,
    error,
    refresh,
    createEntry,
    updateEntry,
    toggleVisibility,
    deleteEntry,
    uploadPhoto,
    transferToSeason,
    isOwnEntry,
  };
}
