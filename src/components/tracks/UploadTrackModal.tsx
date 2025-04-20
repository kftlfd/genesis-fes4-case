import { Track, useUploadTrackMutation } from '@/services/tracks';
import { useForm } from '@tanstack/react-form';
import { FC } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { XIcon } from 'lucide-react';
import { z } from 'zod';

type Values = {
  file: File | null;
};

const defaultValues: Values = {
  file: null,
};

const uploadTrackSchema = z.object({
  file: z.instanceof(File, { message: 'required' }),
});

export const UploadTrackModal: FC<{
  track: Track;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onUploadSuccessful?: () => void;
}> = ({ track, isOpen, onOpenChange, onUploadSuccessful }) => {
  const uploadTrackMutation = useUploadTrackMutation();

  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: uploadTrackSchema,
    },
    onSubmit: async ({ value }) => {
      console.log(value);
      const v = uploadTrackSchema.parse(value);
      await uploadTrackMutation.mutateAsync({ trackId: track.id, file: v.file });
      onUploadSuccessful?.();
    },
  });

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
          <DialogTitle>Upload track</DialogTitle>
        </DialogHeader>

        <form.Field
          name="file"
          children={(field) => (
            <div>
              <div className="flex gap-2">
                <Input
                  className="grow"
                  type="file"
                  onChange={(e) => field.handleChange(e.target.files?.[0] ?? null)}
                />
                {field.state.value && (
                  <Button onClick={() => field.handleChange(null)}>
                    <XIcon />
                  </Button>
                )}
              </div>
              {/* {field.state.meta.errors && <em>{field.state.meta.errors.map((v) => v)}</em>} */}
              <pre>{JSON.stringify(field.state.meta.errors, null, 2)}</pre>
            </div>
          )}
        />

        <DialogFooter>
          <Button
            onClick={() => {
              form.handleSubmit();
            }}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
