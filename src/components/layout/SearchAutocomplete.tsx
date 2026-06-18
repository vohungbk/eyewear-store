"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatPrice } from "@/lib/utils/format";

interface Suggestion {
  id: string;
  name: string;
  slug: string;
  price: number;
  compare_at_price: number | null;
  imageUrl: string | null;
  imageAlt: string;
}

function SearchIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export default function SearchAutocomplete() {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close on outside click
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        closeSearch();
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  // Focus input when search opens
  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  // Clear debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  function openSearch() {
    setIsOpen(true);
  }

  function closeSearch() {
    setIsOpen(false);
    setQuery("");
    setSuggestions([]);
    setActiveIndex(-1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setQuery(value);
    setActiveIndex(-1);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.trim().length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/search/suggest?q=${encodeURIComponent(value.trim())}`
        );
        const data = await res.json();
        setSuggestions(data.suggestions ?? []);
      } catch {
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    switch (e.key) {
      case "Escape":
        closeSearch();
        break;
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, -1));
        break;
      case "Enter":
        e.preventDefault();
        if (activeIndex >= 0 && suggestions[activeIndex]) {
          router.push(`/products/${suggestions[activeIndex].slug}`);
          closeSearch();
        } else if (query.trim()) {
          router.push(`/search?q=${encodeURIComponent(query.trim())}`);
          closeSearch();
        }
        break;
    }
  }

  const showDropdown = isOpen && query.trim().length >= 2;

  return (
    <div ref={containerRef} className="relative">
      {!isOpen ? (
        <button
          onClick={openSearch}
          aria-label="Open search"
          className="p-2 text-neutral-500 hover:text-black transition-colors"
        >
          <SearchIcon />
        </button>
      ) : (
        <div className="flex items-center gap-1.5">
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
              <SearchIcon size={14} />
            </span>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Search eyewear…"
              aria-label="Search"
              aria-autocomplete="list"
              aria-expanded={showDropdown}
              className="w-44 sm:w-60 border border-neutral-300 rounded-lg pl-8 pr-3 py-1.5 text-sm focus:outline-none focus:border-black"
            />
          </div>
          <button
            onClick={closeSearch}
            aria-label="Close search"
            className="p-1.5 text-neutral-400 hover:text-black transition-colors shrink-0"
          >
            <XIcon />
          </button>
        </div>
      )}

      {/* Dropdown */}
      {showDropdown && (
        <div
          role="listbox"
          className="absolute right-0 top-full mt-1.5 w-80 bg-white border border-neutral-200 rounded-xl shadow-lg z-50 overflow-hidden"
        >
          {isLoading && suggestions.length === 0 ? (
            <div className="px-4 py-3 text-sm text-neutral-400">
              Searching…
            </div>
          ) : suggestions.length === 0 ? (
            <div className="px-4 py-3 text-sm text-neutral-400">
              No results for &ldquo;{query}&rdquo;
            </div>
          ) : (
            <ul>
              {suggestions.map((s, i) => (
                <li key={s.id} role="option" aria-selected={i === activeIndex}>
                  <Link
                    href={`/products/${s.slug}`}
                    onClick={closeSearch}
                    className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                      i === activeIndex
                        ? "bg-neutral-50"
                        : "hover:bg-neutral-50"
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="w-10 h-10 rounded-lg bg-neutral-100 shrink-0 overflow-hidden">
                      {s.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={s.imageUrl}
                          alt={s.imageAlt}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-300">
                          <SearchIcon size={14} />
                        </div>
                      )}
                    </div>

                    {/* Name + price */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{s.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-sm text-neutral-700">
                          {formatPrice(s.price)}
                        </span>
                        {s.compare_at_price &&
                          s.compare_at_price > s.price && (
                            <span className="text-xs text-neutral-400 line-through">
                              {formatPrice(s.compare_at_price)}
                            </span>
                          )}
                      </div>
                    </div>

                    {/* Arrow */}
                    <span className="text-neutral-300 shrink-0">›</span>
                  </Link>
                </li>
              ))}

              {/* View all link */}
              <li className="border-t border-neutral-100">
                <Link
                  href={`/search?q=${encodeURIComponent(query.trim())}`}
                  onClick={closeSearch}
                  className="flex items-center justify-between px-4 py-2.5 text-sm text-neutral-500 hover:text-black hover:bg-neutral-50 transition-colors"
                >
                  <span>
                    All results for{" "}
                    <span className="font-medium text-black">
                      &ldquo;{query}&rdquo;
                    </span>
                  </span>
                  <span>→</span>
                </Link>
              </li>
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
