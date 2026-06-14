import type { Metadata } from "next";
import Link from "next/link";
import { getAdminReviews } from "@/lib/data/admin";
import ReviewModerationButtons from "@/components/admin/ReviewModerationButtons";

export const metadata: Metadata = { title: "Admin — Reviews" };

const TABS = [
  { label: "Pending", value: false },
  { label: "Approved", value: true },
] as const;

interface ReviewsPageProps {
  searchParams: Promise<{ approved?: string }>;
}

export default async function ReviewsPage({ searchParams }: ReviewsPageProps) {
  const { approved: approvedParam } = await searchParams;
  const approved = approvedParam === "true" ? true : approvedParam === "false" ? false : undefined;
  const showApproved = approved === true;

  const { reviews, count } = await getAdminReviews(approved === undefined ? false : approved);

  function stars(rating: number) {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
  }

  return (
    <div className="p-8">
      <h1 className="text-xl font-bold mb-6">Reviews</h1>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-neutral-200">
        {TABS.map((tab) => (
          <Link
            key={String(tab.value)}
            href={`/admin/reviews?approved=${tab.value}`}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              showApproved === tab.value
                ? "border-black text-black"
                : "border-transparent text-neutral-500 hover:text-black"
            }`}
          >
            {tab.label}
          </Link>
        ))}
        <Link
          href="/admin/reviews"
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            approved === undefined
              ? "border-black text-black"
              : "border-transparent text-neutral-500 hover:text-black"
          }`}
        >
          All
        </Link>
      </div>

      <p className="text-sm text-neutral-500 mb-4">{count} review{count !== 1 ? "s" : ""}</p>

      {reviews.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-neutral-200 rounded-lg">
          <p className="text-sm text-neutral-500">No reviews found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white border border-neutral-200 rounded-lg p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-amber-400 text-sm tracking-widest">{stars(review.rating)}</span>
                    {!review.is_approved && (
                      <span className="text-[11px] font-medium bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded">
                        Pending
                      </span>
                    )}
                  </div>
                  {review.title && (
                    <p className="text-sm font-semibold">{review.title}</p>
                  )}
                  {review.body && (
                    <p className="text-sm text-neutral-600 mt-1 line-clamp-3">{review.body}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-neutral-400">
                    <span>{review.profiles?.full_name ?? "Anonymous"}</span>
                    <span>·</span>
                    <span>
                      {new Date(review.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    {review.products && (
                      <>
                        <span>·</span>
                        <Link
                          href={`/products/${review.products.slug}`}
                          target="_blank"
                          className="hover:text-black transition-colors hover:underline"
                        >
                          {review.products.name}
                        </Link>
                      </>
                    )}
                  </div>
                </div>
                <ReviewModerationButtons
                  id={review.id}
                  isApproved={review.is_approved}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
