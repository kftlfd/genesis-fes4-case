'use client';

import { CreateTrackModal } from '@/components/tracks/CreateTrackModal';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { useDeleteTracksMutation, useGetTracksListQuery } from '@/services/tracks';
import { PlusIcon, Trash } from 'lucide-react';
import { useState } from 'react';

export default function Home() {
  const [curPage, setCurPage] = useState(1);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const { data, isLoading, isError, refetch } = useGetTracksListQuery({ page: curPage });
  const deleteMutation = useDeleteTracksMutation();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

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

      <div className="container mx-auto py-4">
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

      <main className="container mx-auto">
        <div className="flex flex-col gap-2">
          {isLoading
            ? 'loading...'
            : isError || !data
              ? 'error'
              : data.data.map((track) => (
                  <div
                    key={track.id}
                    className="flex justify-between rounded-sm border border-amber-900 p-2"
                  >
                    <div>
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

        <div className="py-3">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" />
              </PaginationItem>

              {Array.from({ length: curPage - 1 }, (_, i) => i + 1).map((p) => (
                <PaginationItem key={p} onClick={() => setCurPage(p)}>
                  <PaginationLink href="#">{p}</PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationLink href="#" isActive>
                  {curPage}
                </PaginationLink>
              </PaginationItem>

              {Array.from(
                { length: (data?.meta.totalPages ?? 0) - curPage },
                (_, i) => curPage + 1 + i,
              ).map((p) => (
                <PaginationItem key={p} onClick={() => setCurPage(p)}>
                  <PaginationLink href="#">{p}</PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>

              <PaginationItem>
                <PaginationNext href="#" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </main>
    </>
  );
}
