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
    headers: {
      'Content-Type': 'application/json',
    },
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

const deleteTracksResponseSchema = z.object({
  success: z.array(z.string()),
  failed: z.array(z.string()),
});

type DeleteTracksResult = z.infer<typeof deleteTracksResponseSchema>;

const deleteSingleTrackRequest = async (id: string) => {
  try {
    const response = await fetch(`${env.API_URL}/api/tracks/${id}`, { method: 'DELETE' });
    if (response.ok)
      return {
        success: [id],
        failed: [],
      } satisfies DeleteTracksResult;
    throw new Error('request failed');
  } catch {
    return {
      success: [],
      failed: [id],
    } satisfies DeleteTracksResult;
  }
};

const deleteMultipleTracksRequest = async (ids: string[]) => {
  try {
    const response = await fetch(`${env.API_URL}/api/tracks/delete`, {
      method: 'POST',
      body: JSON.stringify({ ids }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return deleteTracksResponseSchema.parse(await response.json());
  } catch {
    return {
      success: [],
      failed: ids,
    } satisfies DeleteTracksResult;
  }
};

const deleteTracksSchema = z.array(z.string()).min(1);

const deleteTracksRequest = (ids: string[]) => {
  const idsToDelete = deleteTracksSchema.parse(ids);

  return idsToDelete.length > 1
    ? deleteMultipleTracksRequest(idsToDelete)
    : deleteSingleTrackRequest(idsToDelete[0]);
};

export const useDeleteTracksMutation = () =>
  useMutation({
    mutationFn: deleteTracksRequest,
  });
