import { create } from 'zustand';

interface useFileMenuContextInterface {
  isFileMenuContextOpen: boolean;
  x: number | null;
  y: number | null;
  file: string | null;
  setIsFileMenuContextOpen: (incomingIsOpen: boolean) => void;
  setX: (incomingX: number) => void;
  setY: (incomingY: number) => void;
  setFile: (incomingFile: string) => void;
}

export const useFileContextMenuStore = create<useFileMenuContextInterface>((set) => ({
  isFileMenuContextOpen: false,
  file: null,
  x: null,
  y: null,
  setIsFileMenuContextOpen: (incomingIsOpen: boolean) => {
    set({
      isFileMenuContextOpen: incomingIsOpen,
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
  setFile: (incomingFile: string) => {
    set({
      file: incomingFile,
    });
  },
}));
