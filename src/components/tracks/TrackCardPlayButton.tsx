import { PauseIcon, PlayIcon } from 'lucide-react';
import { FC } from 'react';

import { useNowPalying } from './AudioControls';

export const TrackCardPlayButton: FC<{
  id: string;
  src: string;
}> = ({ id, src }) => {
  const { cur, setTrack } = useNowPalying();

  const isSelected = cur?.id === id;

  return (
    <button
      className="absolute inset-0 grid cursor-pointer place-content-center bg-gray-200 opacity-50 hover:opacity-75"
      onClick={() => setTrack({ id, src })}
    >
      {isSelected ? <PauseIcon height={40} width={40} /> : <PlayIcon height={40} width={40} />}
    </button>
  );
};
