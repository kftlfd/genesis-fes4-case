'use client';

import { FC, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';

export const useTracksSelection = () => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [isSelectModeEnabled, setIsSelectModeEnabled] = useState(false);

  const handleSelectChange = (trackId: string) => (selected: boolean) => {
    if (selected && !selectedIds.includes(trackId)) {
      setSelectedIds((prev) => [...prev, trackId]);
    }
    if (!selected) {
      setSelectedIds((prev) => prev.filter((p) => p !== trackId));
    }
  };

  const handleSelectMultiple = (ids: string[]) => {
    setSelectedIds(Array.from(new Set([...selectedIds, ...ids])));
  };

  const handleDeselctAll = () => {
    setSelectedIds([]);
  };

  return {
    selectedIds,
    isSelectModeEnabled,
    toggleSelectMode: setIsSelectModeEnabled,
    handleSelectMultiple,
    handleDeselctAll,
    handleSelectChange,
  };
};

type Props = {
  isSelectModeEnabled: boolean;
  selectedCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onDeleteSelected: () => void;
  isDeleteSelectedDisabled: boolean;
};

export const TracksSelection: FC<Props> = ({
  isSelectModeEnabled,
  selectedCount,
  onSelectAll,
  onDeselectAll,
  onDeleteSelected,
  isDeleteSelectedDisabled,
}) => {
  return (
    <Collapsible open={isSelectModeEnabled}>
      <CollapsibleContent className="flex flex-wrap items-center gap-3 pb-4">
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
  );
};
