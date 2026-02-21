/**
 * Upload Service Tests
 */

// Mock firebase config before imports
jest.mock('../../../config/firebase', () => ({
  storage: {},
}));

import { sanitizeFilename, generateStoragePath } from './uploadService';

describe('uploadService', () => {
  describe('sanitizeFilename', () => {
    it('should convert to lowercase', () => {
      expect(sanitizeFilename('MyFile.xlsx')).toBe('myfile.xlsx');
    });

    it('should replace spaces with hyphens', () => {
      expect(sanitizeFilename('my file name')).toBe('my-file-name');
    });

    it('should remove special characters', () => {
      expect(sanitizeFilename('file@#$%name!')).toBe('file-name');
    });

    it('should collapse multiple hyphens', () => {
      expect(sanitizeFilename('file---name')).toBe('file-name');
    });

    it('should remove leading/trailing hyphens', () => {
      expect(sanitizeFilename('-file-name-')).toBe('file-name');
    });

    it('should handle Croatian characters', () => {
      expect(sanitizeFilename('čćžšđ')).toBe('');
    });

    it('should preserve dots and underscores', () => {
      expect(sanitizeFilename('file_name.xlsx')).toBe('file_name.xlsx');
    });
  });

  describe('generateStoragePath', () => {
    it('should generate correct path structure', () => {
      const path = generateStoragePath('season-123', 'booking-456', 'report.xlsx');

      // Should start with exports/
      expect(path.startsWith('exports/')).toBe(true);

      // Should contain seasonId and bookingId
      expect(path).toContain('season-123');
      expect(path).toContain('booking-456');

      // Should contain sanitized filename
      expect(path).toContain('report.xlsx');

      // Should contain timestamp pattern YYYY-MM-DD_HHMM
      expect(path).toMatch(/\d{4}-\d{2}-\d{2}_\d{4}/);
    });

    it('should sanitize filename in path', () => {
      const path = generateStoragePath('season', 'booking', 'My Report File!.xlsx');
      expect(path).toContain('my-report-file.xlsx');
    });
  });
});
