import type { Socket } from 'socket.io-client';
import { create } from 'zustand';
import { useActiveFileTabStore } from './activeFileTabStore';
interface editorSocketInterface {
  editorSocket: Socket | null;
  setEditorSocket: (incomingSocket: Socket | null) => void;
}

export const useEditorSocketStore = create<editorSocketInterface>((set) => {
  return {
    editorSocket: null,
    setEditorSocket: (incomingSocket: Socket | null) => {
      const activeFileTabSetter = useActiveFileTabStore.getState().setActiveFileTab;
      incomingSocket?.on('readFileSuccess', (data) => {
        const fileExtension = data?.path.split('.').pop()
        activeFileTabSetter(data?.path, data?.value, fileExtension);
      });

      set({ editorSocket: incomingSocket });
    },
  };
});
