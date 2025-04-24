'use client';

import { CreateTrackModal } from '@/components/tracks/CreateTrackModal';
import { Button } from '@/components/ui/button';
import {
  createTrackRequest,
  deleteTracksRequest,
  GetTracksListParams,
  useGetTracksListQuery,
} from '@/services/tracks';
import { PlusIcon } from 'lucide-react';
import { FC, useRef, useState } from 'react';
import { LoadingSpinner } from '../ui/loading';
import { PagePagination } from './Pagination';
import { useDebouncedValue } from '@/hooks/use-debouce';
import { TracksFilters } from './TracksFilters';
import { TracksSelection } from './TracksSelection';
import { TrackCard } from './TrackCard';
import { useMutation } from '@tanstack/react-query';
import { useModal } from '@/hooks/use-modal';
import { toast } from 'sonner';

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

  const createTrackModal = useModal();

  const createTrackMutation = useMutation({
    mutationFn: createTrackRequest,
    onSuccess: () => {
      toast('Track created');
      refetch();
      createTrackModal.toggle(false);
      createTrackMutation.reset();
    },
    onError: () => {
      toast('create track failed');
    },
  });

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [isSelectModeEnabled, setIsSelectModeEnabled] = useState(false);

  const handleSelectAll = () => {
    setSelectedIds(
      Array.from(new Set([...selectedIds, ...(data ? data.data.map((track) => track.id) : [])])),
    );
  };

  const handleDeselctAll = () => {
    setSelectedIds([]);
  };

  const deleteTracksMutation = useMutation({
    mutationFn: deleteTracksRequest,
    onSuccess: () => {
      refetch();
      handleDeselctAll();
    },
  });

  const handleDeleteSelected = () => {
    deleteTracksMutation.mutate(selectedIds);
  };

  const handleSelectChange = (trackId: string) => (selected: boolean) => {
    if (selected && !selectedIds.includes(trackId)) {
      setSelectedIds((prev) => [...prev, trackId]);
    }
    if (!selected) {
      setSelectedIds((prev) => prev.filter((p) => p !== trackId));
    }
  };

  const nowPlaying = useRef<HTMLAudioElement | null>(null);

  return (
    <div className="container mx-auto px-4">
      <header className="flex items-center justify-between py-4" data-testid="tracks-header">
        <h1 className="text-3xl">Tracks</h1>

        <div>
          <Button onClick={() => createTrackModal.toggle(true)} data-testid="create-track-button">
            <span className="flex items-center gap-1">
              <PlusIcon />
              <span>Create</span>
            </span>
          </Button>
        </div>

        {createTrackModal.isMounted && (
          <CreateTrackModal
            isOpen={createTrackModal.isOpen}
            onOpenChange={createTrackModal.toggle}
            isLoading={createTrackMutation.isPending}
            onSubmit={createTrackMutation.mutate}
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
        isDeleteSelectedDisabled={selectedIds.length < 1 || deleteTracksMutation.isPending}
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
                onSelectChange={handleSelectChange(track.id)}
                onPlay={(e) => {
                  if (e.currentTarget !== nowPlaying.current) nowPlaying.current?.pause();
                  nowPlaying.current = e.currentTarget;
                }}
              />
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
