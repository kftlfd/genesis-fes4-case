'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Edit, Trash, Upload, XIcon } from 'lucide-react';
import { FC, SyntheticEvent } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { ButtonWithTooltip } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { env } from '@/core/env';
import { useModal } from '@/hooks/use-modal';
import {
  addTrackUploadRequest,
  deleteTracksRequest,
  editTrackRequest,
  removeTrackUploadRequest,
  Track,
} from '@/services/tracks';

import { EditTrackModal } from './EditTrackModal';
import { UploadTrackModal } from './UploadTrackModal';

type Props = {
  track: Track;
  isSelectModeEnabled: boolean;
  isSelected: boolean;
  onSelectChange: (selected: boolean) => void;
  onPlay: (e: SyntheticEvent<HTMLAudioElement, Event>) => void;
  refreshPage?: () => void;
};

export const TrackCard: FC<Props> = ({
  track,
  isSelectModeEnabled,
  isSelected,
  onSelectChange,
  onPlay,
  refreshPage,
}) => {
  const queryClient = useQueryClient();

  const editTrackModal = useModal();
  const addUploadModal = useModal();
  const removeUploadModal = useModal();
  const deleteTrackModal = useModal();

  const editTrackMutation = useMutation({
    mutationFn: editTrackRequest,
    onSuccess: () => {
      toast('Track saved');
      editTrackMutation.reset();
      queryClient.invalidateQueries({ queryKey: ['all-tracks'] });
      editTrackModal.toggle(false);
      refreshPage?.();
    },
    onError: () => {
      toast('Track edit failed');
    },
  });

  const addUploadMutation = useMutation({
    mutationFn: addTrackUploadRequest,
    onSuccess: () => {
      toast('Track upload added');
      addUploadMutation.reset();
      queryClient.invalidateQueries({ queryKey: ['all-tracks'] });
      addUploadModal.toggle(false);
      refreshPage?.();
    },
    onError: () => {
      toast('Upload failed');
    },
  });

  const removeUploadMutation = useMutation({
    mutationFn: removeTrackUploadRequest,
    onSuccess: () => {
      toast('Track upload removed');
      removeUploadMutation.reset();
      queryClient.invalidateQueries({ queryKey: ['all-tracks'] });
      removeUploadModal.toggle(false);
      refreshPage?.();
    },
    onError: () => {
      toast('Removing upload failed');
    },
  });

  const deleteTrackMutation = useMutation({
    mutationFn: deleteTracksRequest,
    onSuccess: () => {
      toast('Track deleted');
      deleteTrackMutation.reset();
      queryClient.invalidateQueries({ queryKey: ['all-tracks'] });
      deleteTrackModal.toggle(false);
      refreshPage?.();
    },
    onError: () => {
      toast('track delete failed');
    },
  });

  return (
    <Card key={track.id} className="py-3" data-testid={`track-item-${track.id}`}>
      <CardContent className="flex gap-2 px-3">
        <Collapsible open={isSelectModeEnabled}>
          <CollapsibleContent>
            <Checkbox
              checked={isSelected}
              onCheckedChange={(checked) => onSelectChange(!!checked)}
              data-testid={`track-checkbox-${track.id}`}
            />
          </CollapsibleContent>
        </Collapsible>

        <picture className="relative h-20 w-20">
          <source srcSet={track.coverImage} />
          <source srcSet="/track-cover-placeholder.webp" />
          <img
            className="absolute inset-0 block h-full w-full object-cover object-center"
            alt={`${track.artist} - ${track.title}`}
            title={`${track.artist} - ${track.title}`}
          />
        </picture>

        <div className="grow">
          <div>
            <span data-testid={`track-item-${track.id}-artist`}>{track.artist}</span>
            {' - '}
            <span data-testid={`track-item-${track.id}-title`}>{track.title}</span>
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
            <div className="pt-2">
              <audio className="w-full" controls onPlay={onPlay}>
                <source src={`${env.API_URL}/api/files/${track.audioFile}`} />
              </audio>
            </div>
          )}
        </div>

        <div className="flex gap-1">
          <ButtonWithTooltip
            tooltip="Edit track"
            onClick={() => editTrackModal.toggle(true)}
            isLoading={editTrackMutation.isPending}
            data-testid={`edit-track-${track.id}`}
          >
            <Edit />
          </ButtonWithTooltip>

          {track.audioFile ? (
            <ButtonWithTooltip
              tooltip="Remove audiofile"
              onClick={() => removeUploadModal.toggle(true)}
              isLoading={removeUploadMutation.isPending}
            >
              <XIcon />
            </ButtonWithTooltip>
          ) : (
            <ButtonWithTooltip
              tooltip="Add audiofile"
              onClick={() => addUploadModal.toggle(true)}
              isLoading={addUploadMutation.isPending}
              data-testid={`upload-track-${track.id}`}
            >
              <Upload />
            </ButtonWithTooltip>
          )}

          <ButtonWithTooltip
            tooltip="Delete track"
            onClick={() => deleteTrackModal.toggle(true)}
            isLoading={deleteTrackMutation.isPending}
            data-testid={`delete-track-${track.id}`}
          >
            <Trash />
          </ButtonWithTooltip>
        </div>

        {editTrackModal.isMounted && (
          <EditTrackModal
            isOpen={editTrackModal.isOpen}
            onOpenChange={editTrackModal.toggle}
            track={track}
            isLoading={editTrackMutation.isPending}
            onSubmit={(data) => editTrackMutation.mutate({ trackId: track.id, data })}
          />
        )}

        {addUploadModal.isMounted && (
          <UploadTrackModal
            isOpen={addUploadModal.isOpen}
            onOpenChange={addUploadModal.toggle}
            isLoading={addUploadMutation.isPending}
            onSubmit={({ file }) => addUploadMutation.mutate({ trackId: track.id, file })}
          />
        )}

        {removeUploadModal.isMounted && (
          <ConfirmModal
            isOpen={removeUploadModal.isOpen}
            onOpenChange={removeUploadModal.toggle}
            title="Delete track audio file?"
            onConfirm={() => removeUploadMutation.mutate(track.id)}
            actionBtnProps={{
              'variant': 'destructive',
              'isLoading': removeUploadMutation.isPending,
              'data-testid': 'confirm-delete',
            }}
            cancelBtnProps={{
              'data-testid': 'cancel-delete',
            }}
          />
        )}

        {deleteTrackModal.isMounted && (
          <ConfirmModal
            isOpen={deleteTrackModal.isOpen}
            onOpenChange={deleteTrackModal.toggle}
            title="Delete track?"
            onConfirm={() => deleteTrackMutation.mutate([track.id])}
            actionBtnProps={{
              'variant': 'destructive',
              'isLoading': deleteTrackMutation.isPending,
              'data-testid': 'confirm-delete',
            }}
            cancelBtnProps={{
              'data-testid': 'cancel-delete',
            }}
          />
        )}
      </CardContent>
    </Card>
  );
};
