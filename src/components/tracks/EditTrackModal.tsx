'use client';

import { FC } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Track, TrackCreateEditFormBody } from '@/services/tracks';

import { TrackCreateEditForm, useTrackCreateEditForm } from './TrackCreateEditForm';

type Props = {
  track: Track;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onEditSuccessful?: (updTrack: Track) => void;
  onSubmit: (data: TrackCreateEditFormBody) => void;
  isLoading?: boolean;
};

export const EditTrackModal: FC<Props> = ({ track, isOpen, onOpenChange, onSubmit, isLoading }) => {
  const formControl = useTrackCreateEditForm({
    defaultValues: {
      artist: track.artist,
      title: track.title,
      album: track.album ?? '',
      genres: track.genres,
      coverImage: track.coverImage ?? '',
    },
    onSubmit,
  });

  const handleOpenChange = (open: boolean) => {
    if (open) formControl.form.reset();
    onOpenChange(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit track</DialogTitle>
        </DialogHeader>

        <TrackCreateEditForm formControl={formControl} isLoading={isLoading} />

        <DialogFooter className="flex justify-end">
          <Button onClick={() => formControl.handleSubmit()} isLoading={isLoading}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
