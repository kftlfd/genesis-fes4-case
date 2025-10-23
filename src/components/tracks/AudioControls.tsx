'use client';

import { AudioMotionAnalyzer } from 'audiomotion-analyzer';
import { XIcon } from 'lucide-react';
import { createContext, FC, ReactNode, useContext, useEffect, useRef } from 'react';
import { useStore, createStore, StoreApi } from 'zustand';

import { env } from '@/core/env';

type NowPalyingTrack = {
  id: string;
  src: string;
};

type NowPlayingStore = {
  cur: NowPalyingTrack | null;
  isPlaying: boolean;
  setTrack: (track: NowPalyingTrack) => void;
  clearTrack: () => void;
  play: () => void;
  pause: () => void;
};

const getTrackSrc = (filename: string) => `${env.API_URL}/api/files/${filename}`;

const AudioControlsCtx = createContext<StoreApi<NowPlayingStore> | null>(null);

export const useNowPlaying = () => {
  const ctx = useContext(AudioControlsCtx);
  if (!ctx) {
    throw new Error('AudioControls context not found');
  }
  return useStore(ctx);
};

export const AudioControls: FC<{
  children?: ReactNode;
}> = ({ children }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const visualizerRef = useRef<HTMLDivElement | null>(null);

  const store = useRef(
    createStore<NowPlayingStore>((set) => ({
      cur: null,
      isPlaying: false,
      setTrack: (track) =>
        set({
          cur: { id: track.id, src: getTrackSrc(track.src) },
        }),
      clearTrack: () => set({ cur: null }),
      play: () => set({ isPlaying: true }),
      pause: () => set({ isPlaying: false }),
    })),
  );

  const { cur, clearTrack, isPlaying } = useStore(store.current);

  useEffect(() => {
    const audioEl = audioRef.current;
    const visualizerEl = visualizerRef.current;
    if (!cur || !audioEl || !visualizerEl) return;

    const analyzer = new AudioMotionAnalyzer(visualizerEl, {
      source: audioEl,
    });

    return () => {
      analyzer.destroy();
    };
  }, [cur]);

  useEffect(() => {
    const audioEl = audioRef.current;
    if (!cur || !audioEl) return;

    if (isPlaying) {
      audioEl.play();
    } else {
      audioEl.pause();
    }
  }, [cur, isPlaying]);

  return (
    <AudioControlsCtx value={store.current}>
      {children}
      {cur && (
        <div className="sticky bottom-0 flex h-60 items-start gap-4 border-t-2 border-t-gray-600 bg-white p-4">
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
            <button
              onClick={clearTrack}
              className="cursor-pointer rounded-md border-2 border-gray-600"
            >
              <XIcon />
            </button>
          </div>
        </div>
      )}
    </AudioControlsCtx>
  );
};
