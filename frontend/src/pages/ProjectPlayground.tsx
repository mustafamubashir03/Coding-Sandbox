import { useParams } from 'react-router-dom';
import EditorComponent from '../components/molecules/EditorComponent/EditorComponent';
import EditorTabsBar from '../components/molecules/EditorComponent/EditorTabsBar/EditorTabsBar';
import TreeStructure from '../components/organisms/TreeStructure/TreeStructure';
import { useEditorSocketStore } from '../store/editorSocketStore';
import { useEffect } from 'react';
import { io } from 'socket.io-client';
import Terminal from '../components/molecules/EditorComponent/Terminal/TerminalComponent';
import { useTerminalSocketStore } from '../store/terminalSocketStore';
import { Allotment } from 'allotment';
import 'allotment/dist/style.css';
import Browser from '../components/organisms/Browser/Browser';

type TreeNodeData = {
  path?: string;
};

const ProjectPlayground = () => {
  const { projectId } = useParams();
  const { editorSocket, setEditorSocket } = useEditorSocketStore();
  const { setTerminalSocket, clearTerminalSocket } = useTerminalSocketStore();

  // Socket Setup
  useEffect(() => {
    if (!projectId) return;

    const socket = io(`${import.meta.env.VITE_BACKEND_URL}/editor`, {
      auth: { projectId },
    });

    setEditorSocket(socket);
    setTerminalSocket(projectId);

    return () => {
      socket.disconnect();
      setEditorSocket(null);
      clearTerminalSocket();
    };
  }, [projectId, clearTerminalSocket, setEditorSocket, setTerminalSocket]);

  useEffect(() => {
    if (!editorSocket || !projectId) return;

    const handler = (data: TreeNodeData) => {
      editorSocket.emit('readFile', {
        projectId,
        pathToFileFolder: data?.path,
      });
    };

    editorSocket.on('writeFileSuccess', handler);

    return () => {
      editorSocket.off('writeFileSuccess', handler);
    };
  }, [editorSocket, projectId]);

  return (
    <div
      style={{
        height: '100vh',
        width: '100%',
        background: 'transparent',
      }}
    >
      {/* MAIN HORIZONTAL SPLIT */}
      <Allotment defaultSizes={[300, 800, 360]} separator>
        {/* ================= LEFT TREE ================= */}
        <Allotment.Pane minSize={220} preferredSize={300}>
          <div
            style={{
              height: '100%',
              backdropFilter: 'blur(12px)',
              borderRight: '1px solid rgba(255,255,255,0.06)',
              overflowY: 'auto',
            }}
          >
            <TreeStructure />
          </div>
        </Allotment.Pane>

        {/* ================= CENTER COLUMN ================= */}
        <Allotment.Pane minSize={400}>
          <Allotment vertical defaultSizes={[75, 25]} separator>
            {/* ===== EDITOR ===== */}
            <Allotment.Pane minSize={250}>
              <div
                style={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  background: 'rgba(30,30,30,0.55)',
                  backdropFilter: 'blur(14px)',
                  overflow: 'hidden',
                }}
              >
                <EditorTabsBar />

                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <EditorComponent />
                </div>
              </div>
            </Allotment.Pane>

            {/* ===== TERMINAL ===== */}
            <Allotment.Pane minSize={160} preferredSize="25%" snap>
              <div
                style={{
                  height: '100%',
                  backdropFilter: 'blur(12px)',
                  borderTop: '1px solid rgba(255,255,255,0.06)',
                  padding: 8,
                }}
              >
                <Terminal />
              </div>
            </Allotment.Pane>
          </Allotment>
        </Allotment.Pane>

        {/* ================= RIGHT PREVIEW ================= */}
        <Allotment.Pane minSize={280} preferredSize={360}>
          <div
            style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              backdropFilter: 'blur(12px)',
              borderLeft: '1px solid rgba(255,255,255,0.06)',
              overflow: 'hidden',
            }}
          >
            <Browser />
          </div>
        </Allotment.Pane>
      </Allotment>
    </div>
  );
};

export default ProjectPlayground;
