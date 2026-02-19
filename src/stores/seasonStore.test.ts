/**
 * Season Store Tests
 *
 * Tests for Zustand season store computed helpers.
 */

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn().mockResolvedValue(undefined),
  getItem: jest.fn().mockResolvedValue(null),
  removeItem: jest.fn().mockResolvedValue(undefined),
}));

// Import after mocks
import { useSeasonStore } from './seasonStore';
import type { CrewMember } from '../features/season/types';
import { Timestamp } from 'firebase/firestore';

// Mock crew members for testing
const mockCrewMembers: CrewMember[] = [
  {
    id: 'captain-id',
    email: 'captain@test.com',
    name: 'Captain Jack',
    color: '#EF4444',
    roles: ['captain', 'editor'],
    seasonId: 'season-1',
    createdAt: { toDate: () => new Date() } as Timestamp,
  },
  {
    id: 'editor-id',
    email: 'editor@test.com',
    name: 'First Mate',
    color: '#F97316',
    roles: ['editor'],
    seasonId: 'season-1',
    createdAt: { toDate: () => new Date() } as Timestamp,
  },
  {
    id: 'crew-id',
    email: 'crew@test.com',
    name: 'Deckhand',
    color: '#F59E0B',
    roles: ['crew'],
    seasonId: 'season-1',
    createdAt: { toDate: () => new Date() } as Timestamp,
  },
];

describe('seasonStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useSeasonStore.getState().reset();
  });

  describe('initial state', () => {
    it('has null currentSeasonId', () => {
      expect(useSeasonStore.getState().currentSeasonId).toBeNull();
    });

    it('has null currentSeason', () => {
      expect(useSeasonStore.getState().currentSeason).toBeNull();
    });

    it('has empty crewMembers array', () => {
      expect(useSeasonStore.getState().crewMembers).toEqual([]);
    });

    it('has empty pendingInvites array', () => {
      expect(useSeasonStore.getState().pendingInvites).toEqual([]);
    });

    it('has isLoading false', () => {
      expect(useSeasonStore.getState().isLoading).toBe(false);
    });

    it('has null error', () => {
      expect(useSeasonStore.getState().error).toBeNull();
    });
  });

  describe('setters', () => {
    it('setCurrentSeasonId updates state', () => {
      useSeasonStore.getState().setCurrentSeasonId('new-season-id');
      expect(useSeasonStore.getState().currentSeasonId).toBe('new-season-id');
    });

    it('setCrewMembers updates state', () => {
      useSeasonStore.getState().setCrewMembers(mockCrewMembers);
      expect(useSeasonStore.getState().crewMembers).toHaveLength(3);
    });

    it('setLoading updates state', () => {
      useSeasonStore.getState().setLoading(true);
      expect(useSeasonStore.getState().isLoading).toBe(true);
    });

    it('setError updates state', () => {
      useSeasonStore.getState().setError('Test error');
      expect(useSeasonStore.getState().error).toBe('Test error');
    });
  });

  describe('reset', () => {
    it('resets all state to initial values', () => {
      // Set some state
      useSeasonStore.getState().setCurrentSeasonId('season-1');
      useSeasonStore.getState().setCrewMembers(mockCrewMembers);
      useSeasonStore.getState().setLoading(true);
      useSeasonStore.getState().setError('Some error');

      // Reset
      useSeasonStore.getState().reset();

      // Verify all reset
      expect(useSeasonStore.getState().currentSeasonId).toBeNull();
      expect(useSeasonStore.getState().crewMembers).toEqual([]);
      expect(useSeasonStore.getState().isLoading).toBe(false);
      expect(useSeasonStore.getState().error).toBeNull();
    });
  });

  describe('isCaptain', () => {
    beforeEach(() => {
      useSeasonStore.getState().setCrewMembers(mockCrewMembers);
    });

    it('returns true for user with captain role', () => {
      const result = useSeasonStore.getState().isCaptain('captain-id');
      expect(result).toBe(true);
    });

    it('returns false for user with only editor role', () => {
      const result = useSeasonStore.getState().isCaptain('editor-id');
      expect(result).toBe(false);
    });

    it('returns false for user with only crew role', () => {
      const result = useSeasonStore.getState().isCaptain('crew-id');
      expect(result).toBe(false);
    });

    it('returns false for non-existent user', () => {
      const result = useSeasonStore.getState().isCaptain('unknown-id');
      expect(result).toBe(false);
    });
  });

  describe('isEditor', () => {
    beforeEach(() => {
      useSeasonStore.getState().setCrewMembers(mockCrewMembers);
    });

    it('returns true for user with editor role', () => {
      const result = useSeasonStore.getState().isEditor('editor-id');
      expect(result).toBe(true);
    });

    it('returns true for captain (who also has editor role)', () => {
      const result = useSeasonStore.getState().isEditor('captain-id');
      expect(result).toBe(true);
    });

    it('returns false for user with only crew role', () => {
      const result = useSeasonStore.getState().isEditor('crew-id');
      expect(result).toBe(false);
    });

    it('returns false for non-existent user', () => {
      const result = useSeasonStore.getState().isEditor('unknown-id');
      expect(result).toBe(false);
    });
  });

  describe('getCrewMember', () => {
    beforeEach(() => {
      useSeasonStore.getState().setCrewMembers(mockCrewMembers);
    });

    it('returns crew member when found', () => {
      const result = useSeasonStore.getState().getCrewMember('captain-id');
      expect(result).toBeDefined();
      expect(result?.name).toBe('Captain Jack');
    });

    it('returns crew member with correct properties', () => {
      const result = useSeasonStore.getState().getCrewMember('editor-id');
      expect(result).toMatchObject({
        id: 'editor-id',
        email: 'editor@test.com',
        name: 'First Mate',
        color: '#F97316',
        roles: ['editor'],
      });
    });

    it('returns undefined for non-existent user', () => {
      const result = useSeasonStore.getState().getCrewMember('unknown-id');
      expect(result).toBeUndefined();
    });
  });

  describe('edge cases', () => {
    it('isCaptain handles empty crew array', () => {
      // crewMembers is already empty after reset
      const result = useSeasonStore.getState().isCaptain('any-id');
      expect(result).toBe(false);
    });

    it('isEditor handles empty crew array', () => {
      const result = useSeasonStore.getState().isEditor('any-id');
      expect(result).toBe(false);
    });

    it('getCrewMember handles empty crew array', () => {
      const result = useSeasonStore.getState().getCrewMember('any-id');
      expect(result).toBeUndefined();
    });

    it('handles crew member with multiple roles', () => {
      const multiRoleCrew: CrewMember[] = [
        {
          id: 'multi-role-id',
          email: 'multi@test.com',
          name: 'Multi Role',
          color: '#EAB308',
          roles: ['captain', 'editor', 'crew'],
          seasonId: 'season-1',
          createdAt: { toDate: () => new Date() } as Timestamp,
        },
      ];
      useSeasonStore.getState().setCrewMembers(multiRoleCrew);

      expect(useSeasonStore.getState().isCaptain('multi-role-id')).toBe(true);
      expect(useSeasonStore.getState().isEditor('multi-role-id')).toBe(true);
    });
  });
});
