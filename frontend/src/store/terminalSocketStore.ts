import { create } from 'zustand';

interface TerminalSocketType {
  terminalSocket: null | WebSocket;
  setTerminalSocket: (projectId: string) => void;
  clearTerminalSocket: () => void;
}

export const useTerminalSocketStore = create<TerminalSocketType>((set) => {
  return {
    terminalSocket: null,
    setTerminalSocket: (projectId: string) => {
      set({
        terminalSocket: new WebSocket(`ws://localhost:4000/terminal?projectId=${projectId}`),
      });
    },
    clearTerminalSocket: () => {
      set({
        terminalSocket: null,
      });
    },
  };
});
