'use client';

import { ArrowUp } from 'lucide-react';
import { ComponentProps, FC, ReactNode, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DataAttrsProps } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useGetGenresListQuery } from '@/services/genres';
import { DEFAULT_FILTERS, TracksListFilters } from '@/services/tracks';

const SelectFilter: FC<{
  value: string;
  options: [string, ReactNode][];
  onChange: (value: string) => void;
  placeholder?: string;
  triggerProps?: ComponentProps<typeof SelectTrigger>;
}> = ({ value, options, onChange, placeholder, triggerProps }) => (
  <Select value={value} onValueChange={onChange}>
    <SelectTrigger className={cn('grow', triggerProps?.className)} {...triggerProps}>
      <SelectValue placeholder={placeholder} />
    </SelectTrigger>
    <SelectContent>
      {!!placeholder && <SelectItem value={FILTER_NONE}>{placeholder}</SelectItem>}
      {options.map(([val, label]) => (
        <SelectItem key={val} value={val}>
          {label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);

const SelectFilterField: FC<{
  label: string;
  value: string;
  placeholder?: string;
  options: [string, ReactNode][];
  onChange: (value: string) => void;
  triggerProps?: ComponentProps<typeof SelectTrigger>;
}> = ({ label, value, placeholder, options, onChange, triggerProps }) => (
  <div className="flex grow basis-50 items-center gap-1 rounded-sm border p-1">
    <span>{label}</span>
    <SelectFilter
      value={value}
      options={options}
      onChange={onChange}
      placeholder={placeholder}
      triggerProps={triggerProps}
    />
  </div>
);

const InputFilterField: FC<{
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  inputProps?: ComponentProps<'input'> & DataAttrsProps;
}> = ({ label, value, onChange, inputProps }) => (
  <div className="flex grow basis-60 items-center gap-1 rounded-sm border p-1">
    <span>{label}</span>
    <Input
      className={cn('grow', inputProps?.className)}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      {...inputProps}
    />
  </div>
);

const FILTER_NONE = '__none__';

export const TracksFilters: FC<{
  filters: TracksListFilters;
  setFilters: (filters: TracksListFilters) => void;
  className?: string;
}> = ({ filters, setFilters, className }) => {
  const { data: genres = [] } = useGetGenresListQuery();

  const updateFilter = <K extends keyof TracksListFilters>(
    key: K,
    val: TracksListFilters[K] | typeof FILTER_NONE,
  ) => {
    setFilters({
      ...filters,
      [key]: val === FILTER_NONE ? undefined : val,
    });
  };

  return (
    <div className={cn('flex flex-wrap gap-3', className)}>
      <SelectFilterField
        label="Sort by"
        value={filters.sort ?? ''}
        placeholder="None"
        options={
          [
            ['artist', 'Artist'],
            ['album', 'Album'],
            ['title', 'Title'],
            ['createdAt', 'Date created'],
          ] satisfies [TracksListFilters['sort'], string][]
        }
        onChange={(v) => updateFilter('sort', v as TracksListFilters['sort'])}
        triggerProps={{
          'data-testid': 'sort-select',
        }}
      />

      <SelectFilterField
        label="Genre"
        value={filters.genre ?? ''}
        placeholder="Any"
        options={genres.map((v) => [v, v])}
        onChange={(v) => updateFilter('genre', v)}
        triggerProps={{
          'data-testid': 'filter-genre',
        }}
      />

      <SelectFilterField
        label="Order"
        value={filters.order ?? ''}
        placeholder="Any"
        options={
          [
            ['asc', <ArrowUp key="asc" />],
            ['desc', <ArrowUp key="desc" className="rotate-180" />],
          ] satisfies [TracksListFilters['order'], ReactNode][]
        }
        onChange={(v) => updateFilter('order', v as TracksListFilters['order'])}
      />

      <SelectFilterField
        label="On page"
        value={filters.limit?.toString() ?? ''}
        options={['4', '10', '20'].map((v) => [v, v])}
        onChange={(v) => updateFilter('limit', Number(v))}
      />

      <InputFilterField
        label="Artist"
        value={filters.artist ?? ''}
        onChange={(v) => updateFilter('artist', v)}
        inputProps={{
          'data-testid': 'filter-artist',
        }}
      />

      <InputFilterField
        label="Search"
        value={filters.search ?? ''}
        onChange={(v) => updateFilter('search', v)}
        inputProps={{
          'data-testid': 'search-input',
        }}
      />
    </div>
  );
};

const compare = <O extends Record<string, unknown>>(a: O, b: O) => {
  return (
    Object.entries(a).every(([key, val]) => b[key] === val) &&
    Object.entries(b).every(([key, val]) => a[key] === val)
  );
};

type FiltersModalProps = {
  isOpen: boolean;
  filters: TracksListFilters;
  onSave: (data: TracksListFilters) => void;
  onOpenChange: (isOpen: boolean) => void;
};

export const FiltersModal: FC<FiltersModalProps> = ({ isOpen, onOpenChange, onSave, filters }) => {
  const [initFilters] = useState(filters);
  const [curFilters, setCurFilters] = useState(initFilters);

  const { data: genres = [] } = useGetGenresListQuery();

  const isSameAsInit = compare(curFilters, DEFAULT_FILTERS);
  const isNotChanged = compare(curFilters, filters);

  const updateFilter = <K extends keyof TracksListFilters>(
    key: K,
    val: TracksListFilters[K] | typeof FILTER_NONE,
  ) => {
    setCurFilters((f) => ({
      ...f,
      [key]: val === FILTER_NONE ? null : val,
    }));
  };

  const handleOpenChange = (open: boolean) => {
    setCurFilters(filters);
    onOpenChange(open);
  };

  const handleReset = () => {
    setCurFilters(DEFAULT_FILTERS);
  };

  const handleSave = () => {
    onSave(curFilters);
    handleOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent data-testid="track-form">
        <DialogHeader>
          <DialogTitle>Filter tracks</DialogTitle>
          <DialogDescription className="sr-only">filters</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-[max-content_1fr] gap-x-6 gap-y-4">
          <Label htmlFor="sort-by">Sort by</Label>
          <SelectFilter
            value={curFilters.sort ?? ''}
            placeholder="None"
            options={
              [
                ['artist', 'Artist'],
                ['album', 'Album'],
                ['title', 'Title'],
                ['createdAt', 'Date created'],
              ] satisfies [TracksListFilters['sort'], string][]
            }
            onChange={(v) => updateFilter('sort', v as TracksListFilters['sort'])}
            triggerProps={{
              'id': 'sort-by',
              'className': 'w-full',
              'data-testid': 'sort-select',
            }}
          />

          <Label htmlFor="genre">Genre</Label>
          <SelectFilter
            value={curFilters.genre ?? ''}
            placeholder="Any"
            options={genres.map((v) => [v, v])}
            onChange={(v) => updateFilter('genre', v)}
            triggerProps={{
              'id': 'genre',
              'className': 'w-full',
              'data-testid': 'filter-genre',
            }}
          />

          <Label htmlFor="order">Order</Label>
          <SelectFilter
            value={curFilters.order ?? ''}
            placeholder="Any"
            options={
              [
                ['asc', <ArrowUp key="asc" />],
                ['desc', <ArrowUp key="desc" className="rotate-180" />],
              ] satisfies [TracksListFilters['order'], ReactNode][]
            }
            onChange={(v) => updateFilter('order', v as TracksListFilters['order'])}
            triggerProps={{ id: 'order', className: 'w-full' }}
          />

          <Label htmlFor="on-page">On page</Label>
          <SelectFilter
            value={curFilters.limit?.toString() ?? ''}
            options={['4', '10', '20'].map((v) => [v, v])}
            onChange={(v) => updateFilter('limit', Number(v))}
            triggerProps={{ id: 'on-page', className: 'w-full' }}
          />

          <Label htmlFor="artist">Artist</Label>
          <Input
            id="artist"
            value={curFilters.artist ?? ''}
            onChange={(e) => updateFilter('artist', e.target.value)}
            data-testid="filter-artist"
          />
        </div>

        <DialogFooter>
          <div className="flex w-full justify-between">
            <Button onClick={handleReset} disabled={isSameAsInit}>
              Reset
            </Button>

            <Button onClick={handleSave} disabled={isNotChanged} data-testid="submit-button">
              Apply
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
