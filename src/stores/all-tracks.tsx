'use client';

import {
  createContext,
  FC,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { createStore, useStore } from 'zustand';

import { Track } from '@/services/tracks';

type AllTracksStore = {
  data: Map<string, Track>;
};

const createTracksStore = (tracks: Track[]) =>
  createStore<AllTracksStore>(() => ({
    data: new Map(tracks.map((t) => [t.id, t] as const)),
  }));

type TracksStoreCtx = ReturnType<typeof createTracksStore>;

const AllTacksContext = createContext<TracksStoreCtx | null>(null);

export function useAllTracks<T>(selector: (store: AllTracksStore) => T): T {
  const ctx = useContext(AllTacksContext);
  if (!ctx) throw new Error('no tracks context');
  return useStore(ctx, selector);
}

type AllTracksActions = {
  addTracks: (tracks: Track[]) => void;
  editTrack: (id: string, update: Partial<Omit<Track, 'id'>>) => void;
  removeTrack: (id: string) => void;
};

const AllTracksActionsContext = createContext<AllTracksActions | null>(null);

export function useAllTracksActions() {
  const ctx = useContext(AllTracksActionsContext);
  if (!ctx) throw new Error('no tracks actions context');
  return ctx;
}

export const AllTracksStoreProvider: FC<{
  tracks: Track[] | null;
  children?: ReactNode;
}> = ({ tracks, children }) => {
  const store = useRef(createTracksStore(tracks ?? [])).current;

  const addTracks = useCallback(
    (tracks: Track[]) => {
      store.setState(({ data }) => {
        const curEntries = Array.from(data.entries());
        const newEntries = tracks.map((t) => [t.id, t] as const);
        const newData = new Map([...curEntries, ...newEntries]);
        return { data: newData };
      });
    },
    [store],
  );

  const editTrack = useCallback(
    (id: string, update: Partial<Omit<Track, 'id'>>) => {
      store.setState(({ data }) => {
        const track = data.get(id);
        if (!track) return {};

        const newData = new Map(data);
        newData.set(id, { ...track, ...update });
        return { data: newData };
      });
    },
    [store],
  );

  const removeTrack = useCallback(
    (id: string) => {
      store.setState(({ data }) => {
        const newData = new Map(data);
        newData.delete(id);
        return { data: newData };
      });
    },
    [store],
  );

  useEffect(() => {
    if (tracks) {
      addTracks(tracks);
    }
  }, [tracks, addTracks]);

  const actions = useMemo<AllTracksActions>(
    () => ({ addTracks, editTrack, removeTrack }),
    [addTracks, editTrack, removeTrack],
  );

  return (
    <AllTacksContext.Provider value={store}>
      <AllTracksActionsContext value={actions}>{children}</AllTracksActionsContext>
    </AllTacksContext.Provider>
  );
};
