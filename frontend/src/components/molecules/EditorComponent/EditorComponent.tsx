import Editor from '@monaco-editor/react';
import appGlassTheme from '../../../themes/appGlassTheme.json';
import { useEditorSocketStore } from '../../../store/editorSocketStore';
import { useActiveFileTabStore } from '../../../store/activeFileTabStore';

const EditorComponent = () => {
  const {editorSocket} = useEditorSocketStore()
  const {activeFileTab,setActiveFileTab} = useActiveFileTabStore()
  editorSocket?.on('readFileSuccess',(data)=>{
    setActiveFileTab(data?.path,data?.value,"")
  })
  return (
    <Editor
      height="80vh"
      width="100%"
      defaultLanguage="javascriptReact"
      defaultValue="// Welcome to DevPlayground"
      value={activeFileTab?.value}
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
