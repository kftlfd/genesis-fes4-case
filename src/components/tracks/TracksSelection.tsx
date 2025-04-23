'use client';

import { FC } from 'react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { Toggle } from '@/components/ui/toggle';
import { cn } from '@/lib/utils';

type Props = {
  className?: string;
  isSelectModeEnabled: boolean;
  toggleSelectMode: (enabled: boolean) => void;
  selectedCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onDeleteSelected: () => void;
  isDeleteSelectedDisabled: boolean;
};

export const TracksSelection: FC<Props> = ({
  className,
  isSelectModeEnabled,
  toggleSelectMode,
  selectedCount,
  onSelectAll,
  onDeselectAll,
  onDeleteSelected,
  isDeleteSelectedDisabled,
}) => {
  return (
    <div className={cn('flex flex-wrap gap-3', className)}>
      <Toggle
        variant="outline"
        pressed={isSelectModeEnabled}
        onPressedChange={toggleSelectMode}
        aria-label="Toggle select mode"
        data-testid="select-mode-toggle"
      >
        Select mode
      </Toggle>

      <Collapsible open={isSelectModeEnabled}>
        <CollapsibleContent className="flex flex-wrap items-center gap-3">
          <div className="flex gap-2">
            <span>Selected: {selectedCount}</span>
          </div>

          <Button onClick={onSelectAll} data-testid="select-all">
            Select All
          </Button>

          <Button onClick={onDeselectAll}>Deselect All</Button>

          <Button
            variant="destructive"
            onClick={onDeleteSelected}
            disabled={isDeleteSelectedDisabled}
            data-testid="bulk-delete-button"
          >
            Delete Selected
          </Button>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
