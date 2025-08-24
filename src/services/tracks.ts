import { keepPreviousData, QueryClient, useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { api } from '@/core/http';

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

export type TracksListApiResponse = z.infer<typeof tracksListSchema>;

export const tracksListFiltersSchema = z.object({
  page: z.number().nullable().catch(1),
  limit: z.number().nullable().catch(10),
  sort: z.enum(['title', 'artist', 'album', 'createdAt']).nullable().catch(null),
  order: z.enum(['asc', 'desc']).nullable().catch(null),
  search: z.string().nullable().catch(null),
  genre: z.string().nullable().catch(null),
  artist: z.string().nullable().catch(null),
});

export type TracksListFilters = z.infer<typeof tracksListFiltersSchema>;

export const DEFAULT_FILTERS: TracksListFilters = tracksListFiltersSchema.parse({});

export const getTracksListRequest = async (
  filters: TracksListFilters,
): Promise<TracksListApiResponse> => {
  try {
    const parsedFilters = tracksListFiltersSchema.parse(filters);

    const searchParams = new URLSearchParams(
      Object.entries(parsedFilters).reduce((acc: [string, string][], [key, val]) => {
        if (val) {
          acc.push([key, val.toString()]);
        }
        return acc;
      }, []),
    );

    const response = await api(`tracks?${searchParams.toString()}`);

    return tracksListSchema.parse(await response.json());
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const TRACKS_LIST_QUERY_KEY = 'all-tracks';

export const useGetTracksListQuery = (params: TracksListFilters) =>
  useQuery({
    queryKey: [TRACKS_LIST_QUERY_KEY, params] as const,
    queryFn: ({ queryKey }) => {
      const [, filters] = queryKey;
      return getTracksListRequest(filters);
    },
    placeholderData: keepPreviousData,
  });

export const prefetchTracksListQuery = (qc: QueryClient, filters: TracksListFilters) =>
  qc.prefetchQuery({
    queryKey: [TRACKS_LIST_QUERY_KEY, filters] as const,
    queryFn: ({ queryKey }) => {
      const [, f] = queryKey;
      return getTracksListRequest(f);
    },
  });

export const createEditTrackSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  artist: z.string().trim().min(1, 'Artist is required'),
  album: z.string().trim(),
  genres: z.array(z.string()),
  coverImage: z.string().url().or(z.literal('')),
});

export type TrackCreateEditInput = z.infer<typeof createEditTrackSchema>;

export const createTrackRequest = async (data: TrackCreateEditInput) => {
  const body = createEditTrackSchema.parse(data);

  const response = await api('tracks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  return trackSchema.parse(await response.json());
};

export const editTrackRequest = async (arg: { trackId: string; data: TrackCreateEditInput }) => {
  const body = createEditTrackSchema.parse(arg.data);

  const response = await api(`tracks/${arg.trackId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  return trackSchema.parse(await response.json());
};

const deleteTracksResultSchema = z.object({
  success: z.array(z.string()),
  failed: z.array(z.string()),
});

type DeleteTracksResult = z.infer<typeof deleteTracksResultSchema>;

const deleteSingleTrackRequest = async (trackId: string) => {
  try {
    const response = await api(`tracks/${trackId}`, { method: 'DELETE' });

    if (response.ok) {
      return {
        success: [trackId],
        failed: [],
      } satisfies DeleteTracksResult;
    }

    throw new Error('request failed');
  } catch {
    return {
      success: [],
      failed: [trackId],
    } satisfies DeleteTracksResult;
  }
};

const deleteMultipleTracksRequest = async (ids: string[]) => {
  try {
    const response = await api('tracks/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    });

    return deleteTracksResultSchema.parse(await response.json());
  } catch {
    return {
      success: [],
      failed: ids,
    } satisfies DeleteTracksResult;
  }
};

export const deleteTracksRequest = (ids: string[]) => {
  if (ids.length < 1) {
    throw new Error('ids array is empty');
  }

  return ids.length > 1 ? deleteMultipleTracksRequest(ids) : deleteSingleTrackRequest(ids[0]);
};

export const addTrackUploadRequest = async (arg: { trackId: string; file: File }) => {
  const data = new FormData();
  data.append('file', arg.file, arg.file.name);

  const response = await api(`tracks/${arg.trackId}/upload`, {
    method: 'POST',
    body: data,
  });

  if (!response.ok) {
    throw new Error('upload failed');
  }

  return response;
};

export const removeTrackUploadRequest = async (trackId: string) => {
  const response = await api(`tracks/${trackId}/file`, { method: 'DELETE' });

  if (!response.ok) {
    throw new Error('request failed');
  }
};
