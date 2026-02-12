import { useEffect, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { io, Socket } from 'socket.io-client';
import '@xterm/xterm/css/xterm.css';
import { useParams } from 'react-router-dom';

type Props = {
  className?: string;
};

const TerminalComponent = ({ className }: Props) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const terminalRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const { projectId } = useParams();
  const socket = useRef<Socket | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const term = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      lineHeight: 1.3,
      fontFamily: 'JetBrains Mono, Fira Code, Cascadia Code, Consolas, monospace',

      theme: {
        background: '#0f1117',
        foreground: '#d7e3f4',
        cursor: '#7db6ff',
        cursorAccent: '#ffffff',
        selectionBackground: '#7db6ff33',

        black: '#1e1e1e',
        red: '#ff6b6b',
        green: '#6bff95',
        yellow: '#ffd76b',
        blue: '#7db6ff',
        magenta: '#c792ea',
        cyan: '#5fd7ff',
        white: '#d7e3f4',
      },

      convertEol: true,
      scrollback: 5000,
      smoothScrollDuration: 80,
      allowTransparency: true,
    });

    const fitAddon = new FitAddon();

    term.loadAddon(fitAddon);
    term.open(containerRef.current);
    fitAddon.fit();

    term.writeln('\x1b[1;34m Terminal \x1b[0m');
    term.writeln('');

    terminalRef.current = term;
    fitAddonRef.current = fitAddon;

    const resizeObserver = new ResizeObserver(() => {
      fitAddon.fit();
    });

    resizeObserver.observe(containerRef.current);
    socket.current = io(`${import.meta.env.VITE_BACKEND_URL}/terminal`, {
      auth: {
        projectId,
      },
    });

    let currentLine = '';
    socket?.current?.on('shell-output', (data) => {
      switch (data) {
        // ENTER
        case '\r':
          term.write('\r\n');
          console.log('Command:', currentLine);
          currentLine = '';
          term.write('$ ');
          break;

        // BACKSPACE
        case '\x7f':
          if (currentLine.length > 0) {
            currentLine = currentLine.slice(0, -1);
            term.write('\b \b'); // erase char visually
          }
          break;

        default:
          currentLine += data;
          term.write(data);
      }
    });

    term.onData((data) => {
      console.log(data);
      socket?.current?.emit('shell-input', data);
    });

    return () => {
      resizeObserver.disconnect();
      term.dispose();
      terminalRef.current = null;
      fitAddonRef.current = null;
      socket.current?.disconnect();
    };
  }, [projectId]);

  return (
    <div
      className={className}
      style={{
        width: '100%',
        height: '100%',
        padding: '8px',

        background: 'rgba(15, 17, 23, 0.18)',
        backdropFilter: 'blur(14px)',
        borderRadius: '12px',

        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 10px 35px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.04)',

        overflow: 'hidden',
      }}
    >
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  );
};

export default TerminalComponent;
