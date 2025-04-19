import { FC, FormEvent, ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { useForm } from '@tanstack/react-form';
import { z } from 'zod';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { GenresInput } from './GenresInput';

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
  coverImage: '',
};

export const CreateTrackModal: FC<{
  trigger: ReactNode;
}> = ({ trigger }) => {
  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: createTrackSchema,
    },
    onSubmitInvalid: ({ value }) => {
      console.log('invalid', { value });
    },
    onSubmit: ({ value, meta }) => {
      console.log({ value, meta });
    },
  });

  const onSubmit = (e?: FormEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    form.handleSubmit();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create new track</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-2">
          <form.Field
            name="artist"
            children={(field) => (
              <>
                <Label htmlFor="artist">Artist</Label>
                <Input
                  id="artist"
                  type="text"
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Artist"
                />
              </>
            )}
          />

          <form.Field
            name="title"
            children={(field) => (
              <>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  type={'text'}
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Title"
                />
              </>
            )}
          />

          <form.Field
            name="album"
            children={(field) => (
              <>
                <Label htmlFor="album">Album</Label>
                <Input
                  id="album"
                  type={'text'}
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Album"
                />
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
                <Input
                  id="coverImage"
                  type={'text'}
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="URL"
                />
              </>
            )}
          />
        </form>

        <DialogFooter className="flex justify-end">
          <Button onClick={() => onSubmit()}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
