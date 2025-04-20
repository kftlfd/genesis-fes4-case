import { env } from '@/core/env';
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
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

export type Track = z.infer<typeof trackSchema>;

const tracksListSchema = z.object({
  data: z.array(trackSchema),
  meta: z.object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
  }),
});

type GetTracksListParams = {
  page?: number;
  limit?: number;
  sort?: 'title' | 'artist' | 'album' | 'createdAt';
  order?: 'asc' | 'desc';
  search?: string;
  genre?: string;
  artist?: string;
};

const getTracksListSearchParamsSchema = z.object({
  page: z
    .number()
    .transform((v) => v.toString())
    .optional(),
  limit: z
    .number()
    .transform((v) => v.toString())
    .optional(),
  sort: z.enum(['title', 'artist', 'album', 'createdAt']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
  search: z.string().optional(),
  genre: z.string().optional(),
  artist: z.string().optional(),
});

const getTracksListRequest = async (params?: GetTracksListParams) => {
  const searchParams = new URLSearchParams(getTracksListSearchParamsSchema.parse(params));
  const response = await fetch(`${env.API_URL}/api/tracks?${searchParams.toString()}`);
  try {
    return tracksListSchema.parse(await response.json());
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const useGetTracksListQuery = (params?: GetTracksListParams) =>
  useQuery({
    queryKey: ['all-tracks', params] as const,
    queryFn: ({ queryKey }) => {
      const [, p] = queryKey;
      return getTracksListRequest(p);
    },
    placeholderData: keepPreviousData,
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

const editTrackRequest = async (track: Track) => {
  try {
    const body = createTrackSchema.parse(track);
    const response = await fetch(`${env.API_URL}/api/tracks/${track.id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return trackSchema.parse(await response.json());
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const useEditTrackMutation = () =>
  useMutation({
    mutationFn: editTrackRequest,
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

export const useDeleteTracksMutation = () => useMutation({ mutationFn: deleteTracksRequest });

const uploadTrackRequest = async (arg: { trackId: string; file: File }) => {
  const data = new FormData();
  data.append('file', arg.file, arg.file.name);

  const response = await fetch(`${env.API_URL}/api/tracks/${arg.trackId}/upload`, {
    method: 'POST',
    body: data,
    // headers: {
    //   'content-type': 'audio/mp3', // arg.file.type,
    //   'content-length': `${arg.file.size}`,
    // },
  });
  if (!response.ok) {
    throw new Error('upload failed');
  }
  return response;
};

export const useUploadTrackMutation = () => useMutation({ mutationFn: uploadTrackRequest });

const deleteTrackUploadRequest = async (trackId: string) => {
  const response = await fetch(`${env.API_URL}/api/tracks/${trackId}/file`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('request failed');
  }
};

export const useDeleteTrackUploadMutation = () =>
  useMutation({ mutationFn: deleteTrackUploadRequest });
