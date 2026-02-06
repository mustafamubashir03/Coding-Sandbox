import { useQuery } from '@tanstack/react-query';
import { getHealth } from '../../../apis/health';

export const useHealth = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryFn: getHealth,
    queryKey: ['health'],
    staleTime: 10000,
  });

  return {
    data,
    isLoading,
    isError,
    error,
  };
};
