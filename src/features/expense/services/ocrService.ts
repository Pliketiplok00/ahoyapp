/**
 * OCR Service
 *
 * Receipt scanning using Gemini Vision API.
 * Extracts merchant, amount, date, and category from receipt images.
 */

import { EXPENSE_CATEGORIES, type ExpenseCategory } from '../../../config/expenses';

// ============ Types ============

export interface OCRResult {
  merchant: string | null;
  amount: number | null;
  currency: string;
  date: string | null; // DD.MM.YYYY format
  category: ExpenseCategory;
  confidence: 'high' | 'medium' | 'low';
  rawText?: string;
  error?: string;
}

export interface OCRServiceResult {
  success: boolean;
  data?: OCRResult;
  error?: string;
}

// ============ Constants ============

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

// Category mapping from Gemini response to our categories
const CATEGORY_MAP: Record<string, ExpenseCategory> = {
  food: 'food',
  provisions: 'food',
  groceries: 'food',
  restaurant: 'food',
  cafe: 'food',
  bar: 'food',
  fuel: 'fuel',
  gas: 'fuel',
  petrol: 'fuel',
  diesel: 'fuel',
  marina: 'mooring',
  mooring: 'mooring',
  port: 'mooring',
  harbor: 'mooring',
  harbour: 'mooring',
  docking: 'mooring',
  berth: 'mooring',
  maintenance: 'other',
  transport: 'other',
  taxi: 'other',
  other: 'other',
};

// ============ Helpers ============

/**
 * Parse amount from string, handling both comma and dot decimals
 * "156,78" → 156.78
 * "156.78" → 156.78
 * "1.234,56" → 1234.56
 */
export function parseAmount(amountStr: string | number | null | undefined): number | null {
  if (amountStr === null || amountStr === undefined) return null;

  // If already a number, return it
  if (typeof amountStr === 'number') {
    return isNaN(amountStr) ? null : amountStr;
  }

  // Remove currency symbols and whitespace
  let cleaned = amountStr.replace(/[€$£\s]/g, '').trim();

  // Handle European format: 1.234,56 → 1234.56
  // Check if we have comma as decimal separator (and possibly dots as thousands)
  if (cleaned.includes(',')) {
    // If there's a dot before comma, it's thousands separator
    if (cleaned.indexOf('.') < cleaned.indexOf(',')) {
      cleaned = cleaned.replace(/\./g, ''); // Remove thousand separators
      cleaned = cleaned.replace(',', '.'); // Convert decimal comma to dot
    } else {
      // Just comma as decimal
      cleaned = cleaned.replace(',', '.');
    }
  }

  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Parse date from various formats to DD.MM.YYYY
 * Handles: "21.02.2026", "21/02/2026", "2026-02-21", etc.
 */
export function parseDate(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null;

  // Try YYYY-MM-DD (ISO format) FIRST - check for 4-digit year at start
  const isoMatch = dateStr.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoMatch) {
    const day = isoMatch[3].padStart(2, '0');
    const month = isoMatch[2].padStart(2, '0');
    return `${day}.${month}.${isoMatch[1]}`;
  }

  // Try DD.MM.YYYY or DD/MM/YYYY or DD-MM-YYYY (European format)
  const euroMatch = dateStr.match(/(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})/);
  if (euroMatch) {
    const day = euroMatch[1].padStart(2, '0');
    const month = euroMatch[2].padStart(2, '0');
    let year = euroMatch[3];
    if (year.length === 2) {
      year = '20' + year;
    }
    return `${day}.${month}.${year}`;
  }

  return null;
}

/**
 * Map category string to ExpenseCategory
 */
export function mapCategory(categoryStr: string | null | undefined): ExpenseCategory {
  if (!categoryStr) return 'other';

  const normalized = categoryStr.toLowerCase().trim();
  return CATEGORY_MAP[normalized] || 'other';
}

/**
 * Extract JSON from Gemini response text (handles markdown code blocks)
 */
export function extractJSON(text: string): Record<string, unknown> | null {
  // Try to find JSON in markdown code block
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1].trim());
    } catch {
      // Continue to try other methods
    }
  }

  // Try to find raw JSON object
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch {
      return null;
    }
  }

  return null;
}

// ============ Main OCR Function ============

/**
 * Extract receipt data from image using Gemini Vision API
 *
 * @param imageBase64 - Base64 encoded image data (without data:image prefix)
 * @returns OCRResult with extracted data
 */
