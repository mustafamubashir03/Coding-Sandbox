import type React from 'react';

type FileContextMenuButtonProps = {
  label: string;
  Icon?: React.ElementType;
  onClick?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  danger?: boolean;
};

const FileContextMenuButton = ({
  label,
  Icon,
  onClick,
  danger = false,
}: FileContextMenuButtonProps) => {
  return (
    <button
      onClick={onClick}
      style={{
        all: 'unset',
        width: '100%',

        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        justifyContent: 'start',

        padding: '6px 10px',
        fontSize: '12.5px',
        lineHeight: 1.4,
        fontWeight: 500,

        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Ubuntu, sans-serif',

        color: danger ? '#ff6b6b' : '#cfe3ff',
        cursor: 'pointer',

        borderRadius: '6px',
        userSelect: 'none',

        transition: 'background 0.12s ease, color 0.12s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = danger
          ? 'rgba(255, 107, 107, 0.14)'
          : 'rgba(55, 121, 207, 0.44)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.background = danger
          ? 'rgba(255, 107, 107, 0.22)'
          : 'rgba(94, 155, 235, 0.83)';
      }}
    >
      {Icon && <Icon />}
      {label}
    </button>
  );
};

export default FileContextMenuButton;
