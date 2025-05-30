import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { offlineAPI } from '@/lib/api';
import { OfflineState } from '@/lib/types';

export const useOfflineStore = create<OfflineState>()(
  persist(
    (set, get) => ({
      isOnline: navigator.onLine,
      pendingChanges: [],

      setOnlineStatus: (status) => {
        set({ isOnline: status });
        
        // If coming back online, process pending changes
        if (status && get().pendingChanges.length > 0) {
          get().processPendingChanges();
        }
      },

      addPendingChange: (type, data) => {
        set((state) => ({
          pendingChanges: [...state.pendingChanges, { type, data }],
        }));
      },

      processPendingChanges: async () => {
        const { pendingChanges } = get();
        if (pendingChanges.length === 0) return;

        try {
          await offlineAPI.processPendingChanges(pendingChanges);
          set({ pendingChanges: [] });
        } catch (error) {
          console.error('Failed to process pending changes:', error);
        }
      },

      clearPendingChanges: () => {
        set({ pendingChanges: [] });
      },
    }),
    {
      name: 'offline-storage',
      partialize: (state) => ({
        pendingChanges: state.pendingChanges,
      }),
    }
  )
);
