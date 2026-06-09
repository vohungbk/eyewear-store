"use client";

import { useEffect } from "react";
import { purchase } from "@/lib/facebook/pixel";

interface Props {
  value: number;
  orderId: string;
  eventId: string;
  numItems: number;
  contentIds: string[];
}

export default function PurchaseTracker({ value, orderId, eventId, numItems, contentIds }: Props) {
  useEffect(() => {
    purchase({ value, orderId, eventId, numItems, contentIds });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
