/**
 * Season Store
 *
 * Zustand store for managing current season state.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Season, CrewMember, SeasonInvite } from '../features/season/types';

interface SeasonStore {
  // State
  currentSeasonId: string | null;
  currentSeason: Season | null;
  crewMembers: CrewMember[];
  pendingInvites: SeasonInvite[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setCurrentSeasonId: (seasonId: string | null) => void;
  setCurrentSeason: (season: Season | null) => void;
  setCrewMembers: (crew: CrewMember[]) => void;
  setPendingInvites: (invites: SeasonInvite[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;

  // Computed helpers
  isCaptain: (userId: string) => boolean;
  isEditor: (userId: string) => boolean;
  getCrewMember: (userId: string) => CrewMember | undefined;
}

const initialState = {
  currentSeasonId: null,
  currentSeason: null,
  crewMembers: [],
  pendingInvites: [],
  isLoading: false,
  error: null,
};

export const useSeasonStore = create<SeasonStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setCurrentSeasonId: (seasonId) => set({ currentSeasonId: seasonId }),
      setCurrentSeason: (season) => set({ currentSeason: season }),
      setCrewMembers: (crew) => set({ crewMembers: crew }),
      setPendingInvites: (invites) => set({ pendingInvites: invites }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      reset: () => set(initialState),

      isCaptain: (userId) => {
        const crew = get().crewMembers.find((c) => c.id === userId);
        return crew?.roles.includes('captain') ?? false;
      },

      isEditor: (userId) => {
        const crew = get().crewMembers.find((c) => c.id === userId);
        return crew?.roles.includes('editor') ?? false;
      },

      getCrewMember: (userId) => {
        return get().crewMembers.find((c) => c.id === userId);
      },
    }),
    {
      name: 'ahoy-season-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        currentSeasonId: state.currentSeasonId,
      }),
    }
  )
);
