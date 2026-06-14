"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createDiscount, updateDiscount } from "@/lib/actions/discounts";
import type { AdminDiscount } from "@/lib/data/admin";

interface DiscountFormProps {
  discount?: AdminDiscount;
}

export default function DiscountForm({ discount }: DiscountFormProps) {
  const router = useRouter();
  const isEdit = !!discount;

  const [form, setForm] = useState({
    code: discount?.code ?? "",
    type: (discount?.type ?? "percent") as "percent" | "fixed",
    value: discount?.value?.toString() ?? "",
    min_order: discount?.min_order?.toString() ?? "0",
    usage_limit: discount?.usage_limit?.toString() ?? "",
    is_active: discount?.is_active ?? true,
    expires_at: discount?.expires_at ? discount.expires_at.slice(0, 10) : "",
  });
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsPending(true);
    setError("");

    const data = {
      code: form.code.toUpperCase(),
      type: form.type,
      value: parseFloat(form.value),
      min_order: parseFloat(form.min_order) || 0,
      usage_limit: form.usage_limit ? parseInt(form.usage_limit) : null,
      is_active: form.is_active,
      expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
    };

    const result = isEdit
      ? await updateDiscount(discount!.id, data)
      : await createDiscount(data);

    if (result && !result.success) {
      setError(result.message ?? "Something went wrong.");
      setIsPending(false);
      return;
    }

    if (isEdit) router.push("/admin/discounts");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
      <div>
        <label htmlFor="code" className="block text-sm font-medium mb-1">
          Code <span className="text-red-500">*</span>
        </label>
        <input
          id="code"
          name="code"
          value={form.code}
          onChange={handleChange}
          required
          placeholder="e.g. SUMMER20"
          className="w-full border border-neutral-200 rounded-md px-3 py-2.5 text-sm uppercase tracking-wider focus:outline-none focus:border-black"
        />
        <p className="text-xs text-neutral-400 mt-1">Uppercase letters, numbers, hyphens, underscores only.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="type" className="block text-sm font-medium mb-1">Type</label>
          <select
            id="type"
            name="type"
            value={form.type}
            onChange={handleChange}
            className="w-full border border-neutral-200 rounded-md px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-black"
          >
            <option value="percent">Percentage (%)</option>
            <option value="fixed">Fixed amount ($)</option>
          </select>
        </div>
        <div>
          <label htmlFor="value" className="block text-sm font-medium mb-1">
            Value <span className="text-red-500">*</span>
          </label>
          <input
            id="value"
            name="value"
            type="number"
            step="0.01"
            min="0.01"
            max={form.type === "percent" ? "100" : undefined}
            value={form.value}
            onChange={handleChange}
            required
            placeholder={form.type === "percent" ? "20" : "15.00"}
            className="w-full border border-neutral-200 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-black"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="min_order" className="block text-sm font-medium mb-1">Min order ($)</label>
          <input
            id="min_order"
            name="min_order"
            type="number"
            step="0.01"
            min="0"
            value={form.min_order}
            onChange={handleChange}
            placeholder="0"
            className="w-full border border-neutral-200 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-black"
          />
        </div>
        <div>
          <label htmlFor="usage_limit" className="block text-sm font-medium mb-1">Usage limit</label>
          <input
            id="usage_limit"
            name="usage_limit"
            type="number"
            min="1"
            value={form.usage_limit}
            onChange={handleChange}
            placeholder="Unlimited"
            className="w-full border border-neutral-200 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-black"
          />
        </div>
      </div>

      <div>
        <label htmlFor="expires_at" className="block text-sm font-medium mb-1">Expiry date (optional)</label>
        <input
          id="expires_at"
          name="expires_at"
          type="date"
          value={form.expires_at}
          onChange={handleChange}
          className="w-full border border-neutral-200 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-black"
        />
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          name="is_active"
          type="checkbox"
          checked={form.is_active}
          onChange={handleChange}
          className="w-4 h-4 rounded"
        />
        <span className="text-sm">Active</span>
      </label>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-md">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-2.5 bg-black text-white text-sm font-semibold rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-60"
        >
          {isPending ? "Saving…" : isEdit ? "Save Changes" : "Create Code"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/discounts")}
          className="px-4 py-2.5 text-sm text-neutral-500 hover:text-black transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
