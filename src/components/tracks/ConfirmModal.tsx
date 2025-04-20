import { FC } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';

export const ConfirmModal: FC<{
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  actionText?: string;
  actionDisabled?: boolean;
}> = ({ isOpen, onOpenChange, onConfirm, title, actionText = 'Confirm', actionDisabled }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <DialogFooter>
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => onConfirm()} disabled={actionDisabled}>
              {actionText}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
