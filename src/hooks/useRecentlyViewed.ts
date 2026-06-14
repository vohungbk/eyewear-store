"use client";

import { useEffect, useState, useCallback } from "react";

const STORAGE_KEY = "eyewear-recently-viewed";
const MAX_ITEMS = 8;

export interface RecentlyViewedItem {
  id: string;
  slug: string;
  name: string;
  price: number;
  imageUrl: string | null;
}

export function useRecentlyViewed() {
  const [items, setItems] = useState<RecentlyViewedItem[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setItems(JSON.parse(stored));
    } catch {}
  }, []);

  const addItem = useCallback((item: RecentlyViewedItem) => {
    setItems((prev) => {
      const filtered = prev.filter((i) => i.id !== item.id);
      const updated = [item, ...filtered].slice(0, MAX_ITEMS);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  return { items, addItem };
}
