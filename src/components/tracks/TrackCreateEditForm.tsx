'use client';

import { useForm } from '@tanstack/react-form';
import { FC, FormEvent } from 'react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createEditTrackSchema, TrackCreateEditInput } from '@/services/tracks';

import { GenresInput } from './GenresInput';

export const useTrackCreateEditForm = ({
  defaultValues,
  onSubmit,
}: {
  defaultValues: TrackCreateEditInput;
  onSubmit: (data: TrackCreateEditInput) => void;
}) => {
  const form = useForm({
    defaultValues,
    validators: { onSubmit: createEditTrackSchema },
    onSubmit: ({ value }) => onSubmit(value),
  });

  const handleSubmit = (e?: FormEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    form.handleSubmit();
  };

  return { form, handleSubmit };
};

export const TrackCreateEditForm: FC<{
  formControl: ReturnType<typeof useTrackCreateEditForm>;
  isLoading?: boolean;
}> = ({ formControl: { form, handleSubmit }, isLoading }) => {
  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-[max-content_1fr] gap-x-6 gap-y-4">
      <form.Field name="artist">
        {(field) => (
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
      </form.Field>

      <form.Field name="title">
        {(field) => (
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
      </form.Field>

      <form.Field name="album">
        {(field) => (
          <>
            <Label htmlFor="album">Album</Label>
            <div>
              <Input
                id="album"
                type={'text'}
                name={field.name}
                value={field.state.value ?? ''}
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
      </form.Field>

      <form.Field name="genres">
        {(field) => (
          <>
            <Label>Genres</Label>
            <GenresInput
              value={field.state.value}
              onChange={field.handleChange}
              disabled={isLoading}
            />
          </>
        )}
      </form.Field>

      <form.Field name="coverImage">
        {(field) => (
          <>
            <Label htmlFor="coverImage">Cover Image</Label>
            <div>
              <Input
                id="coverImage"
                type={'text'}
                name={field.name}
                value={field.state.value ?? ''}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="URL"
                disabled={isLoading}
              />
              {field.state.meta.errors && (
                <em>{field.state.meta.errors.map((e) => e?.message).join(', ')}</em>
              )}
            </div>
          </>
        )}
      </form.Field>
    </form>
  );
};
