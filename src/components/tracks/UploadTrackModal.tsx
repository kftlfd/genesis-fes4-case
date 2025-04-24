import { useForm } from '@tanstack/react-form';
import { XIcon } from 'lucide-react';
import { FC, useRef } from 'react';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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

type SubmitData = z.infer<typeof uploadTrackSchema>;

export const UploadTrackModal: FC<{
  isOpen: boolean;
  isLoading?: boolean;
  onSubmit: (data: SubmitData) => void;
  onOpenChange: (isOpen: boolean) => void;
  onUploadSuccessful?: () => void;
}> = ({ isOpen, isLoading, onOpenChange, onSubmit }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: uploadTrackSchema,
    },
    onSubmit: ({ value }) => {
      console.log(value);
      const v = uploadTrackSchema.parse(value);
      onSubmit(v);
    },
  });

  const handleOpenChange = (open: boolean) => {
    if (open) form.reset();
    onOpenChange(open);
  };

  const handleSubmit = () => {
    form.handleSubmit();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload track</DialogTitle>
          <DialogDescription className="sr-only">
            Upload an audiofile for the track
          </DialogDescription>
        </DialogHeader>

        <form.Field name="file">
          {(field) => (
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

                      <Button onClick={() => field.handleChange(null)} disabled={isLoading}>
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
                  disabled={isLoading}
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
        </form.Field>

        <DialogFooter>
          <Button onClick={handleSubmit} isLoading={isLoading}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
