import Editor from '@monaco-editor/react';
import appGlassTheme from '../../../themes/appGlassTheme.json';
import { useActiveFileTabStore } from '../../../store/activeFileTabStore';
import { useEditorSocketStore } from '../../../store/editorSocketStore';
import { useParams } from 'react-router-dom';

const EditorComponent = () => {
  const { editorSocket } = useEditorSocketStore();
  const { activeFileTab } = useActiveFileTabStore();
  const { projectId } = useParams();
  const handleChanges = (value) => {
    const editorValue = value;
    editorSocket?.emit('writeFile', {
      data: editorValue,
      pathToFileFolder: activeFileTab?.path,
      projectId,
    });
  };

  return (
    <Editor
      height="80vh"
      width="100%"
      defaultLanguage="javascriptReact"
      defaultValue="// Welcome to DevPlayground"
      value={activeFileTab?.value}
      onChange={handleChanges}
      theme="app-glass"
      beforeMount={(monaco) => {
        monaco.editor.defineTheme('app-glass', appGlassTheme);
      }}
      options={{
        fontSize: 18,
        fontFamily: 'Fira Code, monospace',
        minimap: { enabled: false },
        automaticLayout: true,
        lineNumbers: 'on',
      }}
    />
  );
};

export default EditorComponent;
