import { create } from 'zustand';

interface PortStoreType {
  port: number | null;
  setPort: (port: number) => void;
}

export const usePortStore = create<PortStoreType>((set) => {
  return {
    port: null,
    setPort: (port: number) => {
      set({
        port,
      });
    },
  };
});
