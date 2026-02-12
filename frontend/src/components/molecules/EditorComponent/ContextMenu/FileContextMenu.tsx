import { useParams } from 'react-router-dom';
import { useEditorSocketStore } from '../../../../store/editorSocketStore';
import { useFileContextMenuStore } from '../../../../store/fileContextMenuStore';
import FileContextMenuButton from '../../../atoms/FileContextMenuButton/FileContextMenuButton';
import { useTreeStructureStore } from '../../../../store/treeStructureStore';
import { useModalStore } from '../../../../store/modalStore';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';

const FileContextMenu = ({ x, y, path }: { x: number; y: number; path: string }) => {
  const { setIsFileMenuContextOpen } = useFileContextMenuStore();
  const { projectId } = useParams();
  const { editorSocket } = useEditorSocketStore();
  const { setTreeStructure } = useTreeStructureStore();
  const { openModal } = useModalStore();
  const handleFileDelete = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    editorSocket?.emit('deleteFile', {
      pathToFileFolder: path,
      projectId,
    });
  };

  const handleRenameFile = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    openModal({
      title: `Rename File ${path.split('/').pop()}`,
      content: 'Enter the name of file',
      okText: 'Rename File',
      width: 600,
      cancelText: 'Cancel',
      onOk: (inputValue) => {
        if (inputValue) {
          editorSocket?.emit('renameFile', {
            pathToFileFolder: path,
            projectId,
            newFileName: inputValue,
          });
        }
      },
    });
  };
  editorSocket?.on('deleteFileSuccess', () => {
    setIsFileMenuContextOpen(false);
    setTreeStructure(projectId || '');
    open('success', 'Changes made', 'File has been successfully deleted');
  });
  editorSocket?.on('renameFileSuccess', () => {
    setIsFileMenuContextOpen(false);
    setTreeStructure(projectId || '');
    open('success', 'Changes made', 'File has been successfully renamed');
  });
  return (
    <div
      onMouseLeave={() => setIsFileMenuContextOpen(false)}
      style={{
        width: '160px',
        position: 'fixed',
        left: x ?? 0,
        top: y ?? 0,
        zIndex: 999999,
        overflow: 'hidden',
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
        Icon={DeleteOutlined}
        onClick={handleFileDelete}
      />

      <FileContextMenuButton label="Rename file" Icon={EditOutlined} onClick={handleRenameFile} />
    </div>
  );
};

export default FileContextMenu;
