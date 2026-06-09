"use client";

import { useEffect } from "react";
import { search } from "@/lib/facebook/pixel";

export default function SearchTracker({ query }: { query: string }) {
  useEffect(() => {
    if (query) search(query);
  }, [query]);

  return null;
}
