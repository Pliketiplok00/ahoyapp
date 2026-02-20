/**
 * AddApaModal Tests
 *
 * Tests for APA modal input validation.
 */

import { cleanAmountInput, validateAmount } from './AddApaModal';

describe('AddApaModal', () => {
  describe('cleanAmountInput', () => {
    it('allows valid number input', () => {
      expect(cleanAmountInput('500')).toBe('500');
      expect(cleanAmountInput('123.45')).toBe('123.45');
      expect(cleanAmountInput('0.99')).toBe('0.99');
    });

    it('converts comma to decimal point', () => {
      expect(cleanAmountInput('123,45')).toBe('123.45');
      expect(cleanAmountInput('1,5')).toBe('1.5');
    });

    it('removes non-numeric characters', () => {
      expect(cleanAmountInput('$500')).toBe('500');
      expect(cleanAmountInput('500€')).toBe('500');
      expect(cleanAmountInput('abc123')).toBe('123');
    });

    it('rejects multiple decimal points', () => {
      expect(cleanAmountInput('12.34.56')).toBeNull();
      expect(cleanAmountInput('1.2.3')).toBeNull();
    });

    it('rejects more than 2 decimal places', () => {
      expect(cleanAmountInput('12.345')).toBeNull();
      expect(cleanAmountInput('1.999')).toBeNull();
    });

    it('allows up to 2 decimal places', () => {
      expect(cleanAmountInput('12.34')).toBe('12.34');
      expect(cleanAmountInput('12.3')).toBe('12.3');
      expect(cleanAmountInput('12.')).toBe('12.');
    });

    it('handles empty string', () => {
      expect(cleanAmountInput('')).toBe('');
    });
  });

  describe('validateAmount', () => {
    it('accepts positive amounts', () => {
      const result = validateAmount('500');
      expect(result.valid).toBe(true);
      expect(result.value).toBe(500);
    });

    it('accepts decimal amounts', () => {
      const result = validateAmount('123.45');
      expect(result.valid).toBe(true);
      expect(result.value).toBe(123.45);
    });

    it('accepts small amounts', () => {
      const result = validateAmount('0.01');
      expect(result.valid).toBe(true);
      expect(result.value).toBe(0.01);
    });

    it('rejects zero', () => {
      const result = validateAmount('0');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Please enter a valid amount');
    });

    it('rejects negative amounts', () => {
      const result = validateAmount('-100');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Please enter a valid amount');
    });

    it('rejects non-numeric input', () => {
      const result = validateAmount('abc');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Please enter a valid amount');
    });

    it('rejects empty string', () => {
      const result = validateAmount('');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Please enter a valid amount');
    });
  });
});
