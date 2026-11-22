"use client";

import { useState } from "react";
import { useScrollIntoViewOnMount } from "@/components/ui/useScrollIntoViewOnMount";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const startOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());
const sameDay = (a: Date, b: Date) => a.getTime() === b.getTime();

interface Props {
  value: Date | null;
  onChange: (date: Date) => void;
  autoScroll?: boolean;
}

/** Step 3 of 4 for the e-gift card flow: pick the delivery date. */
export default function GiftCardDeliveryStep({
  value,
  onChange,
  autoScroll = true,
}: Props) {
  const ref = useScrollIntoViewOnMount<HTMLDivElement>(autoScroll);
  const [today] = useState(() => startOfDay(new Date()));
  const [month, setMonth] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  );

  const monthLabel = month.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const leading = month.getDay();
  const daysInMonth = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0,
  ).getDate();
  const cells: (Date | null)[] = [
    ...Array.from({ length: leading }, () => null),
    ...Array.from(
      { length: daysInMonth },
      (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1),
    ),
  ];

  const isCurrentMonth =
    month.getFullYear() === today.getFullYear() &&
    month.getMonth() === today.getMonth();
  const shiftMonth = (delta: number) =>
    setMonth((m) => new Date(m.getFullYear(), m.getMonth() + delta, 1));

  const arrow =
    "flex h-8 w-8 items-center justify-center rounded-full border border-[#8a8a8a] text-[#121212] transition-colors enabled:cursor-pointer enabled:hover:bg-[#f1f1f1] disabled:cursor-default disabled:border-[#e4e0da] disabled:text-[#c4c4c4]";

  return (
    <div ref={ref} className="mx-auto mt-24 max-w-[600px] scroll-mt-24">
      <div className="text-center">
        <p className="text-xs font-medium uppercase text-[#121212]">
          Step 3 of 4
        </p>
        <h2 className="mt-6 font-serif text-[28px] font-semibold leading-tight lg:text-[40px]">
          When should we deliver it?
        </h2>
        <p className="mx-auto mt-6 max-w-[460px] text-base text-[#121212] lg:text-lg">
          Timing is everything! You pick the date, we’ll email the gift.
        </p>
      </div>

      <div className="mx-auto mt-10 w-full max-w-[396px] rounded-xl border border-[#e4e0da] bg-white px-4 pb-6 pt-6">
        <div className="flex items-center justify-between px-4">
          <button
            type="button"
            aria-label="Previous month"
            disabled={isCurrentMonth}
            onClick={() => shiftMonth(-1)}
            className={arrow}
          >
            <span aria-hidden>←</span>
          </button>
          <p className="text-base font-semibold text-[#121212]">{monthLabel}</p>
          <button
            type="button"
            aria-label="Next month"
            onClick={() => shiftMonth(1)}
            className={arrow}
          >
            <span aria-hidden>→</span>
          </button>
        </div>

        <div className="mt-6 grid grid-cols-7 gap-y-2 text-center text-sm">
          {WEEKDAYS.map((d) => (
            <span key={d} className="py-2 text-[#6b7280]">
              {d}
            </span>
          ))}
          {cells.map((date, i) => {
            if (!date) return <span key={`empty-${i}`} />;
            const past = date < today;
            const selected = value !== null && sameDay(date, value);
            const isToday = sameDay(date, today);
            return (
              <button
                key={date.getDate()}
                type="button"
                disabled={past}
                aria-pressed={selected}
                aria-label={date.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
                onClick={() => onChange(date)}
                className={`mx-auto flex h-[34px] w-[34px] items-center justify-center rounded-full border text-sm transition-colors ${
                  past
                    ? "cursor-default border-transparent text-[#6b7280]"
                    : selected
                      ? "cursor-pointer border-[#2a4bd0] bg-[#2a4bd0] text-white"
                      : isToday
                        ? "cursor-pointer border-[#2a4bd0] text-[#121212]"
                        : "cursor-pointer border-transparent text-[#121212] hover:border-[#2a4bd0]/50"
                }`}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
