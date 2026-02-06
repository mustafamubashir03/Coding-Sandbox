import { useState } from 'react';
import { FaChevronRight } from 'react-icons/fa';
import FileIcon from '../../../atoms/FileIcon/FileIcon';

export type fileFolderDataType = {
  name: string;
  relativePath: string;
  children?: fileFolderDataType[];
};

const TreeNode = ({
  fileFolderData,
}: {
  fileFolderData: fileFolderDataType | null;
}) => {
  const [visibility, setVisibility] = useState<{ [key: string]: boolean }>({});
  const [hovered, setHovered] = useState<string | null>(null);

  const toggleVisibility = (name: string) => {
    setVisibility((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const hasChildren =
    fileFolderData?.children && fileFolderData.children.length > 0;

  const fileFolderLengthCompute = (file: fileFolderDataType | null) => {
    if (!file) return '';

    const name = file.name || '';

    // Special files first — keys must match iconMap
    if (name === '.gitignore') return 'gitignore';
    if (name === 'package.json') return 'package.json';
    if (name === 'vite.config.js') return 'vite.config.js';
    if (name === 'eslint.config.js') return 'eslint';

    if (name.startsWith('.') && !name.includes('.', 1)) return name;

    if (file.children && file.children.length >= 0) return 'folder';

    const parts = name.split('.');
    if (parts.length > 1) return parts[parts.length - 1];

    return '';
  };

  return (
    <div
      style={{
        paddingLeft: '12px',
        fontFamily: 'Fira Code, monospace',
        fontSize: '14px',
        color: '#e0e0e0',
        backgroundColor: 'transparent',
      }}
    >
      {hasChildren ? (
        <button
          onClick={() => toggleVisibility(fileFolderData?.name)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 8px',
            marginBottom: '2px',
            backgroundColor:
              hovered === fileFolderData?.name
                ? 'rgba(97,218,251,0.12)'
                : 'transparent',
            border: 'none',
            cursor: 'pointer',
            outline: 'none',
            fontWeight: 500,
            fontSize: '14px',
            color: '#7ac7ff',
            transition:
              'background 0.2s ease, color 0.2s ease, border 0.2s ease',
          }}
          onMouseEnter={() => setHovered(fileFolderData?.name)}
          onMouseLeave={() => setHovered(null)}
        >
          <FaChevronRight
            style={{
              fontSize: '14px',
              color: '#61dafb',
              transition: 'transform 0.2s ease',
              transform: visibility[fileFolderData?.name]
                ? 'rotate(90deg)'
                : 'rotate(0deg)',
            }}
          />
          <FileIcon
            extension={fileFolderLengthCompute(fileFolderData!)}
            size={18}
          />
          <span style={{ flexGrow: 1 }}>{fileFolderData?.name}</span>
        </button>
      ) : (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '4px 8px',
            marginBottom: '2px',
            marginLeft: '18px',
            cursor: 'pointer',
            borderRadius: '4px',
            backgroundColor:
              hovered === fileFolderData?.name
                ? 'rgba(108,176,232,0.08)'
                : 'transparent', // subtle hover
            color: '#6cb0e8',
            transition: 'background 0.15s ease, color 0.15s ease',
            fontFamily: 'Fira Code, monospace',
            fontSize: '14px',
          }}
          onMouseEnter={() => setHovered(fileFolderData?.name || null)}
          onMouseLeave={() => setHovered(null)}
        >
          <div
            style={{
              marginRight: '8px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <FileIcon extension={fileFolderLengthCompute(fileFolderData!)} />
          </div>
          <p style={{ margin: 0, lineHeight: 1.2 }}>{fileFolderData?.name}</p>
        </div>
      )}

      {visibility[fileFolderData?.name || 0] &&
        fileFolderData?.children?.map((node) => (
          <TreeNode fileFolderData={node} key={node.relativePath} />
        ))}
    </div>
  );
};

export default TreeNode;
