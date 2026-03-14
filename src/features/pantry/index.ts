/**
 * Pantry Feature
 *
 * Crew inventory management for wine, spirits, etc.
 * Handles items, sales, and financial tracking.
 */

// Types
export * from './types';

// Components
export * from './components';

// Hook
export { usePantry } from './hooks/usePantry';

// Service (for direct access if needed)
export * as pantryService from './services/pantryService';
export { calculateSellingPrice, PANTRY_ERRORS } from './services/pantryService';
