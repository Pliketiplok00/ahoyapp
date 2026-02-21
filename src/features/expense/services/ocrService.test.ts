/**
 * OCR Service Tests
 */

import { parseAmount, parseDate, mapCategory, extractJSON } from './ocrService';

describe('ocrService', () => {
  describe('parseAmount', () => {
    it('should parse simple decimal amount', () => {
      expect(parseAmount('156.78')).toBe(156.78);
    });

    it('should parse comma decimal (European format)', () => {
      expect(parseAmount('156,78')).toBe(156.78);
    });

    it('should parse European thousand separator format', () => {
      expect(parseAmount('1.234,56')).toBe(1234.56);
    });

    it('should parse amount with currency symbol', () => {
      expect(parseAmount('156,78 €')).toBe(156.78);
      expect(parseAmount('€156.78')).toBe(156.78);
    });

    it('should handle number input', () => {
      expect(parseAmount(123.45)).toBe(123.45);
    });

    it('should return null for invalid input', () => {
      expect(parseAmount(null)).toBeNull();
      expect(parseAmount(undefined)).toBeNull();
      expect(parseAmount('abc')).toBeNull();
      expect(parseAmount('')).toBeNull();
    });

    it('should handle NaN number input', () => {
      expect(parseAmount(NaN)).toBeNull();
    });

    it('should handle zero', () => {
      expect(parseAmount('0')).toBe(0);
      expect(parseAmount(0)).toBe(0);
    });

    it('should handle large amounts', () => {
      expect(parseAmount('10.000,00')).toBe(10000);
      expect(parseAmount('1.234.567,89')).toBe(1234567.89);
    });
  });

  describe('parseDate', () => {
    it('should parse DD.MM.YYYY format', () => {
      expect(parseDate('21.02.2026')).toBe('21.02.2026');
    });

    it('should parse DD/MM/YYYY format', () => {
      expect(parseDate('21/02/2026')).toBe('21.02.2026');
    });

    it('should parse DD-MM-YYYY format', () => {
      expect(parseDate('21-02-2026')).toBe('21.02.2026');
    });

    it('should parse ISO YYYY-MM-DD format', () => {
      expect(parseDate('2026-02-21')).toBe('21.02.2026');
    });

    it('should pad single digit day/month', () => {
      expect(parseDate('1.2.2026')).toBe('01.02.2026');
    });

    it('should handle two-digit year', () => {
      expect(parseDate('21.02.26')).toBe('21.02.2026');
    });

    it('should return null for invalid input', () => {
      expect(parseDate(null)).toBeNull();
      expect(parseDate(undefined)).toBeNull();
      expect(parseDate('')).toBeNull();
      expect(parseDate('invalid')).toBeNull();
    });
  });

  describe('mapCategory', () => {
    it('should map food-related categories', () => {
      expect(mapCategory('food')).toBe('food');
      expect(mapCategory('provisions')).toBe('food');
      expect(mapCategory('groceries')).toBe('food');
      expect(mapCategory('restaurant')).toBe('food');
      expect(mapCategory('cafe')).toBe('food');
      expect(mapCategory('bar')).toBe('food');
    });

    it('should map fuel-related categories', () => {
      expect(mapCategory('fuel')).toBe('fuel');
      expect(mapCategory('gas')).toBe('fuel');
      expect(mapCategory('petrol')).toBe('fuel');
      expect(mapCategory('diesel')).toBe('fuel');
    });

    it('should map mooring-related categories', () => {
      expect(mapCategory('marina')).toBe('mooring');
      expect(mapCategory('mooring')).toBe('mooring');
      expect(mapCategory('port')).toBe('mooring');
      expect(mapCategory('harbor')).toBe('mooring');
      expect(mapCategory('harbour')).toBe('mooring');
      expect(mapCategory('docking')).toBe('mooring');
      expect(mapCategory('berth')).toBe('mooring');
    });

    it('should map other categories', () => {
      expect(mapCategory('maintenance')).toBe('other');
      expect(mapCategory('transport')).toBe('other');
      expect(mapCategory('taxi')).toBe('other');
      expect(mapCategory('other')).toBe('other');
    });

    it('should default to other for unknown categories', () => {
      expect(mapCategory('unknown')).toBe('other');
      expect(mapCategory('random')).toBe('other');
    });

    it('should handle null/undefined', () => {
      expect(mapCategory(null)).toBe('other');
      expect(mapCategory(undefined)).toBe('other');
    });

    it('should be case insensitive', () => {
      expect(mapCategory('FOOD')).toBe('food');
      expect(mapCategory('Fuel')).toBe('fuel');
      expect(mapCategory('MARINA')).toBe('mooring');
    });

    it('should handle whitespace', () => {
      expect(mapCategory('  food  ')).toBe('food');
    });
  });

  describe('extractJSON', () => {
    it('should extract JSON from plain object', () => {
      const text = '{"merchant": "Konzum", "amount": 123.45}';
      const result = extractJSON(text);
      expect(result).toEqual({ merchant: 'Konzum', amount: 123.45 });
    });

    it('should extract JSON from markdown code block', () => {
      const text = '```json\n{"merchant": "Konzum", "amount": 123.45}\n```';
      const result = extractJSON(text);
      expect(result).toEqual({ merchant: 'Konzum', amount: 123.45 });
    });

    it('should extract JSON from code block without language', () => {
      const text = '```\n{"merchant": "Konzum"}\n```';
      const result = extractJSON(text);
      expect(result).toEqual({ merchant: 'Konzum' });
    });

    it('should extract JSON surrounded by text', () => {
      const text = 'Here is the result:\n{"merchant": "Konzum"}\nDone!';
      const result = extractJSON(text);
      expect(result).toEqual({ merchant: 'Konzum' });
    });

    it('should return null for invalid JSON', () => {
      expect(extractJSON('not json')).toBeNull();
      expect(extractJSON('{invalid}')).toBeNull();
      expect(extractJSON('')).toBeNull();
    });

    it('should handle complex JSON', () => {
      const text = `
\`\`\`json
{
  "merchant": "Konzum d.d.",
  "amount": 156.78,
  "currency": "EUR",
  "date": "21.02.2026",
  "category": "provisions",
  "confidence": "high"
}
\`\`\`
      `;
      const result = extractJSON(text);
      expect(result).toEqual({
        merchant: 'Konzum d.d.',
        amount: 156.78,
        currency: 'EUR',
        date: '21.02.2026',
        category: 'provisions',
        confidence: 'high',
      });
    });

    it('should handle JSON with error field', () => {
      const text = '{"error": "Not a receipt"}';
      const result = extractJSON(text);
      expect(result).toEqual({ error: 'Not a receipt' });
    });

    it('should handle nested objects', () => {
      const text = '{"data": {"value": 123}}';
      const result = extractJSON(text);
      expect(result).toEqual({ data: { value: 123 } });
    });

    it('should prefer code block over raw JSON', () => {
      const text = '```json\n{"source": "block"}\n``` Some text {"source": "raw"}';
      const result = extractJSON(text);
      expect(result).toEqual({ source: 'block' });
    });
  });
});
