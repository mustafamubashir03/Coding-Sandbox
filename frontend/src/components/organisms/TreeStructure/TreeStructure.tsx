import { useParams } from 'react-router-dom';
import { useTreeStructureStore } from '../../../store/treeStructureStore';
import { useEffect } from 'react';
import TreeNode from '../../molecules/EditorComponent/Tree/TreeNode';
import { useFileContextMenuStore } from '../../../store/fileContextMenuStore';
import FileContextMenu from '../../molecules/EditorComponent/ContextMenu/FileContextMenu';

const TreeStructure = () => {
  const { treeStructure, setTreeStructure } = useTreeStructureStore();
  const {
    isFileMenuContextOpen,
    x: fileContextX,
    y: fileContextY,
    file,
  } = useFileContextMenuStore();
  const { projectId } = useParams();
  useEffect(() => {
    const getTreeStructure = async () => {
      await setTreeStructure(String(projectId));
    };
    if (!treeStructure) {
      getTreeStructure();
    }
  }, [treeStructure, projectId, setTreeStructure]);
  return (
    <div style={{ marginTop: '24px' }}>
      {isFileMenuContextOpen && fileContextX && fileContextY && (
        <FileContextMenu x={fileContextX} y={fileContextY} path={file || ''} />
      )}
      <TreeNode fileFolderData={treeStructure} />
    </div>
  );
};

export default TreeStructure;
