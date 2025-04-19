'use client';

import { CreateTrackModal } from '@/components/tracks/CreateTrackModal';
import { Button } from '@/components/ui/button';
import { useGetTracksListQuery } from '@/services/tracks';
import { PlusIcon } from 'lucide-react';
import { useState } from 'react';

export default function Home() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const { data, isLoading, isError, refetch } = useGetTracksListQuery();

  return (
    <>
      <header className="container mx-auto flex items-center justify-between py-4">
        <h1 className="text-3xl">Tracks</h1>
        <div>
          <Button onClick={() => setCreateModalOpen(true)}>
            <span className="flex items-center gap-1">
              <PlusIcon />
              <span>Create</span>
            </span>
          </Button>
          <CreateTrackModal
            isOpen={createModalOpen}
            onOpenChange={setCreateModalOpen}
            onSubmitSuccessful={async () => {
              refetch();
              await new Promise((res) => setTimeout(res, 1000));
              setCreateModalOpen(false);
            }}
          />
        </div>
      </header>

      <main className="container mx-auto">
        <div className="flex flex-col gap-2">
          {isLoading
            ? 'loading...'
            : isError || !data
              ? 'error'
              : data.data.map((track) => (
                  <div key={track.id} className="rounded-sm border border-amber-900 p-2">
                    {track.artist} - {track.title}
                  </div>
                ))}
        </div>
      </main>
    </>
  );
}
