"use client";

import { useEffect, useRef } from "react";

/** Smoothly scrolls the referenced element into view once, when it first mounts. */
export function useScrollIntoViewOnMount<T extends HTMLElement>(
  enabled = true,
) {
  const ref = useRef<T>(null);
  useEffect(() => {
    if (enabled)
      ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    // Only on mount: later changes to `enabled` must not re-trigger the scroll.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return ref;
}
