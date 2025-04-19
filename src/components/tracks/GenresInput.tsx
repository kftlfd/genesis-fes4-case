import { FC, KeyboardEvent, useState } from 'react';
import { Badge } from '../ui/badge';
import { PlusIcon, XIcon } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

export const GenresInput: FC<{
  value: string[];
  onChange: (val: string[]) => void;
}> = ({ value, onChange }) => {
  const [showInput, setShowInput] = useState(false);
  const [newGenre, setNewGenre] = useState('');

  const handleRemoveGenre = (genre: string) => {
    onChange(value.filter((v) => v !== genre));
  };

  const handleAddNewGenre = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') {
      return;
    }

    if (!newGenre || !!value.find((v) => v === newGenre)) {
      return;
    }

    onChange([...value, newGenre]);
    setNewGenre('');
    setShowInput(false);
  };

  return (
    <div>
      <div className="flex gap-2">
        {value.map((genre) => (
          <Badge key={genre} onClick={() => handleRemoveGenre(genre)}>
            {genre} <XIcon size={10} />
          </Badge>
        ))}
      </div>

      {showInput ? (
        <Input
          type="text"
          value={newGenre}
          onChange={(e) => setNewGenre(e.target.value)}
          onKeyDown={handleAddNewGenre}
          onBlur={() => setShowInput(false)}
          placeholder="add new genre"
          autoFocus
        />
      ) : (
        <Button variant="outline" onClick={() => setShowInput(true)}>
          <PlusIcon />
        </Button>
      )}
    </div>
  );
};
