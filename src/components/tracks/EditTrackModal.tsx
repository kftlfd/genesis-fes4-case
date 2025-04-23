'use client';

import { FC, FormEvent } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { useForm } from '@tanstack/react-form';
import { z } from 'zod';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { GenresInput } from './GenresInput';
import { Track, useEditTrackMutation } from '@/services/tracks';

const createTrackSchema = z.object({
  artist: z.string().min(1),
  title: z.string().min(1),
  album: z.string(),
  genres: z.array(z.string()),
  coverImage: z.string().url().optional(),
});

type TrackInputValues = z.infer<typeof createTrackSchema>;

export const EditTrackModal: FC<{
  track: Track;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onEditSuccessful?: (updTrack: Track) => void;
  onSubmit?: (updTrack: TrackInputValues) => Promise<void>;
}> = ({ track, isOpen, onOpenChange, onEditSuccessful }) => {
  const editTrackMutation = useEditTrackMutation(track.id);

  const defaultValues: TrackInputValues = {
    artist: track.artist,
    title: track.title,
    album: track.album ?? '',
    genres: track.genres,
    coverImage: track.coverImage,
  };

  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: createTrackSchema,
    },
    onSubmitInvalid: ({ value }) => {
      console.log('invalid', { value });
    },
    onSubmit: async ({ value, meta }) => {
      // console.log({ value, meta });
      return editTrackMutation.mutateAsync(
        { ...track, ...value },
        {
          onSuccess: (result) => {
            console.log('edit success');
            onEditSuccessful?.(result);
          },
          onError: () => {
            console.log('edit fail');
          },
        },
      );
    },
  });

  const handleSubmit = (e?: FormEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    form.handleSubmit();
  };

  const isLoading = editTrackMutation.isPending;
  console.log('modal:', { mutationPending: isLoading, form: form.state.isSubmitting });

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (open) form.reset();
        onOpenChange(open);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit track</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid grid-cols-[max-content_1fr] gap-x-6 gap-y-4">
          <form.Field
            name="artist"
            children={(field) => (
              <>
                <Label htmlFor="artist">Artist</Label>
                <div>
                  <Input
                    id="artist"
                    type="text"
                    name={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Artist"
                    disabled={isLoading}
                  />
                  {field.state.meta.errors && (
                    <em>{field.state.meta.errors.map((e) => e?.message).join(', ')}</em>
                  )}
                </div>
              </>
            )}
          />

          <form.Field
            name="title"
            children={(field) => (
              <>
                <Label htmlFor="title">Title</Label>
                <div>
                  <Input
                    id="title"
                    type={'text'}
                    name={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Title"
                    disabled={isLoading}
                  />
                  {field.state.meta.errors && (
                    <em>{field.state.meta.errors.map((e) => e?.message).join(', ')}</em>
                  )}
                </div>
              </>
            )}
          />

          <form.Field
            name="album"
            children={(field) => (
              <>
                <Label htmlFor="album">Album</Label>
                <div>
                  <Input
                    id="album"
                    type={'text'}
                    name={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Album"
                    disabled={isLoading}
                  />
                  {field.state.meta.errors && (
                    <em>{field.state.meta.errors.map((e) => e?.message).join(', ')}</em>
                  )}
                </div>
              </>
            )}
          />

          <form.Field
            name="genres"
            children={(field) => (
              <>
                <Label>Genres</Label>
                <GenresInput
                  value={field.state.value}
                  onChange={field.handleChange}
                  disabled={isLoading}
                />
              </>
            )}
          />

          <form.Field
            name="coverImage"
            children={(field) => (
              <>
                <Label htmlFor="coverImage">Cover Image</Label>
                <div>
                  <Input
                    id="coverImage"
                    type={'text'}
                    name={field.name}
                    value={field.state.value ?? ''}
                    onChange={(e) =>
                      field.handleChange(e.target.value === '' ? undefined : e.target.value)
                    }
                    placeholder="URL"
                    disabled={isLoading}
                  />
                  {field.state.meta.errors && (
                    <em>{field.state.meta.errors.map((e) => e?.message).join(', ')}</em>
                  )}
                </div>
              </>
            )}
          />
        </form>

        <DialogFooter className="flex justify-end">
          <form.Subscribe>
            {({ isSubmitting }) => (
              <Button onClick={() => handleSubmit()} isLoading={isSubmitting}>
                Save
              </Button>
            )}
          </form.Subscribe>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
