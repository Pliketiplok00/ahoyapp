/**
 * useIncome Hook
 *
 * Manages personal income data for the current user and season.
 * PRIVATE: Only fetches and displays current user's data.
 */

import { useEffect, useCallback } from 'react';
import { useIncomeStore } from '../stores/incomeStore';
import * as incomeService from '../services/incomeService';
import type {
  IncomeSettings,
  IncomeSettingsInput,
  WorkDay,
  WorkDayInput,
  IncomeSummary,
} from '../types';
import { EMPTY_SUMMARY } from '../types';

interface UseIncomeReturn {
  // Data
  settings: IncomeSettings | null;
  workDays: WorkDay[];
  summary: IncomeSummary;

  // State
  isLoading: boolean;
  error: string | null;

  // Actions
  refresh: () => Promise<void>;
  saveSettings: (guestDayRate: number, nonGuestDayRate: number) => Promise<{ success: boolean; error?: string }>;
  addWorkDay: (input: Omit<WorkDayInput, 'userId' | 'seasonId'>) => Promise<{ success: boolean; error?: string }>;
  deleteWorkDay: (workDayId: string) => Promise<{ success: boolean; error?: string }>;
}

export function useIncome(
  userId: string | undefined,
  seasonId: string | undefined
): UseIncomeReturn {
  const store = useIncomeStore();

  /**
   * Fetch settings and work days
   */
  const fetchData = useCallback(async () => {
    if (!userId || !seasonId) {
      store.reset();
      return;
    }

    store.setLoading(true);
    store.setError(null);

    try {
      // Fetch settings and work days in parallel
      const [settingsResult, workDaysResult] = await Promise.all([
        incomeService.getIncomeSettings(userId, seasonId),
        incomeService.getWorkDays(userId, seasonId),
      ]);

      if (settingsResult.success) {
        store.setSettings(settingsResult.data || null);
      }

      if (workDaysResult.success && workDaysResult.data) {
        store.setWorkDays(workDaysResult.data);

        // Calculate summary
        const summary = incomeService.calculateSummary(
          workDaysResult.data,
          settingsResult.data || null
        );
        store.setSummary(summary);
      }

      if (!settingsResult.success || !workDaysResult.success) {
        store.setError('Greška pri učitavanju podataka');
      }
    } catch (error) {
      store.setError('Greška pri učitavanju podataka');
    }

    store.setLoading(false);
  }, [userId, seasonId, store]);

  // Fetch on mount and when user/season changes
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /**
   * Save income settings
   */
  const saveSettings = useCallback(
    async (guestDayRate: number, nonGuestDayRate: number) => {
      if (!userId || !seasonId) {
        return { success: false, error: 'Korisnik nije prijavljen' };
      }

      const input: IncomeSettingsInput = {
        userId,
        seasonId,
        guestDayRate,
        nonGuestDayRate,
      };

      const result = await incomeService.saveIncomeSettings(input);

      if (result.success && result.data) {
        store.setSettings(result.data);

        // Recalculate earnings with new rates
        const updatedWorkDays = incomeService.recalculateWorkDayEarnings(
          store.workDays,
          result.data
        );
        store.setWorkDays(updatedWorkDays);

        // Recalculate summary
        const summary = incomeService.calculateSummary(updatedWorkDays, result.data);
        store.setSummary(summary);
      }

      return {
        success: result.success,
        error: result.error,
      };
    },
    [userId, seasonId, store]
  );

  /**
   * Add a work day
   */
  const addWorkDay = useCallback(
    async (input: Omit<WorkDayInput, 'userId' | 'seasonId'>) => {
      if (!userId || !seasonId) {
        return { success: false, error: 'Korisnik nije prijavljen' };
      }

      const fullInput: WorkDayInput = {
        ...input,
        userId,
        seasonId,
      };

      const result = await incomeService.addWorkDay(fullInput, store.settings);

      if (result.success && result.data) {
        store.addWorkDay(result.data);

        // Recalculate summary
        const newWorkDays = [result.data, ...store.workDays];
        const summary = incomeService.calculateSummary(newWorkDays, store.settings);
        store.setSummary(summary);
      }

      return {
        success: result.success,
        error: result.error,
      };
    },
    [userId, seasonId, store]
  );

  /**
   * Delete a work day
   */
  const deleteWorkDay = useCallback(
    async (workDayId: string) => {
      if (!userId) {
        return { success: false, error: 'Korisnik nije prijavljen' };
      }

      const result = await incomeService.deleteWorkDay(userId, workDayId);

      if (result.success) {
        store.removeWorkDay(workDayId);

        // Recalculate summary
        const newWorkDays = store.workDays.filter((wd) => wd.id !== workDayId);
        const summary = incomeService.calculateSummary(newWorkDays, store.settings);
        store.setSummary(summary);
      }

      return {
        success: result.success,
        error: result.error,
      };
    },
    [userId, store]
  );

  return {
    settings: store.settings,
    workDays: store.workDays,
    summary: store.summary,
    isLoading: store.isLoading,
    error: store.error,
    refresh: fetchData,
    saveSettings,
    addWorkDay,
    deleteWorkDay,
  };
}
