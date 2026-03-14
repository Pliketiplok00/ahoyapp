/**
 * Pantry Service
 *
 * Firestore CRUD operations for pantry items and sales.
 * Handles inventory management and auto-creates APA entries.
 *
 * Error messages use i18n keys - translate in UI layer with t(error).
 */

import { logger } from '../../../utils/logger';
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
  serverTimestamp,
  runTransaction,
} from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { createApaEntry } from '../../apa/services/apaService';
import type {
  PantryItem,
  PantrySale,
  CreatePantryItemInput,
  UpdatePantryItemInput,
  CreatePantrySaleInput,
  PantryFinancials,
  CrewPantryFinancials,
} from '../types';
import type { CrewMember } from '../../season/types';

// ============ Types ============

export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ============ Error Keys ============

export const PANTRY_ERRORS = {
  createFailed: 'pantry.errors.createFailed',
  loadFailed: 'pantry.errors.loadFailed',
  updateFailed: 'pantry.errors.updateFailed',
  deleteFailed: 'pantry.errors.deleteFailed',
  itemNotFound: 'pantry.errors.itemNotFound',
  insufficientStock: 'pantry.errors.insufficientStock',
  saleFailed: 'pantry.errors.saleFailed',
  loadSalesFailed: 'pantry.errors.loadSalesFailed',
  financialsFailed: 'pantry.errors.financialsFailed',
  transferFailed: 'pantry.errors.transferFailed',
} as const;

// ============ Helpers ============

/**
 * Calculate selling price from purchase price and markup
 */
export function calculateSellingPrice(purchasePrice: number, markupPercent: number): number {
  return Math.round(purchasePrice * (1 + markupPercent / 100) * 100) / 100;
}

/**
 * Get pantry collection reference for a season
 */
function getPantryCollection(seasonId: string) {
  return collection(db, 'seasons', seasonId, 'pantry');
}

/**
 * Get pantry sales collection reference for a season
 */
function getSalesCollection(seasonId: string) {
  return collection(db, 'seasons', seasonId, 'pantrySales');
}

// ============ Pantry Item CRUD ============

/**
 * Create a new pantry item
 */
