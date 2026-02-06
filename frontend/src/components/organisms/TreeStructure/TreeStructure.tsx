import { useParams } from 'react-router-dom';
import { useTreeStructureStore } from '../../../store/treeStructureStore';
import { useEffect } from 'react';
import TreeNode from '../../molecules/EditorComponent/Tree/TreeNode';

const TreeStructure = () => {
  const { treeStructure, setTreeStructure } = useTreeStructureStore();
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
    <div>
      TreeStructure
      <TreeNode fileFolderData={treeStructure} />
    </div>
  );
};

export default TreeStructure;
