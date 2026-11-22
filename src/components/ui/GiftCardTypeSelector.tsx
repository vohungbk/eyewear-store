"use client";

import { useState } from "react";
import { useScrollIntoViewOnMount } from "@/components/ui/useScrollIntoViewOnMount";
import GiftCardDeliveryStep from "@/components/ui/GiftCardDeliveryStep";
import GiftCardRecipientStep from "@/components/ui/GiftCardRecipientStep";

type GiftCardType = "physical" | "electronic";

interface AmountOption {
  /** `null` means the buyer picks their own amount. */
  value: number | null;
  title: string;
  body: string;
}

const PHYSICAL_AMOUNTS: AmountOption[] = [
  { value: 50, title: "$50", body: "Just over halfway to a new pair!" },
  {
    value: 95,
    title: "$95",
    body: "For non-prescription sunglasses or single-vision eyeglasses",
  },
  {
    value: 145,
    title: "$145",
    body: "Single-vision eyeglasses plus blue-light-filtering lenses",
  },
  {
    value: 295,
    title: "$295",
    body: "For your nearest and dearest progressives wearers",
  },
  {
    value: 395,
    title: "$395",
    body: "Intelligent Eyewear with non-prescription lenses (eyeglasses or sunglasses)",
  },
  {
    value: 495,
    title: "$495",
    body: "Intelligent Eyewear with a single-vision eyeglasses prescription",
  },
];

const ELECTRONIC_AMOUNTS: AmountOption[] = [
  { value: 50, title: "$50", body: "Just over halfway to a new pair!" },
  {
    value: 95,
    title: "$95",
    body: "For non-prescription sunglasses or single-vision eyeglasses",
  },
  {
    value: 145,
    title: "$145",
    body: "Single-vision eyeglasses plus blue-light-filtering lenses",
  },
  {
    value: 325,
    title: "$325",
    body: "For your nearest and dearest progressives wearers",
  },
  {
    value: 395,
    title: "$395",
    body: "Intelligent Eyewear with non-prescription lenses (eyeglasses or sunglasses)",
  },
  {
    value: 495,
    title: "$495",
    body: "Intelligent Eyewear with a single-vision eyeglasses prescription",
  },
  {
    value: null,
    title: "Custom amount",
    body: "Give a gift in the dollar amount of your choice",
  },
];

const OPTIONS: { id: GiftCardType; title: string; body: string }[] = [
  {
    id: "physical",
    title: "Gift card",
    body: "Arrives inside a ready-to-gift envelope in 7 business days. Fun!",
  },
  {
    id: "electronic",
    title: "E-gift card",
    body: "Delivered via email on the date of your choosing. Easy!",
  },
];

function AmountStep({
  type,
  children,
}: {
  type: GiftCardType;
  children: React.ReactNode;
}) {
  const ref = useScrollIntoViewOnMount<HTMLDivElement>();
  return (
    <div ref={ref} className="mx-auto mt-16 max-w-[1100px] scroll-mt-24">
      <div className="text-center">
        <p className="text-xs font-medium uppercase text-[#121212]">
          Step 2 of {type === "electronic" ? 4 : 3}
        </p>
        <h2 className="mt-6 font-serif text-[28px] font-semibold leading-tight lg:text-[40px]">
          How much on the gift card?
        </h2>
      </div>
      {children}
    </div>
  );
}

