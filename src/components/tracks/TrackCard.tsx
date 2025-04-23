'use client';

import { CreateTrackModal } from '@/components/tracks/CreateTrackModal';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  GetTracksListParams,
  Track,
  useDeleteTracksMutation,
  useDeleteTrackUploadMutation,
  useEditTrackMutation,
  useGetTracksListQuery,
  useUploadTrackMutation,
} from '@/services/tracks';
import { Edit, PlusIcon, Trash, Upload, XIcon } from 'lucide-react';
import { FC, SyntheticEvent, useRef, useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { EditTrackModal } from './EditTrackModal';
import { Badge } from '../ui/badge';
import { env } from '@/core/env';
import { UploadTrackModal } from './UploadTrackModal';
import { ConfirmModal } from './ConfirmModal';
import { LoadingSpinner } from '../ui/loading';
import { PagePagination } from './Pagination';
import { useDebouncedValue } from '@/hooks/use-debouce';
import { TracksFilters } from './TracksFilters';
import { Toggle } from '../ui/toggle';
import { Collapsible, CollapsibleContent } from '../ui/collapsible';
import { TracksSelection } from './TracksSelection';

const useModal = (unmountDelay = 1_000) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const unmountTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const toggle = (open: boolean) => {
    if (open) {
      setIsOpen(true);
      setIsMounted(true);
      clearTimeout(unmountTimeout.current);
      unmountTimeout.current = undefined;
    } else {
      setIsOpen(false);
      unmountTimeout.current = setTimeout(() => {
        setIsMounted(false);
      }, unmountDelay);
    }
  };

  return {
    isMounted,
    isOpen,
    toggle,
  };
};

export const TrackCard: FC<{
  track: Track;
  isSelectModeEnabled: boolean;
  isSelected: boolean;
  onSelectChange: (selected: boolean) => void;
  onPlay: (e: SyntheticEvent<HTMLAudioElement, Event>) => void;
}> = ({ track, isSelectModeEnabled, isSelected, onSelectChange, onPlay }) => {
  const editTrackModal = useModal();
  const addUploadModal = useModal();
  const removeUploadModal = useModal();
  const deleteTrackModal = useModal();

  const editTrackMutation = useEditTrackMutation(track.id);
  const addUploadMutation = useUploadTrackMutation(track.id);
  const removeUploadMutation = useDeleteTrackUploadMutation(track.id);
  const deleteTrackMutation = useDeleteTracksMutation(track.id);

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
            <span data-testid={`track-item-${track.id}-artist`}>{track.artist}</span>-
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
          <Button
            onClick={() => editTrackModal.toggle(true)}
            isLoading={editTrackMutation.isPending}
            data-testid={`edit-track-${track.id}`}
          >
            <Edit />
          </Button>

          {track.audioFile ? (
            <Button
              onClick={() => removeUploadModal.toggle(true)}
              isLoading={removeUploadMutation.isPending}
            >
              <XIcon />
            </Button>
          ) : (
            <Button
              onClick={() => addUploadModal.toggle(true)}
              isLoading={addUploadMutation.isPending}
              data-testid={`upload-track-${track.id}`}
            >
              <Upload />
            </Button>
          )}

          <Button
            onClick={() => deleteTrackModal.toggle(true)}
            isLoading={deleteTrackMutation.isPending}
            data-testid={`delete-track-${track.id}`}
          >
            <Trash />
          </Button>
        </div>

        {editTrackModal.isMounted && (
          <EditTrackModal
            isOpen={editTrackModal.isOpen}
            onOpenChange={editTrackModal.toggle}
            track={track}
            onEditSuccessful={() => {
              console.log('card: edit succ');
              editTrackModal.toggle(false);
            }}
          />
        )}

        {addUploadModal.isMounted && (
          <UploadTrackModal
            isOpen={addUploadModal.isOpen}
            onOpenChange={addUploadModal.toggle}
            track={track}
            onUploadSuccessful={async () => {
              // refetch();
              await new Promise((res) => setTimeout(res, 300));
              addUploadModal.toggle(false);
            }}
          />
        )}

        {deleteTrackModal.isMounted && (
          <ConfirmModal
            isOpen={deleteTrackModal.isOpen}
            onOpenChange={deleteTrackModal.toggle}
            title="Delete track?"
            onConfirm={() => {
              deleteTrackMutation.mutate([track.id], {
                onSuccess: () => {
                  // refetch();
                  deleteTrackModal.toggle(false);
                },
              });
            }}
            actionDisabled={deleteTrackMutation.isPending}
          />
        )}

        {removeUploadModal.isMounted && (
          <ConfirmModal
            isOpen={removeUploadModal.isOpen}
            onOpenChange={removeUploadModal.toggle}
            title="Delete track audio file?"
            onConfirm={() => {
              removeUploadMutation.mutate(track.id, {
                onSuccess: () => {
                  // refetch();
                  removeUploadModal.toggle(false);
                },
              });
            }}
            actionDisabled={removeUploadMutation.isPending}
          />
        )}
      </CardContent>
    </Card>
  );
};
