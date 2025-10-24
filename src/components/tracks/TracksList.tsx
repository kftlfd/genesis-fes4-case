'use client';

import { useMutation } from '@tanstack/react-query';
import { FilterIcon, PlusIcon, SquareMousePointer } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FC, useEffect, useState } from 'react';
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
  TracksListApiResponse,
  TracksListFilters,
  tracksListFiltersSchema,
  useGetTracksListQuery,
} from '@/services/tracks';
import { AllTracksStoreProvider } from '@/stores/all-tracks';

import { PagePagination } from './Pagination';
import { TrackCard } from './TrackCard';
import { FiltersModal } from './TracksFilters';
import { TracksSelection, useTracksSelection } from './TracksSelection';
import { Input } from '../ui/input';

export const TracksListPage: FC<{
  filters: TracksListFilters;
  updateFilters: (filters: TracksListFilters) => void;
  data?: TracksListApiResponse;
  isLoading: boolean;
  isRefetching: boolean;
  isError: boolean;
  refetch: () => void;
  refreshPage?: () => void;
}> = ({ filters, updateFilters, data, isLoading, isRefetching, isError, refetch, refreshPage }) => {
  const handleUpdateFilter = <K extends keyof TracksListFilters>(
    key: K,
    value: TracksListFilters[K],
  ) => {
    updateFilters({ ...filters, [key]: value });
  };

  const handleUpdateFilters = (f: TracksListFilters) => {
    updateFilters({ ...f, page: 1 });
  };

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

  return (
    <div className="container mx-auto px-4">
      <header className="flex items-center justify-between py-4" data-testid="tracks-header">
        <h1 className="text-3xl">Tracks</h1>

        <div className="flex gap-2">
          <Input
            value={filters.search ?? ''}
            onChange={(e) => handleUpdateFilter('search', e.target.value || null)}
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
                  trackId={track.id}
                  isSelectModeEnabled={selection.isSelectModeEnabled}
                  isSelected={selection.selectedIds.includes(track.id)}
                  onSelectChange={selection.handleSelectChange(track.id)}
                  refreshPage={refreshPage}
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
                onPageChange={(p) => handleUpdateFilter('page', p)}
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export const TracksListClientBased: FC<{
  initFilters: TracksListFilters;
}> = ({ initFilters }) => {
  const [filters, setFilters] = useState(initFilters);

  const updateFilters = (f: typeof filters) => {
    setFilters(f);
    const params = new URLSearchParams();
    Object.entries(f).forEach(([k, v]) => {
      if (v !== null) params.set(k, v.toString());
    });
    window.history.pushState({}, '', `?${params.toString()}`);
  };

  useEffect(() => {
    window.addEventListener('hashchange', () => {
      const params = new URLSearchParams(window.location.search);
      const newF = tracksListFiltersSchema.parse(Object.fromEntries(params.entries()));
      setFilters(newF);
    });
  }, []);

  const [debouncedSearch] = useDebouncedValue(filters.search, 500);

  const { data, isLoading, isError, isRefetching, refetch } = useGetTracksListQuery({
    ...filters,
    search: debouncedSearch,
  });

  return (
    <AllTracksStoreProvider tracks={data?.data ?? null}>
      <TracksListPage
        filters={filters}
        updateFilters={updateFilters}
        data={data}
        isLoading={isLoading}
        isRefetching={isRefetching}
        isError={isError}
        refetch={() => {
          refetch().catch(console.error);
        }}
      />
    </AllTracksStoreProvider>
  );
};

export const TracksListRSCBased: FC<{
  filters: TracksListFilters;
  data?: TracksListApiResponse;
  isError: boolean;
}> = ({ filters, data, isError }) => {
  const router = useRouter();

  const setFilters = (f: Partial<TracksListFilters>) => {
    const params = new URLSearchParams();
    Object.entries({ ...filters, ...f }).forEach(([k, v]) => {
      if (v !== null) params.set(k, v.toString());
    });
    router.push(`/tracks?${params.toString()}`);
  };

  return (
    <AllTracksStoreProvider tracks={data?.data ?? null}>
      <TracksListPage
        filters={filters}
        updateFilters={setFilters}
        data={data}
        isLoading={false}
        isRefetching={false}
        isError={isError}
        refetch={router.refresh}
        refreshPage={router.refresh}
      />
    </AllTracksStoreProvider>
  );
};
