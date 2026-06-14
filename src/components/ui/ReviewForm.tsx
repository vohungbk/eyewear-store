"use client";

import { useState } from "react";
import { submitReview } from "@/lib/actions/reviews";
import StarRating from "./StarRating";

interface ReviewFormProps {
  productId: string;
}

export default function ReviewForm({ productId }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rating) {
      setMessage("Please select a star rating.");
      setStatus("error");
      return;
    }

    setStatus("pending");
    setMessage("");

    const result = await submitReview(productId, { rating, title, body });
    setMessage(result.message);
    setStatus(result.success ? "success" : "error");

    if (result.success) {
      setRating(0);
      setTitle("");
      setBody("");
    }
  }

  if (status === "success") {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-5 text-center">
        <p className="text-sm font-medium text-green-700">{message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="text-sm font-medium mb-2">Your rating <span className="text-red-500">*</span></p>
        <StarRating rating={rating} size="lg" interactive onRate={setRating} />
      </div>

      <div>
        <label htmlFor="review-title" className="block text-sm font-medium mb-1">
          Title (optional)
        </label>
        <input
          id="review-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
          placeholder="Summarize your experience"
          className="w-full border border-neutral-200 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-black"
        />
      </div>

      <div>
        <label htmlFor="review-body" className="block text-sm font-medium mb-1">
          Review (optional)
        </label>
        <textarea
          id="review-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          maxLength={1000}
          placeholder="Tell others what you thought about this product…"
          className="w-full border border-neutral-200 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-black resize-none"
        />
      </div>

      {status === "error" && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-md">
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "pending"}
        className="px-6 py-2.5 bg-black text-white text-sm font-semibold rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-60"
      >
        {status === "pending" ? "Submitting…" : "Submit Review"}
      </button>
    </form>
  );
}
