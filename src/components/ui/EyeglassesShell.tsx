"use client";

import { useState } from "react";

interface EyeglassesShellProps {
  sidebar: React.ReactNode;
  /** Breadcrumb + title, shown only when the sidebar is hidden. */
  compactHeader: React.ReactNode;
  /** Applied-filter chips, shown only when the sidebar is hidden. */
  tags: React.ReactNode;
  /** Mobile-only head and filter pills (below lg). */
  mobileTop: React.ReactNode;
  total: number;
  sort: React.ReactNode;
  children: React.ReactNode;
}

export default function EyeglassesShell({
  sidebar,
  compactHeader,
  tags,
  mobileTop,
  total,
  sort,
  children,
}: EyeglassesShellProps) {
  const [hidden, setHidden] = useState(false);

  return (
    <div
      data-hidden={hidden}
      className="group/shell flex w-full border-t border-[#e1e5e6] text-[#121212]"
    >
      {/* Sidebar: 366px, sticky, divider on the right */}
      {!hidden && (
        <aside
          className="sticky top-[var(--header-h)] hidden max-h-[calc(100vh-var(--header-h))] w-[366px] shrink-0 self-start overflow-y-auto border-r border-[#e1e5e6] pl-12 pr-5 pb-10 lg:block"
          aria-label="Filters"
        >
          {sidebar}
        </aside>
      )}

      <div className="min-w-0 flex-1 px-6 lg:px-12">
        {mobileTop}
        {hidden && <div className="hidden lg:block">{compactHeader}</div>}

        {/* Top bar */}
        <div className="flex items-center justify-between gap-2 py-3 lg:py-5">
          <div className="flex items-center gap-2 text-base">
            <button
              type="button"
              onClick={() => setHidden((v) => !v)}
              aria-expanded={!hidden}
              className="hidden items-center gap-2 font-medium tracking-[0.32px] hover:text-[#3a434c] lg:flex"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
              >
                <path
                  d={
                    hidden
                      ? "M4 12h13M13 7l5 5-5 5M20 5v14"
                      : "M20 12H7M11 7l-5 5 5 5M4 5v14"
                  }
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {hidden ? "Show filters" : "Hide filters"}
            </button>
            <span className="hidden lg:inline" aria-hidden>
              |
            </span>
            <span>{total} frames</span>
          </div>
          {sort}
        </div>

        {hidden && <div className="hidden lg:block">{tags}</div>}

        {children}
      </div>
    </div>
  );
}
