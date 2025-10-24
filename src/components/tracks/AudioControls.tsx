'use client';

import { AudioMotionAnalyzer } from 'audiomotion-analyzer';
import { PauseIcon, PlayIcon, XIcon } from 'lucide-react';
import { FC, useEffect, useRef, useState } from 'react';

import { Input } from '@/components/ui/input';
import { formatTime } from '@/lib/utils';
import { useNowPlaying } from '@/stores/now-playing';

export const AudioControls: FC = () => {
  const { audio, cur, clearTrack, isPlaying, play, pause } = useNowPlaying();

  const [duration, setDuration] = useState(0);
  const [progr, setProgr] = useState(0);

  const handleSeek = (val: number) => {
    if (!audio) return;
    audio.currentTime = val;
    setProgr(val);
  };

  useEffect(() => {
    if (!audio) return;

    const onProgrChange = () => {
      setProgr(audio.currentTime);
      setDuration(audio.duration);
    };

    audio.addEventListener('timeupdate', onProgrChange);

    return () => {
      audio.removeEventListener('timeupdate', onProgrChange);
    };
  }, [audio]);

  const visualiserRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = visualiserRef.current;
    if (!audio || !container) return;

    const analyzer = new AudioMotionAnalyzer(container, {
      source: audio,
      height: 50,
    });

    return () => {
      analyzer.destroy();
    };
  }, [audio]);

  if (!cur) {
    return null;
  }

  return (
    <div className="sticky bottom-0 border-t bg-white shadow-sm">
      <div className="flex items-center gap-4 px-8 py-4">
        <button
          className="cursor-pointer"
          onClick={() => {
            if (isPlaying) {
              pause();
            } else {
              play();
            }
          }}
        >
          {isPlaying ? <PauseIcon height={50} width={50} /> : <PlayIcon height={50} width={50} />}
        </button>
        <Input
          className="px-0"
          type="range"
          min={0}
          max={duration}
          value={progr}
          onChange={(e) => handleSeek(Number(e.target.value))}
        />
        <div className="w-24 whitespace-nowrap">
          {formatTime(progr)} / {formatTime(duration)}
        </div>
        <button onClick={clearTrack} className="cursor-pointer">
          <XIcon height={30} width={30} />
        </button>
      </div>
      <div ref={visualiserRef} />
    </div>
  );
};
