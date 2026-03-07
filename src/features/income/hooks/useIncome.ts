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
  // Use selectors to get stable references (prevents infinite loop!)
  const settings = useIncomeStore((state) => state.settings);
  const workDays = useIncomeStore((state) => state.workDays);
  const summary = useIncomeStore((state) => state.summary);
  const isLoading = useIncomeStore((state) => state.isLoading);
  const error = useIncomeStore((state) => state.error);

  // Get stable action references
  const setSettings = useIncomeStore((state) => state.setSettings);
  const setWorkDays = useIncomeStore((state) => state.setWorkDays);
  const addWorkDayToStore = useIncomeStore((state) => state.addWorkDay);
  const removeWorkDay = useIncomeStore((state) => state.removeWorkDay);
  const setSummary = useIncomeStore((state) => state.setSummary);
  const setLoading = useIncomeStore((state) => state.setLoading);
  const setError = useIncomeStore((state) => state.setError);
  const reset = useIncomeStore((state) => state.reset);

  /**
   * Fetch settings and work days
   */
  const fetchData = useCallback(async () => {
    if (!userId || !seasonId) {
      reset();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch settings and work days in parallel
      const [settingsResult, workDaysResult] = await Promise.all([
        incomeService.getIncomeSettings(userId, seasonId),
        incomeService.getWorkDays(userId, seasonId),
      ]);

      if (settingsResult.success) {
        setSettings(settingsResult.data || null);
      }

      if (workDaysResult.success && workDaysResult.data) {
        setWorkDays(workDaysResult.data);

        // Calculate summary
        const calculatedSummary = incomeService.calculateSummary(
          workDaysResult.data,
          settingsResult.data || null
        );
        setSummary(calculatedSummary);
      }

      if (!settingsResult.success || !workDaysResult.success) {
        setError('Greška pri učitavanju podataka');
      }
    } catch (err) {
      setError('Greška pri učitavanju podataka');
    }

    setLoading(false);
  }, [userId, seasonId, reset, setLoading, setError, setSettings, setWorkDays, setSummary]);

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
        setSettings(result.data);

        // Recalculate earnings with new rates
        const updatedWorkDays = incomeService.recalculateWorkDayEarnings(
          workDays,
          result.data
        );
        setWorkDays(updatedWorkDays);

        // Recalculate summary
        const calculatedSummary = incomeService.calculateSummary(updatedWorkDays, result.data);
        setSummary(calculatedSummary);
      }

      return {
        success: result.success,
        error: result.error,
      };
    },
    [userId, seasonId, workDays, setSettings, setWorkDays, setSummary]
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

      const result = await incomeService.addWorkDay(fullInput, settings);

      if (result.success && result.data) {
        addWorkDayToStore(result.data);

        // Recalculate summary
        const newWorkDays = [result.data, ...workDays];
        const calculatedSummary = incomeService.calculateSummary(newWorkDays, settings);
        setSummary(calculatedSummary);
      }

      return {
        success: result.success,
        error: result.error,
      };
    },
    [userId, seasonId, settings, workDays, addWorkDayToStore, setSummary]
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
        removeWorkDay(workDayId);

        // Recalculate summary
        const newWorkDays = workDays.filter((wd) => wd.id !== workDayId);
        const calculatedSummary = incomeService.calculateSummary(newWorkDays, settings);
        setSummary(calculatedSummary);
      }

      return {
        success: result.success,
        error: result.error,
      };
    },
    [userId, workDays, settings, removeWorkDay, setSummary]
  );

  return {
    settings,
    workDays,
    summary,
    isLoading,
    error,
    refresh: fetchData,
    saveSettings,
    addWorkDay,
    deleteWorkDay,
  };
}
