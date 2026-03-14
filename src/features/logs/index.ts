/**
 * Logs Feature
 *
 * Three log types under one tab:
 * - Defect Log (captain only)
 * - Wish List (all crew)
 * - Storage Map (per-user with visibility)
 */

// Types
export * from './types';

// Hooks
export { useDefectLog } from './hooks/useDefectLog';
export type { UseDefectLogReturn } from './hooks/useDefectLog';

export { useWishList } from './hooks/useWishList';
export type { UseWishListReturn } from './hooks/useWishList';

export { useStorageMap } from './hooks/useStorageMap';
export type { UseStorageMapReturn } from './hooks/useStorageMap';

// Services (typically not exported, but available for direct use if needed)
export * as defectLogService from './services/defectLogService';
export * as wishListService from './services/wishListService';
export * as storageMapService from './services/storageMapService';
