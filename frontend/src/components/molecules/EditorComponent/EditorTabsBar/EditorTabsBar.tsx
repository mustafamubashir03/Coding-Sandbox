import EditorButton from "../../../atoms/EditorButton/EditorButton";

const EditorTabsBar = () => {
    return (
      <div
        style={{
          display: "flex",
          gap: "2px",
          background: "rgba(15,17,26,0.85)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          padding: "0 8px",
        }}
      >
        <EditorButton active={true} filename="index.js" />
        <EditorButton filename="App.tsx" />
        <EditorButton filename="utils.ts" />
      </div>
    );
  };

export default EditorTabsBar;