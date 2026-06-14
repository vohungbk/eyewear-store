"use client";

import { useEffect } from "react";
import { useRecentlyViewed, type RecentlyViewedItem } from "@/hooks/useRecentlyViewed";

export default function ProductViewTracker({ item }: { item: RecentlyViewedItem }) {
  const { addItem } = useRecentlyViewed();

  useEffect(() => {
    addItem(item);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id]);

  return null;
}
