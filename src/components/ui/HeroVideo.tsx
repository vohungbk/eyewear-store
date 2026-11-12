"use client";

import { useEffect, useState } from "react";

const BASE = "/reference-assets/home-hero";
const DESKTOP_QUERY = "(min-width: 768px)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Background video for the hero. Shows the poster first, then loads only the
 * video that matches the viewport. Skips the video when the user prefers
 * reduced motion.
 */
export default function HeroVideo() {
  const [src, setSrc] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (window.matchMedia(REDUCED_MOTION_QUERY).matches) return;
    const mq = window.matchMedia(DESKTOP_QUERY);
    const update = () => {
      setReady(false);
      setSrc(`${BASE}/${mq.matches ? "desktop" : "mobile"}`);
    };
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <div className="absolute inset-0" aria-hidden="true">
      <picture>
        <source
          media={DESKTOP_QUERY}
          srcSet={`${BASE}/hero-desktop-poster.jpg`}
        />
        <img
          src={`${BASE}/hero-mobile-poster.jpg`}
          alt=""
          className="h-full w-full object-cover"
        />
      </picture>
      {src && (
        <video
          key={src}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          onCanPlay={() => setReady(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
            ready ? "opacity-100" : "opacity-0"
          }`}
        >
          <source src={`${src}.webm`} type="video/webm" />
          <source src={`${src}.mp4`} type="video/mp4" />
        </video>
      )}
    </div>
  );
}
