'use client';

import { CreateTrackModal } from '@/components/tracks/CreateTrackModal';
import { Button } from '@/components/ui/button';
import { useDeleteTracksMutation, useGetTracksListQuery } from '@/services/tracks';
import { PlusIcon, Trash } from 'lucide-react';
import { useState } from 'react';

export default function Home() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const { data, isLoading, isError, refetch } = useGetTracksListQuery();
  const deleteMutation = useDeleteTracksMutation();

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
                  <div
                    key={track.id}
                    className="rounded-sm border border-amber-900 p-2 flex justify-between"
                  >
                    <div>
                      {track.artist} - {track.title}
                    </div>

                    <div>
                      <Button
                        onClick={() =>
                          deleteMutation.mutate([track.id], { onSuccess: () => refetch() })
                        }
                        disabled={deleteMutation.isPending}
                      >
                        <Trash />
                      </Button>
                    </div>
                  </div>
                ))}
        </div>
      </main>
    </>
  );
}
