/**
 * Formatting Utilities
 *
 * CRITICAL: All dates, numbers, and currency MUST use Croatian (HR) formatting.
 *
 * Date format: DD.MM.YYYY.
 * Number format: 1.234,56 (dot for thousands, comma for decimal)
 * Currency format: 1.234,56 €
 */

/**
 * Format date according to Croatian locale.
 *
 * @param date - Date to format
 * @returns Formatted string, e.g., "15.11.2026."
 *
 * @example
 * formatDate(new Date('2026-11-15')) // "15.11.2026."
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('hr-HR');
}

/**
 * Format date in short form (without year).
 *
 * @param date - Date to format
 * @returns Formatted string, e.g., "15.11."
 *
 * @example
 * formatDateShort(new Date('2026-11-15')) // "15.11."
 */
export function formatDateShort(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  return `${day}.${month}.`;
}

/**
 * Format date range for display.
 *
 * @param start - Start date
 * @param end - End date
 * @returns Formatted range, e.g., "15.11. → 22.11."
 */
export function formatDateRange(start: Date, end: Date): string {
  return `${formatDateShort(start)} → ${formatDateShort(end)}`;
}

/**
 * Format time according to Croatian locale (24-hour).
 *
 * @param date - Date to format
 * @returns Formatted time, e.g., "14:30"
 *
 * @example
 * formatTime(new Date('2026-11-15T14:30:00')) // "14:30"
 */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString('hr-HR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format datetime according to Croatian locale.
 *
 * @param date - Date to format
 * @returns Formatted datetime, e.g., "15.11.2026. 14:30"
 */
export function formatDateTime(date: Date): string {
  return `${formatDate(date)} ${formatTime(date)}`;
}

/**
 * Format number according to Croatian locale.
 * Uses comma for decimal, dot for thousands.
 *
 * @param num - Number to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string, e.g., "1.234,56"
 *
 * @example
 * formatNumber(1234.5)     // "1.234,50"
 * formatNumber(1234.5, 0)  // "1.235"
 */
export function formatNumber(num: number, decimals = 2): string {
  return num.toLocaleString('hr-HR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format currency according to Croatian locale.
 * Amount + space + symbol.
 *
 * @param amount - Amount to format
 * @param currency - Currency code (default: EUR)
 * @returns Formatted string, e.g., "1.234,56 €"
 *
 * @example
 * formatCurrency(1234.56)        // "1.234,56 €"
 * formatCurrency(1234.56, 'USD') // "1.234,56 $"
 */
export function formatCurrency(amount: number, currency = 'EUR'): string {
  const symbols: Record<string, string> = {
    EUR: '€',
    USD: '$',
    GBP: '£',
    HRK: 'kn',
  };

  const symbol = symbols[currency] || '€';
  return `${formatNumber(amount)} ${symbol}`;
}

/**
 * Parse HR-formatted number string to number.
 *
 * @param str - String like "1.234,56"
 * @returns Number like 1234.56
 *
 * @example
 * parseHRNumber("1.234,56") // 1234.56
 * parseHRNumber("1234,56")  // 1234.56
 */
export function parseHRNumber(str: string): number {
  // Remove thousands separator (dot), replace decimal separator (comma) with dot
  const normalized = str.replace(/\./g, '').replace(',', '.');
  return parseFloat(normalized);
}

/**
 * Format relative date (days until/since).
 *
 * @param date - Target date
 * @param referenceDate - Reference date (default: now)
 * @returns Relative string, e.g., "za 3 d." or "prije 2 d."
 */
export function formatRelativeDate(
  date: Date,
  referenceDate: Date = new Date()
): string {
  const msPerDay = 24 * 60 * 60 * 1000;
  const diffMs = date.getTime() - referenceDate.getTime();
  const diffDays = Math.round(diffMs / msPerDay);

  if (diffDays === 0) return 'danas';
  if (diffDays === 1) return 'sutra';
  if (diffDays === -1) return 'jučer';
  if (diffDays > 0) return `za ${diffDays} d.`;
  return `prije ${Math.abs(diffDays)} d.`;
}

/**
 * Calculate days between two dates.
 *
 * @param start - Start date
 * @param end - End date
 * @returns Number of days (positive if end > start)
 */
export function daysBetween(start: Date, end: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((end.getTime() - start.getTime()) / msPerDay);
}
