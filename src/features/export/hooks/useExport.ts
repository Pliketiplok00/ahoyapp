/**
 * useExport Hook
 *
 * Manages export state and operations for a booking.
 * Handles Excel generation and sharing.
 *
 * @example
 * const { export, isExporting, error } = useExport(bookingId);
 * await export({ sendViaEmail: true, emailRecipient: 'owner@yacht.com' });
 */

import { useState, useCallback } from 'react';
import * as exportService from '../services/exportService';
import type { ExportOptions, ExportData, ExportResult } from '../services/exportService';
import type { Booking, Expense, ApaEntry, Reconciliation } from '../../../types/models';

interface UseExportReturn {
  // State
  isExporting: boolean;
  error: string | null;
  lastExport: ExportResult | null;

  // Actions
  exportBooking: (options: ExportOptions) => Promise<{ success: boolean; error?: string }>;
  shareLastExport: () => Promise<{ success: boolean; error?: string }>;
  clearError: () => void;
}

interface UseExportProps {
  booking: Booking | null;
  expenses: Expense[];
  apaEntries: ApaEntry[];
  reconciliation: Reconciliation | null;
  seasonName: string;
}

export function useExport({
  booking,
  expenses,
  apaEntries,
  reconciliation,
  seasonName,
}: UseExportProps): UseExportReturn {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastExport, setLastExport] = useState<ExportResult | null>(null);

  /**
   * Export booking data with options
   */
  const exportBooking = useCallback(
    async (options: ExportOptions) => {
      if (!booking) {
        return { success: false, error: 'No booking data' };
      }

      setIsExporting(true);
      setError(null);

      const exportData: ExportData = {
        booking,
        expenses,
        apaEntries,
        reconciliation,
        seasonName,
      };

      const result = await exportService.exportAndShare(exportData, options);

      setIsExporting(false);

      if (result.success && result.data) {
        setLastExport(result.data);
        return { success: true };
      }

      setError(result.error || 'Export failed');
      return { success: false, error: result.error };
    },
    [booking, expenses, apaEntries, reconciliation, seasonName]
  );

  /**
   * Share the last exported file
   */
  const shareLastExport = useCallback(async () => {
    if (!lastExport) {
      return { success: false, error: 'No export available' };
    }

    const result = await exportService.shareFile(lastExport.filePath);
    if (!result.success) {
      setError(result.error || 'Share failed');
    }
    return result;
  }, [lastExport]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isExporting,
    error,
    lastExport,
    exportBooking,
    shareLastExport,
    clearError,
  };
}
