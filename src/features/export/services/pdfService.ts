/**
 * PDF Service
 *
 * Generates PDF reports of booking expenses.
 * Uses expo-print for PDF generation.
 * HR locale formatting for all values.
 */

import { logger } from '../../../utils/logger';
import * as Print from 'expo-print';
import { cacheDirectory, writeAsStringAsync, EncodingType } from 'expo-file-system/legacy';
import type { Booking, Expense, ApaEntry, Reconciliation } from '../../../types/models';
import { formatDate, formatCurrency } from '../../../utils/formatting';
import { sanitizeFilename } from './uploadService';
import type { ExportData } from './exportService';

// ============ Types ============

export interface PdfResult {
  success: boolean;
  localUri?: string;
  filename?: string;
  error?: string;
}

// ============ Helpers ============

/**
 * Get client name from booking for filename
 */
function getClientName(booking: Booking): string {
  if (booking.notes) {
    const firstLine = booking.notes.split('\n')[0];
    return sanitizeFilename(firstLine.slice(0, 30));
  }
  return `booking-${booking.id.slice(0, 8)}`;
}

/**
 * Group expenses by category
 */
function groupExpensesByCategory(expenses: Expense[]): Record<string, { items: Expense[]; total: number }> {
  const groups: Record<string, { items: Expense[]; total: number }> = {};

  expenses.forEach((expense) => {
    if (!groups[expense.category]) {
      groups[expense.category] = { items: [], total: 0 };
    }
    groups[expense.category].items.push(expense);
    groups[expense.category].total += expense.amount;
  });

  return groups;
}

/**
 * Format amount with HR locale (comma as decimal separator)
 */
function formatAmountHR(amount: number): string {
  return `${amount.toFixed(2).replace('.', ',')} €`;
}

// ============ HTML Template ============

/**
 * Generate HTML template for PDF
 */
