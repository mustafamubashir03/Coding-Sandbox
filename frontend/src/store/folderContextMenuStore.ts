import { create } from 'zustand';

interface useFolderMenuContextInterface {
  isFolderMenuContextOpen: boolean;
  x: number | null;
  y: number | null;
  folder: string | null;
  setIsFolderMenuContextOpen: (incomingIsOpen: boolean) => void;
  setX: (incomingX: number) => void;
  setY: (incomingY: number) => void;
  setFolder: (incomingFolder: string) => void;
}

export const useFolderContextMenuStore = create<useFolderMenuContextInterface>((set) => ({
  isFolderMenuContextOpen: false,
  folder: null,
  x: null,
  y: null,
  setIsFolderMenuContextOpen: (incomingIsOpen: boolean) => {
    set({
      isFolderMenuContextOpen: incomingIsOpen,
    });
  },
  setX: (incomingX: number) => {
    set({
      x: incomingX,
    });
  },
  setY: (incomingY: number) => {
    set({
      y: incomingY,
    });
  },
  setFolder: (incomingFolder: string) => {
    set({
      folder: incomingFolder,
    });
  },
}));
