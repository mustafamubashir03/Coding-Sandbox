import { create } from 'zustand';

export const useActiveFileTabStore = create((set) => {
  return {
    activeFileTab: null,
    setActiveFileTab: (path: string, value: string, extension: string) => {
      set({
        activeFileTab: {
          path: path,
          value: value,
          extension: extension,
        },
      });
    },
  };
});
