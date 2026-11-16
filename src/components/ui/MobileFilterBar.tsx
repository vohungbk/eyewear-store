"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface MobileFilterBarProps {
  /** Pill labels shown after the "Filters" pill. */
  labels: string[];
  total: number;
  /** Applied filters; when present they replace the pills. */
  chips: { key: string; label: string; href: string }[];
  /** Filter groups (accordions) rendered inside the sheet. */
  children: React.ReactNode;
}

function Caret() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function MobileFilterBar({
  labels,
  total,
  chips,
  children,
}: MobileFilterBarProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const pill =
    "flex h-10 shrink-0 items-center gap-2 rounded-full border border-[#e1e5e6] bg-white px-4 text-sm font-medium tracking-[0.28px]";

  return (
    <>
      <div className="-mx-6 border-b border-[#e1e5e6] py-4">
        <div className="flex gap-2 overflow-x-auto px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button type="button" onClick={() => setOpen(true)} className={pill}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
            >
              <path
                d="M5 4v6M5 14v6M12 4v2M12 10v10M19 4v10M19 18v2M3 12h4M10 8h4M17 16h4"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
            Filters
            {chips.length > 0 && (
              <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#eef3fd] px-1 text-xs font-medium text-[#1050d0]">
                {chips.length}
              </span>
            )}
          </button>
          {chips.length > 0 &&
            chips.map((c) => (
              <Link
                key={c.key}
                href={c.href}
                className="flex h-10 shrink-0 items-center gap-2 rounded-full bg-[#f4f4f2] px-4 text-sm font-medium tracking-[0.28px] text-[#1050d0]"
              >
                <span aria-hidden>&times;</span>
                {c.label}
                <span className="sr-only"> (remove filter)</span>
              </Link>
            ))}
          {chips.length > 0 && (
            <Link href="/eyeglasses" className={pill}>
              Reset
            </Link>
          )}
          {chips.length === 0 &&
            labels.map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => setOpen(true)}
                className={pill}
              >
                {label}
                <Caret />
              </button>
            ))}
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-[60]">
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/50"
          />
          {/* Bottom sheet */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Filters"
            className="absolute inset-x-0 bottom-0 top-7 flex flex-col rounded-t-2xl bg-white"
          >
            <div className="relative flex items-center justify-center px-6 py-5">
              <h2 className="text-base font-semibold tracking-[0.32px]">
                Filters
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close filters"
                className="absolute right-5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M6 6l12 12M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6">{children}</div>
            <div className="flex gap-3 border-t border-[#e1e5e6] p-4">
              <Link
                href="/eyeglasses"
                className="flex h-12 items-center justify-center rounded-full border border-[#e1e5e6] bg-white px-6 text-base font-medium tracking-[0.32px]"
              >
                Reset
              </Link>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="h-12 flex-1 rounded-full bg-[#2b4fd0] text-base font-medium tracking-[0.32px] text-white"
              >
                View {total} frames
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
