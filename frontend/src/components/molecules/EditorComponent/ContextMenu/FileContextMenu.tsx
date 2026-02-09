import { useParams } from 'react-router-dom';
import { useEditorSocketStore } from '../../../../store/editorSocketStore';
import { useFileContextMenuStore } from '../../../../store/fileContextMenuStore';
import FileContextMenuButton from '../../../atoms/FileContextMenuButton/FileContextMenuButton';
import { useTreeStructureStore } from '../../../../store/treeStructureStore';

const FileContextMenu = ({ x, y, path }: { x: number; y: number; path: string }) => {
  const { setIsFileMenuContextOpen } = useFileContextMenuStore();
  const { projectId } = useParams();
  const { editorSocket } = useEditorSocketStore();
  const { setTreeStructure } = useTreeStructureStore();
  const handleFileDelete = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    editorSocket?.emit('deleteFile', {
      pathToFileFolder: path,
      projectId,
    });
  };
  editorSocket?.on('deleteFileSuccess', () => {
    setIsFileMenuContextOpen(false);
    setTreeStructure(projectId || '');
  });
  return (
    <div
      onMouseLeave={() => setIsFileMenuContextOpen(false)}
      style={{
        width: '160px',
        position: 'fixed',
        left: x ?? 0,
        top: y ?? 0,
        zIndex: 9999,
        overflow:'hidden',
        background: 'rgb(22, 25, 31)',
        borderRadius: '10px',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: `
      0 10px 35px rgba(0, 0, 0, 0.38),
      inset 0 1px 0 rgba(255, 255, 255, 0.05)
    `,
        padding: '6px',
      }}
    >
      <FileContextMenuButton
        label="Delete file"
        danger
        onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => handleFileDelete(e)}
      />
      <FileContextMenuButton label="Rename file" />
    </div>
  );
};

export default FileContextMenu;
