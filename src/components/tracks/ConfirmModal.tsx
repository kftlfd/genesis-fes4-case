import { FC } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';

type Props = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading?: boolean;
  title: string;
  actionText?: string;
  actionDisabled?: boolean;
};

export const ConfirmModal: FC<Props> = ({
  isOpen,
  onOpenChange,
  onConfirm,
  title,
  actionText = 'Confirm',
  actionDisabled,
  isLoading,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent data-testid="confirm-dialog">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <DialogFooter>
          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-testid="cancel-delete"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => onConfirm()}
              disabled={actionDisabled}
              data-testid="confirm-delete"
              isLoading={isLoading}
            >
              {actionText}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
