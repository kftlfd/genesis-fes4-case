'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Edit, Trash, Upload, XIcon } from 'lucide-react';
import { FC } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { ButtonWithTooltip } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { useModal } from '@/hooks/use-modal';
import {
  addTrackUploadRequest,
  deleteTracksRequest,
  editTrackRequest,
  removeTrackUploadRequest,
} from '@/services/tracks';
import { useAllTracks, useAllTracksActions } from '@/stores/all-tracks';
import { useNowPlaying } from '@/stores/now-playing';

import { EditTrackModal } from './EditTrackModal';
import { TrackCardPlayButton } from './TrackCardPlayButton';
import { UploadTrackModal } from './UploadTrackModal';

type Props = {
  trackId: string;
  isSelectModeEnabled: boolean;
  isSelected: boolean;
  onSelectChange: (selected: boolean) => void;
  refreshPage?: () => void;
};

export const TrackCard: FC<Props> = ({
  trackId,
  isSelectModeEnabled,
  isSelected,
  onSelectChange,
  refreshPage,
}) => {
  const track = useAllTracks(({ data }) => data.get(trackId));
  const { addTracks, editTrack, removeTrack } = useAllTracksActions();
  const { cur, clearTrack } = useNowPlaying();

  const queryClient = useQueryClient();

  const editTrackModal = useModal();
  const addUploadModal = useModal();
  const removeUploadModal = useModal();
  const deleteTrackModal = useModal();

  const editTrackMutation = useMutation({
    mutationFn: editTrackRequest,
    onMutate: (vars) => {
      const curTrack = track ? { ...track } : null;
      editTrack(trackId, vars.data);
      editTrackModal.toggle(false);
      return curTrack;
    },
    onSuccess: () => {
      toast('Track saved');
      editTrackMutation.reset();
      // queryClient.invalidateQueries({ queryKey: ['all-tracks'] });
      // editTrackModal.toggle(false);
      // refreshPage?.();
    },
    onError: (err, vars, prev) => {
      toast('Track edit failed');
      if (prev) {
        editTrack(trackId, prev);
      }
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
    onMutate: () => {
      const curAudiofile = track?.audioFile;
      editTrack(trackId, { audioFile: undefined });
      removeUploadModal.toggle(false);
      if (cur?.id === trackId) {
        clearTrack();
      }
      return curAudiofile;
    },
    onSuccess: () => {
      toast('Track upload removed');
      removeUploadMutation.reset();
      // queryClient.invalidateQueries({ queryKey: ['all-tracks'] });
      // removeUploadModal.toggle(false);
      // refreshPage?.();
    },
    onError: (err, vars, prevAudiofile) => {
      toast('Removing upload failed');
      editTrack(trackId, { audioFile: prevAudiofile });
    },
  });

  const deleteTrackMutation = useMutation({
    mutationFn: deleteTracksRequest,
    onMutate: () => {
      const prev = track ? { ...track } : null;
      removeTrack(trackId);
      deleteTrackModal.toggle(false);
      if (cur?.id === trackId) {
        clearTrack();
      }
      return prev;
    },
    onSuccess: () => {
      toast('Track deleted');
      deleteTrackMutation.reset();
      // queryClient.invalidateQueries({ queryKey: ['all-tracks'] });
      // deleteTrackModal.toggle(false);
      // refreshPage?.();
    },
    onError: (err, vars, prev) => {
      toast('track delete failed');
      if (prev) {
        addTracks([prev]);
      }
    },
  });

  if (!track) {
    console.warn(`track with id "${trackId}" not found`);
    return null;
  }

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

        <picture className="relative h-20 w-20 shrink-0">
          <source srcSet={track.coverImage} />
          <source srcSet="/track-cover-placeholder.webp" />
          <img
            className="absolute inset-0 block h-full w-full object-cover object-center"
            alt={`${track.artist} - ${track.title}`}
            title={`${track.artist} - ${track.title}`}
          />
          {track.audioFile && <TrackCardPlayButton id={track.id} src={track.audioFile} />}
        </picture>

        <div className="flex grow flex-col">
          <div>
            <span data-testid={`track-item-${track.id}-artist`}>{track.artist}</span>
            {' - '}
            <span data-testid={`track-item-${track.id}-title`}>{track.title}</span>
          </div>

          <div>{track.album}</div>

          {track.genres.length > 0 && (
            <div className="flex grow flex-col justify-end">
              <div className="flex gap-1 pt-2">
                {track.genres.map((g) => (
                  <Badge key={g}>{g}</Badge>
                ))}
              </div>
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
