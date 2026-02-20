/**
 * Score Service Tests
 *
 * Tests for score CRUD operations and statistics.
 * Uses mocked Firebase for unit testing.
 */

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

// Mock Firebase Firestore
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  addDoc: jest.fn(),
  getDocs: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  Timestamp: {
    fromDate: jest.fn((date: Date) => ({
      toDate: () => date,
      seconds: Math.floor(date.getTime() / 1000),
    })),
    now: jest.fn(() => ({
      toDate: () => new Date(),
      seconds: Math.floor(Date.now() / 1000),
    })),
  },
  serverTimestamp: jest.fn(() => ({ _serverTimestamp: true })),
}));

// Mock Firebase config
jest.mock('../../../config/firebase', () => ({
  db: {},
}));

// Import after mocks
import {
  createScoreEntry,
  getBookingScoreEntries,
  getBookingLeaderboard,
  getSeasonScoreEntries,
  getSeasonScoreStats,
} from './scoreService';
import type { User } from '../../../types/models';

// Helper to create mock Firestore doc
const createMockDoc = (id: string, data: Record<string, unknown>) => ({
  id,
  exists: () => true,
  data: () => data,
});

// Helper to create mock Firestore snapshot
const createMockSnapshot = (
  docs: Array<{ id: string; data: Record<string, unknown> }>
) => ({
  docs: docs.map(({ id, data }) => createMockDoc(id, data)),
  forEach: function (cb: (doc: ReturnType<typeof createMockDoc>) => void) {
    this.docs.forEach(cb);
  },
  empty: docs.length === 0,
});

// Mock crew members
const mockCrew: User[] = [
  {
    id: 'user1',
    email: 'marina@test.com',
    name: 'Marina',
    color: '#E85D3B',
    roles: ['captain'],
    seasonId: 's1',
    createdAt: { seconds: 0, nanoseconds: 0, toDate: () => new Date() },
  },
  {
    id: 'user2',
    email: 'marko@test.com',
    name: 'Marko',
    color: '#3B82F6',
    roles: ['crew'],
    seasonId: 's1',
    createdAt: { seconds: 0, nanoseconds: 0, toDate: () => new Date() },
  },
  {
    id: 'user3',
    email: 'ivan@test.com',
    name: 'Ivan',
    color: '#22C55E',
    roles: ['crew'],
    seasonId: 's1',
    createdAt: { seconds: 0, nanoseconds: 0, toDate: () => new Date() },
  },
];

// Mock score entry data
const mockEntryData = {
  bookingId: 'booking-1',
  toUserId: 'user2',
  points: 2,
  reason: 'Great job',
  fromUserId: 'user1',
  createdAt: { toDate: () => new Date(), seconds: Date.now() / 1000 },
};

