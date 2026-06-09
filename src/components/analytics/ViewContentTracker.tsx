"use client";

import { useEffect } from "react";
import { viewContent } from "@/lib/facebook/pixel";

interface Props {
  productId: string;
  name: string;
  price: number;
}

export default function ViewContentTracker({ productId, name, price }: Props) {
  useEffect(() => {
    viewContent({ id: productId, name, price });
  }, [productId, name, price]);

  return null;
}
