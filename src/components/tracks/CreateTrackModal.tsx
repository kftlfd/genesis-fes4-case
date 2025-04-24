'use client';

import { FC } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { TrackCreateEditForm, useTrackCreateEditForm } from './TrackCreateEditForm';
import { TrackCreateEditFormBody } from '@/services/tracks';

type Props = {
  isOpen: boolean;
  isLoading?: boolean;
  onSubmit: (data: TrackCreateEditFormBody) => void;
  onOpenChange: (isOpen: boolean) => void;
  onSubmitSuccessful?: () => void;
};

export const CreateTrackModal: FC<Props> = ({ isOpen, onOpenChange, onSubmit, isLoading }) => {
  const formControl = useTrackCreateEditForm({
    defaultValues: {
      artist: '',
      title: '',
      album: '',
      genres: [],
      coverImage: '',
    },
    onSubmit,
  });

  const handleOpenChange = (open: boolean) => {
    if (open) formControl.form.reset();
    onOpenChange(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent data-testid="track-form">
        <DialogHeader>
          <DialogTitle>Create new track</DialogTitle>
        </DialogHeader>

        <TrackCreateEditForm formControl={formControl} isLoading={isLoading} />

        <DialogFooter className="flex justify-end">
          <Button
            onClick={() => formControl.handleSubmit()}
            isLoading={isLoading}
            data-testid="submit-button"
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
