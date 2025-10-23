'use client';

import { PauseIcon, PlayIcon, XIcon } from 'lucide-react';
import { FC, useEffect, useState } from 'react';
import { create } from 'zustand';

import { Input } from '@/components/ui/input';
import { env } from '@/core/env';
import { formatTime } from '@/lib/utils';

type NowPalyingTrack = {
  id: string;
  src: string;
};

type NowPlayingStore = {
  audio: HTMLAudioElement | null;
  cur: NowPalyingTrack | null;
  isPlaying: boolean;
  setTrack: (track: NowPalyingTrack) => void;
  clearTrack: () => void;
  play: () => void;
  pause: () => void;
};

const getTrackSrc = (filename: string) => `${env.API_URL}/api/files/${filename}`;

export const useNowPlaying = create<NowPlayingStore>((set) => ({
  audio: null,
  cur: null,
  isPlaying: false,
  setTrack: (track) =>
    set(({ audio }) => {
      audio?.pause();
      return {
        cur: { id: track.id, src: getTrackSrc(track.src) },
        audio: new Audio(getTrackSrc(track.src)),
      };
    }),
  clearTrack: () =>
    set(({ audio }) => {
      audio?.pause();
      return { cur: null, audio: null };
    }),
  play: () =>
    set(({ audio }) => {
      audio?.play();
      return { isPlaying: true };
    }),
  pause: () =>
    set(({ audio }) => {
      audio?.pause();
      return { isPlaying: false };
    }),
}));

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

  if (!cur) {
    return null;
  }

  return (
    <div className="sticky bottom-0 flex grow items-center gap-4 border-t-2 border-t-gray-600 bg-white p-8">
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
      <div className="whitespace-nowrap">
        {formatTime(progr)} / {formatTime(duration)}
      </div>
      <button onClick={clearTrack} className="cursor-pointer">
        <XIcon height={30} width={30} />
      </button>
    </div>
  );
};
