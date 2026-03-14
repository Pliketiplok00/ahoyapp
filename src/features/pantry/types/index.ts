/**
 * Pantry Types
 *
 * Type definitions for crew pantry (inventory management).
 * Items are shared per season, sales create expenses.
 */

import type { Timestamp } from '../../../types/models';

// ============ Categories ============

export type PantryCategory = 'wine' | 'spirits' | 'beer' | 'other';

export const PANTRY_CATEGORIES: PantryCategory[] = ['wine', 'spirits', 'beer', 'other'];

// ============ Investor ============

/**
 * Tracks who invested in a pantry item and how much
 */
export interface PantryInvestor {
  userId: string;
  amount: number; // Total amount invested (€)
}

// ============ Pantry Item ============

/**
 * A pantry item (wine, spirits, etc.)
 */
export interface PantryItem {
  id: string;
  seasonId: string;
  name: string;
  category: PantryCategory;
  /** Current quantity in stock */
  quantity: number;
  /** Original quantity when added */
  originalQuantity: number;
  /** Purchase price per unit (€) */
  purchasePrice: number;
  /** Markup percentage (e.g., 25 for 25%) */
  markupPercent: number;
  /** Selling price per unit (€) - computed: purchasePrice * (1 + markupPercent/100) */
  sellingPrice: number;
  /** Who invested and how much */
  investors: PantryInvestor[];
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Input for creating a pantry item
 */
export interface CreatePantryItemInput {
  seasonId: string;
  name: string;
  category: PantryCategory;
  quantity: number;
  purchasePrice: number;
  markupPercent: number;
  investors: PantryInvestor[];
  createdBy: string;
}

/**
 * Input for updating a pantry item
 */
export interface UpdatePantryItemInput {
  name?: string;
  category?: PantryCategory;
  quantity?: number;
  purchasePrice?: number;
  markupPercent?: number;
  investors?: PantryInvestor[];
}

// ============ Pantry Sale ============

/**
 * A sale from pantry to a booking
 */
export interface PantrySale {
  id: string;
  seasonId: string;
  pantryItemId: string;
  pantryItemName: string; // Denormalized for historical record
  bookingId: string;
  /** Quantity sold */
  quantity: number;
  /** Selling price per unit at time of sale */
  sellingPrice: number;
  /** Total amount (quantity × sellingPrice) */
  totalAmount: number;
  /** Expense ID created for this sale */
  expenseId?: string;
  createdBy: string;
  createdAt: Timestamp;
}

/**
 * Input for creating a sale
 */
export interface CreatePantrySaleInput {
  seasonId: string;
  pantryItemId: string;
  bookingId: string;
  quantity: number;
  createdBy: string;
}

// ============ Financial Summary ============

/**
 * Per-crew member financial breakdown
 */
export interface CrewPantryFinancials {
  crewId: string;
  crewName: string;
  invested: number;
  returnedCapital: number; // Portion of cost of sold items
  profit: number; // Share of markup earned
  totalReturn: number; // returnedCapital + profit
  remainingInvestment: number; // Value of unsold items
}

/**
 * Season-wide pantry financials
 */
export interface PantryFinancials {
  totalInvested: number;
  totalSold: number;
  costOfSold: number;
  profit: number;
  remainingStockValue: number;
  perCrew: CrewPantryFinancials[];
}
