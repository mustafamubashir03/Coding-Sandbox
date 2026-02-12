import React from 'react';
import { useModalStore } from '../../../../store/modalStore';

export const GlobalModal: React.FC = () => {
  const {
    isOpen,
    title,
    content,
    okText,
    cancelText,
    inputValue,
    placeholder,
    onOk,
    onCancel,
    width,
    maskBlur,
    closeModal,
    setInputValue,
  } = useModalStore();

  if (!isOpen) return null;

  const handleOk = async () => {
    if (onOk) await onOk(inputValue);
    closeModal();
  };

  const handleCancel = async () => {
    if (onCancel) await onCancel();
    closeModal();
  };
  console.log('input value', inputValue);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        backdropFilter: maskBlur ? 'blur(6px)' : undefined,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        padding: '16px', // ensure mobile padding
      }}
    >
      <div
        style={{
          backgroundColor: '#1b1d27',
          color: '#e0e6f0',
          padding: '28px 24px',
          borderRadius: '14px',
          width: width || 500,
          maxWidth: '100%',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          fontFamily: 'Fira Code, monospace',
        }}
      >
        {title && (
          <h2
            style={{
              margin: 0,
              marginBottom: '16px',
              fontSize: '20px',
              fontWeight: 500,
              background: 'linear-gradient(180deg, #ffffff, #61dafb)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {title}
          </h2>
        )}

        {content && (
          <div
            style={{
              marginBottom: '16px',
              fontSize: 14,
              fontFamily: '-apple-system, system-ui, sans-serif',
              lineHeight: 1.6,
              color: '#c7d0da',
            }}
          >
            {content}
          </div>
        )}

        {placeholder !== undefined && (
          <input
            value={inputValue}
            placeholder={placeholder}
            onChange={(e) => setInputValue(e.target.value)}
            style={{
              width: '100%',
              maxWidth: '100%',
              boxSizing: 'border-box',
              padding: '10px 12px',
              marginBottom: '24px',
              borderRadius: '8px',
              border: '1px solid #555',
              backgroundColor: '#2c2f3b',
              color: '#e0e6f0',
              fontSize: '14px',
            }}
          />
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          {cancelText && (
            <button
              onClick={handleCancel}
              style={{
                padding: '8px 18px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#333647',
                color: '#e0e6f0',
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: 14,
              }}
            >
              {cancelText}
            </button>
          )}
          {okText && (
            <button
              onClick={handleOk}
              style={{
                padding: '8px 18px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#3b82f6', // brighter primary
                color: '#fff',
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: 14,
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#2563eb';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#3b82f6';
              }}
            >
              {okText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
