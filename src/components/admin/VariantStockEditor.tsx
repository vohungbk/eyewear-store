"use client";

import { useState } from "react";
import { updateVariantStock } from "@/lib/actions/admin";

interface Variant {
  id: string;
  name: string;
  sku: string | null;
  stock_quantity: number;
}

export default function VariantStockEditor({ variants }: { variants: Variant[] }) {
  const [stocks, setStocks] = useState<Record<string, string>>(
    Object.fromEntries(variants.map((v) => [v.id, String(v.stock_quantity)]))
  );
  const [saving, setSaving] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, string>>({});

  async function handleSave(variantId: string) {
    const qty = parseInt(stocks[variantId] ?? "0", 10);
    if (isNaN(qty) || qty < 0) {
      setMessages((m) => ({ ...m, [variantId]: "Enter a valid quantity." }));
      return;
    }
    setSaving(variantId);
    const result = await updateVariantStock(variantId, qty);
    setSaving(null);
    setMessages((m) => ({
      ...m,
      [variantId]: result.error ?? "Saved — waitlist notified if restocked.",
    }));
    setTimeout(
      () => setMessages((m) => ({ ...m, [variantId]: "" })),
      3000
    );
  }

  return (
    <ul className="space-y-2">
      {variants.map((v) => (
        <li key={v.id} className="border border-neutral-100 rounded-md px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="flex-1 text-sm truncate">{v.name}</span>
            <input
              type="number"
              min={0}
              value={stocks[v.id] ?? "0"}
              onChange={(e) =>
                setStocks((s) => ({ ...s, [v.id]: e.target.value }))
              }
              className="w-20 border border-neutral-200 rounded px-2 py-1 text-sm text-right focus:outline-none focus:border-black"
            />
            <button
              onClick={() => handleSave(v.id)}
              disabled={saving === v.id}
              className="px-3 py-1 bg-black text-white text-xs font-semibold rounded hover:bg-neutral-800 transition-colors disabled:opacity-50"
            >
              {saving === v.id ? "…" : "Save"}
            </button>
          </div>
          {messages[v.id] && (
            <p className="mt-1 text-xs text-neutral-500">{messages[v.id]}</p>
          )}
        </li>
      ))}
    </ul>
  );
}
