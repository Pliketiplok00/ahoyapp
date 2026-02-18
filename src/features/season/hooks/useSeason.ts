/**
 * useSeason Hook
 *
 * Hook for managing the current season and related operations.
 */

import { useEffect, useCallback } from 'react';
import { useSeasonStore } from '../../../stores/seasonStore';
import { useAuthStore } from '../../../stores/authStore';
import { seasonService } from '../services/seasonService';
import type { CreateSeasonData, CreateInviteData } from '../types';

/**
 * Hook for current season management
 */
export function useSeason() {
  const {
    currentSeasonId,
    currentSeason,
    crewMembers,
    pendingInvites,
    isLoading,
    error,
    setCurrentSeasonId,
    setCurrentSeason,
    setCrewMembers,
    setPendingInvites,
    setLoading,
    setError,
    isCaptain,
    isEditor,
    getCrewMember,
  } = useSeasonStore();

  const { firebaseUser } = useAuthStore();
  const userId = firebaseUser?.uid;

  // Subscribe to current season
  useEffect(() => {
    if (!currentSeasonId) {
      setCurrentSeason(null);
      setCrewMembers([]);
      setPendingInvites([]);
      return;
    }

    setLoading(true);

    // Subscribe to season data
    const unsubscribeSeason = seasonService.subscribeToSeason(
      currentSeasonId,
      (season) => {
        setCurrentSeason(season);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    // Subscribe to crew members
    const unsubscribeCrew = seasonService.subscribeToCrewMembers(
      currentSeasonId,
      setCrewMembers,
      (err) => setError(err.message)
    );

    // Subscribe to pending invites
    const unsubscribeInvites = seasonService.subscribeToPendingInvites(
      currentSeasonId,
      setPendingInvites,
      (err) => setError(err.message)
    );

    return () => {
      unsubscribeSeason();
      unsubscribeCrew();
      unsubscribeInvites();
    };
  }, [currentSeasonId, setCurrentSeason, setCrewMembers, setPendingInvites, setLoading, setError]);

  /**
   * Create a new season (boat workspace)
   */
  const createSeason = useCallback(
    async (data: CreateSeasonData) => {
      setLoading(true);
      setError(null);

      const result = await seasonService.createSeason(data);

      if (result.success && result.seasonId) {
        setCurrentSeasonId(result.seasonId);
      } else {
        setError(result.error || 'Failed to create season');
      }

      setLoading(false);
      return result;
    },
    [setCurrentSeasonId, setLoading, setError]
  );

  /**
   * Join a season using invite code
   */
  const joinSeason = useCallback(
    async (inviteCode: string) => {
      setLoading(true);
      setError(null);

      const result = await seasonService.acceptInvite(inviteCode);

      if (result.success && result.seasonId) {
        setCurrentSeasonId(result.seasonId);
      } else {
        setError(result.error || 'Failed to join season');
      }

      setLoading(false);
      return result;
    },
    [setCurrentSeasonId, setLoading, setError]
  );

  /**
   * Update current season
   */
  const updateSeason = useCallback(
    async (data: Partial<CreateSeasonData>) => {
      if (!currentSeasonId) {
        return { success: false, error: 'No season selected' };
      }

      setLoading(true);
      setError(null);

      const result = await seasonService.updateSeason(currentSeasonId, data);

      if (!result.success) {
        setError(result.error || 'Failed to update season');
      }

      setLoading(false);
      return result;
    },
    [currentSeasonId, setLoading, setError]
  );

  /**
   * Send invite to a crew member
   */
  const sendInvite = useCallback(
    async (data: CreateInviteData) => {
      if (!currentSeasonId) {
        return { success: false, error: 'No season selected' };
      }

      const result = await seasonService.createInvite(currentSeasonId, data);

      if (!result.success) {
        setError(result.error || 'Failed to send invite');
      }

      return result;
    },
    [currentSeasonId, setError]
  );

  /**
   * Delete a pending invite
   */
  const deleteInvite = useCallback(
    async (inviteId: string) => {
      if (!currentSeasonId) {
        return { success: false, error: 'No season selected' };
      }

      return seasonService.deleteInvite(currentSeasonId, inviteId);
    },
    [currentSeasonId]
  );

  /**
   * Remove a crew member
   */
  const removeCrewMember = useCallback(
    async (memberId: string) => {
      if (!currentSeasonId) {
        return { success: false, error: 'No season selected' };
      }

      return seasonService.removeCrewMember(currentSeasonId, memberId);
    },
    [currentSeasonId]
  );

  /**
   * Load available seasons for current user
   */
  const loadUserSeasons = useCallback(async () => {
    setLoading(true);
    const seasons = await seasonService.getUserSeasons();
    setLoading(false);
    return seasons;
  }, [setLoading]);

  /**
   * Select a season
   */
  const selectSeason = useCallback(
    (seasonId: string) => {
      setCurrentSeasonId(seasonId);
    },
    [setCurrentSeasonId]
  );

  /**
   * Check if current user is captain
   */
  const isCurrentUserCaptain = userId ? isCaptain(userId) : false;

  /**
   * Check if current user is editor
   */
  const isCurrentUserEditor = userId ? isEditor(userId) : false;

  /**
   * Get current user's crew member data
   */
  const currentUserCrew = userId ? getCrewMember(userId) : undefined;

  return {
    // State
    currentSeasonId,
    currentSeason,
    crewMembers,
    pendingInvites,
    isLoading,
    error,

    // User status
    isCurrentUserCaptain,
    isCurrentUserEditor,
    currentUserCrew,

    // Actions
    createSeason,
    joinSeason,
    updateSeason,
    sendInvite,
    deleteInvite,
    removeCrewMember,
    loadUserSeasons,
    selectSeason,

    // Helpers
    isCaptain,
    isEditor,
    getCrewMember,
  };
}