export async function createPantryItem(
  input: CreatePantryItemInput
): Promise<ServiceResult<PantryItem>> {
  try {
    const sellingPrice = calculateSellingPrice(input.purchasePrice, input.markupPercent);

    const itemData = {
      seasonId: input.seasonId,
      name: input.name,
      category: input.category,
      quantity: input.quantity,
      originalQuantity: input.quantity,
      purchasePrice: input.purchasePrice,
      markupPercent: input.markupPercent,
      sellingPrice,
      investors: input.investors,
      createdBy: input.createdBy,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(getPantryCollection(input.seasonId), itemData);

    const item: PantryItem = {
      id: docRef.id,
      ...itemData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    return { success: true, data: item };
  } catch (error) {
    logger.error('Error creating pantry item:', error);
    return { success: false, error: PANTRY_ERRORS.createFailed };
  }
}

/**
 * Get a single pantry item by ID
 */
export async function getPantryItem(
  seasonId: string,
  itemId: string
): Promise<ServiceResult<PantryItem>> {
  try {
    const docRef = doc(db, 'seasons', seasonId, 'pantry', itemId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return { success: false, error: PANTRY_ERRORS.itemNotFound };
    }

    const item: PantryItem = {
      id: docSnap.id,
      ...docSnap.data(),
    } as PantryItem;

    return { success: true, data: item };
  } catch (error) {
    logger.error('Error getting pantry item:', error);
    return { success: false, error: PANTRY_ERRORS.loadFailed };
  }
}

/**
 * Get all pantry items for a season
 */
export async function getSeasonPantryItems(
  seasonId: string
): Promise<ServiceResult<PantryItem[]>> {
  try {
    const snapshot = await getDocs(getPantryCollection(seasonId));
    const items: PantryItem[] = [];

    snapshot.forEach((docSnap) => {
      items.push({
        id: docSnap.id,
        ...docSnap.data(),
      } as PantryItem);
    });

    // Sort by name
    items.sort((a, b) => a.name.localeCompare(b.name));

    return { success: true, data: items };
  } catch (error) {
    logger.error('Error getting pantry items:', error);
    return { success: false, error: PANTRY_ERRORS.loadFailed };
  }
}

/**
 * Update a pantry item
 */
export async function updatePantryItem(
  seasonId: string,
  itemId: string,
  input: UpdatePantryItemInput
): Promise<ServiceResult<PantryItem>> {
  try {
    const docRef = doc(db, 'seasons', seasonId, 'pantry', itemId);

    const updateData: Record<string, unknown> = {
      updatedAt: serverTimestamp(),
    };

    if (input.name !== undefined) updateData.name = input.name;
    if (input.category !== undefined) updateData.category = input.category;
    if (input.quantity !== undefined) updateData.quantity = input.quantity;
    if (input.investors !== undefined) updateData.investors = input.investors;

    // Recalculate selling price if price or markup changed
    if (input.purchasePrice !== undefined || input.markupPercent !== undefined) {
      const currentDoc = await getDoc(docRef);
      if (!currentDoc.exists()) {
        return { success: false, error: PANTRY_ERRORS.itemNotFound };
      }
      const current = currentDoc.data() as PantryItem;

      const newPurchasePrice = input.purchasePrice ?? current.purchasePrice;
      const newMarkup = input.markupPercent ?? current.markupPercent;

      updateData.purchasePrice = newPurchasePrice;
      updateData.markupPercent = newMarkup;
      updateData.sellingPrice = calculateSellingPrice(newPurchasePrice, newMarkup);
    }

    await updateDoc(docRef, updateData);

    return getPantryItem(seasonId, itemId);
  } catch (error) {
    logger.error('Error updating pantry item:', error);
    return { success: false, error: PANTRY_ERRORS.updateFailed };
  }
}

/**
 * Delete a pantry item
 */
export async function deletePantryItem(
  seasonId: string,
  itemId: string
): Promise<ServiceResult<void>> {
  try {
    const docRef = doc(db, 'seasons', seasonId, 'pantry', itemId);
    await deleteDoc(docRef);
    return { success: true };
  } catch (error) {
    logger.error('Error deleting pantry item:', error);
    return { success: false, error: PANTRY_ERRORS.deleteFailed };
  }
}

// ============ Pantry Sales ============

/**
 * Create a sale - decrements stock and creates APA entry
 */
export async function createPantrySale(
  input: CreatePantrySaleInput
): Promise<ServiceResult<PantrySale>> {
  try {
    // Get the pantry item first
    const itemResult = await getPantryItem(input.seasonId, input.pantryItemId);
    if (!itemResult.success || !itemResult.data) {
      return { success: false, error: itemResult.error || PANTRY_ERRORS.itemNotFound };
    }

    const item = itemResult.data;

    // Check stock
    if (item.quantity < input.quantity) {
      return { success: false, error: PANTRY_ERRORS.insufficientStock };
    }

    const totalAmount = item.sellingPrice * input.quantity;

    // Use transaction to ensure atomicity
    const saleId = await runTransaction(db, async (transaction) => {
      const itemRef = doc(db, 'seasons', input.seasonId, 'pantry', input.pantryItemId);

      // Decrement stock
      transaction.update(itemRef, {
        quantity: item.quantity - input.quantity,
        updatedAt: serverTimestamp(),
      });

      // Create sale document
      const saleRef = doc(getSalesCollection(input.seasonId));
      transaction.set(saleRef, {
        seasonId: input.seasonId,
        pantryItemId: input.pantryItemId,
        pantryItemName: item.name,
        bookingId: input.bookingId,
        quantity: input.quantity,
        sellingPrice: item.sellingPrice,
        totalAmount,
        createdBy: input.createdBy,
        createdAt: serverTimestamp(),
      });

      return saleRef.id;
    });

    // Create APA entry for the booking (negative amount = expense from APA)
    const apaResult = await createApaEntry({
      bookingId: input.bookingId,
      amount: -totalAmount, // Negative: money going OUT of APA to pay crew
      note: `Pantry: ${item.name} (${input.quantity}x)`,
      createdBy: input.createdBy,
    });

    // Update sale with APA entry ID if created
    // This is non-critical - sale and APA entry already exist, so don't fail if this throws
    if (apaResult.success && apaResult.data) {
      try {
        const saleRef = doc(db, 'seasons', input.seasonId, 'pantrySales', saleId);
        await updateDoc(saleRef, { apaEntryId: apaResult.data.id });
      } catch (linkError) {
        // Log but don't fail - sale and APA entry were created successfully
        logger.warn('Failed to link APA entry to sale:', linkError);
      }
    }

    const sale: PantrySale = {
      id: saleId,
      seasonId: input.seasonId,
      pantryItemId: input.pantryItemId,
      pantryItemName: item.name,
      bookingId: input.bookingId,
      quantity: input.quantity,
      sellingPrice: item.sellingPrice,
      totalAmount,
      apaEntryId: apaResult.data?.id,
      createdBy: input.createdBy,
      createdAt: Timestamp.now(),
    };

    return { success: true, data: sale };
  } catch (error) {
    logger.error('Error creating pantry sale:', error);
    return { success: false, error: PANTRY_ERRORS.saleFailed };
  }
}

/**
 * Get all sales for a season
 */
export async function getSeasonSales(
  seasonId: string
): Promise<ServiceResult<PantrySale[]>> {
  try {
    const snapshot = await getDocs(getSalesCollection(seasonId));
    const sales: PantrySale[] = [];

    snapshot.forEach((docSnap) => {
      sales.push({
        id: docSnap.id,
        ...docSnap.data(),
      } as PantrySale);
    });

    // Sort by date descending
    sales.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);

    return { success: true, data: sales };
  } catch (error) {
    logger.error('Error getting pantry sales:', error);
    return { success: false, error: PANTRY_ERRORS.loadSalesFailed };
  }
}

/**
 * Get sales for a specific booking
 */
export async function getBookingSales(
  seasonId: string,
  bookingId: string
): Promise<ServiceResult<PantrySale[]>> {
  try {
    const q = query(
      getSalesCollection(seasonId),
      where('bookingId', '==', bookingId)
    );

    const snapshot = await getDocs(q);
    const sales: PantrySale[] = [];

    snapshot.forEach((docSnap) => {
      sales.push({
        id: docSnap.id,
        ...docSnap.data(),
      } as PantrySale);
    });

    return { success: true, data: sales };
  } catch (error) {
    logger.error('Error getting booking sales:', error);
    return { success: false, error: PANTRY_ERRORS.loadSalesFailed };
  }
}

/**
 * Get sales for a specific item
 */
export async function getItemSales(
  seasonId: string,
  pantryItemId: string
): Promise<ServiceResult<PantrySale[]>> {
  try {
    const q = query(
      getSalesCollection(seasonId),
      where('pantryItemId', '==', pantryItemId)
    );

    const snapshot = await getDocs(q);
    const sales: PantrySale[] = [];

    snapshot.forEach((docSnap) => {
      sales.push({
        id: docSnap.id,
        ...docSnap.data(),
      } as PantrySale);
    });

    // Sort by date descending
    sales.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);

    return { success: true, data: sales };
  } catch (error) {
    logger.error('Error getting item sales:', error);
    return { success: false, error: PANTRY_ERRORS.loadSalesFailed };
  }
}

