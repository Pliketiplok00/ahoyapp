/**
 * Export Service Tests
 *
 * Tests for Excel generation and export functionality.
 */

import * as XLSX from 'xlsx';

// Mock expo-file-system/legacy API
const mockWriteAsStringAsync = jest.fn().mockResolvedValue(undefined);
const mockReadDirectoryAsync = jest.fn().mockResolvedValue([]);
const mockDeleteAsync = jest.fn().mockResolvedValue(undefined);

jest.mock('expo-file-system/legacy', () => ({
  __esModule: true,
  cacheDirectory: '/cache/',
  writeAsStringAsync: mockWriteAsStringAsync,
  readDirectoryAsync: mockReadDirectoryAsync,
  deleteAsync: mockDeleteAsync,
  EncodingType: {
    Base64: 'base64',
  },
}));

import * as Sharing from 'expo-sharing';
import * as MailComposer from 'expo-mail-composer';

jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn().mockResolvedValue(true),
  shareAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('expo-mail-composer', () => ({
  isAvailableAsync: jest.fn().mockResolvedValue(true),
  composeAsync: jest.fn().mockResolvedValue({ status: 'sent' }),
}));

// Mock formatting utilities
jest.mock('../../../utils/formatting', () => ({
  formatCurrency: (amount: number) => `${amount.toFixed(2)} €`,
  formatDate: (date: { toDate?: () => Date } | Date) => {
    const d = date instanceof Date ? date : date.toDate?.() || new Date();
    return d.toLocaleDateString('hr-HR');
  },
}));

import {
  createWorkbook,
  generateFileName,
  exportToExcel,
  shareFile,
  sendViaEmail,
  cleanupExportFiles,
} from './exportService';
import type { ExportData } from './exportService';

// Mock data
const mockBooking = {
  id: 'booking-1',
  seasonId: 'season-1',
  notes: 'John Doe',
  arrivalDate: { toDate: () => new Date('2024-07-15'), seconds: Date.now() / 1000, nanoseconds: 0 },
  departureDate: { toDate: () => new Date('2024-07-22'), seconds: Date.now() / 1000, nanoseconds: 0 },
  departureMarina: 'Kaštela',
  arrivalMarina: 'Kaštela',
  guestCount: 8,
  status: 'active' as const,
  apaTotal: 1000,
  createdBy: 'user-1',
  createdAt: { toDate: () => new Date(), seconds: Date.now() / 1000, nanoseconds: 0 },
  updatedAt: { toDate: () => new Date(), seconds: Date.now() / 1000, nanoseconds: 0 },
};

const mockExpenses = [
  {
    id: 'exp-1',
    bookingId: 'booking-1',
    seasonId: 'season-1',
    amount: 50,
    date: { toDate: () => new Date('2024-07-16'), seconds: Date.now() / 1000, nanoseconds: 0 },
    category: 'food' as const,
    merchant: 'Konzum',
    note: 'Groceries',
    type: 'receipt' as const,
    createdBy: 'user-1',
    createdAt: { toDate: () => new Date(), seconds: Date.now() / 1000, nanoseconds: 0 },
    updatedAt: { toDate: () => new Date(), seconds: Date.now() / 1000, nanoseconds: 0 },
    syncStatus: 'synced' as const,
    isComplete: true,
    ocrStatus: 'completed' as const,
  },
  {
    id: 'exp-2',
    bookingId: 'booking-1',
    seasonId: 'season-1',
    amount: 100,
    date: { toDate: () => new Date('2024-07-17'), seconds: Date.now() / 1000, nanoseconds: 0 },
    category: 'fuel' as const,
    merchant: 'INA',
    type: 'receipt' as const,
    createdBy: 'user-1',
    createdAt: { toDate: () => new Date(), seconds: Date.now() / 1000, nanoseconds: 0 },
    updatedAt: { toDate: () => new Date(), seconds: Date.now() / 1000, nanoseconds: 0 },
    syncStatus: 'synced' as const,
    isComplete: true,
    ocrStatus: 'completed' as const,
  },
];

const mockApaEntries = [
  {
    id: 'apa-1',
    bookingId: 'booking-1',
    amount: 500,
    note: 'Initial APA',
    createdBy: 'user-1',
    createdAt: { toDate: () => new Date('2024-07-15'), seconds: Date.now() / 1000, nanoseconds: 0 },
  },
  {
    id: 'apa-2',
    bookingId: 'booking-1',
    amount: 500,
    createdBy: 'user-1',
    createdAt: { toDate: () => new Date('2024-07-18'), seconds: Date.now() / 1000, nanoseconds: 0 },
  },
];

const mockExportData: ExportData = {
  booking: mockBooking as any,
  expenses: mockExpenses as any,
  apaEntries: mockApaEntries as any,
  reconciliation: null,
  seasonName: 'Summer 2024',
};

