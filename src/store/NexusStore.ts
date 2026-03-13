import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface NexusState {
  isSidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  selectedFolderSlug: string | null;
  setSelectedFolderSlug: (slug: string | null) => void;
  toggleSidebar: () => void;
}

export const useNexusStore = create<NexusState>()(
  persist(
    (set) => ({
      isSidebarCollapsed: false,
      setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),
      selectedFolderSlug: null,
      setSelectedFolderSlug: (slug) => set({ selectedFolderSlug: slug }),
      toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
    }),
    {
      name: 'nexus-storage',
    }
  )
);
