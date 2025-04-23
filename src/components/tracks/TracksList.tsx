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
import { PagePagination } from './Pagination';
import { useDebouncedValue } from '@/hooks/use-debouce';
import { TracksFilters } from './TracksFilters';
import { Toggle } from '../ui/toggle';
import { Collapsible, CollapsibleContent } from '../ui/collapsible';
import { TracksSelection } from './TracksSelection';
import { TrackCard } from './TrackCard';

export const TracksListPage: FC = () => {
  const [filters, setFilters] = useState<GetTracksListParams>({
    page: 1,
    limit: 4,
  });

  const handleUpdateFilters = (f: GetTracksListParams) => {
    setFilters((prev) => ({ ...prev, ...f }));
  };

  const { data, isLoading, isError, refetch } = useGetTracksListQuery({
    ...filters,
    artist: useDebouncedValue(filters.artist, 300)[0],
    search: useDebouncedValue(filters.search, 300)[0],
  });

  const [createModalOpen, setCreateModalOpen] = useState(false);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [trackToEdit, setTrackToEdit] = useState<Track | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const [trackToUpload, setTrackToUpload] = useState<Track | null>(null);
  const [uploadTrackModalOpen, setUploadTrackModalOpen] = useState(false);

  const [confirmDeleteTrackModalOpen, setConfirmDeleteTrackModalOpen] = useState(false);
  const [deleteTrackId, setDeleteTrackId] = useState<string | null>(null);
  const deleteMutation = useDeleteTracksMutation(deleteTrackId ?? '');

  const [confirmDeleteUploadModalOpen, setConfirmDeleteUploadModalOpen] = useState(false);
  const [deleteUploadId, setDeleteUploadId] = useState<string | null>(null);
  const deleteUpload = useDeleteTrackUploadMutation(deleteUploadId ?? '');

  const [isSelectModeEnabled, setIsSelectModeEnabled] = useState(false);

  const handleSelectAll = () => {
    setSelectedIds(
      Array.from(new Set([...selectedIds, ...(data ? data.data.map((track) => track.id) : [])])),
    );
  };

  const handleDeselctAll = () => {
    setSelectedIds([]);
  };

  const handleDeleteSelected = () => {
    deleteMutation.mutate(selectedIds, {
      onSuccess: () => {
        refetch();
        handleDeselctAll();
      },
    });
  };

  const nowPlaying = useRef<HTMLAudioElement | null>(null);

  return (
    <div className="container mx-auto px-4">
      <header className="flex items-center justify-between py-4" data-testid="tracks-header">
        <h1 className="text-3xl">Tracks</h1>

        <div>
          <Button onClick={() => setCreateModalOpen(true)} data-testid="create-track-button">
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

      <TracksFilters className="py-4" filters={filters} setFilters={handleUpdateFilters} />

      <TracksSelection
        className="py-4"
        isSelectModeEnabled={isSelectModeEnabled}
        toggleSelectMode={setIsSelectModeEnabled}
        selectedCount={selectedIds.length}
        onSelectAll={handleSelectAll}
        onDeselectAll={handleDeselctAll}
        onDeleteSelected={handleDeleteSelected}
        isDeleteSelectedDisabled={selectedIds.length < 1 || deleteMutation.isPending}
      />

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
              <TrackCard
                key={track.id}
                track={track}
                isSelectModeEnabled={isSelectModeEnabled}
                isSelected={selectedIds.includes(track.id)}
                onSelectChange={(checked) => {
                  if (checked === true && !selectedIds.includes(track.id)) {
                    setSelectedIds((prev) => [...prev, track.id]);
                  }
                  if (checked === false) {
                    setSelectedIds((prev) => prev.filter((p) => p !== track.id));
                  }
                }}
                onPlay={(e) => {
                  if (e.currentTarget !== nowPlaying.current) nowPlaying.current?.pause();
                  nowPlaying.current = e.currentTarget;
                }}
              />
              /*
              <Card key={track.id} className="py-3" data-testid={`track-item-${track.id}`}>
                <CardContent className="flex gap-2 px-3">
                  <Collapsible open={isSelectModeEnabled}>
                    <CollapsibleContent>
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
                        data-testid={`track-checkbox-${track.id}`}
                      />
                    </CollapsibleContent>
                  </Collapsible>

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
                      <span data-testid={`track-item-${track.id}-artist`}>{track.artist}</span>-
                      <span data-testid={`track-item-${track.id}-title`}>{track.title}</span>
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
                      data-testid={`edit-track-${track.id}`}
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
                        data-testid={`upload-track-${track.id}`}
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
                      data-testid={`delete-track-${track.id}`}
                    >
                      <Trash />
                    </Button>
                  </div>
                </CardContent>
              </Card>
              */
            ))
          )}
        </div>

        {!isLoading && (
          <div className="py-3">
            <PagePagination
              curPage={filters.page ?? 1}
              totalPages={data?.meta.totalPages ?? 0}
              onPageChange={(p) => setFilters((prev) => ({ ...prev, page: p }))}
            />
          </div>
        )}
      </main>
    </div>
  );
};