describe('exportService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateFileName', () => {
    it('generates file name from booking data', () => {
      const fileName = generateFileName(mockBooking as any, 'Summer2024');

      expect(fileName).toContain('Summer2024');
      expect(fileName).toContain('John_Doe');
      expect(fileName.length).toBeLessThanOrEqual(50);
    });

    it('handles special characters in notes', () => {
      const booking = { ...mockBooking, notes: 'Mr. & Mrs. Smith!' };
      const fileName = generateFileName(booking as any, 'Season');

      expect(fileName).not.toContain('&');
      expect(fileName).not.toContain('!');
      expect(fileName).not.toContain('.');
    });

    it('uses default name when no notes', () => {
      const booking = { ...mockBooking, notes: '' };
      const fileName = generateFileName(booking as any, 'Season');

      expect(fileName).toContain('booking');
    });

    it('truncates long names', () => {
      const booking = {
        ...mockBooking,
        notes: 'Very Long Guest Name That Should Be Truncated',
      };
      const fileName = generateFileName(booking as any, 'VeryLongSeasonName');

      expect(fileName.length).toBeLessThanOrEqual(50);
    });
  });

  describe('createWorkbook', () => {
    it('creates workbook with summary sheet', () => {
      const workbook = createWorkbook(mockExportData);

      expect(workbook.SheetNames).toContain('Izvještaj');
    });

    it('creates workbook with expenses sheet', () => {
      const workbook = createWorkbook(mockExportData);

      expect(workbook.SheetNames).toContain('Troškovi');
    });

    it('creates workbook with APA sheet', () => {
      const workbook = createWorkbook(mockExportData);

      expect(workbook.SheetNames).toContain('APA');
    });

    it('creates workbook with category breakdown', () => {
      const workbook = createWorkbook(mockExportData);

      expect(workbook.SheetNames).toContain('Po kategoriji');
    });

    it('skips expenses sheet when no expenses', () => {
      const dataWithoutExpenses = { ...mockExportData, expenses: [] };
      const workbook = createWorkbook(dataWithoutExpenses);

      expect(workbook.SheetNames).not.toContain('Troškovi');
      expect(workbook.SheetNames).not.toContain('Po kategoriji');
    });

    it('skips APA sheet when no entries', () => {
      const dataWithoutApa = { ...mockExportData, apaEntries: [] };
      const workbook = createWorkbook(dataWithoutApa);

      expect(workbook.SheetNames).not.toContain('APA');
    });

    it('includes reconciliation data when available', () => {
      const dataWithRecon = {
        ...mockExportData,
        reconciliation: {
          expectedCash: 850,
          actualCash: 850,
          difference: 0,
          reconciledAt: { toDate: () => new Date() },
          reconciledBy: 'user-1',
        },
      };
      const workbook = createWorkbook(dataWithRecon as any);

      // Summary sheet should contain reconciliation
      expect(workbook.SheetNames).toContain('Izvještaj');
    });

    it('includes expense table in summary sheet', () => {
      const workbook = createWorkbook(mockExportData);
      const summarySheet = workbook.Sheets['Izvještaj'];
      const data = XLSX.utils.sheet_to_json(summarySheet, { header: 1 }) as string[][];

      // Should contain TROŠKOVI header
      const hasTroskoviHeader = data.some(row => row[0] === 'TROŠKOVI');
      expect(hasTroskoviHeader).toBe(true);

      // Should contain UKUPNO row
      const hasUkupnoRow = data.some(row => row[2] === 'UKUPNO:');
      expect(hasUkupnoRow).toBe(true);
    });
  });

  describe('exportToExcel', () => {
    beforeEach(() => {
      mockWriteAsStringAsync.mockClear();
    });

    it('creates Excel file successfully', async () => {
      const result = await exportToExcel(mockExportData);

      expect(result.success).toBe(true);
      expect(result.data?.fileName).toContain('.xlsx');
      expect(mockWriteAsStringAsync).toHaveBeenCalled();
    });

    it('returns file path', async () => {
      const result = await exportToExcel(mockExportData);

      expect(result.data?.filePath).toBeDefined();
    });

    it('handles errors gracefully', async () => {
      // Mock writeAsStringAsync to throw
      mockWriteAsStringAsync.mockRejectedValueOnce(new Error('Write failed'));

      const result = await exportToExcel(mockExportData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to generate Excel file');
    });
  });

  describe('shareFile', () => {
    it('shares file successfully', async () => {
      const result = await shareFile('/path/to/file.xlsx');

      expect(result.success).toBe(true);
      expect(Sharing.shareAsync).toHaveBeenCalledWith('/path/to/file.xlsx', expect.any(Object));
    });

    it('returns error when sharing unavailable', async () => {
      (Sharing.isAvailableAsync as jest.Mock).mockResolvedValueOnce(false);

      const result = await shareFile('/path/to/file.xlsx');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Sharing is not available on this device');
    });
  });

  describe('sendViaEmail', () => {
    it('sends email with attachment', async () => {
      const result = await sendViaEmail(
        '/path/to/file.xlsx',
        'report.xlsx',
        'owner@yacht.com',
        'John Doe Booking'
      );

      expect(result.success).toBe(true);
      expect(MailComposer.composeAsync).toHaveBeenCalledWith({
        recipients: ['owner@yacht.com'],
        subject: expect.stringContaining('John Doe Booking'),
        body: expect.any(String),
        attachments: ['/path/to/file.xlsx'],
      });
    });

    it('returns error when email unavailable', async () => {
      (MailComposer.isAvailableAsync as jest.Mock).mockResolvedValueOnce(false);

      const result = await sendViaEmail(
        '/path/to/file.xlsx',
        'report.xlsx',
        'owner@yacht.com',
        'Booking'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Email is not available on this device');
    });
  });

  describe('cleanupExportFiles', () => {
    it('cleans up xlsx files from cache', async () => {
      mockReadDirectoryAsync.mockResolvedValueOnce([
        'report1.xlsx',
        'report2.xlsx',
        'other.txt',
      ]);

      await cleanupExportFiles();

      expect(mockDeleteAsync).toHaveBeenCalledWith('/cache/report1.xlsx', { idempotent: true });
      expect(mockDeleteAsync).toHaveBeenCalledWith('/cache/report2.xlsx', { idempotent: true });
      expect(mockDeleteAsync).not.toHaveBeenCalledWith('/cache/other.txt', expect.anything());
    });

    it('handles empty cache directory', async () => {
      mockReadDirectoryAsync.mockResolvedValueOnce([]);

      await cleanupExportFiles();
      // No errors thrown
    });
  });
});
