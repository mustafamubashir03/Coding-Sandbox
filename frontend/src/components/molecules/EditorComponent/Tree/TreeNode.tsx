import { useState } from 'react';
import { FaChevronRight } from 'react-icons/fa';
import FileIcon from '../../../atoms/FileIcon/FileIcon';
import { fileFolderLengthCompute } from '../../../../utils/fileFolderLength';
import { useEditorSocketStore } from '../../../../store/editorSocketStore';
import { useParams } from 'react-router-dom';
import { useFileContextMenuStore } from '../../../../store/fileContextMenuStore';

export type fileFolderDataType = {
  name: string;
  relativePath: string;
  children?: fileFolderDataType[];
};
const TreeNode = ({ fileFolderData }: { fileFolderData: fileFolderDataType | null }) => {
  const { projectId } = useParams();
  const { setIsFileMenuContextOpen, setFile, setX, setY } = useFileContextMenuStore();
  const [visibility, setVisibility] = useState<{ [key: string]: boolean }>({});
  const [hovered, setHovered] = useState<string | null>(null);
  const { editorSocket } = useEditorSocketStore();

  const handleContextMenuForFiles = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    path: string,
  ) => {
    console.log('double');
    e.preventDefault();
    setFile(path);
    setX(e.clientX);
    setY(e.clientY);
    setIsFileMenuContextOpen(true);
  };

  const toggleVisibility = (name: string) => {
    setVisibility((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const hasChildren = fileFolderData?.children && fileFolderData.children.length > 0;
  const handleFileClick = (fileFolderData: fileFolderDataType) => {
    editorSocket?.emit('readFile', {
      projectId,
      pathToFileFolder: fileFolderData?.relativePath,
    });
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
              hovered === fileFolderData?.name ? 'rgba(97,218,251,0.12)' : 'transparent',
            border: 'none',
            cursor: 'pointer',
            outline: 'none',
            fontWeight: 500,
            fontSize: '14px',
            color: '#7ac7ff',
            transition: 'background 0.2s ease, color 0.2s ease, border 0.2s ease',
          }}
          onMouseEnter={() => setHovered(fileFolderData?.name)}
          onMouseLeave={() => setHovered(null)}
        >
          <FaChevronRight
            style={{
              fontSize: '14px',
              color: 'lightblue',
              transition: 'transform 0.2s ease',
              transform: visibility[fileFolderData?.name] ? 'rotate(90deg)' : 'rotate(0deg)',
            }}
          />
          <FileIcon extension={fileFolderLengthCompute(fileFolderData!)} size={18} />
          <span style={{ flexGrow: 1, color: 'lightblue', fontWeight: 'bold' }}>
            {fileFolderData?.name}
          </span>
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
              hovered === fileFolderData?.name ? 'rgba(108,176,232,0.08)' : 'transparent', // subtle hover
            color: '#6cb0e8',
            transition: 'background 0.15s ease, color 0.15s ease',
            fontFamily: 'Fira Code, monospace',
            fontSize: '14px',
          }}
          onMouseEnter={() => setHovered(fileFolderData?.name || null)}
          onMouseLeave={() => setHovered(null)}
          onContextMenu={(e) => handleContextMenuForFiles(e, fileFolderData?.relativePath || '')}
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
          <p
            onClick={() => handleFileClick(fileFolderData!)}
            style={{ margin: 0, lineHeight: 1.2, color: 'lightblue' }}
          >
            {fileFolderData?.name}
          </p>
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
