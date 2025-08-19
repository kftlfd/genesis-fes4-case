'use client';

import { useMutation } from '@tanstack/react-query';
import { FilterIcon, PlusIcon, SquareMousePointer } from 'lucide-react';
import { FC, useRef, useState } from 'react';
import { toast } from 'sonner';

import { CreateTrackModal } from '@/components/tracks/CreateTrackModal';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading';
import { Toggle } from '@/components/ui/toggle';
import { useDebouncedValue } from '@/hooks/use-debouce';
import { useModal } from '@/hooks/use-modal';
import { cn } from '@/lib/utils';
import {
  createTrackRequest,
  deleteTracksRequest,
  TracksListFilters,
  useGetTracksListQuery,
} from '@/services/tracks';

import { PagePagination } from './Pagination';
import { TrackCard } from './TrackCard';
import { FiltersModal } from './TracksFilters';
import { TracksSelection, useTracksSelection } from './TracksSelection';
import { Input } from '../ui/input';

export const TracksListPage: FC = () => {
  const [filters, setFilters] = useState<TracksListFilters>({
    search: null,
    sort: null,
    order: null,
    artist: null,
    genre: null,
    page: 1,
    limit: 10,
  });

  const handleUpdateFilters = (f: TracksListFilters) => {
    setFilters((prev) => ({ ...prev, ...f, page: 1 }));
  };

  const [debouncedSearch] = useDebouncedValue(filters.search, 500);

  const { data, isLoading, isError, isRefetching, refetch } = useGetTracksListQuery({
    ...filters,
    search: debouncedSearch,
  });

  const filtersModal = useModal();
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
      toast('Create track failed');
    },
  });

  const selection = useTracksSelection();

  const handleSelectAll = () =>
    selection.handleSelectMultiple(data ? data.data.map((track) => track.id) : []);

  const deleteTracksMutation = useMutation({
    mutationFn: deleteTracksRequest,
    onSuccess: () => {
      refetch();
      selection.handleDeselctAll();
    },
  });

  const handleDeleteSelected = () => {
    deleteTracksMutation.mutate(selection.selectedIds);
  };

  const nowPlaying = useRef<HTMLAudioElement | null>(null);

  return (
    <div className="container mx-auto px-4">
      <header className="flex items-center justify-between py-4" data-testid="tracks-header">
        <h1 className="text-3xl">Tracks</h1>

        <div className="flex gap-2">
          <Input
            value={filters.search ?? ''}
            onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value || null }))}
            placeholder="Search"
          />

          <Button variant="outline" onClick={() => filtersModal.toggle(true)}>
            <FilterIcon />
          </Button>

          <Toggle
            className="shrink-0"
            variant="outline"
            pressed={selection.isSelectModeEnabled}
            onPressedChange={selection.toggleSelectMode}
            aria-label="Toggle select mode"
            data-testid="select-mode-toggle"
          >
            <SquareMousePointer />
          </Toggle>

          <Button onClick={() => createTrackModal.toggle(true)} data-testid="create-track-button">
            <span className="flex items-center gap-1">
              <PlusIcon />
              <span>Create</span>
            </span>
          </Button>
        </div>

        {filtersModal.isMounted && (
          <FiltersModal
            isOpen={filtersModal.isOpen}
            onOpenChange={filtersModal.toggle}
            filters={filters}
            onSave={handleUpdateFilters}
          />
        )}

        {createTrackModal.isMounted && (
          <CreateTrackModal
            isOpen={createTrackModal.isOpen}
            onOpenChange={createTrackModal.toggle}
            isLoading={createTrackMutation.isPending}
            onSubmit={createTrackMutation.mutate}
          />
        )}
      </header>

      <TracksSelection
        isSelectModeEnabled={selection.isSelectModeEnabled}
        selectedCount={selection.selectedIds.length}
        onSelectAll={handleSelectAll}
        onDeselectAll={selection.handleDeselctAll}
        onDeleteSelected={handleDeleteSelected}
        isDeleteSelectedDisabled={
          selection.selectedIds.length < 1 || deleteTracksMutation.isPending
        }
      />

      <main>
        {isLoading ? (
          <div className="flex justify-center py-6">
            <LoadingSpinner size={100} width={4} data-testid="loading-indicator" />
          </div>
        ) : isError || !data ? (
          <h2>Error</h2>
        ) : (
          <>
            <div
              id="tracks-list"
              className={cn(
                'flex flex-col gap-4',
                isRefetching && 'pointer-none: relative opacity-50',
              )}
            >
              {data.data.map((track) => (
                <TrackCard
                  key={track.id}
                  track={track}
                  isSelectModeEnabled={selection.isSelectModeEnabled}
                  isSelected={selection.selectedIds.includes(track.id)}
                  onSelectChange={selection.handleSelectChange(track.id)}
                  onPlay={(e) => {
                    if (e.currentTarget !== nowPlaying.current) nowPlaying.current?.pause();
                    nowPlaying.current = e.currentTarget;
                  }}
                />
              ))}

              {isRefetching && (
                <div className="absolute inset-0 grid place-content-center">
                  <LoadingSpinner size={100} width={4} data-testid="loading-tracks" />
                </div>
              )}
            </div>

            <div className="pt-3 pb-10">
              <PagePagination
                curPage={filters.page ?? 1}
                totalPages={data?.meta.totalPages ?? 0}
                onPageChange={(p) => setFilters((prev) => ({ ...prev, page: p }))}
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
};
