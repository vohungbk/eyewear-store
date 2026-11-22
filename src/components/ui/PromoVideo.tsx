"use client";

import { useEffect, useRef, useState } from "react";

const DESKTOP_QUERY = "(min-width: 640px)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

interface PromoVideoProps {
  src: string;
  mobileSrc: string;
  poster: string;
  mobilePoster: string;
  label: string;
}

/**
 * Looping, muted promo video with a pause button. Shows the poster first and
 * loads only the video that matches the viewport. Stays paused when the user
 * prefers reduced motion.
 */
export default function PromoVideo({
  src,
  mobileSrc,
  poster,
  mobilePoster,
  label,
}: PromoVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
  const [playing, setPlaying] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_QUERY);
    const update = () => {
      setReduced(window.matchMedia(REDUCED_MOTION_QUERY).matches);
      setIsDesktop(mq.matches);
    };
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  function toggle() {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) void v.play();
    else v.pause();
  }

  const currentPoster = isDesktop === false ? mobilePoster : poster;

  return (
    <div className="absolute inset-0">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={currentPoster}
        alt={label}
        className="absolute inset-0 h-full w-full object-cover"
      />
      {isDesktop !== null && (
        <video
          key={isDesktop ? "desktop" : "mobile"}
          ref={videoRef}
          src={isDesktop ? src : mobileSrc}
          poster={currentPoster}
          autoPlay={!reduced}
          loop
          muted
          playsInline
          preload="metadata"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          aria-label={label}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Pause video" : "Play video"}
        className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white ring-1 ring-white/70 hover:bg-black/80"
      >
        {playing ? (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
            <rect x="3" y="2" width="3.5" height="12" rx="1" />
            <rect x="9.5" y="2" width="3.5" height="12" rx="1" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
            <path d="M4 2.5v11l9-5.5z" />
          </svg>
        )}
      </button>
    </div>
  );
}
