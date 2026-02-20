/**
 * Export Service
 *
 * Generates Excel exports of booking expenses.
 * Handles HR locale formatting for numbers and dates.
 */

import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as MailComposer from 'expo-mail-composer';
import * as XLSX from 'xlsx';
import type { Booking, Expense, ApaEntry, Reconciliation } from '../../../types/models';
import { formatCurrency, formatDate } from '../../../utils/formatting';

// ============ Types ============

export interface ExportData {
  booking: Booking;
  expenses: Expense[];
  apaEntries: ApaEntry[];
  reconciliation: Reconciliation | null;
  seasonName: string;
}

export interface ExportOptions {
  includeReceipts: boolean;
  sendViaEmail: boolean;
  emailRecipient?: string;
}

export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ExportResult {
  filePath: string;
  fileName: string;
}

// ============ Excel Generation ============

/**
 * Generate expense data rows for Excel
 */
function generateExpenseRows(expenses: Expense[]): string[][] {
  const header = ['Date', 'Merchant', 'Category', 'Amount (€)', 'Note', 'Type'];

  const rows = expenses.map((expense) => [
    formatDate(expense.date.toDate()),
    expense.merchant || '',
    expense.category,
    expense.amount.toFixed(2).replace('.', ','),
    expense.note || '',
    expense.type === 'receipt' ? 'Receipt' : 'No Receipt',
  ]);

  return [header, ...rows];
}

/**
 * Generate APA data rows for Excel
 */
function generateApaRows(apaEntries: ApaEntry[]): string[][] {
  const header = ['Date', 'Amount (€)', 'Note'];

  const rows = apaEntries.map((entry) => [
    formatDate(entry.createdAt.toDate()),
    entry.amount.toFixed(2).replace('.', ','),
    entry.note || '',
  ]);

  return [header, ...rows];
}

/**
 * Get display name for booking (uses marina or booking ID)
 */
function getBookingDisplayName(booking: Booking): string {
  // Use departure marina or notes as identifier
  if (booking.notes) {
    return booking.notes.substring(0, 50);
  }
  return `Booking ${booking.id.substring(0, 8)}`;
}

/**
 * Generate summary data for Excel
 */
function generateSummaryRows(data: ExportData): string[][] {
  const apaTotal = data.apaEntries.reduce((sum, e) => sum + e.amount, 0);
  const expenseTotal = data.expenses.reduce((sum, e) => sum + e.amount, 0);
  const expectedCash = apaTotal - expenseTotal;

  const rows: string[][] = [
    ['SUMMARY'],
    [],
    ['Booking', getBookingDisplayName(data.booking)],
    ['Season', data.seasonName],
    ['Period', `${formatDate(data.booking.arrivalDate.toDate())} - ${formatDate(data.booking.departureDate.toDate())}`],
    [],
    ['Total APA', `${apaTotal.toFixed(2).replace('.', ',')} €`],
    ['Total Expenses', `${expenseTotal.toFixed(2).replace('.', ',')} €`],
    ['Expected Cash', `${expectedCash.toFixed(2).replace('.', ',')} €`],
  ];

  if (data.reconciliation) {
    rows.push(
      [],
      ['RECONCILIATION'],
      ['Actual Cash', `${data.reconciliation.actualCash.toFixed(2).replace('.', ',')} €`],
      ['Difference', `${data.reconciliation.difference.toFixed(2).replace('.', ',')} €`],
      ['Status', Math.abs(data.reconciliation.difference) < 0.01 ? 'Balanced' : 'Difference'],
    );
  }

  return rows;
}

/**
 * Generate category breakdown for Excel
 */
function generateCategoryBreakdown(expenses: Expense[]): string[][] {
  const categories: Record<string, number> = {};

  expenses.forEach((expense) => {
    categories[expense.category] = (categories[expense.category] || 0) + expense.amount;
  });

  const header = ['EXPENSES BY CATEGORY'];
  const rows: string[][] = [header, []];

  Object.entries(categories)
    .sort((a, b) => b[1] - a[1])
    .forEach(([category, total]) => {
      rows.push([category, `${total.toFixed(2).replace('.', ',')} €`]);
    });

  return rows;
}

/**
 * Create Excel workbook from export data
 */
