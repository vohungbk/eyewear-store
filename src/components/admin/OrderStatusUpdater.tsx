"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateOrderStatus } from "@/lib/actions/admin";

const STATUSES = [
  "pending",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export default function OrderStatusUpdater({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const [selected, setSelected] = useState(currentStatus);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const router = useRouter();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value;
    if (newStatus === selected) return;
    if (!confirm(`Change status to "${newStatus}"?`)) return;

    setSelected(newStatus);
    setError("");
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, newStatus);
      if (result.error) {
        setError(result.error);
        setSelected(currentStatus);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div>
      <select
        value={selected}
        onChange={handleChange}
        disabled={isPending}
        className="text-sm border border-neutral-200 rounded-md px-2 py-1.5 focus:outline-none focus:border-black bg-white disabled:opacity-60 capitalize"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s} className="capitalize">
            {s}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
