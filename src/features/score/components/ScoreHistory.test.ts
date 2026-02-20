/**
 * ScoreHistory Component Tests
 *
 * Tests for score history display logic.
 */

import { groupEntriesByDate, formatPointsDisplay } from './ScoreHistory';
import { COLORS } from '../../../config/theme';
import type { ScoreEntry, Timestamp } from '../../../types/models';

// Helper to create mock timestamp
function createTimestamp(date: Date): Timestamp {
  return {
    seconds: Math.floor(date.getTime() / 1000),
    nanoseconds: 0,
    toDate: () => date,
  };
}

// Helper to create mock entry
function createEntry(
  id: string,
  points: -3 | -2 | -1 | 1 | 2 | 3,
  date: Date
): ScoreEntry {
  return {
    id,
    bookingId: 'booking1',
    toUserId: 'user1',
    points,
    reason: 'Test reason',
    fromUserId: 'captain1',
    createdAt: createTimestamp(date),
  };
}

describe('ScoreHistory', () => {
  describe('formatPointsDisplay', () => {
    it('formats positive points with plus sign and success color', () => {
      const result = formatPointsDisplay(3);
      expect(result.text).toBe('+3');
      expect(result.color).toBe(COLORS.success);
    });

    it('formats +1 correctly', () => {
      const result = formatPointsDisplay(1);
      expect(result.text).toBe('+1');
      expect(result.color).toBe(COLORS.success);
    });

    it('formats negative points with error color', () => {
      const result = formatPointsDisplay(-2);
      expect(result.text).toBe('-2');
      expect(result.color).toBe(COLORS.error);
    });

    it('formats -3 correctly', () => {
      const result = formatPointsDisplay(-3);
      expect(result.text).toBe('-3');
      expect(result.color).toBe(COLORS.error);
    });
  });

  describe('groupEntriesByDate', () => {
    it('groups entries by date', () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const entries: ScoreEntry[] = [
        createEntry('1', 2, today),
        createEntry('2', -1, today),
        createEntry('3', 3, yesterday),
      ];

      const sections = groupEntriesByDate(entries);

      expect(sections).toHaveLength(2);
      expect(sections[0].title).toBe('Today');
      expect(sections[0].data).toHaveLength(2);
      expect(sections[1].title).toBe('Yesterday');
      expect(sections[1].data).toHaveLength(1);
    });

    it('labels today correctly', () => {
      const today = new Date();
      const entries: ScoreEntry[] = [createEntry('1', 1, today)];

      const sections = groupEntriesByDate(entries);

      expect(sections[0].title).toBe('Today');
    });

    it('labels yesterday correctly', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const entries: ScoreEntry[] = [createEntry('1', 1, yesterday)];

      const sections = groupEntriesByDate(entries);

      expect(sections[0].title).toBe('Yesterday');
    });

    it('uses formatted date for older entries', () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 5);
      const entries: ScoreEntry[] = [createEntry('1', 1, oldDate)];

      const sections = groupEntriesByDate(entries);

      // Should be formatted date, not "Today" or "Yesterday"
      expect(sections[0].title).not.toBe('Today');
      expect(sections[0].title).not.toBe('Yesterday');
    });

    it('handles empty entries array', () => {
      const sections = groupEntriesByDate([]);
      expect(sections).toHaveLength(0);
    });

    it('maintains entry order within groups', () => {
      const today = new Date();
      const entries: ScoreEntry[] = [
        createEntry('1', 1, today),
        createEntry('2', 2, today),
        createEntry('3', 3, today),
      ];

      const sections = groupEntriesByDate(entries);

      expect(sections[0].data[0].id).toBe('1');
      expect(sections[0].data[1].id).toBe('2');
      expect(sections[0].data[2].id).toBe('3');
    });
  });

  describe('display scenarios', () => {
    it('handles entries across multiple days', () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const twoDaysAgo = new Date(today);
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      const entries: ScoreEntry[] = [
        createEntry('1', 1, today),
        createEntry('2', -1, yesterday),
        createEntry('3', 2, twoDaysAgo),
      ];

      const sections = groupEntriesByDate(entries);

      expect(sections).toHaveLength(3);
    });

    it('handles multiple entries same day different points', () => {
      const today = new Date();
      const entries: ScoreEntry[] = [
        createEntry('1', 3, today),
        createEntry('2', -3, today),
        createEntry('3', 1, today),
        createEntry('4', -1, today),
      ];

      const sections = groupEntriesByDate(entries);

      expect(sections[0].data).toHaveLength(4);
    });
  });
});
