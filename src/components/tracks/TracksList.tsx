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
import {
  Track,
  useDeleteTracksMutation,
  useDeleteTrackUploadMutation,
  useGetTracksListQuery,
} from '@/services/tracks';
import { Edit, PlusIcon, Trash, Upload, XIcon } from 'lucide-react';
import { FC, useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { EditTrackModal } from './EditTrackModal';
import { Badge } from '../ui/badge';
import { env } from '@/core/env';
import { UploadTrackModal } from './UploadTrackModal';

export const TracksListPage: FC = () => {
  const [curPage, setCurPage] = useState(1);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const { data, isLoading, isError, refetch } = useGetTracksListQuery({ page: curPage });
  const deleteMutation = useDeleteTracksMutation();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [trackToEdit, setTrackToEdit] = useState<Track | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const [trackToUpload, setTrackToUpload] = useState<Track | null>(null);
  const [uploadTrackModalOpen, setUploadTrackModalOpen] = useState(false);

  const deleteUpload = useDeleteTrackUploadMutation();

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
        <div id="tracks-list" className="flex flex-col gap-4">
          {isLoading
            ? 'loading...'
            : isError || !data
              ? 'error'
              : data.data.map((track) => (
                  <Card key={track.id} className="py-3">
                    <CardContent className="flex gap-2 px-3">
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

                      <picture>
                        <source srcSet={track.coverImage} />
                        <img
                          className="block h-20 w-20 object-cover object-center"
                          alt={`${track.artist} - ${track.title}`}
                          title={`${track.artist} - ${track.title}`}
                          src="https://picsum.photos/seed/Johnny%20B.%20Goode/300/300"
                        />
                      </picture>

                      <div className="grow">
                        <div>
                          {track.artist} - {track.title}
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
                          <audio controls>
                            <source
                              src={`${env.API_URL}/api/files/${track.audioFile}`}
                              type="audio/mp3"
                            />
                          </audio>
                        )}
                      </div>

                      <div className="flex gap-1">
                        <Button
                          onClick={() => {
                            setEditModalOpen(true);
                            setTrackToEdit(track);
                          }}
                        >
                          <Edit />
                        </Button>

                        {track.audioFile ? (
                          <Button
                            onClick={() => {
                              deleteUpload.mutate(track.id, { onSuccess: () => refetch() });
                            }}
                          >
                            <XIcon />
                          </Button>
                        ) : (
                          <Button
                            onClick={() => {
                              setUploadTrackModalOpen(true);
                              setTrackToUpload(track);
                            }}
                          >
                            <Upload />
                          </Button>
                        )}

                        <Button
                          onClick={() =>
                            deleteMutation.mutate([track.id], { onSuccess: () => refetch() })
                          }
                          disabled={deleteMutation.isPending}
                        >
                          <Trash />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
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
                  <PaginationLink href={`?p=${p}#tracks-list`}>{p}</PaginationLink>
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
                  <PaginationLink href={`?p=${p}#tracks-list`}>{p}</PaginationLink>
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
};
