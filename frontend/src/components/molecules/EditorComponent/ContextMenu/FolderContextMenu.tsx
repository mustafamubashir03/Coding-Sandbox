import { useParams } from 'react-router-dom';
import { useEditorSocketStore } from '../../../../store/editorSocketStore';
import FileContextMenuButton from '../../../atoms/FileContextMenuButton/FileContextMenuButton';
import { useTreeStructureStore } from '../../../../store/treeStructureStore';
import { useFolderContextMenuStore } from '../../../../store/folderContextMenuStore';
import { useModalStore } from '../../../../store/modalStore';
import { DeleteOutlined, FileOutlined, FolderOutlined } from '@ant-design/icons';

const FolderContextMenu = ({ x, y, path }: { x: number; y: number; path: string }) => {
  const { setIsFolderMenuContextOpen } = useFolderContextMenuStore();
  const { projectId } = useParams();
  const { openModal } = useModalStore();
  const { editorSocket } = useEditorSocketStore();
  const { setTreeStructure } = useTreeStructureStore();
  const handleFileCreate = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    openModal({
      title: 'write File Name',
      content: 'Write file name with extension',
      onOk: (inputValue) => {
        editorSocket?.emit('createFile', {
          pathToFileFolder: path,
          projectId,
          fileName: inputValue,
        });
      },
    });
  };
  const handleFolderDelete = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    editorSocket?.emit('deleteFolder', {
      pathToFileFolder: path,
      projectId,
    });
  };

  const handleFolderCreate = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    openModal({
      title: 'Create Folder',
      content: 'Write a unique folder name',
      onOk: (inputValue) => {
        editorSocket?.emit('createFolder', {
          pathToFileFolder: path,
          projectId,
          folderName: inputValue,
        });
      },
    });
  };
  editorSocket?.on('deleteFolderSuccess', () => {
    setIsFolderMenuContextOpen(false);
    setTreeStructure(projectId || '');
  });
  editorSocket?.on('createFileSuccess', () => {
    setIsFolderMenuContextOpen(false);
    setTreeStructure(projectId || '');
  });
  editorSocket?.on('createFolderSuccess', () => {
    setIsFolderMenuContextOpen(false);
    setTreeStructure(projectId || '');
  });
  return (
    <div
      onMouseLeave={() => setIsFolderMenuContextOpen(false)}
      style={{
        width: '160px',
        position: 'fixed',
        left: x ?? 0,
        top: y ?? 0,
        zIndex: 9999,
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
        label="Create File"
        Icon={FileOutlined}
        onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => handleFileCreate(e)}
      />
      <FileContextMenuButton
        label="Create Folder"
        Icon={FolderOutlined}
        onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => handleFolderCreate(e)}
      />
      <FileContextMenuButton
        Icon={DeleteOutlined}
        label="Delete Folder"
        danger
        onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
          handleFolderDelete(e);
        }}
      />
    </div>
  );
};

export default FolderContextMenu;
