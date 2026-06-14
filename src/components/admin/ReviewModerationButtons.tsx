"use client";

import { useState } from "react";
import { approveReview, deleteReview } from "@/lib/actions/reviews";

interface ReviewModerationButtonsProps {
  id: string;
  isApproved: boolean;
}

export default function ReviewModerationButtons({ id, isApproved }: ReviewModerationButtonsProps) {
  const [isPending, setIsPending] = useState(false);

  async function handleApprove() {
    setIsPending(true);
    const result = await approveReview(id);
    if (result.error) { alert(result.error); setIsPending(false); }
  }

  async function handleDelete() {
    if (!confirm("Delete this review permanently?")) return;
    setIsPending(true);
    const result = await deleteReview(id);
    if (result.error) { alert(result.error); setIsPending(false); }
  }

  return (
    <div className="flex items-center gap-2 shrink-0">
      {!isApproved && (
        <button
          onClick={handleApprove}
          disabled={isPending}
          className="text-sm text-green-600 hover:text-green-800 font-medium transition-colors disabled:opacity-50"
        >
          Approve
        </button>
      )}
      <button
        onClick={handleDelete}
        disabled={isPending}
        className="text-sm text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
      >
        Delete
      </button>
    </div>
  );
}
