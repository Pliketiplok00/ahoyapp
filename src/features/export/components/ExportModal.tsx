/**
 * Export Modal
 *
 * Neo-brutalist modal with 3 export options:
 * - PDF Report (coming soon)
 * - Excel Table (.xlsx)
 * - Full Package (Excel + receipts .zip)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import { logger } from '../../../utils/logger';
import {
  COLORS,
  SPACING,
  BORDERS,
  BORDER_RADIUS,
  SHADOWS,
  FONTS,
  TYPOGRAPHY,
  ANIMATION,
} from '../../../config/theme';
import { formatDate } from '../../../utils/formatting';
import type { Booking, Expense, ApaEntry, Reconciliation } from '../../../types/models';
import { createExcelExport, createFullPackage } from '../services/zipService';
import { uploadExport } from '../services/uploadService';
import type { ExportData } from '../services/exportService';

// ============ Types ============

export interface ExportModalProps {
  visible: boolean;
  onClose: () => void;
  booking: Booking;
  expenses: Expense[];
  apaEntries: ApaEntry[];
  reconciliation: Reconciliation | null;
  seasonName: string;
}

type ExportType = 'pdf' | 'excel' | 'full';
type ExportStatus = 'idle' | 'generating' | 'uploading' | 'success' | 'error';

// ============ Component ============

export function ExportModal({
  visible,
  onClose,
  booking,
  expenses,
  apaEntries,
  reconciliation,
  seasonName,
}: ExportModalProps) {
  const [status, setStatus] = useState<ExportStatus>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Display name
  const displayName = booking.notes?.split('\n')[0]?.slice(0, 30) || 'Charter';
  const period = `${formatDate(booking.arrivalDate.toDate())} - ${formatDate(booking.departureDate.toDate())}`;

  // Reset state on close
  const handleClose = () => {
    setStatus('idle');
    setStatusMessage('');
    setDownloadUrl(null);
    setError(null);
    setCopied(false);
    onClose();
  };

  // Handle export
  const handleExport = async (type: ExportType) => {
    if (type === 'pdf') {
      // PDF coming soon
      setError('PDF export coming soon!');
      return;
    }

    try {
      setError(null);
      setStatus('generating');
      setStatusMessage(
        type === 'excel' ? 'Generiram Excel...' : 'Generiram paket...'
      );

      // Prepare export data
      const exportData: ExportData = {
        booking,
        expenses,
        apaEntries,
        reconciliation,
        seasonName,
      };

      // Generate file locally
      const result =
        type === 'excel'
          ? await createExcelExport(exportData)
          : await createFullPackage(exportData);

      if (!result.success || !result.localUri || !result.filename) {
        throw new Error(result.error || 'Failed to generate export');
      }

      // Upload to Firebase Storage
      setStatus('uploading');
      setStatusMessage('Uploadam...');

      const uploadResult = await uploadExport(
        result.localUri,
        booking.seasonId,
        booking.id,
        result.filename
      );

      if (!uploadResult.success || !uploadResult.downloadUrl) {
        throw new Error(uploadResult.error || 'Upload failed');
      }

      // Success!
      setDownloadUrl(uploadResult.downloadUrl);
      setStatus('success');
      setStatusMessage('Gotovo!');
    } catch (err) {
      logger.error('[Export] Error:', err);
      setStatus('error');
      setError((err as Error)?.message || 'Export failed');
    }
  };

  // Copy link to clipboard
  const handleCopyLink = async () => {
    if (downloadUrl) {
      await Clipboard.setStringAsync(downloadUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Share link
  const handleShare = async () => {
    if (downloadUrl) {
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        // Share the URL as text
        await Sharing.shareAsync(downloadUrl, {
          dialogTitle: `Export: ${displayName}`,
          mimeType: 'text/plain',
        });
      }
    }
  };

  // Render loading state
  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={styles.loadingText}>{statusMessage}</Text>
    </View>
  );

  // Render success state
  const renderSuccess = () => (
    <View style={styles.successContainer}>
      <Text style={styles.successIcon}>✅</Text>
      <Text style={styles.successTitle}>EXPORT SPREMAN</Text>

      <View style={styles.urlBox}>
        <Text style={styles.urlText} numberOfLines={2}>
          {downloadUrl}
        </Text>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.actionButton,
          styles.copyButton,
          pressed && styles.buttonPressed,
        ]}
        onPress={handleCopyLink}
      >
        <Text style={styles.actionButtonText}>
          {copied ? '✓ KOPIRANO!' : '📋 KOPIRAJ LINK'}
        </Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [
          styles.actionButton,
          styles.shareButton,
          pressed && styles.buttonPressed,
        ]}
        onPress={handleShare}
      >
        <Text style={styles.actionButtonText}>📤 PODIJELI</Text>
      </Pressable>

      <Text style={styles.expiryNote}>Link vrijedi 7 dana</Text>

      <Pressable
        style={({ pressed }) => [
          styles.closeButton,
          pressed && styles.buttonPressed,
        ]}
        onPress={handleClose}
      >
        <Text style={styles.closeButtonText}>ZATVORI</Text>
      </Pressable>
    </View>
  );

  // Render error state
  const renderError = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorIcon}>⚠️</Text>
      <Text style={styles.errorTitle}>GREŠKA</Text>
      <Text style={styles.errorText}>{error}</Text>
      <Pressable
        style={({ pressed }) => [
          styles.retryButton,
          pressed && styles.buttonPressed,
        ]}
        onPress={() => setStatus('idle')}
      >
        <Text style={styles.retryButtonText}>POKUŠAJ PONOVO</Text>
      </Pressable>
    </View>
  );

  // Render options
  const renderOptions = () => (
    <>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>EXPORT</Text>
        <Pressable
          style={({ pressed }) => [
            styles.headerClose,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleClose}
        >
          <Text style={styles.headerCloseText}>×</Text>
        </Pressable>
      </View>

      {/* Booking Info */}
      <View style={styles.bookingInfo}>
        <Text style={styles.bookingName}>{displayName.toUpperCase()}</Text>
        <Text style={styles.bookingPeriod}>{period}</Text>
      </View>

      {/* Export Options */}
      <View style={styles.options}>
        {/* PDF Option - Coming Soon */}
        <Pressable
          style={({ pressed }) => [
            styles.optionCard,
            styles.optionDisabled,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => handleExport('pdf')}
        >
          <Text style={styles.optionIcon}>📄</Text>
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>PDF IZVJEŠTAJ</Text>
            <Text style={styles.optionSubtitle}>Sažetak chartera (uskoro)</Text>
          </View>
        </Pressable>

        {/* Excel Option */}
        <Pressable
          style={({ pressed }) => [
            styles.optionCard,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => handleExport('excel')}
        >
          <Text style={styles.optionIcon}>📊</Text>
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>EXCEL TABLICA</Text>
            <Text style={styles.optionSubtitle}>Svi troškovi (.xlsx)</Text>
          </View>
        </Pressable>

        {/* Full Package Option */}
        <Pressable
          style={({ pressed }) => [
            styles.optionCard,
            styles.optionHighlight,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => handleExport('full')}
        >
          <Text style={styles.optionIcon}>📦</Text>
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>KOMPLETAN PAKET</Text>
            <Text style={styles.optionSubtitle}>
              Excel + svi računi (.zip)
            </Text>
          </View>
        </Pressable>
      </View>

      {/* Stats */}
      <View style={styles.stats}>
        <Text style={styles.statsText}>
          {expenses.length} troškova · {expenses.filter((e) => e.receiptUrl || e.receiptLocalPath).length} računa
        </Text>
      </View>
    </>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {status === 'idle' && renderOptions()}
          {(status === 'generating' || status === 'uploading') && renderLoading()}
          {status === 'success' && renderSuccess()}
          {status === 'error' && renderError()}
        </View>
      </View>
    </Modal>
  );
}

// ============ Styles ============

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlayDark,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modal: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.heavy,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    ...SHADOWS.brut,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderBottomWidth: BORDERS.normal,
    borderBottomColor: COLORS.foreground,
    backgroundColor: COLORS.primary,
  },
  headerTitle: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.cardTitle,
    color: COLORS.foreground,
    letterSpacing: TYPOGRAPHY.letterSpacing.wide,
  },
  headerClose: {
    width: 32,
    height: 32,
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCloseText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.cardTitle,
    color: COLORS.foreground,
  },

  // Booking Info
  bookingInfo: {
    padding: SPACING.md,
    borderBottomWidth: BORDERS.thin,
    borderBottomColor: COLORS.muted,
  },
  bookingName: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
    marginBottom: SPACING.xxs,
  },
  bookingPeriod: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
  },

  // Options
  options: {
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    ...SHADOWS.brutSm,
  },
  optionHighlight: {
    backgroundColor: COLORS.accent,
  },
  optionDisabled: {
    opacity: 0.5,
  },
  optionIcon: {
    fontSize: 28,
    marginRight: SPACING.md,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
    marginBottom: SPACING.xxs,
  },
  optionSubtitle: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
  },

  // Stats
  stats: {
    padding: SPACING.md,
    paddingTop: 0,
  },
  statsText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.meta,
    color: COLORS.mutedForeground,
    textAlign: 'center',
  },

  // Loading
  loadingContainer: {
    padding: SPACING.xxl,
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
    marginTop: SPACING.lg,
  },

  // Success
  successContainer: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  successIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  successTitle: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.cardTitle,
    color: COLORS.foreground,
    marginBottom: SPACING.lg,
  },
  urlBox: {
    width: '100%',
    padding: SPACING.md,
    backgroundColor: COLORS.muted,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    marginBottom: SPACING.md,
  },
  urlText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.meta,
    color: COLORS.mutedForeground,
  },
  actionButton: {
    width: '100%',
    padding: SPACING.md,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    alignItems: 'center',
    marginBottom: SPACING.sm,
    ...SHADOWS.brutSm,
  },
  copyButton: {
    backgroundColor: COLORS.primary,
  },
  shareButton: {
    backgroundColor: COLORS.secondary,
  },
  actionButtonText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.white,
  },
  expiryNote: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.meta,
    color: COLORS.mutedForeground,
    marginTop: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  closeButton: {
    width: '100%',
    padding: SPACING.md,
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    alignItems: 'center',
  },
  closeButtonText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
  },

  // Error
  errorContainer: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  errorTitle: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.cardTitle,
    color: COLORS.destructive,
    marginBottom: SPACING.sm,
  },
  errorText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.mutedForeground,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  retryButton: {
    width: '100%',
    padding: SPACING.md,
    backgroundColor: COLORS.primary,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    alignItems: 'center',
    ...SHADOWS.brutSm,
  },
  retryButtonText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.white,
  },

  // Pressed
  buttonPressed: {
    transform: ANIMATION.pressedTransform,
  },
});

export default ExportModal;
