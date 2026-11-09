"use client";

import { useEffect, useRef } from "react";

type LoopVideoProps = {
  src: string;
  poster: string;
  label: string;
};

export default function LoopVideo({ src, poster, label }: LoopVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      videoRef.current?.pause();
    }
  }, []);

  return (
    <video
      ref={videoRef}
      className="film-frame-media"
      src={src}
      poster={poster}
      aria-label={label}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
    />
  );
}