export function createWorkbook(data: ExportData): XLSX.WorkBook {
  const workbook = XLSX.utils.book_new();

  // Summary sheet
  const summaryData = generateSummaryRows(data);
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

  // Expenses sheet
  if (data.expenses.length > 0) {
    const expenseData = generateExpenseRows(data.expenses);
    const expenseSheet = XLSX.utils.aoa_to_sheet(expenseData);
    XLSX.utils.book_append_sheet(workbook, expenseSheet, 'Expenses');
  }

  // APA sheet
  if (data.apaEntries.length > 0) {
    const apaData = generateApaRows(data.apaEntries);
    const apaSheet = XLSX.utils.aoa_to_sheet(apaData);
    XLSX.utils.book_append_sheet(workbook, apaSheet, 'APA');
  }

  // Category breakdown sheet
  if (data.expenses.length > 0) {
    const categoryData = generateCategoryBreakdown(data.expenses);
    const categorySheet = XLSX.utils.aoa_to_sheet(categoryData);
    XLSX.utils.book_append_sheet(workbook, categorySheet, 'By Category');
  }

  return workbook;
}

/**
 * Generate file name for export
 */
export function generateFileName(booking: Booking, seasonName: string): string {
  const bookingName = (booking.notes || 'booking').replace(/[^a-zA-Z0-9]/g, '_');
  const startDate = formatDate(booking.arrivalDate.toDate()).replace(/\./g, '');
  return `${seasonName.replace(/[^a-zA-Z0-9]/g, '_')}_${bookingName}_${startDate}`.substring(0, 50);
}

/**
 * Export booking data to Excel file
 */
export async function exportToExcel(
  data: ExportData
): Promise<ServiceResult<ExportResult>> {
  try {
    const workbook = createWorkbook(data);
    const fileName = generateFileName(data.booking, data.seasonName);
    const file = new File(Paths.cache, `${fileName}.xlsx`);

    // Generate Excel buffer as base64
    const excelBuffer = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });

    // Write to file system using new API
    await file.write(excelBuffer, { encoding: 'base64' });

    return {
      success: true,
      data: {
        filePath: file.uri,
        fileName: `${fileName}.xlsx`,
      },
    };
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    return {
      success: false,
      error: 'Failed to generate Excel file',
    };
  }
}

// ============ Sharing ============

/**
 * Share file using system share sheet
 */
export async function shareFile(filePath: string): Promise<ServiceResult<void>> {
  try {
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      return {
        success: false,
        error: 'Sharing is not available on this device',
      };
    }

    await Sharing.shareAsync(filePath, {
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      dialogTitle: 'Share Expense Report',
    });

    return { success: true };
  } catch (error) {
    console.error('Error sharing file:', error);
    return {
      success: false,
      error: 'Failed to share file',
    };
  }
}

/**
 * Send file via email
 */
export async function sendViaEmail(
  filePath: string,
  fileName: string,
  recipient: string,
  bookingName: string
): Promise<ServiceResult<void>> {
  try {
    const isAvailable = await MailComposer.isAvailableAsync();
    if (!isAvailable) {
      return {
        success: false,
        error: 'Email is not available on this device',
      };
    }

    await MailComposer.composeAsync({
      recipients: [recipient],
      subject: `Expense Report: ${bookingName}`,
      body: `Please find attached the expense report for ${bookingName}.\n\nGenerated by Ahoy App.`,
      attachments: [filePath],
    });

    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      error: 'Failed to send email',
    };
  }
}

// ============ Combined Export ============

/**
 * Export and share booking data
 */
export async function exportAndShare(
  data: ExportData,
  options: ExportOptions
): Promise<ServiceResult<ExportResult>> {
  // Generate Excel file
  const exportResult = await exportToExcel(data);
  if (!exportResult.success || !exportResult.data) {
    return exportResult;
  }

  const { filePath, fileName } = exportResult.data;

  // Send via email or share
  if (options.sendViaEmail && options.emailRecipient) {
    const emailResult = await sendViaEmail(
      filePath,
      fileName,
      options.emailRecipient,
      getBookingDisplayName(data.booking)
    );
    if (!emailResult.success) {
      return { success: false, error: emailResult.error };
    }
  } else {
    const shareResult = await shareFile(filePath);
    if (!shareResult.success) {
      return { success: false, error: shareResult.error };
    }
  }

  return {
    success: true,
    data: { filePath, fileName },
  };
}

// ============ Cleanup ============

/**
 * Clean up exported files from cache
 */
export async function cleanupExportFiles(): Promise<void> {
  try {
    // List files in cache directory
    const cacheDir = Paths.cache;
    const entries = await cacheDir.list();

    // Delete xlsx files
    for (const entry of entries) {
      if (entry.uri.endsWith('.xlsx')) {
        await entry.delete();
      }
    }
  } catch (error) {
    console.error('Error cleaning up export files:', error);
  }
}
