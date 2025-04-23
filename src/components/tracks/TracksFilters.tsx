'use client';

import { GetTracksListParams } from '@/services/tracks';
import { ArrowUp } from 'lucide-react';
import { ComponentProps, FC, ReactNode } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { useGetGenresListQuery } from '@/services/genres';
import { cn } from '@/lib/utils';
import { DataAttrsProps } from '@/lib/types';

const SelectFilter: FC<{
  label: string;
  value: string;
  placeholder?: string;
  options: [string, ReactNode][];
  onChange: (value: string) => void;
  triggerProps?: ComponentProps<typeof SelectTrigger>;
}> = ({ label, value, placeholder, options, onChange, triggerProps }) => (
  <div className="flex min-w-35 grow basis-0 items-center gap-1 rounded-sm border p-1">
    <span>{label}</span>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={cn('grow', triggerProps?.className)} {...triggerProps}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={FILTER_NONE}>{placeholder}</SelectItem>
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
  <div className="flex min-w-45 grow basis-0 items-center gap-1 rounded-sm border p-1">
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
  filters: GetTracksListParams;
  setFilters: (filters: GetTracksListParams) => void;
  className?: string;
}> = ({ filters, setFilters, className }) => {
  const genresQuery = useGetGenresListQuery();

  const updateFilter = <K extends keyof GetTracksListParams>(
    key: K,
    val: GetTracksListParams[K],
  ) => {
    setFilters({ ...filters, [key]: val });
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
          ] satisfies [GetTracksListParams['sort'], string][]
        }
        onChange={(v) =>
          updateFilter('sort', v === FILTER_NONE ? undefined : (v as GetTracksListParams['sort']))
        }
        triggerProps={{
          'data-testid': 'sort-select',
        }}
      />

      <SelectFilter
        label="Genre"
        value={filters.genre ?? ''}
        placeholder="Any"
        options={(genresQuery.data ?? []).map((v) => [v, v])}
        onChange={(v) => updateFilter('genre', v === FILTER_NONE ? undefined : v)}
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
          ] satisfies [GetTracksListParams['order'], ReactNode][]
        }
        onChange={(v) =>
          updateFilter('order', v === FILTER_NONE ? undefined : (v as GetTracksListParams['order']))
        }
      />

      <SelectFilter
        label="On page"
        value={filters.limit?.toString() ?? ''}
        options={[4, 10, 20].map((v) => [v.toString(), v.toString()])}
        onChange={(v) => updateFilter('limit', Number(v))}
      />

      <InputFilter
        label="Artist"
        value={filters.artist ?? ''}
        onChange={(v) => updateFilter('artist', v === '' ? undefined : v)}
        inputProps={{
          'data-testid': 'filter-artist',
        }}
      />

      <InputFilter
        label="Search"
        value={filters.search ?? ''}
        onChange={(v) => updateFilter('search', v === '' ? undefined : v)}
        inputProps={{
          'data-testid': 'search-input',
        }}
      />
    </div>
  );
};
