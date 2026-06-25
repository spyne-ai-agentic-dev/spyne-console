"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

// Drop-in replacement for the console's WaveformPlayer: same ref API
// (seek/play/pause) and the same callbacks, backed by a plain <audio> element
// so the drawer's transcript click-to-seek + active-row sync work unchanged.
export interface WaveformPlayerRef {
  seek: (time: number) => void;
  play: () => void;
  pause: () => void;
}

interface SimpleAudioPlayerProps {
  url: string;
  onTimeUpdate?: (time: number) => void;
  onPlay?: () => void;
  onPause?: () => void;
}

const SimpleAudioPlayer = forwardRef<WaveformPlayerRef, SimpleAudioPlayerProps>(
  ({ url, onTimeUpdate, onPlay, onPause }, ref) => {
    const audioRef = useRef<HTMLAudioElement>(null);

    useImperativeHandle(ref, () => ({
      seek: (time: number) => {
        if (audioRef.current) audioRef.current.currentTime = time;
      },
      play: () => {
        audioRef.current?.play().catch((e) => console.error("Error playing audio:", e));
      },
      pause: () => {
        audioRef.current?.pause();
      },
    }));

    // Reset to the start when the source changes (new call selected).
    useEffect(() => {
      if (audioRef.current) audioRef.current.currentTime = 0;
    }, [url]);

    if (!url) {
      return <p className="py-2 text-sm text-gray-400">No recording available</p>;
    }

    return (
      <audio
        ref={audioRef}
        src={url}
        controls
        preload="none"
        className="w-full"
        onTimeUpdate={(e) => onTimeUpdate?.(e.currentTarget.currentTime)}
        onPlay={() => onPlay?.()}
        onPause={() => onPause?.()}
      />
    );
  },
);
SimpleAudioPlayer.displayName = "SimpleAudioPlayer";

export default SimpleAudioPlayer;
