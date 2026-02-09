type FileContextMenuButtonProps = {
  label: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  danger?: boolean;
};

const FileContextMenuButton = ({ label, onClick, danger = false }: FileContextMenuButtonProps) => {
  return (
    <button
      onClick={onClick}
      style={{
        all: 'unset',
        width: '100%',

        display: 'flex',
        alignItems: 'center',

        padding: '6px 10px',
        fontSize: '12.5px',
        lineHeight: 1.4,
        fontWeight: 500,

        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Ubuntu, sans-serif',

        color: danger ? '#ff6b6b' : '#d7e3f4',
        cursor: 'pointer',

        borderRadius: '6px',
        userSelect: 'none',

        transition: 'background 0.12s ease, color 0.12s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = danger
          ? 'rgba(255, 107, 107, 0.14)'
          : 'rgba(125, 182, 255, 0.14)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.background = danger
          ? 'rgba(255, 107, 107, 0.22)'
          : 'rgba(125, 182, 255, 0.22)';
      }}
    >
      {label}
    </button>
  );
};

export default FileContextMenuButton;
