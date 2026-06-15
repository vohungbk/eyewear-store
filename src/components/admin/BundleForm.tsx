"use client";

import { useState, useTransition } from "react";
import { createBundle, updateBundle } from "@/lib/actions/admin";
import { formatPrice } from "@/lib/utils/format";
import type { AdminBundleDetail } from "@/lib/data/admin";

interface SimpleProduct {
  id: string;
  name: string;
  price: number;
  imageUrl: string | null;
}

interface SelectedItem {
  productId: string;
  name: string;
  price: number;
  imageUrl: string | null;
  quantity: number;
}

interface Props {
  products: SimpleProduct[];
  bundle?: AdminBundleDetail;
}

export default function BundleForm({ products, bundle }: Props) {
  const isEdit = !!bundle;
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [selected, setSelected] = useState<SelectedItem[]>(
    bundle?.bundle_items
      .sort((a, b) => a.position - b.position)
      .map((item) => ({
        productId: item.product_id,
        name: item.products?.name ?? "",
        price: item.products?.price ?? 0,
        imageUrl: item.products?.product_images.find((i) => i.is_primary)?.url ?? item.products?.product_images[0]?.url ?? null,
        quantity: item.quantity,
      })) ?? []
  );

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) &&
      !selected.find((s) => s.productId === p.id)
  );

  function addProduct(p: SimpleProduct) {
    setSelected((prev) => [...prev, { productId: p.id, name: p.name, price: p.price, imageUrl: p.imageUrl, quantity: 1 }]);
  }

  function removeProduct(productId: string) {
    setSelected((prev) => prev.filter((s) => s.productId !== productId));
  }

  function setQty(productId: string, qty: number) {
    setSelected((prev) =>
      prev.map((s) => (s.productId === productId ? { ...s, quantity: Math.max(1, qty) } : s))
    );
  }

  function handleSubmit(formData: FormData) {
    formData.set("items", JSON.stringify(selected.map((s) => ({ productId: s.productId, quantity: s.quantity }))));
    startTransition(async () => {
      const result = isEdit
        ? await updateBundle(bundle!.id, formData)
        : await createBundle(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <form action={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="p-3 rounded-md bg-red-50 text-red-700 text-sm">{error}</div>
      )}

      {/* Basic info */}
      <div className="bg-white border border-neutral-200 rounded-lg p-5 space-y-4">
        <h2 className="text-sm font-semibold">Bundle Info</h2>

        <div>
          <label className="block text-sm font-medium mb-1">Name *</label>
          <input
            name="name"
            required
            defaultValue={bundle?.name}
            className="w-full border border-neutral-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            name="description"
            rows={2}
            defaultValue={bundle?.description ?? ""}
            className="w-full border border-neutral-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-black resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Discount type</label>
            <select
              name="discount_type"
              defaultValue={bundle?.discount_type ?? "percent"}
              className="w-full border border-neutral-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-black"
            >
              <option value="percent">Percent (%)</option>
              <option value="fixed">Fixed ($)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Discount value</label>
            <input
              name="discount_value"
              type="number"
              min="0"
              step="0.01"
              defaultValue={bundle?.discount_value ?? 0}
              className="w-full border border-neutral-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-black"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="hidden"
            name="is_active"
            value="false"
          />
          <input
            id="is_active"
            name="is_active"
            type="checkbox"
            value="true"
            defaultChecked={bundle?.is_active ?? true}
            className="w-4 h-4 rounded"
          />
          <label htmlFor="is_active" className="text-sm font-medium">Active</label>
        </div>
      </div>

      {/* Product selection */}
      <div className="bg-white border border-neutral-200 rounded-lg p-5 space-y-4">
        <h2 className="text-sm font-semibold">Products in Bundle</h2>

        {/* Selected items */}
        {selected.length > 0 && (
          <div className="space-y-2 mb-2">
            {selected.map((item) => (
              <div key={item.productId} className="flex items-center gap-3 p-2.5 bg-neutral-50 rounded-lg">
                <div className="w-10 h-10 rounded bg-neutral-200 overflow-hidden shrink-0">
                  {item.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.name}</p>
                  <p className="text-xs text-neutral-500">{formatPrice(item.price)}</p>
                </div>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => setQty(item.productId, parseInt(e.target.value) || 1)}
                  className="w-14 border border-neutral-200 rounded px-2 py-1 text-sm text-center focus:outline-none focus:border-black"
                />
                <button
                  type="button"
                  onClick={() => removeProduct(item.productId)}
                  className="text-neutral-400 hover:text-red-500 transition-colors p-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Product search */}
        <div>
          <input
            type="text"
            placeholder="Search products to add…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-neutral-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-black"
          />
          {search && (
            <div className="mt-1 border border-neutral-200 rounded-lg overflow-hidden max-h-48 overflow-y-auto">
              {filteredProducts.length === 0 ? (
                <p className="text-sm text-neutral-400 text-center py-4">No products found.</p>
              ) : (
                filteredProducts.slice(0, 10).map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => { addProduct(p); setSearch(""); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-neutral-50 text-left transition-colors"
                  >
                    <div className="w-8 h-8 bg-neutral-100 rounded overflow-hidden shrink-0">
                      {p.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{p.name}</p>
                      <p className="text-xs text-neutral-500">{formatPrice(p.price)}</p>
                    </div>
                    <span className="text-xs text-neutral-400">+ Add</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {selected.length < 2 && (
          <p className="text-xs text-amber-600">Add at least 2 products to create a bundle.</p>
        )}
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending || selected.length < 2}
          className="bg-black text-white text-sm font-semibold px-6 py-2.5 rounded-md hover:bg-neutral-800 transition-colors disabled:opacity-50"
        >
          {isPending ? "Saving…" : isEdit ? "Save Changes" : "Create Bundle"}
        </button>
        <a
          href="/admin/bundles"
          className="text-sm px-6 py-2.5 border border-neutral-200 rounded-md hover:border-black transition-colors"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
