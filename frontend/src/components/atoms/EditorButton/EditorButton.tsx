import { IoClose } from 'react-icons/io5';
import React from 'react';

type EditorButtonProps = {
  active?: boolean;
  filename?: string;
  onClick?: () => void;
  onClose?: (e: React.MouseEvent) => void;
};

const EditorButton = ({ active = false, filename = 'File.js', onClick, onClose }: EditorButtonProps) => {
  return (
    <button
      onClick={onClick}
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
        gap: '4px',
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
      <div 
        onClick={onClose} 
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '4px', padding: '2px', borderRadius: '4px', transition: 'background 0.2s' }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        <IoClose size={14} />
      </div>
    </button>
  );
};

export default EditorButton;