describe('scoreService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (doc as jest.Mock).mockImplementation((...args) => ({
      id: args[args.length - 1] || 'mock-doc-id',
      path: args.join('/'),
    }));
    (collection as jest.Mock).mockImplementation((...args) => ({
      path: args.join('/'),
    }));
  });

  // ============ Create Score Entry ============

  describe('createScoreEntry', () => {
    it('creates score entry with correct data', async () => {
      const mockDocRef = { id: 'new-entry-id' };
      (addDoc as jest.Mock).mockResolvedValueOnce(mockDocRef);

      const input = {
        bookingId: 'booking-1',
        toUserId: 'user2',
        points: 2 as const,
        reason: 'Great work',
        fromUserId: 'user1',
      };

      const result = await createScoreEntry(input);

      expect(result.success).toBe(true);
      expect(result.data?.id).toBe('new-entry-id');
      expect(addDoc).toHaveBeenCalled();
    });

    it('creates entry without reason', async () => {
      const mockDocRef = { id: 'new-entry-id' };
      (addDoc as jest.Mock).mockResolvedValueOnce(mockDocRef);

      const input = {
        bookingId: 'booking-1',
        toUserId: 'user2',
        points: -1 as const,
        fromUserId: 'user1',
      };

      const result = await createScoreEntry(input);

      expect(result.success).toBe(true);
      const addDocCall = (addDoc as jest.Mock).mock.calls[0];
      const entryData = addDocCall[1];
      expect(entryData.reason).toBe('');
    });

    it('handles all valid point values', async () => {
      const validPoints = [-3, -2, -1, 1, 2, 3] as const;

      for (const points of validPoints) {
        const mockDocRef = { id: `entry-${points}` };
        (addDoc as jest.Mock).mockResolvedValueOnce(mockDocRef);

        const result = await createScoreEntry({
          bookingId: 'booking-1',
          toUserId: 'user2',
          points,
          fromUserId: 'user1',
        });

        expect(result.success).toBe(true);
      }
    });

    it('handles Firebase errors gracefully', async () => {
      (addDoc as jest.Mock).mockRejectedValueOnce(new Error('Firebase error'));

      const result = await createScoreEntry({
        bookingId: 'booking-1',
        toUserId: 'user2',
        points: 1,
        fromUserId: 'user1',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to add score entry. Please try again.');
    });
  });

  // ============ Get Booking Score Entries ============

  describe('getBookingScoreEntries', () => {
    it('returns all entries for booking', async () => {
      const mockEntries = [
        { id: 'e1', data: { ...mockEntryData, points: 2 } },
        { id: 'e2', data: { ...mockEntryData, points: -1 } },
      ];
      (getDocs as jest.Mock).mockResolvedValueOnce(
        createMockSnapshot(mockEntries)
      );

      const result = await getBookingScoreEntries('booking-1');

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(query).toHaveBeenCalled();
      expect(where).toHaveBeenCalledWith('bookingId', '==', 'booking-1');
      expect(orderBy).toHaveBeenCalledWith('createdAt', 'desc');
    });

    it('returns empty array when no entries', async () => {
      (getDocs as jest.Mock).mockResolvedValueOnce(createMockSnapshot([]));

      const result = await getBookingScoreEntries('booking-1');

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(0);
    });

    it('handles errors gracefully', async () => {
      (getDocs as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await getBookingScoreEntries('booking-1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to load score entries');
    });
  });

  // ============ Get Booking Leaderboard ============

  describe('getBookingLeaderboard', () => {
    it('calculates leaderboard from entries', async () => {
      const mockEntries = [
        { id: 'e1', data: { ...mockEntryData, toUserId: 'user2', points: 3 } },
        { id: 'e2', data: { ...mockEntryData, toUserId: 'user2', points: 2 } },
        { id: 'e3', data: { ...mockEntryData, toUserId: 'user3', points: -1 } },
      ];
      (getDocs as jest.Mock).mockResolvedValueOnce(
        createMockSnapshot(mockEntries)
      );

      const result = await getBookingLeaderboard('booking-1', mockCrew);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(3);

      // Should be sorted by total points descending
      expect(result.data![0].userId).toBe('user2');
      expect(result.data![0].totalPoints).toBe(5);
      expect(result.data![0].entryCount).toBe(2);
    });

    it('includes crew members with zero points', async () => {
      const mockEntries = [
        { id: 'e1', data: { ...mockEntryData, toUserId: 'user2', points: 2 } },
      ];
      (getDocs as jest.Mock).mockResolvedValueOnce(
        createMockSnapshot(mockEntries)
      );

      const result = await getBookingLeaderboard('booking-1', mockCrew);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(3);

      const user3 = result.data!.find((d) => d.userId === 'user3');
      expect(user3?.totalPoints).toBe(0);
      expect(user3?.entryCount).toBe(0);
    });

    it('handles negative total points correctly', async () => {
      const mockEntries = [
        { id: 'e1', data: { ...mockEntryData, toUserId: 'user3', points: -3 } },
        { id: 'e2', data: { ...mockEntryData, toUserId: 'user3', points: -2 } },
      ];
      (getDocs as jest.Mock).mockResolvedValueOnce(
        createMockSnapshot(mockEntries)
      );

      const result = await getBookingLeaderboard('booking-1', mockCrew);

      expect(result.success).toBe(true);
      const user3 = result.data!.find((d) => d.userId === 'user3');
      expect(user3?.totalPoints).toBe(-5);
    });

    it('handles errors gracefully', async () => {
      (getDocs as jest.Mock).mockRejectedValueOnce(new Error('Error'));

      const result = await getBookingLeaderboard('booking-1', mockCrew);

      expect(result.success).toBe(false);
      // Error comes from getBookingScoreEntries which is called internally
      expect(result.error).toBe('Failed to load score entries');
    });
  });

  // ============ Get Season Score Entries ============

  describe('getSeasonScoreEntries', () => {
    it('returns entries for multiple bookings', async () => {
      const mockEntries = [
        { id: 'e1', data: { ...mockEntryData, bookingId: 'b1' } },
        { id: 'e2', data: { ...mockEntryData, bookingId: 'b2' } },
      ];
      (getDocs as jest.Mock).mockResolvedValueOnce(
        createMockSnapshot(mockEntries)
      );

      const result = await getSeasonScoreEntries(['b1', 'b2']);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(where).toHaveBeenCalledWith('bookingId', 'in', ['b1', 'b2']);
    });

    it('returns empty array for empty booking IDs', async () => {
      const result = await getSeasonScoreEntries([]);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(0);
      expect(getDocs).not.toHaveBeenCalled();
    });

    it('handles large number of bookings in batches', async () => {
      const bookingIds = Array.from({ length: 35 }, (_, i) => `b${i}`);
      (getDocs as jest.Mock).mockResolvedValue(createMockSnapshot([]));

      const result = await getSeasonScoreEntries(bookingIds);

      expect(result.success).toBe(true);
      // Should make 2 queries (30 + 5)
      expect(getDocs).toHaveBeenCalledTimes(2);
    });

    it('handles errors gracefully', async () => {
      (getDocs as jest.Mock).mockRejectedValueOnce(new Error('Error'));

      const result = await getSeasonScoreEntries(['b1', 'b2']);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to load season scores');
    });
  });

  // ============ Get Season Score Stats ============

  describe('getSeasonScoreStats', () => {
    it('calculates season totals correctly', async () => {
      const mockEntries = [
        { id: 'e1', data: { ...mockEntryData, bookingId: 'b1', toUserId: 'user2', points: 3 } },
        { id: 'e2', data: { ...mockEntryData, bookingId: 'b1', toUserId: 'user3', points: -1 } },
        { id: 'e3', data: { ...mockEntryData, bookingId: 'b2', toUserId: 'user2', points: 2 } },
        { id: 'e4', data: { ...mockEntryData, bookingId: 'b2', toUserId: 'user3', points: 1 } },
      ];
      (getDocs as jest.Mock).mockResolvedValueOnce(
        createMockSnapshot(mockEntries)
      );

      const result = await getSeasonScoreStats(['b1', 'b2'], mockCrew);

      expect(result.success).toBe(true);
      expect(result.data?.crewTotals).toHaveLength(3);

      const user2 = result.data!.crewTotals.find((c) => c.userId === 'user2');
      expect(user2?.totalPoints).toBe(5);

      const user3 = result.data!.crewTotals.find((c) => c.userId === 'user3');
      expect(user3?.totalPoints).toBe(0); // -1 + 1
    });

    it('identifies trophy holder correctly', async () => {
      const mockEntries = [
        { id: 'e1', data: { ...mockEntryData, bookingId: 'b1', toUserId: 'user2', points: 3 } },
        { id: 'e2', data: { ...mockEntryData, bookingId: 'b2', toUserId: 'user2', points: 3 } },
        { id: 'e3', data: { ...mockEntryData, bookingId: 'b1', toUserId: 'user3', points: 1 } },
      ];
      (getDocs as jest.Mock).mockResolvedValueOnce(
        createMockSnapshot(mockEntries)
      );

      const result = await getSeasonScoreStats(['b1', 'b2'], mockCrew);

      expect(result.success).toBe(true);
      // user2 won both bookings
      expect(result.data?.trophyHolder).toBe('user2');

      const user2 = result.data!.crewTotals.find((c) => c.userId === 'user2');
      expect(user2?.bookingWins).toBe(2);
    });

    it('identifies horns holder correctly', async () => {
      const mockEntries = [
        { id: 'e1', data: { ...mockEntryData, bookingId: 'b1', toUserId: 'user2', points: 3 } },
        { id: 'e2', data: { ...mockEntryData, bookingId: 'b1', toUserId: 'user3', points: -2 } },
        { id: 'e3', data: { ...mockEntryData, bookingId: 'b2', toUserId: 'user2', points: 1 } },
        { id: 'e4', data: { ...mockEntryData, bookingId: 'b2', toUserId: 'user3', points: -3 } },
      ];
      (getDocs as jest.Mock).mockResolvedValueOnce(
        createMockSnapshot(mockEntries)
      );

      const result = await getSeasonScoreStats(['b1', 'b2'], mockCrew);

      expect(result.success).toBe(true);
      // user3 lost both bookings
      expect(result.data?.hornsHolder).toBe('user3');

      const user3 = result.data!.crewTotals.find((c) => c.userId === 'user3');
      expect(user3?.bookingLosses).toBe(2);
    });

    it('returns empty stats for no bookings', async () => {
      const result = await getSeasonScoreStats([], mockCrew);

      expect(result.success).toBe(true);
      expect(result.data?.crewTotals).toHaveLength(0);
      expect(result.data?.trophyHolder).toBeUndefined();
      expect(result.data?.hornsHolder).toBeUndefined();
    });

    it('returns empty stats for no crew', async () => {
      const result = await getSeasonScoreStats(['b1'], []);

      expect(result.success).toBe(true);
      expect(result.data?.crewTotals).toHaveLength(0);
    });

    it('handles errors gracefully', async () => {
      (getDocs as jest.Mock).mockRejectedValueOnce(new Error('Error'));

      const result = await getSeasonScoreStats(['b1'], mockCrew);

      expect(result.success).toBe(false);
      // Error comes from getSeasonScoreEntries which is called internally
      expect(result.error).toBe('Failed to load season scores');
    });
  });
});
