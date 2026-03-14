/**
 * useWishList Hook
 *
 * Manages wish list items for the current season.
 * All crew members can create items.
 * Only creator or captain can update/delete items.
 */

import { useState, useCallback, useEffect } from 'react';
import { useSeason } from '../../season/hooks/useSeason';
import { useAuthStore } from '../../../stores/authStore';
import { logger } from '../../../utils/logger';
import * as wishListService from '../services/wishListService';
import type {
  WishListItem,
  CreateWishListInput,
  UpdateWishListInput,
} from '../types';

export interface UseWishListReturn {
  /** All wish list items */
  items: WishListItem[];
  /** Loading state */
  isLoading: boolean;
  /** Error message if any */
  error: string | null;
  /** Refresh items from server */
  refresh: () => Promise<void>;
  /** Create a new item */
  createItem: (input: CreateWishListInput) => Promise<boolean>;
  /** Update an existing item (creator or captain only) */
  updateItem: (itemId: string, input: UpdateWishListInput) => Promise<boolean>;
  /** Toggle done status (creator or captain only) */
  toggleDone: (itemId: string) => Promise<boolean>;
  /** Delete an item (creator or captain only) */
  deleteItem: (itemId: string) => Promise<boolean>;
  /** Check if current user can edit a specific item */
  canEditItem: (item: WishListItem) => boolean;
}

export function useWishList(): UseWishListReturn {
  const { currentSeasonId, isCurrentUserCaptain } = useSeason();
  const { firebaseUser } = useAuthStore();
  const userId = firebaseUser?.uid;

  const [items, setItems] = useState<WishListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if current user can edit a specific item
  const canEditItem = useCallback(
    (item: WishListItem): boolean => {
      if (!userId) return false;
      // Creator or captain can edit
      return item.createdBy === userId || isCurrentUserCaptain;
    },
    [userId, isCurrentUserCaptain]
  );

  // Fetch items on mount and when season changes
  const refresh = useCallback(async () => {
    if (!currentSeasonId) {
      setItems([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const result = await wishListService.getWishList(currentSeasonId);

      if (result.success) {
        setItems(result.data);
      } else {
        setError(result.error || 'Failed to fetch wish list');
      }
    } catch (err) {
      logger.error('[useWishList] Error refreshing:', err);
      setError((err as Error)?.message || 'Failed to fetch wish list');
    } finally {
      setIsLoading(false);
    }
  }, [currentSeasonId]);

  // Initial fetch
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Create item (all crew)
  const createItem = useCallback(
    async (input: CreateWishListInput): Promise<boolean> => {
      if (!currentSeasonId || !userId) {
        setError('Not authenticated');
        return false;
      }

      try {
        setError(null);

        const result = await wishListService.createWishItem(
          currentSeasonId,
          userId,
          input
        );

        if (result.success && result.data) {
          setItems((prev) => [result.data!, ...prev]);
          return true;
        } else {
          setError(result.error || 'Failed to create item');
          return false;
        }
      } catch (err) {
        logger.error('[useWishList] Error creating item:', err);
        setError((err as Error)?.message || 'Failed to create item');
        return false;
      }
    },
    [currentSeasonId, userId]
  );

  // Update item (creator or captain)
  const updateItem = useCallback(
    async (itemId: string, input: UpdateWishListInput): Promise<boolean> => {
      if (!currentSeasonId) {
        setError('No season selected');
        return false;
      }

      // Find the item to check permissions
      const item = items.find((i) => i.id === itemId);
      if (item && !canEditItem(item)) {
        setError('You can only edit your own items');
        return false;
      }

      try {
        setError(null);

        const result = await wishListService.updateWishItem(
          currentSeasonId,
          itemId,
          input
        );

        if (result.success && result.data) {
          setItems((prev) =>
            prev.map((i) => (i.id === itemId ? result.data! : i))
          );
          return true;
        } else {
          setError(result.error || 'Failed to update item');
          return false;
        }
      } catch (err) {
        logger.error('[useWishList] Error updating item:', err);
        setError((err as Error)?.message || 'Failed to update item');
        return false;
      }
    },
    [currentSeasonId, items, canEditItem]
  );

  // Toggle done status
  const toggleDone = useCallback(
    async (itemId: string): Promise<boolean> => {
      if (!currentSeasonId) {
        setError('No season selected');
        return false;
      }

      // Find the item to check permissions
      const item = items.find((i) => i.id === itemId);
      if (item && !canEditItem(item)) {
        setError('You can only edit your own items');
        return false;
      }

      try {
        setError(null);

        const result = await wishListService.toggleWishItemDone(
          currentSeasonId,
          itemId
        );

        if (result.success && result.data) {
          setItems((prev) =>
            prev.map((i) => (i.id === itemId ? result.data! : i))
          );
          return true;
        } else {
          setError(result.error || 'Failed to toggle done status');
          return false;
        }
      } catch (err) {
        logger.error('[useWishList] Error toggling done:', err);
        setError((err as Error)?.message || 'Failed to toggle done status');
        return false;
      }
    },
    [currentSeasonId, items, canEditItem]
  );

  // Delete item (creator or captain)
  const deleteItem = useCallback(
    async (itemId: string): Promise<boolean> => {
      if (!currentSeasonId) {
        setError('No season selected');
        return false;
      }

      // Find the item to check permissions
      const item = items.find((i) => i.id === itemId);
      if (item && !canEditItem(item)) {
        setError('You can only delete your own items');
        return false;
      }

      try {
        setError(null);

        const result = await wishListService.deleteWishItem(
          currentSeasonId,
          itemId
        );

        if (result.success) {
          setItems((prev) => prev.filter((i) => i.id !== itemId));
          return true;
        } else {
          setError(result.error || 'Failed to delete item');
          return false;
        }
      } catch (err) {
        logger.error('[useWishList] Error deleting item:', err);
        setError((err as Error)?.message || 'Failed to delete item');
        return false;
      }
    },
    [currentSeasonId, items, canEditItem]
  );

  return {
    items,
    isLoading,
    error,
    refresh,
    createItem,
    updateItem,
    toggleDone,
    deleteItem,
    canEditItem,
  };
}
