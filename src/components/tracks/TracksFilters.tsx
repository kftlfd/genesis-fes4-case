'use client';

import { ArrowUp } from 'lucide-react';
import { ComponentProps, FC, ReactNode } from 'react';

import { Input } from '@/components/ui/input';
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
import { TracksListFilters } from '@/services/tracks';

const SelectFilter: FC<{
  label: string;
  value: string;
  placeholder?: string;
  options: [string, ReactNode][];
  onChange: (value: string) => void;
  triggerProps?: ComponentProps<typeof SelectTrigger>;
}> = ({ label, value, placeholder, options, onChange, triggerProps }) => (
  <div className="flex grow basis-50 items-center gap-1 rounded-sm border p-1">
    <span>{label}</span>
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
  </div>
);

const InputFilter: FC<{
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
      <SelectFilter
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

      <SelectFilter
        label="Genre"
        value={filters.genre ?? ''}
        placeholder="Any"
        options={genres.map((v) => [v, v])}
        onChange={(v) => updateFilter('genre', v)}
        triggerProps={{
          'data-testid': 'filter-genre',
        }}
      />

      <SelectFilter
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

      <SelectFilter
        label="On page"
        value={filters.limit?.toString() ?? ''}
        options={['4', '10', '20'].map((v) => [v, v])}
        onChange={(v) => updateFilter('limit', Number(v))}
      />

      <InputFilter
        label="Artist"
        value={filters.artist ?? ''}
        onChange={(v) => updateFilter('artist', v)}
        inputProps={{
          'data-testid': 'filter-artist',
        }}
      />

      <InputFilter
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
