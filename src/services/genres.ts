import { env } from '@/core/env';
import { useQuery } from '@tanstack/react-query';

const getGenresRequest = async () => {
  const response = await fetch(`${env.API_URL}/api/genres`);
  if (!response.ok) {
    throw new Error('request failed');
  }
  return (await response.json()) as string[];
};

export const useGetGenresListQuery = () =>
  useQuery({ queryKey: ['genres'], queryFn: getGenresRequest });
