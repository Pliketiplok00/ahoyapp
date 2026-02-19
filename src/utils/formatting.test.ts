/**
 * Formatting Utilities Tests
 *
 * Tests for Croatian locale formatting functions.
 */

import {
  formatDate,
  formatDateShort,
  formatDateRange,
  formatTime,
  formatDateTime,
  formatNumber,
  formatCurrency,
  parseHRNumber,
  formatRelativeDate,
  daysBetween,
} from './formatting';

describe('formatDate', () => {
  it('formats date in Croatian locale (DD.MM.YYYY.)', () => {
    const date = new Date('2026-11-15');
    expect(formatDate(date)).toBe('15. 11. 2026.');
  });

  it('handles single-digit days and months', () => {
    const date = new Date('2026-01-05');
    const result = formatDate(date);
    // Croatian locale may vary slightly, check for key parts
    expect(result).toContain('5');
    expect(result).toContain('1');
    expect(result).toContain('2026');
  });

  it('handles edge of year dates', () => {
    const date = new Date('2026-12-31');
    const result = formatDate(date);
    expect(result).toContain('31');
    expect(result).toContain('12');
    expect(result).toContain('2026');
  });
});

describe('formatDateShort', () => {
  it('formats date without year (DD.MM.)', () => {
    const date = new Date('2026-11-15');
    expect(formatDateShort(date)).toBe('15.11.');
  });

  it('pads single-digit days and months', () => {
    const date = new Date('2026-01-05');
    expect(formatDateShort(date)).toBe('05.01.');
  });
});

describe('formatDateRange', () => {
  it('formats date range with arrow', () => {
    const start = new Date('2026-11-15');
    const end = new Date('2026-11-22');
    expect(formatDateRange(start, end)).toBe('15.11. → 22.11.');
  });

  it('handles range spanning months', () => {
    const start = new Date('2026-06-28');
    const end = new Date('2026-07-05');
    expect(formatDateRange(start, end)).toBe('28.06. → 05.07.');
  });
});

describe('formatTime', () => {
  it('formats time in 24-hour format (HH:MM)', () => {
    const date = new Date('2026-11-15T14:30:00');
    expect(formatTime(date)).toBe('14:30');
  });

  it('handles midnight', () => {
    const date = new Date('2026-11-15T00:00:00');
    expect(formatTime(date)).toBe('00:00');
  });

  it('handles noon', () => {
    const date = new Date('2026-11-15T12:00:00');
    expect(formatTime(date)).toBe('12:00');
  });
});

describe('formatDateTime', () => {
  it('combines date and time', () => {
    const date = new Date('2026-11-15T14:30:00');
    const result = formatDateTime(date);
    expect(result).toContain('15');
    expect(result).toContain('11');
    expect(result).toContain('2026');
    expect(result).toContain('14:30');
  });
});

describe('formatNumber', () => {
  it('formats number with Croatian locale (comma decimal)', () => {
    const result = formatNumber(1234.56);
    expect(result).toBe('1.234,56');
  });

  it('formats integer with two decimal places by default', () => {
    const result = formatNumber(1000);
    expect(result).toBe('1.000,00');
  });

  it('respects custom decimal places', () => {
    expect(formatNumber(1234.5, 0)).toBe('1.235');
    expect(formatNumber(1234.567, 1)).toBe('1.234,6');
    expect(formatNumber(1234.567, 3)).toBe('1.234,567');
  });

  it('handles zero', () => {
    expect(formatNumber(0)).toBe('0,00');
  });

  it('handles negative numbers', () => {
    const result = formatNumber(-1234.56);
    expect(result).toContain('1.234,56');
    // Croatian locale uses Unicode minus (−) not ASCII hyphen (-)
    expect(result.startsWith('−') || result.startsWith('-')).toBe(true);
  });

  it('handles large numbers', () => {
    const result = formatNumber(1234567.89);
    expect(result).toBe('1.234.567,89');
  });
});

describe('formatCurrency', () => {
  it('formats EUR by default', () => {
    expect(formatCurrency(1234.56)).toBe('1.234,56 €');
  });

  it('formats USD', () => {
    expect(formatCurrency(1234.56, 'USD')).toBe('1.234,56 $');
  });

  it('formats GBP', () => {
    expect(formatCurrency(1234.56, 'GBP')).toBe('1.234,56 £');
  });

  it('formats HRK', () => {
    expect(formatCurrency(1234.56, 'HRK')).toBe('1.234,56 kn');
  });

  it('falls back to EUR symbol for unknown currency', () => {
    expect(formatCurrency(1234.56, 'XXX')).toBe('1.234,56 €');
  });

  it('handles zero', () => {
    expect(formatCurrency(0)).toBe('0,00 €');
  });
});

describe('parseHRNumber', () => {
  it('parses HR-formatted number with thousands separator', () => {
    expect(parseHRNumber('1.234,56')).toBe(1234.56);
  });

  it('parses HR-formatted number without thousands separator', () => {
    expect(parseHRNumber('1234,56')).toBe(1234.56);
  });

  it('parses integer without decimal', () => {
    expect(parseHRNumber('1.000')).toBe(1000);
  });

  it('handles large numbers', () => {
    expect(parseHRNumber('1.234.567,89')).toBe(1234567.89);
  });

  it('handles simple decimals', () => {
    expect(parseHRNumber('42,50')).toBe(42.5);
  });
});

describe('formatRelativeDate', () => {
  const baseDate = new Date('2026-06-15T12:00:00');

  it('returns "danas" for same day', () => {
    const sameDay = new Date('2026-06-15T18:00:00');
    expect(formatRelativeDate(sameDay, baseDate)).toBe('danas');
  });

  it('returns "sutra" for next day', () => {
    const nextDay = new Date('2026-06-16T12:00:00');
    expect(formatRelativeDate(nextDay, baseDate)).toBe('sutra');
  });

  it('returns "jučer" for previous day', () => {
    const prevDay = new Date('2026-06-14T12:00:00');
    expect(formatRelativeDate(prevDay, baseDate)).toBe('jučer');
  });

  it('returns "za X d." for future dates', () => {
    const futureDate = new Date('2026-06-18T12:00:00');
    expect(formatRelativeDate(futureDate, baseDate)).toBe('za 3 d.');
  });

  it('returns "prije X d." for past dates', () => {
    const pastDate = new Date('2026-06-10T12:00:00');
    expect(formatRelativeDate(pastDate, baseDate)).toBe('prije 5 d.');
  });
});

describe('daysBetween', () => {
  it('calculates positive days when end > start', () => {
    const start = new Date('2026-06-01');
    const end = new Date('2026-06-08');
    expect(daysBetween(start, end)).toBe(7);
  });

  it('calculates negative days when start > end', () => {
    const start = new Date('2026-06-08');
    const end = new Date('2026-06-01');
    expect(daysBetween(start, end)).toBe(-7);
  });

  it('returns 0 for same date', () => {
    const date = new Date('2026-06-15');
    expect(daysBetween(date, date)).toBe(0);
  });

  it('handles month boundaries', () => {
    const start = new Date('2026-06-28');
    const end = new Date('2026-07-05');
    expect(daysBetween(start, end)).toBe(7);
  });

  it('handles year boundaries', () => {
    const start = new Date('2026-12-28');
    const end = new Date('2027-01-04');
    expect(daysBetween(start, end)).toBe(7);
  });
});
