import { useParams } from 'react-router-dom';
import { usePortStore } from '../../../store/portStore';
import { useEditorSocketStore } from '../../../store/editorSocketStore';
import { Input } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { useTerminalSocketStore } from '../../../store/terminalSocketStore';
import { SyncOutlined, PlayCircleOutlined } from '@ant-design/icons';

const Browser = () => {
  const { projectId } = useParams();
  const { port, setPort } = usePortStore();
  const { editorSocket } = useEditorSocketStore();
  const { terminalSocket } = useTerminalSocketStore();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const [iframeSrc, setIframeSrc] = useState<string | null>(null);
  const [loadingStatus, setLoadingStatus] = useState<string>("Your preview will appear here.");

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

  // Poll localhost until dev server responds, but with limits and no-cors to avoid infinite TypeError spam
  useEffect(() => {
    if (!port) return;

    let cancelled = false;
    let retries = 0;
    const MAX_RETRIES = 60; // Max 2 minutes trying

    const pollServer = async () => {
      if (cancelled || retries >= MAX_RETRIES) return;
      retries++;

      try {
        // use no-cors so if the dev server is up but rejects CORS, we still get an 'opaque' response
        // rather than a thrown TypeError, letting us know the port is active.
        const res = await fetch(`http://localhost:${port}`, { mode: 'no-cors' });

        if (res.type === 'opaque' || res.ok) {
          setIframeSrc(`http://localhost:${port}`);
        } else if (!cancelled) {
          setLoadingStatus("Pre-bundling dependencies (this may take a minute)...");
          setTimeout(pollServer, 5000);
        }
      } catch (error) {
        // Connection refused -> server likely not running yet
        setLoadingStatus("Sandbox initializing...");
        if (!cancelled) setTimeout(pollServer, 5000);
      }
    };

    // explicitly catch any extremely unexpected synchronous errors from pollServer async frame
    pollServer().catch(e => setLoadingStatus("Sandbox initializing..."));
    return () => {
      cancelled = true;
    };
  }, [port]);

  // Refresh iframe on icon click
  const handleRefresh = () => {
    if (port) setIframeSrc(`http://localhost:${port}?t=${Date.now()}`);
  };

  const handleStartProject = () => {
    if (!terminalSocket || terminalSocket.readyState !== WebSocket.OPEN) return;
    setLoadingStatus("Sending start command to Terminal...");
    terminalSocket.send('cd sandbox && npm install && npm run dev -- --host 0.0.0.0\r');
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
        suffix={
          <button
            onClick={handleStartProject}
            style={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              height: "40px",
              backgroundColor: '#00e5ff',
              color: '#000',
              fontWeight: 600,
              padding: '4px 12px',
              borderRadius: '4px',
              fontSize: '12px',
              border: 'none',
              outline: 'none',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            <PlayCircleOutlined size={24} /> Start Browser
          </button>
        }
        style={{
          height: 50,
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
        {!iframeSrc && <ModernLoader status={loadingStatus} />}
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
const ModernLoader = ({ status = "Your preview will appear here." }: { status?: string }) => (
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
      {status}
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
