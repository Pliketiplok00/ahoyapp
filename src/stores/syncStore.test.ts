/**
 * Sync Store Tests
 *
 * Tests for offline sync state management.
 */

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

import {
  useSyncStore,
  selectPendingCount,
  selectIsOnline,
  selectSyncStatus,
  selectHasPendingUploads,
  getPendingByType,
  getPendingById,
  hasFailedUploads,
} from './syncStore';

describe('syncStore', () => {
  beforeEach(() => {
    // Reset store state
    useSyncStore.setState({
      isOnline: true,
      lastSyncAt: null,
      pendingUploads: [],
      pendingCount: 0,
      syncStatus: 'synced',
      syncError: null,
    });
  });

  describe('initial state', () => {
    it('starts with online status', () => {
      expect(useSyncStore.getState().isOnline).toBe(true);
    });

    it('starts with synced status', () => {
      expect(useSyncStore.getState().syncStatus).toBe('synced');
    });

    it('starts with no pending uploads', () => {
      expect(useSyncStore.getState().pendingUploads).toHaveLength(0);
    });
  });

  describe('setOnline', () => {
    it('updates online status', () => {
      useSyncStore.getState().setOnline(false);

      expect(useSyncStore.getState().isOnline).toBe(false);
    });

    it('sets pending status when coming online with pending uploads', () => {
      // Add pending upload first
      useSyncStore.getState().addPendingUpload({
        type: 'expense-receipt',
        data: { bookingId: 'test' },
      });
      useSyncStore.getState().setOnline(false);

      // Come back online
      useSyncStore.getState().setOnline(true);

      expect(useSyncStore.getState().syncStatus).toBe('pending');
    });
  });

  describe('addPendingUpload', () => {
    it('adds upload to queue', () => {
      useSyncStore.getState().addPendingUpload({
        type: 'expense-receipt',
        localPath: '/path/to/file.jpg',
        data: { bookingId: 'booking-1' },
      });

      const state = useSyncStore.getState();
      expect(state.pendingUploads).toHaveLength(1);
      expect(state.pendingUploads[0].type).toBe('expense-receipt');
      expect(state.pendingUploads[0].retryCount).toBe(0);
    });

    it('generates unique ID', () => {
      const id1 = useSyncStore.getState().addPendingUpload({
        type: 'expense-receipt',
        data: {},
      });
      const id2 = useSyncStore.getState().addPendingUpload({
        type: 'apa-entry',
        data: {},
      });

      expect(id1).not.toBe(id2);
    });

    it('updates pending count', () => {
      useSyncStore.getState().addPendingUpload({ type: 'expense-data', data: {} });
      useSyncStore.getState().addPendingUpload({ type: 'expense-data', data: {} });

      expect(useSyncStore.getState().pendingCount).toBe(2);
    });

    it('sets sync status to pending', () => {
      useSyncStore.getState().addPendingUpload({ type: 'expense-data', data: {} });

      expect(useSyncStore.getState().syncStatus).toBe('pending');
    });
  });

  describe('removePendingUpload', () => {
    it('removes upload from queue', () => {
      const uploadId = useSyncStore.getState().addPendingUpload({
        type: 'expense-receipt',
        data: {},
      });

      useSyncStore.getState().removePendingUpload(uploadId);

      expect(useSyncStore.getState().pendingUploads).toHaveLength(0);
    });

    it('updates pending count', () => {
      const uploadId = useSyncStore.getState().addPendingUpload({
        type: 'expense-receipt',
        data: {},
      });
      useSyncStore.getState().addPendingUpload({
        type: 'apa-entry',
        data: {},
      });

      expect(useSyncStore.getState().pendingCount).toBe(2);

      useSyncStore.getState().removePendingUpload(uploadId);

      expect(useSyncStore.getState().pendingCount).toBe(1);
    });

    it('sets status to synced when queue is empty', () => {
      const uploadId = useSyncStore.getState().addPendingUpload({
        type: 'expense-receipt',
        data: {},
      });

      useSyncStore.getState().removePendingUpload(uploadId);

      expect(useSyncStore.getState().syncStatus).toBe('synced');
    });
  });

  describe('incrementRetry', () => {
    it('increments retry count', () => {
      const uploadId = useSyncStore.getState().addPendingUpload({
        type: 'expense-receipt',
        data: {},
      });

      useSyncStore.getState().incrementRetry(uploadId, 'Network error');

      const upload = useSyncStore.getState().pendingUploads[0];
      expect(upload.retryCount).toBe(1);
      expect(upload.lastError).toBe('Network error');
    });

    it('sets sync status to error', () => {
      const uploadId = useSyncStore.getState().addPendingUpload({
        type: 'expense-receipt',
        data: {},
      });

      useSyncStore.getState().incrementRetry(uploadId, 'Failed');

      expect(useSyncStore.getState().syncStatus).toBe('error');
      expect(useSyncStore.getState().syncError).toBe('Failed');
    });
  });

  describe('selectors', () => {
    it('selectPendingCount returns pending count', () => {
      useSyncStore.getState().addPendingUpload({ type: 'expense-data', data: {} });
      useSyncStore.getState().addPendingUpload({ type: 'expense-data', data: {} });

      expect(selectPendingCount(useSyncStore.getState())).toBe(2);
    });

    it('selectIsOnline returns online status', () => {
      useSyncStore.getState().setOnline(false);

      expect(selectIsOnline(useSyncStore.getState())).toBe(false);
    });

    it('selectSyncStatus returns sync status', () => {
      useSyncStore.getState().setSyncStatus('syncing');

      expect(selectSyncStatus(useSyncStore.getState())).toBe('syncing');
    });

    it('selectHasPendingUploads returns true when has uploads', () => {
      expect(selectHasPendingUploads(useSyncStore.getState())).toBe(false);

      useSyncStore.getState().addPendingUpload({ type: 'expense-data', data: {} });

      expect(selectHasPendingUploads(useSyncStore.getState())).toBe(true);
    });
  });

  describe('utility functions', () => {
    it('getPendingByType filters by type', () => {
      useSyncStore.getState().addPendingUpload({ type: 'expense-receipt', data: {} });
      useSyncStore.getState().addPendingUpload({ type: 'apa-entry', data: {} });
      useSyncStore.getState().addPendingUpload({ type: 'expense-receipt', data: {} });

      const receipts = getPendingByType('expense-receipt');
      expect(receipts).toHaveLength(2);
    });

    it('getPendingById returns correct upload', () => {
      useSyncStore.getState().addPendingUpload({ type: 'expense-receipt', data: {} });
      const targetId = useSyncStore.getState().addPendingUpload({
        type: 'apa-entry',
        data: { amount: 100 },
      });

      const upload = getPendingById(targetId);
      expect(upload?.type).toBe('apa-entry');
      expect(upload?.data.amount).toBe(100);
    });

    it('hasFailedUploads returns true for uploads with many retries', () => {
      expect(hasFailedUploads()).toBe(false);

      const uploadId = useSyncStore.getState().addPendingUpload({
        type: 'expense-receipt',
        data: {},
      });

      // Increment retry 4 times (> 3 threshold)
      for (let i = 0; i < 4; i++) {
        useSyncStore.getState().incrementRetry(uploadId);
      }

      expect(hasFailedUploads()).toBe(true);
    });
  });

  describe('clearAll', () => {
    it('clears all pending uploads', () => {
      useSyncStore.getState().addPendingUpload({ type: 'expense-data', data: {} });
      useSyncStore.getState().addPendingUpload({ type: 'apa-entry', data: {} });

      useSyncStore.getState().clearAll();

      expect(useSyncStore.getState().pendingUploads).toHaveLength(0);
      expect(useSyncStore.getState().pendingCount).toBe(0);
      expect(useSyncStore.getState().syncStatus).toBe('synced');
    });
  });
});