// ============ Financial Calculations ============

/**
 * Calculate pantry financials for a season
 */
export async function calculateFinancials(
  seasonId: string,
  crewMembers: CrewMember[]
): Promise<ServiceResult<PantryFinancials>> {
  try {
    const [itemsResult, salesResult] = await Promise.all([
      getSeasonPantryItems(seasonId),
      getSeasonSales(seasonId),
    ]);

    if (!itemsResult.success || !itemsResult.data) {
      return { success: false, error: itemsResult.error };
    }
    if (!salesResult.success || !salesResult.data) {
      return { success: false, error: salesResult.error };
    }

    const items = itemsResult.data;
    const sales = salesResult.data;

    // Calculate totals
    let totalInvested = 0;
    let totalSold = 0;
    let costOfSold = 0;
    let remainingStockValue = 0;

    // Track per-item sold quantities
    const soldByItem: Record<string, number> = {};
    sales.forEach((sale) => {
      soldByItem[sale.pantryItemId] = (soldByItem[sale.pantryItemId] || 0) + sale.quantity;
      totalSold += sale.totalAmount;
    });

    // Calculate per-crew investments and returns
    const crewFinancials: Record<string, CrewPantryFinancials> = {};

    // Initialize crew financials
    crewMembers.forEach((crew) => {
      crewFinancials[crew.id] = {
        crewId: crew.id,
        crewName: crew.name,
        invested: 0,
        returnedCapital: 0,
        profit: 0,
        totalReturn: 0,
        remainingInvestment: 0,
      };
    });

    items.forEach((item) => {
      const itemTotalInvested = item.originalQuantity * item.purchasePrice;
      totalInvested += itemTotalInvested;

      const itemSoldQty = soldByItem[item.id] || 0;
      const itemCostOfSold = itemSoldQty * item.purchasePrice;
      costOfSold += itemCostOfSold;

      const itemProfitFromSold = itemSoldQty * (item.sellingPrice - item.purchasePrice);
      const itemRemainingValue = item.quantity * item.purchasePrice;
      remainingStockValue += itemRemainingValue;

      // Distribute to investors proportionally
      if (itemTotalInvested > 0) {
        item.investors.forEach((investor) => {
          if (!crewFinancials[investor.userId]) {
            // Investor might not be in current crew (left season)
            return;
          }

          const investorShare = investor.amount / itemTotalInvested;
          crewFinancials[investor.userId].invested += investor.amount;
          crewFinancials[investor.userId].returnedCapital += itemCostOfSold * investorShare;
          crewFinancials[investor.userId].profit += itemProfitFromSold * investorShare;
          crewFinancials[investor.userId].remainingInvestment += itemRemainingValue * investorShare;
        });
      }
    });

    // Calculate total returns and round values
    Object.values(crewFinancials).forEach((cf) => {
      cf.totalReturn = cf.returnedCapital + cf.profit;
      // Round to 2 decimal places
      cf.invested = Math.round(cf.invested * 100) / 100;
      cf.returnedCapital = Math.round(cf.returnedCapital * 100) / 100;
      cf.profit = Math.round(cf.profit * 100) / 100;
      cf.totalReturn = Math.round(cf.totalReturn * 100) / 100;
      cf.remainingInvestment = Math.round(cf.remainingInvestment * 100) / 100;
    });

    const profit = totalSold - costOfSold;

    const financials: PantryFinancials = {
      totalInvested: Math.round(totalInvested * 100) / 100,
      totalSold: Math.round(totalSold * 100) / 100,
      costOfSold: Math.round(costOfSold * 100) / 100,
      profit: Math.round(profit * 100) / 100,
      remainingStockValue: Math.round(remainingStockValue * 100) / 100,
      perCrew: Object.values(crewFinancials).filter((cf) => cf.invested > 0),
    };

    return { success: true, data: financials };
  } catch (error) {
    logger.error('Error calculating pantry financials:', error);
    return { success: false, error: PANTRY_ERRORS.financialsFailed };
  }
}

// ============ Season Transfer ============

/**
 * Transfer remaining pantry items to a new season
 */
export async function transferToNewSeason(
  fromSeasonId: string,
  toSeasonId: string,
  userId: string
): Promise<ServiceResult<number>> {
  try {
    const itemsResult = await getSeasonPantryItems(fromSeasonId);
    if (!itemsResult.success || !itemsResult.data) {
      return { success: false, error: itemsResult.error };
    }

    const itemsToTransfer = itemsResult.data.filter((item) => item.quantity > 0);
    let transferred = 0;

    for (const item of itemsToTransfer) {
      await createPantryItem({
        seasonId: toSeasonId,
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        purchasePrice: item.purchasePrice,
        markupPercent: item.markupPercent,
        investors: item.investors,
        createdBy: userId,
      });
      transferred++;
    }

    return { success: true, data: transferred };
  } catch (error) {
    logger.error('Error transferring pantry items:', error);
    return { success: false, error: PANTRY_ERRORS.transferFailed };
  }
}
