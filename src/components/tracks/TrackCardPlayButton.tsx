import { PauseIcon, PlayIcon } from 'lucide-react';
import { FC } from 'react';

import { useNowPlaying } from './AudioControls';

export const TrackCardPlayButton: FC<{
  id: string;
  src: string;
}> = ({ id, src }) => {
  const { cur, setTrack, isPlaying, play, pause } = useNowPlaying();

  const isSelected = cur?.id === id;

  const handleClick = () => {
    if (!isSelected) {
      setTrack({ id, src });
      play();
      return;
    }
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  return (
    <button
      className="absolute inset-0 grid cursor-pointer place-content-center bg-gray-200 opacity-50 hover:opacity-75"
      onClick={handleClick}
    >
      {isSelected && isPlaying ? (
        <PauseIcon height={40} width={40} />
      ) : (
        <PlayIcon height={40} width={40} />
      )}
    </button>
  );
};
