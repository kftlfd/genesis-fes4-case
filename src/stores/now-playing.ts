import { create } from 'zustand';

import { env } from '@/core/env';

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
      const newAudio = new Audio(getTrackSrc(track.src));
      newAudio.crossOrigin = 'anonymous';
      return {
        cur: { id: track.id, src: getTrackSrc(track.src) },
        audio: newAudio,
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
