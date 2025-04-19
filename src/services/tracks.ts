import { env } from '@/core/env';
import { useMutation, useQuery } from '@tanstack/react-query';
import { z } from 'zod';

const trackSchema = z.object({
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
});

const tracksListSchema = z.object({
  data: z.array(trackSchema),
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

const createTrackSchema = z.object({
  title: z.string(),
  artist: z.string(),
  album: z.string(),
  genres: z.array(z.string()),
  coverImage: z.string(),
});

type CreateTrackBody = z.infer<typeof createTrackSchema>;

const createTrackRequest = async (track: CreateTrackBody) => {
  const body = createTrackSchema.parse(track);
  const response = await fetch(`${env.API_URL}/api/tracks`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  try {
    return trackSchema.parse(await response.json());
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const useCreateTrackMutation = () =>
  useMutation({
    mutationFn: createTrackRequest,
  });
