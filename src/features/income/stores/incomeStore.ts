/**
 * Income Store
 *
 * Zustand store for personal income state management.
 * PRIVATE: Stores only current user's income data.
 */

import { create } from 'zustand';
import type {
  IncomeSettings,
  WorkDay,
  IncomeSummary,
  IncomeState,
} from '../types';
import { EMPTY_SUMMARY } from '../types';

interface IncomeStore extends IncomeState {
  // Actions
  setSettings: (settings: IncomeSettings | null) => void;
  setWorkDays: (workDays: WorkDay[]) => void;
  addWorkDay: (workDay: WorkDay) => void;
  removeWorkDay: (workDayId: string) => void;
  setSummary: (summary: IncomeSummary) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState: IncomeState = {
  settings: null,
  workDays: [],
  summary: EMPTY_SUMMARY,
  isLoading: false,
  error: null,
};

export const useIncomeStore = create<IncomeStore>((set) => ({
  ...initialState,

  setSettings: (settings) => set({ settings }),

  setWorkDays: (workDays) => set({ workDays }),

  addWorkDay: (workDay) =>
    set((state) => ({
      workDays: [workDay, ...state.workDays],
    })),

  removeWorkDay: (workDayId) =>
    set((state) => ({
      workDays: state.workDays.filter((wd) => wd.id !== workDayId),
    })),

  setSummary: (summary) => set({ summary }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  reset: () => set(initialState),
}));
