'use client';

import { AudioMotionAnalyzer } from 'audiomotion-analyzer';
import { FC, useEffect, useRef } from 'react';
import { create } from 'zustand';

import { env } from '@/core/env';
import { cn } from '@/lib/utils';

type NowPalyingTrack = {
  id: string;
  src: string;
};

type NowPlayingStore = {
  cur: NowPalyingTrack | null;
  setTrack: (track: NowPalyingTrack) => void;
  clearTrack: () => void;
};

const getTrackSrc = (filename: string) => `${env.API_URL}/api/files/${filename}`;

export const useNowPalying = create<NowPlayingStore>((set) => ({
  cur: null,
  setTrack: (track) => set({ cur: { id: track.id, src: getTrackSrc(track.src) } }),
  clearTrack: () => set({ cur: null }),
}));

export const AudioControls: FC = () => {
  const { cur, clearTrack } = useNowPalying();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const visualizerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!cur?.id) return;

    const audioEl = audioRef.current;
    const visualizerEl = visualizerRef.current;

    if (!audioEl || !visualizerEl) return;

    audioEl.play();

    const analyzer = new AudioMotionAnalyzer(visualizerEl, {
      source: audioEl,
    });

    return () => {
      analyzer.destroy();
    };
  }, [cur?.id]);

  return (
    <div
      className={cn(
        cur ? 'sticky bottom-0 h-60 border-t-2 border-t-gray-600 bg-white p-4' : 'hidden',
      )}
    >
      {cur ? (
        <div className="flex items-start">
          <div className="grow">
            <audio
              key={cur.id}
              ref={audioRef}
              src={cur.src}
              controls
              crossOrigin="anonymous"
              className="w-full"
            />
            <div ref={visualizerRef} />
          </div>
          <div className="shrink-0">
            <button onClick={clearTrack}>X</button>
          </div>
        </div>
      ) : (
        <div>Audio controls</div>
      )}
    </div>
  );
};
