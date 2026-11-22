/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ACCESSORIES,
  ACCESSORY_TABS,
  accessoryImage,
  swatchImage,
  type Accessory,
  type AccessoryCategory,
} from "@/lib/data/accessoriesSample";

function AccessoryCard({ item }: { item: Accessory }) {
  const [active, setActive] = useState(0);
  return (
    <div>
      <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg bg-[#f6f0e9]">
        <img
          src={accessoryImage(item.image)}
          alt={item.name}
          loading="lazy"
          className="h-full w-full object-contain mix-blend-multiply"
        />
      </div>
      <h2 className="mt-4 text-base font-semibold text-[#121212] lg:text-lg">{item.name}</h2>
      <p className="mt-1 text-sm text-[#121212] lg:text-base">${item.price.toFixed(2)}</p>
      {item.swatches.length > 0 && (
        <div role="radiogroup" aria-label={`Style options for ${item.name}`} className="mt-3 flex flex-wrap gap-2">
          {item.swatches.map((s, i) => (
            <button
              key={`${s.name}-${i}`}
              type="button"
              role="radio"
              aria-checked={i === active}
              aria-label={s.name}
              title={s.name}
              onClick={() => setActive(i)}
              className={`h-[22px] w-[22px] cursor-pointer overflow-hidden rounded-full border bg-white p-[2px] ${
                i === active ? "border-[#121212]" : "border-transparent"
              }`}
            >
              <img src={swatchImage(s.image)} alt="" width={18} height={18} className="h-full w-full rounded-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function GiftCardBanner() {
  return (
    <div className="col-span-full grid items-center gap-6 rounded-xl bg-[#faf8f5] p-6 md:grid-cols-2 md:p-10">
      <img
        src="https://img.warbyparker.com/Gift%20Cards/gift-card-holiday-2024-hero.jpg"
        alt="Gift card with its enclosing card and envelope"
        loading="lazy"
        className="h-full w-full rounded-lg object-cover"
      />
      <div>
        <h2 className="font-serif text-[28px] leading-tight md:text-[40px]">Gift Cards</h2>
        <p className="mt-4 text-base text-[#121212] lg:text-lg">
          Easy to give and so delightful to get: We’ll deliver a beautifully wrapped gift card to their door or send it
          straight to their inbox. Your pick!
        </p>
        <Link
          href="/gift-cards"
          className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-[#2a4bd0] px-6 text-base font-semibold text-white transition-colors hover:bg-[#2340b8]"
        >
          Get gifty
        </Link>
      </div>
    </div>
  );
}

export default function AccessoriesGrid() {
  const [tab, setTab] = useState<"all" | AccessoryCategory>("all");
  const items = tab === "all" ? ACCESSORIES : ACCESSORIES.filter((a) => a.category === tab);
  // In the "All" view the gift card banner sits between the care items and the clip-ons.
  const splitAt = tab === "all" ? ACCESSORIES.findIndex((a) => a.category === "clip-ons") : -1;

  return (
    <div className="mx-auto max-w-[1600px] px-6 pb-16 md:px-8 lg:px-12">
      <div role="tablist" aria-label="Accessory categories" className="mb-8 flex gap-2 overflow-x-auto pb-2">
        {ACCESSORY_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`h-10 shrink-0 cursor-pointer rounded-full border px-5 text-sm font-semibold transition-colors ${
              tab === t.id
                ? "border-[#2a4bd0] bg-[#2a4bd0] text-white hover:border-[#2340b8] hover:bg-[#2340b8]"
                : "border-[#d6d6d6] bg-white text-[#121212] hover:border-[#121212]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => (
          <div key={item.id} className="contents">
            {i === splitAt && <GiftCardBanner />}
            <AccessoryCard item={item} />
          </div>
        ))}
      </div>
    </div>
  );
}
