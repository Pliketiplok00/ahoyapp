/**
 * ScoreLeaderboard Component Tests
 *
 * Tests for leaderboard display logic.
 */

import {
  getRankIcon,
  getLastPlaceIcon,
  formatPoints,
  getPointsColor,
} from './ScoreLeaderboard';
import { COLORS } from '../../../config/theme';

describe('ScoreLeaderboard', () => {
  describe('getRankIcon', () => {
    it('returns trophy for first place with positive points', () => {
      expect(getRankIcon(0, 5)).toBe('\u{1F3C6}');
    });

    it('returns empty string for first place with zero points', () => {
      expect(getRankIcon(0, 0)).toBe('');
    });

    it('returns empty string for first place with negative points', () => {
      expect(getRankIcon(0, -2)).toBe('');
    });

    it('returns silver medal for second place', () => {
      expect(getRankIcon(1, 3)).toBe('\u{1F948}');
    });

    it('returns bronze medal for third place', () => {
      expect(getRankIcon(2, 1)).toBe('\u{1F949}');
    });

    it('returns empty string for fourth place and beyond', () => {
      expect(getRankIcon(3, 0)).toBe('');
      expect(getRankIcon(5, 2)).toBe('');
    });
  });

  describe('getLastPlaceIcon', () => {
    it('returns horns for last place with negative points', () => {
      expect(getLastPlaceIcon(3, 4, -2)).toBe('\u{1F608}');
    });

    it('returns empty string for last place with zero points', () => {
      expect(getLastPlaceIcon(3, 4, 0)).toBe('');
    });

    it('returns empty string for last place with positive points', () => {
      expect(getLastPlaceIcon(3, 4, 1)).toBe('');
    });

    it('returns empty string for non-last place even with negative points', () => {
      expect(getLastPlaceIcon(1, 4, -3)).toBe('');
    });
  });

  describe('formatPoints', () => {
    it('formats positive points with plus sign', () => {
      expect(formatPoints(5)).toBe('+5');
      expect(formatPoints(1)).toBe('+1');
      expect(formatPoints(100)).toBe('+100');
    });

    it('formats negative points as is', () => {
      expect(formatPoints(-3)).toBe('-3');
      expect(formatPoints(-1)).toBe('-1');
    });

    it('formats zero without sign', () => {
      expect(formatPoints(0)).toBe('0');
    });
  });

  describe('getPointsColor', () => {
    it('returns success color for positive points', () => {
      expect(getPointsColor(5)).toBe(COLORS.success);
      expect(getPointsColor(1)).toBe(COLORS.success);
    });

    it('returns error color for negative points', () => {
      expect(getPointsColor(-3)).toBe(COLORS.error);
      expect(getPointsColor(-1)).toBe(COLORS.error);
    });

    it('returns muted color for zero points', () => {
      expect(getPointsColor(0)).toBe(COLORS.textMuted);
    });
  });

  describe('leaderboard display scenarios', () => {
    it('handles single crew member', () => {
      const icon = getRankIcon(0, 5);
      expect(icon).toBe('\u{1F3C6}');
    });

    it('handles tie scenarios (same position)', () => {
      // Both at index 0 would get trophy
      expect(getRankIcon(0, 5)).toBe('\u{1F3C6}');
      // Both at index 1 would get silver
      expect(getRankIcon(1, 5)).toBe('\u{1F948}');
    });

    it('handles negative total points leader', () => {
      // First place but negative - no trophy
      expect(getRankIcon(0, -1)).toBe('');
    });
  });
});
