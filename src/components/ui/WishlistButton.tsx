"use client";

import { useState, useTransition } from "react";
import { toggleWishlist } from "@/lib/actions/wishlist";

interface WishlistButtonProps {
  productId: string;
  initialWishlisted?: boolean;
  className?: string;
  size?: "sm" | "md";
}

export default function WishlistButton({
  productId,
  initialWishlisted = false,
  className = "",
  size = "md",
}: WishlistButtonProps) {
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setError("");

    startTransition(async () => {
      const result = await toggleWishlist(productId);
      if (result.error) {
        setError(result.error);
        return;
      }
      setWishlisted(result.wishlisted);
    });
  }

  const iconSize = size === "sm" ? "w-4 h-4" : "w-5 h-5";
  const btnSize = size === "sm" ? "w-7 h-7" : "w-9 h-9";

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        disabled={isPending}
        aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        className={`${btnSize} flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-sm border border-neutral-200 transition-all hover:scale-110 hover:shadow disabled:opacity-50 ${className}`}
      >
        <svg
          className={`${iconSize} transition-colors`}
          fill={wishlisted ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            className={wishlisted ? "text-red-500" : "text-neutral-600"}
          />
        </svg>
      </button>
      {error && (
        <div className="absolute top-full right-0 mt-1 w-max text-[10px] bg-black text-white px-2 py-1 rounded shadow z-20">
          {error}
        </div>
      )}
    </div>
  );
}
