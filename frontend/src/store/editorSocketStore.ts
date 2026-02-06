import type { Socket } from 'socket.io-client';
import { create } from 'zustand';
interface editorSocketInterface {
  editorSocket: Socket | null;
  setEditorSocket: (incomingSocket: Socket | null) => void;
}

export const useEditorSocketStore = create<editorSocketInterface>((set) => {
  return {
    editorSocket: null,
    setEditorSocket: (incomingSocket: Socket | null) => {
      set({ editorSocket: incomingSocket });
    },
  };
});
