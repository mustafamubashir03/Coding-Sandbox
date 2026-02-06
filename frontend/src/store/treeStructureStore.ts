import { QueryClient } from '@tanstack/react-query';
import { create } from 'zustand';
import { getProjectTree } from '../apis/projects';
import type { fileFolderDataType } from '../components/molecules/EditorComponent/Tree/TreeNode';

interface treeStructureInterface {
  treeStructure: fileFolderDataType | null;
  setTreeStructure: (projectId: string) => void;
}

export const useTreeStructureStore = create<treeStructureInterface>((set) => {
  const queryClient = new QueryClient();

  return {
    treeStructure: null,
    setTreeStructure: async (projectId: string) => {
      const data = await queryClient.fetchQuery({
        queryFn: () => getProjectTree(projectId),
        queryKey: ['project-tree', projectId],
      });
      console.log(data);
      set({
        treeStructure: data,
      });
    },
  };
});
