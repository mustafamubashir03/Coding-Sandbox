import { useParams } from 'react-router-dom';
import { usePortStore } from '../../../store/portStore';
import { useEditorSocketStore } from '../../../store/editorSocketStore';
import { Input } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { useTerminalSocketStore } from '../../../store/terminalSocketStore';
import { SyncOutlined } from '@ant-design/icons';

const Browser = () => {
  const { projectId } = useParams();
  const { port, setPort } = usePortStore();
  const { editorSocket } = useEditorSocketStore();
  const { terminalSocket } = useTerminalSocketStore();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const [iframeSrc, setIframeSrc] = useState<string | null>(null);

  // Request port from backend
  useEffect(() => {
    if (!editorSocket || !projectId || !terminalSocket || port !== null) return;

    const timeout = setTimeout(() => {
      editorSocket.emit('getPort', { containerName: projectId });
    }, 3000);

    const handlePort = ({ port }: { port: number }) => setPort(port);

    editorSocket.once('getPortSuccess', handlePort);

    return () => {
      clearTimeout(timeout);
      editorSocket.off('getPortSuccess', handlePort);
    };
  }, [editorSocket, projectId, terminalSocket, port, setPort]);

  // Poll localhost until dev server responds
  useEffect(() => {
    if (!port) return;

    let cancelled = false;

    const pollServer = async () => {
      if (cancelled) return;
      try {
        const res = await fetch(`http://localhost:${port}`, { method: 'HEAD' });
        if (res.ok) {
          setIframeSrc(`http://localhost:${port}`);
        } else if (!cancelled) {
          setTimeout(pollServer, 300);
        }
      } catch {
        if (!cancelled) setTimeout(pollServer, 300);
      }
    };

    pollServer();
    return () => {
      cancelled = true;
    };
  }, [port]);

  // Refresh iframe on icon click
  const handleRefresh = () => {
    if (port) setIframeSrc(`http://localhost:${port}?t=${Date.now()}`);
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#0a0a0a',
      }}
    >
      {/* URL input with refresh icon */}
      <Input
        value={iframeSrc ?? (port ? `http://localhost:${port}` : 'Waiting for container port...')}
        readOnly
        prefix={
          <SyncOutlined
            onClick={handleRefresh}
            spin={!iframeSrc}
            style={{ cursor: 'pointer', color: '#00e5ff' }}
          />
        }
        style={{
          height: 32,
          borderRadius: 0,
          border: 'none',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          background: '#111',
          color: '#aaa',
          fontFamily: 'Fira Code',
          padding: '0 8px',
        }}
      />

      {/* Iframe / loader container */}
      <div style={{ flex: 1, position: 'relative' }}>
        {!iframeSrc && <ModernLoader />}
        {iframeSrc && (
          <iframe
            ref={iframeRef}
            src={iframeSrc}
            style={{ width: '100%', height: '100%', border: 'none' }}
          />
        )}
      </div>
    </div>
  );
};

// Modern centered loader component
const ModernLoader = () => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#ccc',
      fontFamily: 'Fira Code',
      textAlign: 'center',
      padding: 16,
    }}
  >
    {/* Spinner */}
    <div
      style={{
        width: 48,
        height: 48,
        border: '5px solid rgba(255,255,255,0.1)',
        borderTop: '5px solid #00e5ff',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: 16,
      }}
    />
    <div style={{ fontSize: 14 }}>
      Your preview will appear here.
      <br />
      Make sure to run <code>npm run dev</code> in your project!
    </div>

    <style>
      {`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}
    </style>
  </div>
);

export default Browser;
