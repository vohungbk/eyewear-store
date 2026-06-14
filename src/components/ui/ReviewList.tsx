import StarRating from "./StarRating";
import type { ProductReviewSummary } from "@/lib/data/reviews";

interface ReviewListProps {
  summary: ProductReviewSummary;
}

export default function ReviewList({ summary }: ReviewListProps) {
  const { reviews, averageRating, totalCount } = summary;

  if (totalCount === 0) {
    return (
      <p className="text-sm text-neutral-500">
        No reviews yet. Be the first to share your experience!
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex items-center gap-4">
        <div className="text-center">
          <p className="text-4xl font-bold">{averageRating.toFixed(1)}</p>
          <StarRating rating={averageRating} size="sm" />
          <p className="text-xs text-neutral-500 mt-1">{totalCount} review{totalCount !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Individual reviews */}
      <ul className="space-y-5 divide-y divide-neutral-100">
        {reviews.map((review) => (
          <li key={review.id} className="pt-5 first:pt-0">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <StarRating rating={review.rating} size="sm" />
                {review.title && (
                  <p className="text-sm font-semibold mt-1">{review.title}</p>
                )}
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-neutral-500">
                  {review.profiles?.full_name ?? "Anonymous"}
                </p>
                <p className="text-xs text-neutral-400">
                  {new Date(review.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
            {review.body && (
              <p className="text-sm text-neutral-600 leading-relaxed">{review.body}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
