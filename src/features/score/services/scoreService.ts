/**
 * Score Service
 *
 * Firestore CRUD operations for crew score entries.
 * Handles score entry creation, queries, and statistics.
 */

import { logger } from '../../../utils/logger';
import {
  collection,
  doc,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../../config/firebase';
import type {
  ScoreEntry,
  ScorePoints,
  BookingScoreSummary,
  SeasonScoreStats,
  User,
} from '../../../types/models';

// Collection reference
const SCORE_ENTRIES_COLLECTION = 'scoreEntries';

/**
 * Result type for service operations
 */
interface ServiceResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Input for creating a new score entry
 */
export interface CreateScoreEntryInput {
  bookingId: string;
  toUserId: string;
  points: ScorePoints;
  reason?: string;
  fromUserId: string; // Captain
}

/**
 * Create a new score entry
 */
export async function createScoreEntry(
  input: CreateScoreEntryInput
): Promise<ServiceResult<ScoreEntry>> {
  try {
    const entryData = {
      bookingId: input.bookingId,
      toUserId: input.toUserId,
      points: input.points,
      reason: input.reason || '',
      fromUserId: input.fromUserId,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(
      collection(db, SCORE_ENTRIES_COLLECTION),
      entryData
    );

    return {
      success: true,
      data: {
        id: docRef.id,
        ...entryData,
        createdAt: Timestamp.now(),
      } as ScoreEntry,
    };
  } catch (error) {
    logger.error('Error creating score entry:', error);
    return {
      success: false,
      error: 'Failed to add score entry. Please try again.',
    };
  }
}

/**
 * Get all score entries for a booking
 */
export async function getBookingScoreEntries(
  bookingId: string
): Promise<ServiceResult<ScoreEntry[]>> {
  try {
    const q = query(
      collection(db, SCORE_ENTRIES_COLLECTION),
      where('bookingId', '==', bookingId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const entries: ScoreEntry[] = [];

    querySnapshot.forEach((doc) => {
      entries.push({
        id: doc.id,
        ...doc.data(),
      } as ScoreEntry);
    });

    return {
      success: true,
      data: entries,
    };
  } catch (error) {
    logger.error('Error getting booking score entries:', error);
    return {
      success: false,
      error: 'Failed to load score entries',
    };
  }
}

/**
 * Get score leaderboard for a booking
 */
export async function getBookingLeaderboard(
  bookingId: string,
  crewMembers: User[]
): Promise<ServiceResult<BookingScoreSummary[]>> {
  try {
    const entriesResult = await getBookingScoreEntries(bookingId);
    if (!entriesResult.success || !entriesResult.data) {
      return { success: false, error: entriesResult.error };
    }

    const entries = entriesResult.data;

    // Calculate totals per user
    const userScores = new Map<
      string,
      { totalPoints: number; entryCount: number }
    >();

    for (const entry of entries) {
      const current = userScores.get(entry.toUserId) || {
        totalPoints: 0,
        entryCount: 0,
      };
      userScores.set(entry.toUserId, {
        totalPoints: current.totalPoints + entry.points,
        entryCount: current.entryCount + 1,
      });
    }

    // Build leaderboard with user info
    const leaderboard: BookingScoreSummary[] = [];

    for (const member of crewMembers) {
      const scores = userScores.get(member.id) || {
        totalPoints: 0,
        entryCount: 0,
      };
      leaderboard.push({
        userId: member.id,
        userName: member.name,
        userColor: member.color,
        totalPoints: scores.totalPoints,
        entryCount: scores.entryCount,
      });
    }

    // Sort by total points descending
    leaderboard.sort((a, b) => b.totalPoints - a.totalPoints);

    return {
      success: true,
      data: leaderboard,
    };
  } catch (error) {
    logger.error('Error getting booking leaderboard:', error);
    return {
      success: false,
      error: 'Failed to load leaderboard',
    };
  }
}

/**
 * Get all score entries for a season (across all bookings)
 */
export async function getSeasonScoreEntries(
  bookingIds: string[]
): Promise<ServiceResult<ScoreEntry[]>> {
  try {
    if (bookingIds.length === 0) {
      return { success: true, data: [] };
    }

    // Firestore 'in' queries are limited to 30 items
    const batchSize = 30;
    const allEntries: ScoreEntry[] = [];

    for (let i = 0; i < bookingIds.length; i += batchSize) {
      const batch = bookingIds.slice(i, i + batchSize);
      const q = query(
        collection(db, SCORE_ENTRIES_COLLECTION),
        where('bookingId', 'in', batch),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        allEntries.push({
          id: doc.id,
          ...doc.data(),
        } as ScoreEntry);
      });
    }

    return {
      success: true,
      data: allEntries,
    };
  } catch (error) {
    logger.error('Error getting season score entries:', error);
    return {
      success: false,
      error: 'Failed to load season scores',
    };
  }
}

/**
 * Calculate season-wide score statistics
 */
export async function getSeasonScoreStats(
  bookingIds: string[],
  crewMembers: User[]
): Promise<ServiceResult<SeasonScoreStats>> {
  try {
    if (bookingIds.length === 0 || crewMembers.length === 0) {
      return {
        success: true,
        data: {
          crewTotals: [],
          trophyHolder: undefined,
          hornsHolder: undefined,
        },
      };
    }

    const entriesResult = await getSeasonScoreEntries(bookingIds);
    if (!entriesResult.success || !entriesResult.data) {
      return { success: false, error: entriesResult.error };
    }

    const entries = entriesResult.data;

    // Group entries by booking
    const entriesByBooking = new Map<string, ScoreEntry[]>();
    for (const entry of entries) {
      const current = entriesByBooking.get(entry.bookingId) || [];
      current.push(entry);
      entriesByBooking.set(entry.bookingId, current);
    }

    // Calculate per-booking winners and losers
    const userWins = new Map<string, number>();
    const userLosses = new Map<string, number>();
    const userTotals = new Map<string, number>();

    for (const [, bookingEntries] of entriesByBooking) {
      // Calculate totals for this booking
      const bookingTotals = new Map<string, number>();
      for (const entry of bookingEntries) {
        const current = bookingTotals.get(entry.toUserId) || 0;
        bookingTotals.set(entry.toUserId, current + entry.points);

        // Add to overall totals
        const overall = userTotals.get(entry.toUserId) || 0;
        userTotals.set(entry.toUserId, overall + entry.points);
      }

      // Find winner and loser for this booking
      let maxPoints = -Infinity;
      let minPoints = Infinity;
      let winner: string | undefined;
      let loser: string | undefined;

      for (const [userId, points] of bookingTotals) {
        if (points > maxPoints) {
          maxPoints = points;
          winner = userId;
        }
        if (points < minPoints) {
          minPoints = points;
          loser = userId;
        }
      }

      if (winner) {
        userWins.set(winner, (userWins.get(winner) || 0) + 1);
      }
      if (loser && loser !== winner) {
        userLosses.set(loser, (userLosses.get(loser) || 0) + 1);
      }
    }

    // Build crew totals array
    const crewTotals = crewMembers.map((member) => ({
      userId: member.id,
      userName: member.name,
      userColor: member.color,
      totalPoints: userTotals.get(member.id) || 0,
      bookingWins: userWins.get(member.id) || 0,
      bookingLosses: userLosses.get(member.id) || 0,
    }));

    // Sort by total points descending
    crewTotals.sort((a, b) => b.totalPoints - a.totalPoints);

    // Find trophy holder (most wins) and horns holder (most losses)
    let maxWins = 0;
    let maxLosses = 0;
    let trophyHolder: string | undefined;
    let hornsHolder: string | undefined;

    for (const crew of crewTotals) {
      if (crew.bookingWins > maxWins) {
        maxWins = crew.bookingWins;
        trophyHolder = crew.userId;
      }
      if (crew.bookingLosses > maxLosses) {
        maxLosses = crew.bookingLosses;
        hornsHolder = crew.userId;
      }
    }

    return {
      success: true,
      data: {
        crewTotals,
        trophyHolder,
        hornsHolder,
      },
    };
  } catch (error) {
    logger.error('Error getting season score stats:', error);
    return {
      success: false,
      error: 'Failed to calculate season statistics',
    };
  }
}
