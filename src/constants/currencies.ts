/**
 * Currency Constants
 *
 * Supported currencies and formatting.
 */

export const CURRENCIES = {
  EUR: { code: 'EUR', symbol: '€', name: 'Euro' },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound' },
  HRK: { code: 'HRK', symbol: 'kn', name: 'Croatian Kuna' }, // Legacy
} as const;

export type CurrencyCode = keyof typeof CURRENCIES;

export const DEFAULT_CURRENCY: CurrencyCode = 'EUR';

/**
 * Currency options for dropdown selection.
 */
export const CURRENCY_OPTIONS = Object.values(CURRENCIES).map((c) => ({
  value: c.code,
  label: `${c.code} ${c.symbol}`,
  name: c.name,
}));

/**
 * Get currency by code
 */
export function getCurrency(code: CurrencyCode) {
  return CURRENCIES[code];
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(code: CurrencyCode): string {
  return CURRENCIES[code]?.symbol || '€';
}
