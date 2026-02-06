import { useQuery } from '@tanstack/react-query';
import { getProjectTree } from '../../../apis/projects';

export const useGetProjectTree = (projectId: string) => {
  const {
    data: projectTree,
    isLoading,
    error,
    isError,
  } = useQuery({
    queryFn: () => getProjectTree(projectId),
    queryKey: ['project-tree', projectId],
    staleTime: 0, // always stale              // garbage collect immediately
    refetchOnMount: 'always', // refetch every mount
    refetchOnWindowFocus: true,
  });
  return {
    projectTree,
    isLoading,
    isError,
    error,
  };
};
