/**
 * ZIP Service
 *
 * Creates ZIP packages containing Excel exports and receipt images.
 * ZIP structure:
 *   {clientName}-komplet.zip
 *   ├── {clientName}-troskovi.xlsx
 *   └── racuni/
 *       ├── 2026-02-15_Konzum_156.78€.jpg
 *       └── ...
 */

import JSZip from 'jszip';
import { File, Paths } from 'expo-file-system';
import * as XLSX from 'xlsx';
import type { Booking, Expense } from '../../../types/models';
import { createWorkbook, type ExportData } from './exportService';
import { sanitizeFilename } from './uploadService';

// ============ Types ============

export interface ZipResult {
  success: boolean;
  localUri?: string;
  filename?: string;
  error?: string;
}

// ============ Helpers ============

/**
 * Format date for receipt filename (YYYY-MM-DD)
 */
function formatDateForFilename(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Generate receipt filename
 * Format: 2026-02-15_Konzum_156.78€.jpg
 */
function generateReceiptFilename(expense: Expense): string {
  const date = formatDateForFilename(expense.date.toDate());
  const merchant = sanitizeFilename(expense.merchant || 'nepoznato');
  const amount = expense.amount.toFixed(2).replace('.', ',');
  return `${date}_${merchant}_${amount}EUR.jpg`;
}

/**
 * Get client name from booking for filename
 */
function getClientName(booking: Booking): string {
  // Use notes (first line) or fallback to booking ID
  if (booking.notes) {
    const firstLine = booking.notes.split('\n')[0];
    return sanitizeFilename(firstLine.slice(0, 30));
  }
  return `booking-${booking.id.slice(0, 8)}`;
}

/**
 * Convert blob to base64 string
 */
async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Remove data:image/jpeg;base64, prefix
      const base64 = result.split(',')[1] || result;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// ============ ZIP Generation ============

/**
 * Create full export package (Excel + receipts ZIP)
 *
 * @param data - Export data with booking, expenses, etc.
 * @returns Local URI to generated ZIP file
 */
export async function createFullPackage(data: ExportData): Promise<ZipResult> {
  try {
    console.log('[ZIP] Creating full package...');
    const zip = new JSZip();
    const clientName = getClientName(data.booking);

    // 1. Generate Excel workbook
    console.log('[ZIP] Generating Excel...');
    const workbook = createWorkbook(data);
    const xlsxBuffer = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });
    zip.file(`${clientName}-troskovi.xlsx`, xlsxBuffer, { base64: true });
    console.log('[ZIP] Excel added');

    // 2. Add receipts folder
    const receiptsFolder = zip.folder('racuni');
    if (receiptsFolder) {
      let receiptCount = 0;

      for (const expense of data.expenses) {
        // Check for receipt URL (could be local path or remote URL)
        const receiptPath = expense.receiptUrl || expense.receiptLocalPath;

        if (receiptPath) {
          try {
            console.log('[ZIP] Fetching receipt:', receiptPath.slice(0, 50));
            const response = await fetch(receiptPath);

            if (response.ok) {
              const blob = await response.blob();
              const base64 = await blobToBase64(blob);
              const filename = generateReceiptFilename(expense);
              receiptsFolder.file(filename, base64, { base64: true });
              receiptCount++;
              console.log('[ZIP] Added receipt:', filename);
            }
          } catch (error) {
            console.warn('[ZIP] Failed to add receipt:', expense.id, error);
            // Continue with other receipts
          }
        }
      }

      console.log('[ZIP] Added', receiptCount, 'receipts');
    }

    // 3. Generate ZIP file
    console.log('[ZIP] Generating ZIP...');
    const zipBase64 = await zip.generateAsync({ type: 'base64' });

    // 4. Save to local file system
    const filename = `${clientName}-komplet.zip`;
    const file = new File(Paths.cache, filename);
    await file.write(zipBase64, { encoding: 'base64' });

    console.log('[ZIP] Saved to:', file.uri);

    return {
      success: true,
      localUri: file.uri,
      filename,
    };
  } catch (error) {
    console.error('[ZIP] Error:', error);
    return {
      success: false,
      error: (error as Error)?.message || 'Failed to create ZIP',
    };
  }
}

/**
 * Create Excel-only export (no receipts)
 *
 * @param data - Export data
 * @returns Local URI to generated Excel file
 */
export async function createExcelExport(data: ExportData): Promise<ZipResult> {
  try {
    console.log('[Excel] Creating Excel export...');
    const clientName = getClientName(data.booking);

    // Generate Excel workbook
    const workbook = createWorkbook(data);
    const xlsxBuffer = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });

    // Save to local file system
    const filename = `${clientName}-troskovi.xlsx`;
    const file = new File(Paths.cache, filename);
    await file.write(xlsxBuffer, { encoding: 'base64' });

    console.log('[Excel] Saved to:', file.uri);

    return {
      success: true,
      localUri: file.uri,
      filename,
    };
  } catch (error) {
    console.error('[Excel] Error:', error);
    return {
      success: false,
      error: (error as Error)?.message || 'Failed to create Excel',
    };
  }
}
