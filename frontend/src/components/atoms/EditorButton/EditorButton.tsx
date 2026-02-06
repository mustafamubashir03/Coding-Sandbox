const EditorButton = ({ active = false, filename = 'File.js' }) => {
  return (
    <button
      style={{
        background: active ? 'rgba(97,218,251,0.08)' : 'transparent',

        color: active ? '#e6f6ff' : '#9aa7b2',
        fontSize: '14px',
        fontFamily: 'Fira Code, monospace',
        fontWeight: 500,

        padding: '8px 14px',
        cursor: 'pointer',

        border: 'none',
        borderBottom: active ? '2px solid #61dafb' : '2px solid transparent',

        outline: 'none',
        transition: 'all 0.15s ease',

        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.color = '#cfefff';
          e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.color = '#9aa7b2';
          e.currentTarget.style.background = 'transparent';
        }
      }}
    >
      {filename}
    </button>
  );
};

export default EditorButton;
