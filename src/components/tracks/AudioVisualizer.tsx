import { AudioMotionAnalyzer } from 'audiomotion-analyzer';
import { FC, useEffect, useRef } from 'react';

import { env } from '@/core/env';

export const AudioVisualizer: FC<{
  audioFile: string;
  trackId: string;
  className?: string;
}> = ({ trackId, audioFile, className }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  // const initDone = useRef(false);
  // const audCtx = useRef<AudioContext | null>(null);
  // const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // if (initDone.current) return;
    // initDone.current = true;

    const audioEl = audioRef.current;
    const container = containerRef.current;

    if (!container || !audioEl) return;

    // let context = audCtx.current;
    // if (!context) {
    //   const audioCtx = new AudioContext();
    //   audioCtx.createMediaElementSource(audioEl);
    //   audCtx.current = audioCtx;
    //   context = audioCtx;
    // }

    // audCtx.current = audioCtx;

    const analyzer = new AudioMotionAnalyzer(container, {
      source: audioEl,
      // audioCtx: context,
    });

    return () => {
      analyzer.destroy();
      // node.disconnect();
    };
  }, [audioRef, trackId]);

  // const handlePlay = () => {
  //   if (isPlaying) {
  //     audioRef.current?.pause();
  //     setIsPlaying(false);
  //   } else {
  //     audioRef.current?.play();
  //     setIsPlaying(true);
  //   }
  // };

  return (
    <div>
      <div className="pt-2">
        <audio ref={audioRef} className="w-full" controls crossOrigin="anonymous">
          <source src={`${env.API_URL}/api/files/${audioFile}`} />
        </audio>
      </div>
      {/* <button onClick={handlePlay}>{isPlaying ? 'Pause' : 'Play'}</button> */}
      <div className={className} ref={containerRef} />
    </div>
  );
};
