"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { useCheckoutStore, type ShippingInfo } from "@/store/checkoutStore";

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","DC","FL","GA","HI","ID","IL","IN",
  "IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH",
  "NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT",
  "VT","VA","WA","WV","WI","WY",
];

type Errors = Partial<Record<keyof ShippingInfo, string>>;

const boxClass = (error?: string) =>
  `field-box rounded-xl border bg-white px-4 ${
    error ? "border-red-500" : "border-neutral-200"
  }`;

function Field({
  label,
  name,
  value,
  onChange,
  error,
  type = "text",
  autoComplete,
  inputMode,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
  error?: string;
  type?: string;
  autoComplete?: string;
  inputMode?: "text" | "tel" | "email" | "numeric";
}) {
  return (
    <div className="min-w-0">
      <div className={boxClass(error)}>
        {value && (
          <label htmlFor={name} className="block pt-2 text-[11px] text-neutral-600">
            {label}
          </label>
        )}
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          placeholder={label}
          autoComplete={autoComplete}
          inputMode={inputMode}
          aria-label={label}
          aria-invalid={!!error}
          onChange={(e) => onChange(name, e.target.value)}
          className={`field-input w-full bg-transparent text-sm outline-none placeholder:text-neutral-600 ${
            value ? "pb-2 pt-0.5" : "py-4"
          }`}
        />
      </div>
      {error && <p className="mt-1 px-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export default function ShippingAddressForm({
  defaultEmail,
  defaultName,
}: {
  defaultEmail: string;
  defaultName: string;
}) {
  const router = useRouter();
  const itemCount = useCartStore((s) => s.items.length);
  const saved = useCheckoutStore((s) => s.shipping);
  const setShipping = useCheckoutStore((s) => s.setShipping);

  const [form, setForm] = useState<ShippingInfo>(
    () =>
      saved ?? {
        full_name: defaultName,
        email: defaultEmail,
        line1: "",
        line2: "",
        postal_code: "",
        city: "",
        state: "",
        phone: "",
        sms_opt_in: false,
        country: "US",
      }
  );
  const [errors, setErrors] = useState<Errors>({});

  function update(name: string, value: string) {
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((e) => ({ ...e, [name]: undefined }));
  }

  function validate(): Errors {
    const e: Errors = {};
    if (!form.full_name.trim()) e.full_name = "Enter your first and last name";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Enter a valid email address";
    if (!form.line1.trim()) e.line1 = "Enter your street address";
    if (!/^\d{5}(-\d{4})?$/.test(form.postal_code.trim()))
      e.postal_code = "Enter a valid zip code";
    if (!form.city.trim()) e.city = "Enter your city";
    if (!form.state) e.state = "Select a state";
    if (form.phone.replace(/\D/g, "").length < 10)
      e.phone = "Enter a valid phone number";
    return e;
  }

  const isComplete = Object.keys(validate()).length === 0;

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    setShipping({ ...form, country: "US" });
    router.push("/checkout/payment");
  }

  if (itemCount === 0 && !saved) {
    // Nothing to check out: send the user back to the cart.
    return (
      <div className="mx-auto max-w-[520px] px-4 py-16 text-center">
        <p className="mb-4 text-sm text-neutral-600">Your cart is empty.</p>
        <Link href="/cart" className="text-sm font-medium underline">
          Back to cart
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[540px] px-4 pb-16 pt-6 sm:px-6">
      <Link
        href="/cart"
        aria-label="Back to cart"
        className="mb-8 inline-flex p-1 transition-opacity hover:opacity-60"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M19 12H5M11 6l-6 6 6 6" />
        </svg>
      </Link>

      <h1 className="mb-6 font-serif text-3xl leading-tight">
        What is your shipping information?
      </h1>

      <form onSubmit={handleSubmit} noValidate className="space-y-3">
        <Field label="First and last name" name="full_name" value={form.full_name} onChange={update} error={errors.full_name} autoComplete="name" />
        <Field label="Email address" name="email" type="email" value={form.email} onChange={update} error={errors.email} autoComplete="email" inputMode="email" />
        <Field label="Street address" name="line1" value={form.line1} onChange={update} error={errors.line1} autoComplete="address-line1" />
        <Field label="Apt, suite, company (optional)" name="line2" value={form.line2} onChange={update} autoComplete="address-line2" />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Field label="Zip code" name="postal_code" value={form.postal_code} onChange={update} error={errors.postal_code} autoComplete="postal-code" inputMode="numeric" />
          <Field label="City" name="city" value={form.city} onChange={update} error={errors.city} autoComplete="address-level2" />
          <div className="min-w-0">
            <div className={`relative ${boxClass(errors.state)}`}>
              {form.state && (
                <label htmlFor="state" className="block pt-2 text-[11px] text-neutral-600">
                  State
                </label>
              )}
              <select
                id="state"
                name="state"
                value={form.state}
                onChange={(e) => update("state", e.target.value)}
                autoComplete="address-level1"
                aria-label="State"
                aria-invalid={!!errors.state}
                className={`field-input w-full appearance-none bg-transparent pr-6 text-sm outline-none ${
                  form.state ? "pb-2 pt-0.5" : "py-4"
                }`}
              >
                <option value="">State</option>
                {US_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2"
                aria-hidden="true"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
            {errors.state && (
              <p className="mt-1 px-1 text-xs text-red-600">{errors.state}</p>
            )}
          </div>
        </div>

        <Field label="Phone number" name="phone" type="tel" value={form.phone} onChange={update} error={errors.phone} autoComplete="tel" inputMode="tel" />

        <label className="flex items-start gap-3 pt-2 text-sm text-neutral-700">
          <input
            type="checkbox"
            checked={form.sms_opt_in}
            onChange={(e) =>
              setForm((f) => ({ ...f, sms_opt_in: e.target.checked }))
            }
            className="mt-0.5 h-5 w-5 shrink-0 rounded border-neutral-400 accent-[#1050d0]"
          />
          Send me texts about my order status, future eye exams, and essential
          Rx or medical notices.
        </label>

        <button
          type="submit"
          disabled={!isComplete}
          className="mt-2 flex h-12 w-full items-center justify-center rounded-full bg-[#1050d0] text-base font-medium text-white transition-colors enabled:hover:bg-[#0d44b0] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next: Payment
        </button>
      </form>
    </div>
  );
}