function generateHtmlTemplate(data: ExportData): string {
  const { booking, expenses, apaEntries, reconciliation, seasonName } = data;

  // Calculate totals
  const apaTotal = apaEntries.reduce((sum, e) => sum + e.amount, 0);
  const expenseTotal = expenses.reduce((sum, e) => sum + e.amount, 0);
  const expectedCash = apaTotal - expenseTotal;

  // Group expenses by category
  const expensesByCategory = groupExpensesByCategory(expenses);

  // Sort expenses by date
  const sortedExpenses = [...expenses].sort(
    (a, b) => a.date.toDate().getTime() - b.date.toDate().getTime()
  );

  // Client name and period
  const clientName = booking.notes?.split('\n')[0]?.slice(0, 40) || 'Charter';
  const period = `${formatDate(booking.arrivalDate.toDate())} - ${formatDate(booking.departureDate.toDate())}`;

  // Generate category breakdown HTML
  const categoryRows = Object.entries(expensesByCategory)
    .sort((a, b) => b[1].total - a[1].total)
    .map(([category, data]) => `
      <tr>
        <td>${category}</td>
        <td class="amount">${formatAmountHR(data.total)}</td>
        <td class="count">${data.items.length}</td>
      </tr>
    `).join('');

  // Generate expense rows HTML
  const expenseRows = sortedExpenses.map((expense) => `
    <tr>
      <td>${formatDate(expense.date.toDate())}</td>
      <td>${expense.merchant || '-'}</td>
      <td>${expense.category}</td>
      <td class="amount">${formatAmountHR(expense.amount)}</td>
    </tr>
  `).join('');

  // Reconciliation section
  const reconciliationHtml = reconciliation ? `
    <div class="section">
      <h2>REKONCILIJACIJA</h2>
      <table class="summary-table">
        <tr>
          <td>Stvarna gotovina:</td>
          <td class="value">${formatAmountHR(reconciliation.actualCash)}</td>
        </tr>
        <tr>
          <td>Razlika:</td>
          <td class="value ${Math.abs(reconciliation.difference) < 0.01 ? 'success' : 'warning'}">
            ${formatAmountHR(reconciliation.difference)}
          </td>
        </tr>
        <tr>
          <td>Status:</td>
          <td class="value">
            ${Math.abs(reconciliation.difference) < 0.01 ? '✓ Uravnoteženo' : '⚠ Razlika'}
          </td>
        </tr>
      </table>
    </div>
  ` : '';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Izvještaj - ${clientName}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 12px;
      line-height: 1.4;
      color: #1a1a1a;
      padding: 24px;
    }

    .header {
      background-color: #ffd93d;
      border: 3px solid #1a1a1a;
      padding: 20px;
      margin-bottom: 24px;
    }

    .header h1 {
      font-size: 24px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 8px;
    }

    .header .meta {
      font-family: 'Courier New', monospace;
      font-size: 11px;
      color: #444;
    }

    .section {
      border: 2px solid #1a1a1a;
      margin-bottom: 16px;
      background: #fff;
    }

    .section h2 {
      background-color: #1a1a1a;
      color: #fff;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      padding: 8px 12px;
    }

    .section-content {
      padding: 12px;
    }

    .summary-table {
      width: 100%;
      border-collapse: collapse;
    }

    .summary-table td {
      padding: 6px 12px;
      border-bottom: 1px solid #eee;
    }

    .summary-table td.value {
      text-align: right;
      font-family: 'Courier New', monospace;
      font-weight: 700;
    }

    .summary-table td.highlight {
      background-color: #ffd93d;
      font-weight: 700;
    }

    .summary-table td.success {
      color: #22c55e;
    }

    .summary-table td.warning {
      color: #ef4444;
    }

    table.expenses-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10px;
    }

    .expenses-table th {
      background-color: #f5f5f5;
      text-align: left;
      padding: 8px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 2px solid #1a1a1a;
    }

    .expenses-table td {
      padding: 6px 8px;
      border-bottom: 1px solid #eee;
    }

    .expenses-table td.amount,
    .expenses-table th.amount {
      text-align: right;
      font-family: 'Courier New', monospace;
    }

    .expenses-table td.count,
    .expenses-table th.count {
      text-align: center;
    }

    .expenses-table tr:nth-child(even) {
      background-color: #fafafa;
    }

    .total-row {
      background-color: #ffd93d !important;
      font-weight: 700;
    }

    .total-row td {
      border-bottom: none;
      padding: 10px 8px;
    }

    .footer {
      margin-top: 24px;
      padding-top: 12px;
      border-top: 1px solid #ccc;
      font-family: 'Courier New', monospace;
      font-size: 9px;
      color: #888;
      text-align: center;
    }

    .two-col {
      display: flex;
      gap: 16px;
    }

    .two-col > div {
      flex: 1;
    }

    @media print {
      body {
        padding: 0;
      }
      .section {
        break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <!-- Header -->
  <div class="header">
    <h1>${clientName}</h1>
    <div class="meta">
      ${period} · ${seasonName}
    </div>
  </div>

  <!-- Summary -->
  <div class="section">
    <h2>SAŽETAK</h2>
    <table class="summary-table">
      <tr>
        <td>Ukupno APA:</td>
        <td class="value">${formatAmountHR(apaTotal)}</td>
      </tr>
      <tr>
        <td>Ukupno troškovi:</td>
        <td class="value">${formatAmountHR(expenseTotal)}</td>
      </tr>
      <tr>
        <td class="highlight">Očekivana gotovina:</td>
        <td class="value highlight">${formatAmountHR(expectedCash)}</td>
      </tr>
    </table>
  </div>

  ${reconciliationHtml}

  <!-- Category Breakdown -->
  ${Object.keys(expensesByCategory).length > 0 ? `
  <div class="section">
    <h2>TROŠKOVI PO KATEGORIJI</h2>
    <table class="expenses-table">
      <thead>
        <tr>
          <th>Kategorija</th>
          <th class="amount">Iznos</th>
          <th class="count">Broj</th>
        </tr>
      </thead>
      <tbody>
        ${categoryRows}
        <tr class="total-row">
          <td>UKUPNO</td>
          <td class="amount">${formatAmountHR(expenseTotal)}</td>
          <td class="count">${expenses.length}</td>
        </tr>
      </tbody>
    </table>
  </div>
  ` : ''}

  <!-- All Expenses -->
  ${sortedExpenses.length > 0 ? `
  <div class="section">
    <h2>SVI TROŠKOVI</h2>
    <table class="expenses-table">
      <thead>
        <tr>
          <th>Datum</th>
          <th>Trgovina</th>
          <th>Kategorija</th>
          <th class="amount">Iznos</th>
        </tr>
      </thead>
      <tbody>
        ${expenseRows}
        <tr class="total-row">
          <td colspan="3">UKUPNO</td>
          <td class="amount">${formatAmountHR(expenseTotal)}</td>
        </tr>
      </tbody>
    </table>
  </div>
  ` : ''}

  <!-- Footer -->
  <div class="footer">
    Generirano: ${formatDate(new Date())} · AhoyCrew App
  </div>
</body>
</html>
  `.trim();
}

// ============ PDF Generation ============

/**
 * Create PDF report
 *
 * @param data - Export data with booking, expenses, etc.
 * @returns Local URI to generated PDF file
 */
export async function createPdfReport(data: ExportData): Promise<PdfResult> {
  try {
    logger.log('[PDF] Creating PDF report...');

    // Generate HTML
    const html = generateHtmlTemplate(data);

    // Generate PDF
    const { uri } = await Print.printToFileAsync({
      html,
      base64: false,
    });

    logger.log('[PDF] Generated at:', uri);

    // Generate filename
    const clientName = getClientName(data.booking);
    const filename = `${clientName}-izvjestaj.pdf`;

    // Move to cache with proper name (expo-print generates random name)
    const finalPath = `${cacheDirectory}${filename}`;

    // Copy content (expo-print returns a temp file)
    // We need to read and rewrite to rename
    const response = await fetch(uri);
    const blob = await response.blob();
    const reader = new FileReader();

    const base64Data = await new Promise<string>((resolve, reject) => {
      reader.onloadend = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1] || result;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    await writeAsStringAsync(finalPath, base64Data, {
      encoding: EncodingType.Base64,
    });

    logger.log('[PDF] Saved to:', finalPath);

    return {
      success: true,
      localUri: finalPath,
      filename,
    };
  } catch (error) {
    logger.error('[PDF] Error:', error);
    return {
      success: false,
      error: (error as Error)?.message || 'Failed to create PDF',
    };
  }
}
