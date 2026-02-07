import { create } from 'zustand';

interface activeFileTabStoreType{
  activeFileTab: {
    path: string,
    value: string,
    extension: string,
  } | null,
  setActiveFileTab:(path: string, value: string, extension: string)=>void
}

export const useActiveFileTabStore = create<activeFileTabStoreType>((set) => {
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
