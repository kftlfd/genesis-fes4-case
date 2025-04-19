'use client';

import { useGetTracksListQuery } from '@/services/tracks';

export default function Home() {
  const { data, isLoading, isError } = useGetTracksListQuery();

  return (
    <>
      <header className="container mx-auto flex items-center justify-between py-4">
        <h1>Tracks</h1>
        <div>
          <button>+ Create</button>
        </div>
      </header>

      <main className="container mx-auto">
        <div className="flex flex-col gap-2">
          {isLoading
            ? 'loading...'
            : isError || !data
              ? 'error'
              : data.data.map((track) => (
                  <div key={track.id} className="border border-amber-50 p-2">
                    {track.artist} - {track.title}
                  </div>
                ))}
        </div>
      </main>
    </>
  );
}
