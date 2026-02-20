/**
 * Sync Store
 *
 * Manages offline sync state using Zustand.
 * Tracks pending uploads, sync status, and network state.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============ Types ============

export type SyncStatus = 'synced' | 'pending' | 'syncing' | 'error';

export interface PendingUpload {
  id: string;
  type: 'expense-receipt' | 'expense-data' | 'apa-entry';
  localPath?: string;
  data: Record<string, unknown>;
  createdAt: number;
  retryCount: number;
  lastError?: string;
}

interface SyncState {
  // Network state
  isOnline: boolean;
  lastSyncAt: number | null;

  // Pending items
  pendingUploads: PendingUpload[];
  pendingCount: number;

  // Status
  syncStatus: SyncStatus;
  syncError: string | null;

  // Actions
  setOnline: (isOnline: boolean) => void;
  addPendingUpload: (upload: Omit<PendingUpload, 'id' | 'createdAt' | 'retryCount'>) => string;
  removePendingUpload: (id: string) => void;
  updatePendingUpload: (id: string, updates: Partial<PendingUpload>) => void;
  incrementRetry: (id: string, error?: string) => void;
  setSyncStatus: (status: SyncStatus, error?: string) => void;
  setLastSyncAt: (timestamp: number) => void;
  clearAll: () => void;
}

// ============ Store ============

export const useSyncStore = create<SyncState>()(
  persist(
    (set, get) => ({
      // Initial state
      isOnline: true,
      lastSyncAt: null,
      pendingUploads: [],
      pendingCount: 0,
      syncStatus: 'synced',
      syncError: null,

      // Actions
      setOnline: (isOnline) => {
        set({ isOnline });
        // If coming back online, set status to pending if there are uploads
        if (isOnline && get().pendingUploads.length > 0) {
          set({ syncStatus: 'pending' });
        }
      },

      addPendingUpload: (upload) => {
        const id = `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newUpload: PendingUpload = {
          ...upload,
          id,
          createdAt: Date.now(),
          retryCount: 0,
        };
        set((state) => ({
          pendingUploads: [...state.pendingUploads, newUpload],
          pendingCount: state.pendingUploads.length + 1,
          syncStatus: 'pending',
        }));
        return id;
      },

      removePendingUpload: (id) => {
        set((state) => {
          const newUploads = state.pendingUploads.filter((u) => u.id !== id);
          return {
            pendingUploads: newUploads,
            pendingCount: newUploads.length,
            syncStatus: newUploads.length === 0 ? 'synced' : state.syncStatus,
          };
        });
      },

      updatePendingUpload: (id, updates) => {
        set((state) => ({
          pendingUploads: state.pendingUploads.map((u) =>
            u.id === id ? { ...u, ...updates } : u
          ),
        }));
      },

      incrementRetry: (id, error) => {
        set((state) => ({
          pendingUploads: state.pendingUploads.map((u) =>
            u.id === id
              ? { ...u, retryCount: u.retryCount + 1, lastError: error }
              : u
          ),
          syncStatus: 'error',
          syncError: error || 'Upload failed',
        }));
      },

      setSyncStatus: (status, error) => {
        set({
          syncStatus: status,
          syncError: error || null,
        });
      },

      setLastSyncAt: (timestamp) => {
        set({ lastSyncAt: timestamp });
      },

      clearAll: () => {
        set({
          pendingUploads: [],
          pendingCount: 0,
          syncStatus: 'synced',
          syncError: null,
        });
      },
    }),
    {
      name: 'sync-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        pendingUploads: state.pendingUploads,
        pendingCount: state.pendingCount,
        lastSyncAt: state.lastSyncAt,
      }),
    }
  )
);

// ============ Selectors ============

export const selectPendingCount = (state: SyncState) => state.pendingCount;
export const selectIsOnline = (state: SyncState) => state.isOnline;
export const selectSyncStatus = (state: SyncState) => state.syncStatus;
export const selectHasPendingUploads = (state: SyncState) => state.pendingUploads.length > 0;

// ============ Utility Functions ============

/**
 * Get pending uploads for a specific type
 */
export function getPendingByType(type: PendingUpload['type']): PendingUpload[] {
  return useSyncStore.getState().pendingUploads.filter((u) => u.type === type);
}

/**
 * Get upload by ID
 */
export function getPendingById(id: string): PendingUpload | undefined {
  return useSyncStore.getState().pendingUploads.find((u) => u.id === id);
}

/**
 * Check if there are any failed uploads (retry count > 3)
 */
export function hasFailedUploads(): boolean {
  return useSyncStore.getState().pendingUploads.some((u) => u.retryCount > 3);
}
