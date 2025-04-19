import { env } from '@/core/env';
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

const tracksListSchema = z.object({
  data: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      artist: z.string(),
      album: z.string().optional(),
      genres: z.array(z.string()),
      slug: z.string(),
      coverImage: z.string().optional(),
      audioFile: z.string().optional(),
      createdAt: z.string(),
      updatedAt: z.string(),
    }),
  ),
  meta: z.object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
  }),
});

const getTracksListRequest = async () => {
  const response = await fetch(`${env.API_URL}/api/tracks`);
  try {
    return tracksListSchema.parse(await response.json());
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const useGetTracksListQuery = () =>
  useQuery({
    queryKey: ['all-tracks'],
    queryFn: getTracksListRequest,
  });
