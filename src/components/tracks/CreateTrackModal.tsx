'use client';

import { FC, FormEvent } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { useForm } from '@tanstack/react-form';
import { z } from 'zod';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { GenresInput } from './GenresInput';
import { useCreateTrackMutation } from '@/services/tracks';

const createTrackSchema = z.object({
  artist: z.string().min(1),
  title: z.string().min(1),
  album: z.string(),
  genres: z.array(z.string()),
  coverImage: z.string().url().optional(),
});

type TrackInputValues = z.infer<typeof createTrackSchema>;

const defaultValues: TrackInputValues = {
  artist: '',
  title: '',
  album: '',
  genres: [],
  coverImage: undefined,
};

export const CreateTrackModal: FC<{
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmitSuccessful?: () => void;
}> = ({ isOpen, onOpenChange, onSubmitSuccessful }) => {
  const createTrackMutation = useCreateTrackMutation();

  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: createTrackSchema,
    },
    onSubmitInvalid: ({ value }) => {
      console.log('invalid', { value });
    },
    onSubmit: async ({ value, meta }) => {
      console.log({ value, meta });
      await createTrackMutation.mutateAsync({ ...value, coverImage: value.coverImage ?? '' });
      onSubmitSuccessful?.();
    },
  });

  const onSubmit = (e?: FormEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    form.handleSubmit();
  };

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
          <DialogTitle>Create new track</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="grid grid-cols-[max-content_1fr] gap-x-6 gap-y-4">
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
                <GenresInput value={field.state.value} onChange={field.handleChange} />
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
          <form.Subscribe
            children={(f) => (
              <Button onClick={() => onSubmit()} disabled={f.isSubmitting}>
                {f.isSubmitting ? 'Loading...' : f.isSubmitSuccessful ? 'Created' : 'Create'}
              </Button>
            )}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