export async function extractReceiptData(imageBase64: string): Promise<OCRServiceResult> {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

  // Debug logging
  console.log('[OCR] API Key exists:', !!apiKey);
  console.log('[OCR] API Key length:', apiKey?.length || 0);
  console.log('[OCR] Image base64 length:', imageBase64.length);

  if (!apiKey) {
    console.error('[OCR] No API key found in EXPO_PUBLIC_GEMINI_API_KEY');
    return {
      success: false,
      error: 'Gemini API key not configured',
    };
  }

  try {
    console.log('[OCR] Calling Gemini API...');
    const categoryList = EXPENSE_CATEGORIES.map((c) => c.id).join(', ');

    const url = `${GEMINI_API_URL}?key=${apiKey}`;
    console.log('[OCR] Request URL:', url.replace(apiKey, '***'));

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Analyze this receipt image and extract:
1. Merchant/store name (the business name at the top of the receipt)
2. Total amount (the final amount paid, not subtotal - look for "UKUPNO", "TOTAL", "IZNOS", or the largest bold number)
3. Currency (EUR, HRK, USD, etc. - default to EUR if not visible)
4. Date of purchase (look for date/datum)
5. Category (one of: ${categoryList})

Return ONLY valid JSON in this exact format, no other text:
{
  "merchant": "Store Name",
  "amount": 123.45,
  "currency": "EUR",
  "date": "21.02.2026",
  "category": "food",
  "confidence": "high"
}

Rules:
- For amount, use a number (not string), e.g., 123.45 not "123,45"
- For date, use DD.MM.YYYY format
- confidence: "high" if all fields clear, "medium" if some unclear, "low" if mostly guessing
- If you can't read a field, use null
- If this is not a receipt, return: {"error": "Not a receipt"}`,
              },
              {
                inline_data: {
                  mime_type: 'image/jpeg',
                  data: imageBase64,
                },
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      return {
        success: false,
        error: 'Failed to analyze receipt. Please try again.',
      };
    }

    const data = await response.json();

    // Extract text from response
    const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!responseText) {
      return {
        success: false,
        error: 'No response from AI. Please try again.',
      };
    }

    // Parse JSON from response
    const parsed = extractJSON(responseText);
    if (!parsed) {
      return {
        success: false,
        error: 'Could not parse AI response. Please try again.',
      };
    }

    // Check for error response (not a receipt)
    if (parsed.error) {
      return {
        success: false,
        error: String(parsed.error),
      };
    }

    // Build result
    const result: OCRResult = {
      merchant: parsed.merchant ? String(parsed.merchant) : null,
      amount: parseAmount(parsed.amount as string | number | null),
      currency: parsed.currency ? String(parsed.currency) : 'EUR',
      date: parseDate(parsed.date as string | null),
      category: mapCategory(parsed.category as string | null),
      confidence: (parsed.confidence as 'high' | 'medium' | 'low') || 'medium',
      rawText: responseText,
    };

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error('[OCR] Error:', error);
    console.error('[OCR] Error name:', (error as Error)?.name);
    console.error('[OCR] Error message:', (error as Error)?.message);
    return {
      success: false,
      error: 'Failed to analyze receipt. Check your internet connection.',
    };
  }
}

/**
 * Test Gemini API connection (without image)
 * Use this to verify API key and network are working
 */
export async function testGeminiConnection(): Promise<boolean> {
  try {
    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    console.log('[OCR] Testing connection, key exists:', !!apiKey);
    console.log('[OCR] Key first 10 chars:', apiKey?.slice(0, 10) + '...');

    const response = await fetch(
      `${GEMINI_API_URL}?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Say hello' }] }],
        }),
      }
    );

    console.log('[OCR] Test response status:', response.status);
    const data = await response.json();
    console.log('[OCR] Test response:', JSON.stringify(data).slice(0, 200));

    return response.ok;
  } catch (error) {
    console.error('[OCR] Test connection failed:', error);
    console.error('[OCR] Error type:', (error as Error)?.constructor?.name);
    console.error('[OCR] Error message:', (error as Error)?.message);
    return false;
  }
}

/**
 * Convert image URI to base64
 * Works with both file:// and content:// URIs
 */
export async function imageToBase64(uri: string): Promise<string> {
  const response = await fetch(uri);
  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      // Remove data:image/jpeg;base64, prefix
      const base64Data = base64.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
