import { FC } from 'react';

import { TracksListRSCBased } from '@/components/tracks/TracksList';
import { PageSearchParams } from '@/core/types';
import { getTracksListRequest, tracksListFiltersSchema } from '@/services/tracks';

const TracksPage: FC<PageSearchParams> = async ({ searchParams }) => {
  const sp = await searchParams;
  const filters = tracksListFiltersSchema.parse(Object.fromEntries(Object.entries(sp)));

  const data = await getTracksListRequest(filters).catch(() => undefined);

  return <TracksListRSCBased filters={filters} data={data} isError={!data} />;
};

export default TracksPage;