export default function GiftCardTypeSelector() {
  const [type, setType] = useState<GiftCardType | null>(null);
  const [amount, setAmount] = useState<AmountOption | null>(null);
  const [deliveryDate, setDeliveryDate] = useState<Date | null>(null);
  const [customAmount, setCustomAmount] = useState("");

  const customValue = parseFloat(customAmount);
  const resolvedAmount =
    amount === null
      ? null
      : (amount.value ??
        (Number.isInteger(customValue) &&
        customValue >= 5 &&
        customValue <= 1000
          ? customValue
          : null));

  return (
    <section
      id="select-gift-card"
      className="scroll-mt-24 bg-[#faf8f5] px-6 py-16 md:py-24"
    >
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <p className="text-xs font-medium uppercase text-[#121212]">
            What’ll it be?
          </p>
          <h2 className="mt-6 font-serif text-[28px] font-semibold leading-tight lg:text-[40px]">
            Select what kind of gift card you’d like
          </h2>
          <p className="mx-auto mt-6 max-w-[500px] text-base text-[#121212] lg:text-lg">
            The perfect something for the perfect someone delivered right to
            their door or inbox.
          </p>
        </div>

        <div
          role="radiogroup"
          aria-label="Gift card type"
          className="mx-auto mt-10 grid max-w-[624px] gap-6 md:grid-cols-2"
        >
          {OPTIONS.map((o) => {
            const selected = type === o.id;
            return (
              <button
                key={o.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => {
                  setType(o.id);
                  setAmount(null);
                  setDeliveryDate(null);
                  setCustomAmount("");
                }}
                className={`cursor-pointer rounded-xl border bg-white px-6 py-8 text-center shadow-sm transition-colors ${
                  selected
                    ? "border-[#0f1b6b]"
                    : "border-transparent hover:border-[#0f1b6b]/40"
                }`}
              >
                <h3 className="text-lg font-semibold text-[#121212]">
                  {o.title}
                </h3>
                <p className="mt-4 text-sm text-[#3a434c] lg:text-base">
                  {o.body}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {type && (
        <AmountStep key={type} type={type}>
          <div
            role="radiogroup"
            aria-label="Gift card amount"
            className="mt-10 flex flex-wrap justify-center gap-4 lg:gap-6"
          >
            {(type === "electronic"
              ? ELECTRONIC_AMOUNTS
              : PHYSICAL_AMOUNTS
            ).map((a) => {
              const selected = amount?.title === a.title;
              return (
                <button
                  key={a.title}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setAmount(a)}
                  className={`min-h-[168px] w-[calc(50%-8px)] cursor-pointer rounded-xl border bg-white px-6 py-8 text-center shadow-sm transition-colors lg:w-[302px] ${
                    selected
                      ? "border-[#0f1b6b]"
                      : "border-transparent hover:border-[#0f1b6b]/40"
                  }`}
                >
                  <h3 className="text-lg font-semibold text-[#121212]">
                    {a.title}
                  </h3>
                  <p className="mt-4 text-sm text-[#3a434c] lg:text-base">
                    {a.body}
                  </p>
                </button>
              );
            })}
          </div>

          {amount?.value === null && (
            <div className="mx-auto mt-8 max-w-[302px]">
              <label
                htmlFor="custom-amount"
                className="mb-2 block text-center text-sm text-[#3a434c]"
              >
                Enter an amount between $5 and $1,000
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base text-[#3a434c]">
                  $
                </span>
                <input
                  id="custom-amount"
                  type="number"
                  min={5}
                  max={1000}
                  step={1}
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full rounded-xl border border-[#e4e0da] bg-white py-4 pl-8 pr-4 text-base text-[#121212] focus:border-[#0f1b6b] focus:outline-none"
                />
              </div>
            </div>
          )}

          {type === "physical" && resolvedAmount !== null && (
            <GiftCardRecipientStep
              mode="physical"
              amount={resolvedAmount}
              autoScroll={amount?.value !== null}
            />
          )}

          {type === "electronic" && resolvedAmount !== null && (
            <GiftCardDeliveryStep
              value={deliveryDate}
              onChange={setDeliveryDate}
              autoScroll={amount?.value !== null}
            />
          )}
          {type === "electronic" && resolvedAmount !== null && deliveryDate && (
            <GiftCardRecipientStep
              key={resolvedAmount}
              mode="electronic"
              deliveryDate={deliveryDate}
              amount={resolvedAmount}
            />
          )}
        </AmountStep>
      )}
    </section>
  );
}
