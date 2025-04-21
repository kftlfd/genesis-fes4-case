'use client';

import { CreateTrackModal } from '@/components/tracks/CreateTrackModal';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  GetTracksListParams,
  Track,
  useDeleteTracksMutation,
  useDeleteTrackUploadMutation,
  useGetTracksListQuery,
} from '@/services/tracks';
import { Edit, PlusIcon, Trash, Upload, XIcon } from 'lucide-react';
import { FC, useRef, useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { EditTrackModal } from './EditTrackModal';
import { Badge } from '../ui/badge';
import { env } from '@/core/env';
import { UploadTrackModal } from './UploadTrackModal';
import { ConfirmModal } from './ConfirmModal';
import { LoadingSpinner } from '../ui/loading';
// import { useSearchParams } from 'next/navigation';
import { PagePagination } from './Pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useDebouncedValue } from '@/hooks/use-debouce';
import { Input } from '../ui/input';
import { useGetGenresListQuery } from '@/services/genres';

const FILTER_NONE = '__none__';

// const parseCurPage = (val: string | null) => {
//   const p = Number(val);
//   return Number.isFinite(p) && p > 0 ? p : 1;
// };

export const TracksListPage: FC = () => {
  // const searchParams = useSearchParams();

  const [curPage, setCurPage] = useState(() => {
    return 1;
    // const p = Number(searchParams.get('p'));
    // return Number.isFinite(p) && p > 0 ? p : 1;
  });
  // const curPage = parseCurPage(searchParams.get('p'));
  // console.log({ p: searchParams.get('p') });
  const [curPageSize, setCurPageSize] = useState(4);

  const [curSort, setCurSort] = useState<GetTracksListParams['sort']>();
  const [curOrder, setCurOrder] = useState<GetTracksListParams['order']>();

  const [genreFilter, setGenreFilter] = useState<string>();
  const [artistFilter, setArtistFilter] = useState<string>();
  const [searchFilter, setSearchFilter] = useState<string>();

  const { data, isLoading, isError, refetch } = useGetTracksListQuery({
    page: curPage,
    limit: curPageSize,
    sort: curSort,
    order: curOrder,
    genre: genreFilter,
    artist: useDebouncedValue(artistFilter, 300)[0],
    search: useDebouncedValue(searchFilter, 300)[0],
  });

  const genresQuery = useGetGenresListQuery();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const deleteMutation = useDeleteTracksMutation();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [trackToEdit, setTrackToEdit] = useState<Track | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const [trackToUpload, setTrackToUpload] = useState<Track | null>(null);
  const [uploadTrackModalOpen, setUploadTrackModalOpen] = useState(false);

  const deleteUpload = useDeleteTrackUploadMutation();

  const [confirmDeleteTrackModalOpen, setConfirmDeleteTrackModalOpen] = useState(false);
  const [deleteTrackId, setDeleteTrackId] = useState<string | null>(null);

  const [confirmDeleteUploadModalOpen, setConfirmDeleteUploadModalOpen] = useState(false);
  const [deleteUploadId, setDeleteUploadId] = useState<string | null>(null);

  const nowPlaying = useRef<HTMLAudioElement | null>(null);

  return (
    <div className="container mx-auto px-4">
      <header className="flex items-center justify-between py-4">
        <h1 className="text-3xl">Tracks</h1>

        <div>
          <Button onClick={() => setCreateModalOpen(true)}>
            <span className="flex items-center gap-1">
              <PlusIcon />
              <span>Create</span>
            </span>
          </Button>
        </div>

        <CreateTrackModal
          isOpen={createModalOpen}
          onOpenChange={setCreateModalOpen}
          onSubmitSuccessful={async () => {
            refetch();
            await new Promise((res) => setTimeout(res, 1000));
            setCreateModalOpen(false);
          }}
        />

        {trackToEdit && (
          <EditTrackModal
            key={trackToEdit.id}
            track={trackToEdit}
            isOpen={editModalOpen}
            onOpenChange={setEditModalOpen}
            onEditSuccessful={async () => {
              refetch();
              await new Promise((res) => setTimeout(res, 1000));
              setEditModalOpen(false);
            }}
          />
        )}

        {trackToUpload && (
          <UploadTrackModal
            key={trackToUpload.id}
            track={trackToUpload}
            isOpen={uploadTrackModalOpen}
            onOpenChange={setUploadTrackModalOpen}
            onUploadSuccessful={async () => {
              refetch();
              await new Promise((res) => setTimeout(res, 300));
              setUploadTrackModalOpen(false);
            }}
          />
        )}

        {deleteTrackId && (
          <ConfirmModal
            title="Delete track?"
            isOpen={confirmDeleteTrackModalOpen}
            onOpenChange={setConfirmDeleteTrackModalOpen}
            onConfirm={() => {
              deleteMutation.mutate([deleteTrackId], {
                onSuccess: () => {
                  refetch();
                  setConfirmDeleteTrackModalOpen(false);
                },
              });
            }}
            actionDisabled={deleteMutation.isPending}
          />
        )}

        {deleteUploadId && (
          <ConfirmModal
            title="Delete track audio file?"
            isOpen={confirmDeleteUploadModalOpen}
            onOpenChange={setConfirmDeleteUploadModalOpen}
            onConfirm={() => {
              deleteUpload.mutate(deleteUploadId, {
                onSuccess: () => {
                  refetch();
                  setConfirmDeleteUploadModalOpen(false);
                },
              });
            }}
            actionDisabled={deleteUpload.isPending}
          />
        )}
      </header>

      <div className="flex flex-wrap gap-3 py-4">
        <div className="flex min-w-25 grow items-center gap-1 rounded-sm border p-1">
          <span>Sort by</span>
          <Select
            value={curSort ?? FILTER_NONE}
            onValueChange={(v) =>
              setCurSort(v === FILTER_NONE ? undefined : (v as GetTracksListParams['sort']))
            }
          >
            <SelectTrigger className="grow">
              <SelectValue placeholder="None" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={FILTER_NONE}>None</SelectItem>
              {(
                ['artist', 'album', 'title', 'createdAt'] satisfies GetTracksListParams['sort'][]
              ).map((val) => (
                <SelectItem key={val} value={val}>
                  {val}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex min-w-25 grow items-center gap-1 rounded-sm border p-1">
          <span>Genre</span>
          <Select
            value={genreFilter ?? FILTER_NONE}
            onValueChange={(v) => setGenreFilter(v === FILTER_NONE ? undefined : v)}
          >
            <SelectTrigger className="grow">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={FILTER_NONE}>Any</SelectItem>
              {(genresQuery.data ?? []).map((val) => (
                <SelectItem key={val} value={val}>
                  {val}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex min-w-25 grow items-center gap-1 rounded-sm border p-1">
          <span>Order</span>
          <Select
            value={curOrder ?? FILTER_NONE}
            onValueChange={(v) =>
              setCurOrder(v === FILTER_NONE ? undefined : (v as GetTracksListParams['order']))
            }
          >
            <SelectTrigger className="grow">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={FILTER_NONE}>Any</SelectItem>
              {(['asc', 'desc'] satisfies GetTracksListParams['order'][]).map((val) => (
                <SelectItem key={val} value={val}>
                  {val}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex min-w-25 grow items-center gap-1 rounded-sm border p-1">
          <span>On Page</span>
          <Select value={curPageSize.toString()} onValueChange={(v) => setCurPageSize(Number(v))}>
            <SelectTrigger className="grow">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[4, 10, 20].map((val) => (
                <SelectItem key={val} value={val.toString()}>
                  {val}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex min-w-35 grow items-center gap-1 rounded-sm border p-1">
          <span>Artist</span>
          <Input
            className="grow"
            type="text"
            value={artistFilter ?? ''}
            onChange={(e) => {
              const v = e.target.value;
              setArtistFilter(v === '' ? undefined : v);
            }}
          />
        </div>

        <div className="flex min-w-35 grow items-center gap-1 rounded-sm border p-1">
          <span>Search</span>
          <Input
            className="grow"
            type="text"
            value={searchFilter ?? ''}
            onChange={(e) => {
              const v = e.target.value;
              setSearchFilter(v === '' ? undefined : v);
            }}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-3 py-4">
        <div className="flex gap-2">
          <span>Selected: {selectedIds.length}</span>
        </div>

        <Button
          onClick={() => {
            setSelectedIds(
              Array.from(
                new Set([...selectedIds, ...(data ? data.data.map((track) => track.id) : [])]),
              ),
            );
          }}
        >
          Select All
        </Button>

        <Button onClick={() => setSelectedIds([])}>Deselect All</Button>

        <Button
          disabled={selectedIds.length < 1}
          onClick={() => deleteMutation.mutate(selectedIds, { onSuccess: () => refetch() })}
        >
          Delete Selected
        </Button>
      </div>

      <main>
        <div id="tracks-list" className="flex flex-col gap-4">
          {isLoading ? (
            <div className="flex justify-center py-6">
              <LoadingSpinner size={100} width={4} />
            </div>
          ) : isError || !data ? (
            'error'
          ) : (
            data.data.map((track) => (
              <Card key={track.id} className="py-3">
                <CardContent className="flex gap-2 px-3">
                  <Checkbox
                    checked={selectedIds.includes(track.id)}
                    onCheckedChange={(checked) => {
                      if (checked === true && !selectedIds.includes(track.id)) {
                        setSelectedIds((prev) => [...prev, track.id]);
                      }
                      if (checked === false) {
                        setSelectedIds((prev) => prev.filter((p) => p !== track.id));
                      }
                    }}
                  />

                  <picture className="relative h-20 w-20">
                    <source srcSet={track.coverImage} />
                    <source srcSet="/track-cover-placeholder.webp" />
                    <img
                      className="absolute inset-0 block h-full w-full object-cover object-center"
                      alt={`${track.artist} - ${track.title}`}
                      title={`${track.artist} - ${track.title}`}
                    />
                  </picture>

                  <div className="grow">
                    <div>
                      {track.artist} - {track.title}
                    </div>
                    <div>{track.album}</div>

                    {track.genres.length > 0 && (
                      <div className="flex gap-1 pt-2">
                        {track.genres.map((g) => (
                          <Badge key={g}>{g}</Badge>
                        ))}
                      </div>
                    )}

                    {track.audioFile && (
                      <div className="pt-2">
                        <audio
                          className="w-full"
                          controls
                          onPlay={(e) => {
                            if (e.currentTarget !== nowPlaying.current) nowPlaying.current?.pause();
                            nowPlaying.current = e.currentTarget;
                          }}
                        >
                          <source
                            src={`${env.API_URL}/api/files/${track.audioFile}`}
                            type="audio/mp3"
                          />
                        </audio>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-1">
                    <Button
                      onClick={() => {
                        setEditModalOpen(true);
                        setTrackToEdit(track);
                      }}
                    >
                      <Edit />
                    </Button>

                    {track.audioFile ? (
                      <Button
                        onClick={() => {
                          setDeleteUploadId(track.id);
                          setConfirmDeleteUploadModalOpen(true);
                        }}
                        disabled={deleteUpload.isPending}
                      >
                        <XIcon />
                      </Button>
                    ) : (
                      <Button
                        onClick={() => {
                          setUploadTrackModalOpen(true);
                          setTrackToUpload(track);
                        }}
                      >
                        <Upload />
                      </Button>
                    )}

                    <Button
                      onClick={() => {
                        setDeleteTrackId(track.id);
                        setConfirmDeleteTrackModalOpen(true);
                      }}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {!isLoading && (
          <div className="py-3">
            <PagePagination
              curPage={curPage}
              totalPages={data?.meta.totalPages ?? 0}
              onPageChange={setCurPage}
            />
          </div>
        )}
      </main>
    </div>
  );
};
