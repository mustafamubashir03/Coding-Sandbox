import { create } from 'zustand';

interface activeFileTabStoreType {
  activeFileTab: {
    path: string;
    value: string;
    extension: string;
  } | null;
  openFiles: { path: string; filename: string }[];
  setActiveFileTab: (path: string, value: string, extension: string) => void;
  closeFile: (path: string) => void;
}

export const useActiveFileTabStore = create<activeFileTabStoreType>((set, get) => {
  return {
    activeFileTab: null,
    openFiles: [],
    setActiveFileTab: (path: string, value: string, extension: string) => {
      set((state) => {
        // If not already in openFiles, add it
        const isAlreadyOpen = state.openFiles.some((file) => file.path === path);
        const newOpenFiles = isAlreadyOpen
          ? state.openFiles
          : [...state.openFiles, { path, filename: path.split('/').pop() || path }];

        return {
          activeFileTab: { path, value, extension },
          openFiles: newOpenFiles,
        };
      });
    },
    closeFile: (path: string) => {
      set((state) => {
        const newOpenFiles = state.openFiles.filter((file) => file.path !== path);
        // If we close the active tab, we can clear activeFileTab or switch to another
        let newActive = state.activeFileTab;
        if (newActive?.path === path) {
          newActive = null;
        }
        return {
          openFiles: newOpenFiles,
          activeFileTab: newActive,
        };
      });
    }
  };
});
