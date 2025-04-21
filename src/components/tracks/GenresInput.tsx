'use client';

import { FC, useMemo } from 'react';
import { Badge } from '../ui/badge';
import { PlusIcon, XIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { useGetGenresListQuery } from '@/services/genres';
import { Select, SelectContent, SelectItem, SelectTrigger } from '../ui/select';
import { LoadingSpinner } from '../ui/loading';
import { cn } from '@/lib/utils';

export const GenresInput: FC<{
  value: string[];
  onChange: (val: string[]) => void;
}> = ({ value, onChange }) => {
  const genresQuery = useGetGenresListQuery();

  const selectOptions = useMemo(() => {
    const options = genresQuery.data ?? [];
    const availableOptions = options.reduce((acc: string[], val) => {
      if (!value.includes(val)) {
        acc.push(val);
      }
      return acc;
    }, []);
    return availableOptions;
  }, [value, genresQuery.data]);

  const handleAddGenre = (genre: string) => {
    if (value.includes(genre)) return;
    onChange([...value, genre]);
  };

  const handleRemoveGenre = (genre: string) => {
    onChange(value.filter((v) => v !== genre));
  };

  return (
    <div className="flex flex-col gap-2">
      {value.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {value.map((genre) => (
            <Badge
              key={genre}
              onClick={() => handleRemoveGenre(genre)}
              variant={'outline'}
              className="cursor-pointer select-none hover:bg-neutral-100"
            >
              {genre} <XIcon size={10} />
            </Badge>
          ))}
        </div>
      )}

      {genresQuery.isLoading ? (
        <LoadingSpinner size={16} width={2} />
      ) : (
        <Select value="" onValueChange={handleAddGenre}>
          <SelectTrigger asChild>
            <Button variant="outline" className={cn(selectOptions.length < 1 && 'hidden')}>
              <PlusIcon />
            </Button>
          </SelectTrigger>

          <SelectContent>
            {selectOptions.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
};
