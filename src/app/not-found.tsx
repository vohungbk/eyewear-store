import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Page Not Found" };

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <p className="text-xs font-semibold tracking-widest text-neutral-400 uppercase mb-4">
        404
      </p>
      <h1 className="text-3xl font-bold mb-3">Page not found</h1>
      <p className="text-neutral-500 text-sm mb-8 max-w-sm">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/"
          className="px-6 py-2.5 bg-black text-white text-sm font-semibold rounded-lg hover:bg-neutral-800 transition-colors"
        >
          Go Home
        </Link>
        <Link
          href="/products"
          className="px-6 py-2.5 border border-neutral-200 text-sm font-semibold rounded-lg hover:border-black transition-colors"
        >
          Shop Eyewear
        </Link>
      </div>
    </div>
  );
}
