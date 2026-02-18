/**
 * Marina Configuration
 *
 * Marina abbreviations for display on booking cards.
 * Default marina (Kaštela) is not shown - only non-default marinas get badges.
 */

export const DEFAULT_MARINA = 'Kaštela';

export const MARINA_ABBREVIATIONS: Record<string, string> = {
  Kaštela: '', // Default - don't show
  Split: 'ST',
  Dubrovnik: 'DBK',
  Zadar: 'ZD',
  Šibenik: 'ŠI',
  Trogir: 'TG',
  Hvar: 'HV',
  Korčula: 'KČ',
  Vis: 'VS',
  Biograd: 'BG',
  Sukošan: 'SK',
  Murter: 'MU',
  Primošten: 'PR',
  Rogoznica: 'RG',
} as const;

/**
 * Get marina abbreviation for display.
 * Returns first 2-3 characters if marina not in list.
 */
export function getMarinaAbbreviation(marina: string): string {
  if (marina === DEFAULT_MARINA) return '';
  return MARINA_ABBREVIATIONS[marina] || marina.slice(0, 2).toUpperCase();
}

/**
 * Get marina badge text for display.
 * Returns empty string if both marinas are default (Kaštela).
 *
 * @example
 * getMarinaBadge('Kaštela', 'Kaštela')   // ''
 * getMarinaBadge('Kaštela', 'Dubrovnik') // 'DBK'
 * getMarinaBadge('Split', 'Dubrovnik')   // 'ST→DBK'
 */
export function getMarinaBadge(departure: string, arrival: string): string {
  const depAbbr = getMarinaAbbreviation(departure);
  const arrAbbr = getMarinaAbbreviation(arrival);

  const isDepDefault = departure === DEFAULT_MARINA;
  const isArrDefault = arrival === DEFAULT_MARINA;

  if (isDepDefault && isArrDefault) return '';
  if (isDepDefault) return arrAbbr;
  if (isArrDefault) return depAbbr;
  return `${depAbbr}→${arrAbbr}`;
}

/**
 * List of all known marinas for dropdown selection.
 */
export const MARINA_OPTIONS = Object.keys(MARINA_ABBREVIATIONS);
