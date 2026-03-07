/**
 * Income Feature
 *
 * Personal income tracking for crew members.
 * PRIVATE: Each user can only access their own income data.
 *
 * Features:
 * - Configure daily rates (guest/non-guest days)
 * - Track work days manually or auto-detect from bookings
 * - View earnings summary per season
 */

// Types
export type {
  IncomeSettings,
  IncomeSettingsInput,
  WorkDay,
  WorkDayInput,
  WorkDayType,
  IncomeSummary,
  IncomeState,
  SuggestedWorkDay,
} from './types';
export { EMPTY_SUMMARY } from './types';

// Hooks
export { useIncome } from './hooks/useIncome';

// Store
export { useIncomeStore } from './stores/incomeStore';

// Services
export {
  getIncomeSettings,
  saveIncomeSettings,
  getWorkDays,
  addWorkDay,
  deleteWorkDay,
  workDayExistsForDate,
  calculateSummary,
  recalculateWorkDayEarnings,
  getSuggestedWorkDays,
} from './services/incomeService';
