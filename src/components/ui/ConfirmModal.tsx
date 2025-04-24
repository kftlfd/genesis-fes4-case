import { ComponentProps, FC } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type Props = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  actionText?: string;
  cancelText?: string;
  cancelBtnProps?: ComponentProps<typeof Button>;
  actionBtnProps?: ComponentProps<typeof Button>;
  onConfirm: () => void;
};

export const ConfirmModal: FC<Props> = ({
  isOpen,
  onOpenChange,
  title,
  description,
  actionText = 'Confirm',
  cancelText = 'Cancel',
  cancelBtnProps,
  actionBtnProps,
  onConfirm,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent data-testid="confirm-dialog">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : (
            <DialogDescription className="sr-only">{title}</DialogDescription>
          )}
        </DialogHeader>
        <DialogFooter>
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} {...cancelBtnProps}>
              {cancelText}
            </Button>
            <Button onClick={() => onConfirm()} {...actionBtnProps}>
              {actionText}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
