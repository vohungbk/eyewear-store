"use client";

import { useState } from "react";

interface DemoLocation {
  id: string;
  name: string;
  address: string;
  availability: string;
}

const LOCATIONS: DemoLocation[] = [
  {
    id: "jordan-creek",
    name: "Jordan Creek",
    address: "101 Jordan Creek Pkwy., West Des Moines, IA 50266",
    availability: "Availability today",
  },
];

export default function DemoLocationPicker() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  const q = query.trim().toLowerCase();
  const results = q
    ? LOCATIONS.filter((l) =>
        `${l.name} ${l.address}`.toLowerCase().includes(q),
      )
    : LOCATIONS;

  return (
    <div>
      <div className="relative">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#3a434c]"
        >
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M20 20l-4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        <input
          type="text"
          role="combobox"
          aria-expanded="false"
          aria-controls="demo-locations"
          aria-label="Search by city or zip code"
          placeholder="Search by city or zip code"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-14 w-full rounded-lg border border-[#a1a4a6] bg-white pl-14 pr-12 text-base text-[#121212] outline-none focus:border-[#1050d0] focus:ring-1 focus:ring-[#1050d0]"
        />
        {query && (
          <button
            type="button"
            aria-label="Clear input"
            onClick={() => setQuery("")}
            className="absolute right-4 top-1/2 flex h-4 w-4 -translate-y-1/2 items-center justify-center rounded-full bg-[#a1a4a6] text-[10px] leading-none text-white"
          >
            &times;
          </button>
        )}
      </div>

      <ul id="demo-locations" className="mt-6 space-y-3">
        {results.map((l) => {
          const active = selected === l.id;
          return (
            <li key={l.id}>
              <button
                type="button"
                aria-pressed={active}
                onClick={() => setSelected(l.id)}
                className={`flex w-full items-start justify-between gap-4 rounded-xl border bg-white p-5 text-left transition-colors ${
                  active
                    ? "border-[#1050d0] ring-1 ring-[#1050d0]"
                    : "border-[#e1e5e6] hover:border-[#72777c]"
                }`}
              >
                <span>
                  <span className="block text-base font-semibold">
                    {l.name}
                  </span>
                  <span className="mt-1 block text-sm text-[#3a434c]">
                    {l.address}
                  </span>
                </span>
                <span className="shrink-0 rounded bg-[#dbe7fb] px-2 py-1 text-xs font-semibold text-[#1050d0]">
                  {l.availability}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <p className="mt-6 text-base text-[#3a434c]">
        {results.length === 0
          ? "No Intelligent Eyewear demo locations match your search. Try another city or zip code."
          : "There aren’t any other Intelligent Eyewear demo locations within 50 miles. Search another area to find more."}
      </p>
    </div>
  );
}
