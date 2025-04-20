'use client';

import { CreateTrackModal } from '@/components/tracks/CreateTrackModal';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

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
import { ConfirmModal } from './ConfirmModal';
import { LoadingSpinner } from '../ui/loading';
// import { useSearchParams } from 'next/navigation';
import { PagePagination } from './Pagination';

// const parseCurPage = (val: string | null) => {
//   const p = Number(val);
//   return Number.isFinite(p) && p > 0 ? p : 1;
// };

export const TracksListPage: FC = () => {
  // const searchParams = useSearchParams();

  const [curPage, setCurPage] = useState(() => {
    return 1;
    // const p = Number(searchParams.get('p'));
    // return Number.isFinite(p) && p > 0 ? p : 1;
  });

  // const curPage = parseCurPage(searchParams.get('p'));

  // console.log({ p: searchParams.get('p') });

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const { data, isLoading, isError, refetch } = useGetTracksListQuery({ page: curPage });
  const deleteMutation = useDeleteTracksMutation();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [trackToEdit, setTrackToEdit] = useState<Track | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const [trackToUpload, setTrackToUpload] = useState<Track | null>(null);
  const [uploadTrackModalOpen, setUploadTrackModalOpen] = useState(false);

  const deleteUpload = useDeleteTrackUploadMutation();

  const [confirmDeleteTrackModalOpen, setConfirmDeleteTrackModalOpen] = useState(false);
  const [deleteTrackId, setDeleteTrackId] = useState<string | null>(null);

  const [confirmDeleteUploadModalOpen, setConfirmDeleteUploadModalOpen] = useState(false);
  const [deleteUploadId, setDeleteUploadId] = useState<string | null>(null);

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

        {deleteTrackId && (
          <ConfirmModal
            title="Delete track?"
            isOpen={confirmDeleteTrackModalOpen}
            onOpenChange={setConfirmDeleteTrackModalOpen}
            onConfirm={() => {
              deleteMutation.mutate([deleteTrackId], {
                onSuccess: () => {
                  refetch();
                  setConfirmDeleteTrackModalOpen(false);
                },
              });
            }}
            actionDisabled={deleteMutation.isPending}
          />
        )}

        {deleteUploadId && (
          <ConfirmModal
            title="Delete track audio file?"
            isOpen={confirmDeleteUploadModalOpen}
            onOpenChange={setConfirmDeleteUploadModalOpen}
            onConfirm={() => {
              deleteUpload.mutate(deleteUploadId, {
                onSuccess: () => {
                  refetch();
                  setConfirmDeleteUploadModalOpen(false);
                },
              });
            }}
            actionDisabled={deleteUpload.isPending}
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
          {isLoading ? (
            <div className="flex justify-center py-6">
              <LoadingSpinner size={100} width={4} />
            </div>
          ) : isError || !data ? (
            'error'
          ) : (
            data.data.map((track) => (
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
                          setDeleteUploadId(track.id);
                          setConfirmDeleteUploadModalOpen(true);
                        }}
                        disabled={deleteUpload.isPending}
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
                      onClick={() => {
                        setDeleteTrackId(track.id);
                        setConfirmDeleteTrackModalOpen(true);
                      }}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {!isLoading && (
          <div className="py-3">
            <PagePagination
              curPage={curPage}
              totalPages={data?.meta.totalPages ?? 0}
              onPageChange={setCurPage}
            />
          </div>
        )}
      </main>
    </>
  );
};
