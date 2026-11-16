"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useTransition } from "react";

const OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

export default function EyeglassesSort({ value }: { value: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const current = OPTIONS.find((o) => o.value === value) ?? OPTIONS[0];

  function choose(next: string) {
    setOpen(false);
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", next);
    params.delete("page");
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  }

  return (
    <div className={`relative ${isPending ? "opacity-60" : ""}`}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded text-base font-medium tracking-[0.32px]"
      >
        {current.label}
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <ul
          role="menu"
          className="absolute right-0 z-20 mt-2 w-52 rounded-lg border border-[#e1e5e6] bg-white py-2 shadow-lg"
        >
          {OPTIONS.map((o) => (
            <li key={o.value} role="none">
              <button
                role="menuitemradio"
                aria-checked={o.value === value}
                onClick={() => choose(o.value)}
                className={`block w-full px-4 py-2 text-left text-sm hover:bg-[#faf8f5] ${
                  o.value === value ? "font-semibold" : ""
                }`}
              >
                {o.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
