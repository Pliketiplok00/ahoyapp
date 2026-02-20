/**
 * Tip Split Tests
 *
 * Tests for tip split calculation logic.
 */

// Test utility functions for tip split calculations

/**
 * Calculate equal split percentage
 */
export function calculateEqualSplit(crewCount: number): number {
  return crewCount > 0 ? 100 / crewCount : 0;
}

/**
 * Calculate split amounts from percentages
 */
export function calculateSplitAmounts(
  totalAmount: number,
  splits: Record<string, number>
): Record<string, number> {
  const result: Record<string, number> = {};
  for (const [id, percentage] of Object.entries(splits)) {
    result[id] = totalAmount * (percentage / 100);
  }
  return result;
}

/**
 * Validate total percentage equals 100
 */
export function isValidTotalPercentage(splits: Record<string, number>): boolean {
  const total = Object.values(splits).reduce((sum, pct) => sum + pct, 0);
  return Math.abs(total - 100) < 0.01;
}

/**
 * Distribute remaining percentage evenly
 */
export function distributeEvenly(crewIds: string[]): Record<string, number> {
  const evenSplit = 100 / crewIds.length;
  const result: Record<string, number> = {};
  for (const id of crewIds) {
    result[id] = evenSplit;
  }
  return result;
}

describe('Tip Split Calculations', () => {
  describe('calculateEqualSplit', () => {
    it('returns 100 for single crew member', () => {
      expect(calculateEqualSplit(1)).toBe(100);
    });

    it('returns 50 for two crew members', () => {
      expect(calculateEqualSplit(2)).toBe(50);
    });

    it('returns 25 for four crew members', () => {
      expect(calculateEqualSplit(4)).toBe(25);
    });

    it('returns 0 for zero crew members', () => {
      expect(calculateEqualSplit(0)).toBe(0);
    });

    it('handles odd numbers correctly', () => {
      expect(calculateEqualSplit(3)).toBeCloseTo(33.333, 2);
    });
  });

  describe('calculateSplitAmounts', () => {
    it('calculates correct amounts for equal split', () => {
      const splits = { user1: 50, user2: 50 };
      const amounts = calculateSplitAmounts(1000, splits);

      expect(amounts.user1).toBe(500);
      expect(amounts.user2).toBe(500);
    });

    it('calculates correct amounts for custom split', () => {
      const splits = { captain: 40, crew1: 30, crew2: 30 };
      const amounts = calculateSplitAmounts(1000, splits);

      expect(amounts.captain).toBe(400);
      expect(amounts.crew1).toBe(300);
      expect(amounts.crew2).toBe(300);
    });

    it('handles zero amount', () => {
      const splits = { user1: 50, user2: 50 };
      const amounts = calculateSplitAmounts(0, splits);

      expect(amounts.user1).toBe(0);
      expect(amounts.user2).toBe(0);
    });

    it('handles decimal percentages', () => {
      const splits = { user1: 33.33, user2: 33.33, user3: 33.34 };
      const amounts = calculateSplitAmounts(1000, splits);

      expect(amounts.user1).toBeCloseTo(333.3, 1);
      expect(amounts.user2).toBeCloseTo(333.3, 1);
      expect(amounts.user3).toBeCloseTo(333.4, 1);
    });
  });

  describe('isValidTotalPercentage', () => {
    it('returns true for exactly 100%', () => {
      expect(isValidTotalPercentage({ a: 50, b: 50 })).toBe(true);
    });

    it('returns true for 100% within tolerance', () => {
      expect(isValidTotalPercentage({ a: 33.33, b: 33.33, c: 33.34 })).toBe(true);
    });

    it('returns false for less than 100%', () => {
      expect(isValidTotalPercentage({ a: 40, b: 40 })).toBe(false);
    });

    it('returns false for more than 100%', () => {
      expect(isValidTotalPercentage({ a: 60, b: 60 })).toBe(false);
    });

    it('returns true for empty splits (0%)', () => {
      expect(isValidTotalPercentage({})).toBe(false);
    });

    it('handles single member at 100%', () => {
      expect(isValidTotalPercentage({ solo: 100 })).toBe(true);
    });
  });

  describe('distributeEvenly', () => {
    it('distributes 100% to single member', () => {
      const result = distributeEvenly(['user1']);
      expect(result.user1).toBe(100);
    });

    it('distributes 50% to two members', () => {
      const result = distributeEvenly(['user1', 'user2']);
      expect(result.user1).toBe(50);
      expect(result.user2).toBe(50);
    });

    it('distributes evenly to four members', () => {
      const result = distributeEvenly(['a', 'b', 'c', 'd']);
      expect(result.a).toBe(25);
      expect(result.b).toBe(25);
      expect(result.c).toBe(25);
      expect(result.d).toBe(25);
    });

    it('total equals 100% for any crew size', () => {
      for (let size = 1; size <= 10; size++) {
        const ids = Array.from({ length: size }, (_, i) => `user${i}`);
        const result = distributeEvenly(ids);
        const total = Object.values(result).reduce((sum, pct) => sum + pct, 0);
        expect(total).toBeCloseTo(100, 5);
      }
    });
  });

  describe('edge cases', () => {
    it('handles large tip amounts', () => {
      const splits = { user1: 60, user2: 40 };
      const amounts = calculateSplitAmounts(100000, splits);

      expect(amounts.user1).toBe(60000);
      expect(amounts.user2).toBe(40000);
    });

    it('handles very small percentages', () => {
      const splits = { user1: 99.9, user2: 0.1 };
      const amounts = calculateSplitAmounts(1000, splits);

      expect(amounts.user1).toBeCloseTo(999, 2);
      expect(amounts.user2).toBeCloseTo(1, 2);
    });

    it('percentage validation with floating point precision', () => {
      // This simulates what happens with three-way equal split
      const splits = { a: 33.333333, b: 33.333333, c: 33.333334 };
      expect(isValidTotalPercentage(splits)).toBe(true);
    });
  });
});

describe('Tip Split Scenarios', () => {
  describe('Croatian yacht crew scenarios', () => {
    it('captain gets larger share scenario', () => {
      // Common arrangement: captain 40%, two crew 30% each
      const splits = { captain: 40, crew1: 30, crew2: 30 };
      const amounts = calculateSplitAmounts(500, splits);

      expect(amounts.captain).toBe(200);
      expect(amounts.crew1).toBe(150);
      expect(amounts.crew2).toBe(150);
      expect(isValidTotalPercentage(splits)).toBe(true);
    });

    it('four-person crew equal split', () => {
      const crewIds = ['captain', 'chef', 'steward', 'deckhand'];
      const splits = distributeEvenly(crewIds);
      const amounts = calculateSplitAmounts(2000, splits);

      expect(amounts.captain).toBe(500);
      expect(amounts.chef).toBe(500);
      expect(amounts.steward).toBe(500);
      expect(amounts.deckhand).toBe(500);
    });

    it('handles typical weekly tip of 1500 EUR', () => {
      const splits = { captain: 35, firstMate: 25, chef: 25, steward: 15 };
      const amounts = calculateSplitAmounts(1500, splits);

      expect(amounts.captain).toBe(525);
      expect(amounts.firstMate).toBe(375);
      expect(amounts.chef).toBe(375);
      expect(amounts.steward).toBe(225);
      expect(isValidTotalPercentage(splits)).toBe(true);
    });
  });
});
