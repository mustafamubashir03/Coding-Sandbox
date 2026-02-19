import { Layout } from 'antd';
import { useParams } from 'react-router-dom';
import EditorComponent from '../components/molecules/EditorComponent/EditorComponent';
import EditorTabsBar from '../components/molecules/EditorComponent/EditorTabsBar/EditorTabsBar';
import TreeStructure from '../components/organisms/TreeStructure/TreeStructure';
import { useEditorSocketStore } from '../store/editorSocketStore';
import { useEffect } from 'react';
import { io } from 'socket.io-client';
import Terminal from '../components/molecules/EditorComponent/Terminal/TerminalComponent';
import { useTerminalSocketStore } from '../store/terminalSocketStore';

const { Sider, Content, Footer } = Layout;

const ProjectPlayground = () => {
  const { projectId } = useParams();
  const { editorSocket, setEditorSocket } = useEditorSocketStore();
  const { setTerminalSocket, clearTerminalSocket } = useTerminalSocketStore();
  const fetchPort = () => {
    editorSocket?.emit('getPort', { containerName: projectId });
  };

  useEffect(() => {
    if (!projectId) {
      return;
    }
    const editorSocketConnection = io(`${import.meta.env.VITE_BACKEND_URL}/editor`, {
      auth: {
        projectId,
      },
    });
    setEditorSocket(editorSocketConnection);
    setTerminalSocket(projectId);
    return () => {
      editorSocketConnection.disconnect();
      setEditorSocket(null);
      clearTerminalSocket();
    };
  }, [setEditorSocket, projectId, clearTerminalSocket, setTerminalSocket]);
  console.log(projectId);
  editorSocket?.on('writeFileSuccess', (data) => {
    console.log(data);
    editorSocket.emit('readFile', {
      projectId,
      pathToFileFolder: data?.path,
    });
  });

  return (
    <Layout style={{ height: '100vh', background: 'transparent' }}>
      {/* LEFT FILE TREE */}
      <Sider
        width={300}
        theme="dark"
        style={{
          background: 'transparent',
          backdropFilter: 'blur(12px)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          height: '100vh',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
        breakpoint="lg"
        collapsedWidth={0}
      >
        <TreeStructure />
      </Sider>

      {/* CENTER COLUMN (EDITOR + TERMINAL) */}
      <Layout style={{ background: 'transparent' }}>
        {/* EDITOR AREA */}
        <Content
          style={{
            display: 'flex',
            flexDirection: 'column',
            background: 'rgba(30,30,30,0.55)',
            backdropFilter: 'blur(14px)',
          }}
        >
          <EditorTabsBar />
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <EditorComponent />
          </div>
        </Content>

        <Footer
          style={{
            height: '25vh',
            background: 'transparent',
            backdropFilter: 'blur(12px)',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            padding: '8px',
            color: '#aaa',
          }}
        >
          <Terminal />
        </Footer>
      </Layout>

      {/* RIGHT PREVIEW */}
      <Sider
        width={360}
        theme="dark"
        style={{
          background: 'transparent',
          backdropFilter: 'blur(12px)',
          borderLeft: '1px solid rgba(255,255,255,0.06)',
        }}
        breakpoint="xl"
        collapsedWidth={0}
      >
        <button onClick={fetchPort}>Get Port</button>
        Preview
      </Sider>
    </Layout>
  );
};

export default ProjectPlayground;
