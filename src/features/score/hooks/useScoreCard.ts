/**
 * useScoreCard Hook
 *
 * Manages score card state for a booking.
 * Provides score entries, leaderboard, and add functionality.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { logger } from '../../../utils/logger';
import {
  getBookingScoreEntries,
  getBookingLeaderboard,
  createScoreEntry,
  type CreateScoreEntryInput,
} from '../services/scoreService';
import type {
  ScoreEntry,
  BookingScoreSummary,
  ScorePoints,
  User,
} from '../../../types/models';

interface UseScoreCardOptions {
  bookingId: string;
  crewMembers: User[];
  currentUserId: string;
  isCaptain: boolean;
}

interface UseScoreCardReturn {
  // Data
  entries: ScoreEntry[];
  leaderboard: BookingScoreSummary[];

  // State
  loading: boolean;
  error: string | null;
  isAdding: boolean;

  // Actions
  addScore: (
    toUserId: string,
    points: ScorePoints,
    reason?: string
  ) => Promise<boolean>;
  refresh: () => Promise<void>;

  // Computed
  canAddScore: boolean;
  topScorer: BookingScoreSummary | null;
  lowestScorer: BookingScoreSummary | null;
}

export function useScoreCard({
  bookingId,
  crewMembers,
  currentUserId,
  isCaptain,
}: UseScoreCardOptions): UseScoreCardReturn {
  const [entries, setEntries] = useState<ScoreEntry[]>([]);
  const [leaderboard, setLeaderboard] = useState<BookingScoreSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Load data
  const loadData = useCallback(async () => {
    if (!bookingId) return;

    setLoading(true);
    setError(null);

    try {
      // Load entries and leaderboard in parallel
      const [entriesResult, leaderboardResult] = await Promise.all([
        getBookingScoreEntries(bookingId),
        getBookingLeaderboard(bookingId, crewMembers),
      ]);

      if (entriesResult.success && entriesResult.data) {
        setEntries(entriesResult.data);
      } else {
        setError(entriesResult.error || 'Failed to load score entries');
      }

      if (leaderboardResult.success && leaderboardResult.data) {
        setLeaderboard(leaderboardResult.data);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      logger.error('Error loading score card data:', err);
    } finally {
      setLoading(false);
    }
  }, [bookingId, crewMembers]);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Add score entry (captain only)
  const addScore = useCallback(
    async (
      toUserId: string,
      points: ScorePoints,
      reason?: string
    ): Promise<boolean> => {
      if (!isCaptain) {
        setError('Only captains can add score entries');
        return false;
      }

      setIsAdding(true);
      setError(null);

      try {
        const input: CreateScoreEntryInput = {
          bookingId,
          toUserId,
          points,
          reason,
          fromUserId: currentUserId,
        };

        const result = await createScoreEntry(input);

        if (result.success) {
          // Refresh data after adding
          await loadData();
          return true;
        } else {
          setError(result.error || 'Failed to add score');
          return false;
        }
      } catch (err) {
        setError('An unexpected error occurred');
        logger.error('Error adding score:', err);
        return false;
      } finally {
        setIsAdding(false);
      }
    },
    [bookingId, currentUserId, isCaptain, loadData]
  );

  // Computed values
  const canAddScore = isCaptain;

  const topScorer = useMemo(() => {
    if (leaderboard.length === 0) return null;
    return leaderboard[0];
  }, [leaderboard]);

  const lowestScorer = useMemo(() => {
    if (leaderboard.length === 0) return null;
    // Find crew member with lowest score (could be negative)
    const sorted = [...leaderboard].sort(
      (a, b) => a.totalPoints - b.totalPoints
    );
    return sorted[0];
  }, [leaderboard]);

  return {
    entries,
    leaderboard,
    loading,
    error,
    isAdding,
    addScore,
    refresh: loadData,
    canAddScore,
    topScorer,
    lowestScorer,
  };
}
