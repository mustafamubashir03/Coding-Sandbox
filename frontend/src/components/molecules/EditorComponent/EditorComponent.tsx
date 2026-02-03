import Editor from "@monaco-editor/react";
import appGlassTheme from "../../../themes/appGlassTheme.json";

const EditorComponent = () => {
  return (
    <Editor
      height="80vh"
      width="100%"
      defaultLanguage="javascript"
      defaultValue="// Welcome to DevPlayground"
      theme="app-glass"
      beforeMount={(monaco) => {
        monaco.editor.defineTheme("app-glass", appGlassTheme);
      }}
      options={{
        fontSize: 18,
        fontFamily: "Fira Code, monospace",
        minimap: { enabled: false },
        automaticLayout: true,
        lineNumbers: "on",
      }}
    />
  );
};

export default EditorComponent;
