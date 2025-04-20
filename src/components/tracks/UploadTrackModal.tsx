import { Track, useUploadTrackMutation } from '@/services/tracks';
import { useForm } from '@tanstack/react-form';
import { FC, useRef } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { XIcon } from 'lucide-react';
import { z } from 'zod';
import { Card, CardContent } from '../ui/card';

const AUDIOFILE_TYPES = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/x-wav'];

const fileInputAcceptAttr = AUDIOFILE_TYPES.join(', ');

type Values = {
  file: File | null;
};

const defaultValues: Values = {
  file: null,
};

const uploadTrackSchema = z.object({
  file: z
    .instanceof(File, { message: 'required' })
    .refine((v) => AUDIOFILE_TYPES.includes(v.type), 'acceptable files: .mp3, .wav')
    .refine((v) => v.size > 0, 'empty file')
    .refine((v) => v.size < 50_000 * 1024, 'file too large'),
});

export const UploadTrackModal: FC<{
  track: Track;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onUploadSuccessful?: () => void;
}> = ({ track, isOpen, onOpenChange, onUploadSuccessful }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

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
              <input
                ref={inputRef}
                className="hidden"
                type="file"
                onChange={(e) => field.handleChange(e.target.files?.[0] ?? null)}
                accept={fileInputAcceptAttr}
              />

              {field.state.value ? (
                <Card className="py-3">
                  <CardContent className="px-3">
                    <div className="flex items-center justify-between gap-4">
                      <span>{field.state.value.name}</span>

                      <Button
                        onClick={() => field.handleChange(null)}
                        disabled={uploadTrackMutation.isPending}
                      >
                        <XIcon />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Button
                  onClick={() => {
                    inputRef.current?.click();
                  }}
                  disabled={uploadTrackMutation.isPending}
                >
                  Select file
                </Button>
              )}

              {field.state.meta.errors && (
                <div className="pt-3">
                  <em>{field.state.meta.errors.map((err) => err?.message).join(', ')}</em>
                </div>
              )}
            </div>
          )}
        />

        <DialogFooter>
          <Button
            onClick={() => {
              form.handleSubmit();
            }}
            disabled={uploadTrackMutation.isPending}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
