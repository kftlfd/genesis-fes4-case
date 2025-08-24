import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { FC } from 'react';

import { TracksListClientBased } from '@/components/tracks/TracksList';
import { PageSearchParams } from '@/core/types';
import {
  DEFAULT_FILTERS,
  prefetchTracksListQuery,
  tracksListFiltersSchema,
} from '@/services/tracks';

const TracksPage: FC<PageSearchParams> = async ({ searchParams }) => {
  const sp = await searchParams;
  const filtersParsed = tracksListFiltersSchema.safeParse(Object.fromEntries(Object.entries(sp)));
  const filters = filtersParsed.success ? filtersParsed.data : DEFAULT_FILTERS;

  const qc = new QueryClient();
  await prefetchTracksListQuery(qc, filters);

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <TracksListClientBased initFilters={filters} />
    </HydrationBoundary>
  );
};

export default TracksPage;
