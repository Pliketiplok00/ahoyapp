/**
 * usePantry Hook
 *
 * Manages pantry state for the current season.
 * Provides CRUD operations and financial calculations.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import * as pantryService from '../services/pantryService';
import { useSeason } from '../../season/hooks/useSeason';
import { useAuthStore } from '../../../stores/authStore';
import type {
  PantryItem,
  PantrySale,
  PantryFinancials,
  CreatePantryItemInput,
  UpdatePantryItemInput,
  CreatePantrySaleInput,
  PantryCategory,
} from '../types';

interface UsePantryReturn {
  // Data
  items: PantryItem[];
  sales: PantrySale[];
  financials: PantryFinancials | null;

  // Filtered views
  itemsByCategory: Record<PantryCategory, PantryItem[]>;
  inStockItems: PantryItem[];
  lowStockItems: PantryItem[];
  outOfStockItems: PantryItem[];

  // Summary
  totalItems: number;
  totalValue: number;
  totalInvested: number;

  // State
  isLoading: boolean;
  error: string | null;

  // Actions
  refresh: () => Promise<void>;
  createItem: (
    input: Omit<CreatePantryItemInput, 'seasonId' | 'createdBy'>
  ) => Promise<{ success: boolean; item?: PantryItem; error?: string }>;
  updateItem: (
    itemId: string,
    input: UpdatePantryItemInput
  ) => Promise<{ success: boolean; error?: string }>;
  deleteItem: (itemId: string) => Promise<{ success: boolean; error?: string }>;
  createSale: (
    input: Omit<CreatePantrySaleInput, 'seasonId' | 'createdBy'>
  ) => Promise<{ success: boolean; sale?: PantrySale; error?: string }>;
  getItemSales: (itemId: string) => Promise<{ success: boolean; sales?: PantrySale[]; error?: string }>;

  // Permissions
  canEdit: (item: PantryItem) => boolean;
  canDelete: (item: PantryItem) => boolean;
}

const LOW_STOCK_THRESHOLD = 3;

export function usePantry(): UsePantryReturn {
  const { currentSeasonId, crewMembers, isCurrentUserCaptain } = useSeason();
  const { firebaseUser } = useAuthStore();
  const userId = firebaseUser?.uid;

  const [items, setItems] = useState<PantryItem[]>([]);
  const [sales, setSales] = useState<PantrySale[]>([]);
  const [financials, setFinancials] = useState<PantryFinancials | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all pantry data
   */
  const fetchData = useCallback(async () => {
    if (!currentSeasonId) {
      setItems([]);
      setSales([]);
      setFinancials(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [itemsResult, salesResult, financialsResult] = await Promise.all([
        pantryService.getSeasonPantryItems(currentSeasonId),
        pantryService.getSeasonSales(currentSeasonId),
        pantryService.calculateFinancials(currentSeasonId, crewMembers),
      ]);

      if (itemsResult.success && itemsResult.data) {
        setItems(itemsResult.data);
      } else {
        setError(itemsResult.error || 'pantry.errors.loadFailed');
      }

      if (salesResult.success && salesResult.data) {
        setSales(salesResult.data);
      }

      if (financialsResult.success && financialsResult.data) {
        setFinancials(financialsResult.data);
      }
    } catch (err) {
      setError('pantry.errors.loadFailed');
    }

    setIsLoading(false);
  }, [currentSeasonId, crewMembers]);

  // Fetch on mount and when season changes
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /**
   * Group items by category
   */
  const itemsByCategory = useMemo(() => {
    const grouped: Record<PantryCategory, PantryItem[]> = {
      wine: [],
      spirits: [],
      beer: [],
      other: [],
    };

    items.forEach((item) => {
      grouped[item.category].push(item);
    });

    return grouped;
  }, [items]);

  /**
   * Filter items by stock level
   */
  const inStockItems = useMemo(
    () => items.filter((i) => i.quantity >= LOW_STOCK_THRESHOLD),
    [items]
  );

  const lowStockItems = useMemo(
    () => items.filter((i) => i.quantity > 0 && i.quantity < LOW_STOCK_THRESHOLD),
    [items]
  );

  const outOfStockItems = useMemo(
    () => items.filter((i) => i.quantity === 0),
    [items]
  );

  /**
   * Summary calculations
   */
  const totalItems = items.length;

  const totalValue = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity * i.sellingPrice, 0),
    [items]
  );

  const totalInvested = useMemo(
    () => items.reduce((sum, i) => sum + i.originalQuantity * i.purchasePrice, 0),
    [items]
  );

  /**
   * Create a new item
   */
  const createItem = useCallback(
    async (input: Omit<CreatePantryItemInput, 'seasonId' | 'createdBy'>) => {
      if (!currentSeasonId || !userId) {
        return { success: false, error: 'pantry.errors.noSeasonOrUser' };
      }

      const result = await pantryService.createPantryItem({
        ...input,
        seasonId: currentSeasonId,
        createdBy: userId,
      });

      if (result.success && result.data) {
        setItems((prev) => [...prev, result.data!].sort((a, b) => a.name.localeCompare(b.name)));
        // Refresh financials
        fetchData();
        return { success: true, item: result.data };
      }

      return { success: false, error: result.error };
    },
    [currentSeasonId, userId, fetchData]
  );

  /**
   * Update an item
   */
  const updateItem = useCallback(
    async (itemId: string, input: UpdatePantryItemInput) => {
      if (!currentSeasonId) {
        return { success: false, error: 'pantry.errors.noSeasonOrUser' };
      }

      const result = await pantryService.updatePantryItem(currentSeasonId, itemId, input);

      if (result.success && result.data) {
        setItems((prev) =>
          prev.map((i) => (i.id === itemId ? result.data! : i))
        );
        fetchData(); // Refresh financials
        return { success: true };
      }

      return { success: false, error: result.error };
    },
    [currentSeasonId, fetchData]
  );

  /**
   * Delete an item
   */
  const deleteItem = useCallback(
    async (itemId: string) => {
      if (!currentSeasonId) {
        return { success: false, error: 'pantry.errors.noSeasonOrUser' };
      }

      const result = await pantryService.deletePantryItem(currentSeasonId, itemId);

      if (result.success) {
        setItems((prev) => prev.filter((i) => i.id !== itemId));
        fetchData(); // Refresh financials
        return { success: true };
      }

      return { success: false, error: result.error };
    },
    [currentSeasonId, fetchData]
  );

  /**
   * Create a sale
   */
  const createSale = useCallback(
    async (input: Omit<CreatePantrySaleInput, 'seasonId' | 'createdBy'>) => {
      if (!currentSeasonId || !userId) {
        return { success: false, error: 'pantry.errors.noSeasonOrUser' };
      }

      const result = await pantryService.createPantrySale({
        ...input,
        seasonId: currentSeasonId,
        createdBy: userId,
      });

      if (result.success && result.data) {
        // Update local item stock
        setItems((prev) =>
          prev.map((i) =>
            i.id === input.pantryItemId
              ? { ...i, quantity: i.quantity - input.quantity }
              : i
          )
        );
        setSales((prev) => [result.data!, ...prev]);
        fetchData(); // Refresh financials
        return { success: true, sale: result.data };
      }

      return { success: false, error: result.error };
    },
    [currentSeasonId, userId, fetchData]
  );

  /**
   * Get sales for a specific item
   */
  const getItemSales = useCallback(
    async (itemId: string) => {
      if (!currentSeasonId) {
        return { success: false, error: 'pantry.errors.noSeasonOrUser' };
      }

      const result = await pantryService.getItemSales(currentSeasonId, itemId);

      if (result.success && result.data) {
        return { success: true, sales: result.data };
      }

      return { success: false, error: result.error };
    },
    [currentSeasonId]
  );

  /**
   * Check if user can edit an item
   */
  const canEdit = useCallback(
    (item: PantryItem) => {
      return isCurrentUserCaptain || item.createdBy === userId;
    },
    [isCurrentUserCaptain, userId]
  );

  /**
   * Check if user can delete an item
   */
  const canDelete = useCallback(
    (item: PantryItem) => {
      return isCurrentUserCaptain || item.createdBy === userId;
    },
    [isCurrentUserCaptain, userId]
  );

  return {
    items,
    sales,
    financials,
    itemsByCategory,
    inStockItems,
    lowStockItems,
    outOfStockItems,
    totalItems,
    totalValue,
    totalInvested,
    isLoading,
    error,
    refresh: fetchData,
    createItem,
    updateItem,
    deleteItem,
    createSale,
    getItemSales,
    canEdit,
    canDelete,
  };
}
