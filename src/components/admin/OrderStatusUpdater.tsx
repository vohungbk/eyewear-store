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

const CARRIERS = ["UPS", "FedEx", "USPS", "DHL", "Other"];

export default function OrderStatusUpdater({
  orderId,
  currentStatus,
  currentTracking,
  currentCarrier,
}: {
  orderId: string;
  currentStatus: string;
  currentTracking?: string | null;
  currentCarrier?: string | null;
}) {
  const [selected, setSelected] = useState(currentStatus);
  const [trackingNumber, setTrackingNumber] = useState(currentTracking ?? "");
  const [shippingCarrier, setShippingCarrier] = useState(currentCarrier ?? "");
  const [showTracking, setShowTracking] = useState(currentStatus === "shipped");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const router = useRouter();

  function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value;
    setSelected(newStatus);
    setShowTracking(newStatus === "shipped");
  }

  function handleSave() {
    if (!confirm(`Change status to "${selected}"?`)) return;

    setError("");
    startTransition(async () => {
      const result = await updateOrderStatus(
        orderId,
        selected,
        selected === "shipped"
          ? { trackingNumber: trackingNumber.trim(), shippingCarrier: shippingCarrier.trim() }
          : undefined
      );
      if (result.error) {
        setError(result.error);
      } else {
        router.refresh();
      }
    });
  }

  const hasChanged = selected !== currentStatus
    || (selected === "shipped" && (trackingNumber !== (currentTracking ?? "") || shippingCarrier !== (currentCarrier ?? "")));

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <select
          value={selected}
          onChange={handleStatusChange}
          disabled={isPending}
          className="text-sm border border-neutral-200 rounded-md px-2 py-1.5 focus:outline-none focus:border-black bg-white disabled:opacity-60 capitalize"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s} className="capitalize">
              {s}
            </option>
          ))}
        </select>
        {hasChanged && (
          <button
            onClick={handleSave}
            disabled={isPending}
            className="text-sm bg-black text-white px-3 py-1.5 rounded-md hover:bg-neutral-800 transition-colors disabled:opacity-60"
          >
            {isPending ? "Saving…" : "Save"}
          </button>
        )}
      </div>

      {showTracking && (
        <div className="space-y-2 border border-neutral-200 rounded-lg p-3 bg-neutral-50">
          <p className="text-xs font-semibold text-neutral-600">Tracking Info</p>
          <div className="flex gap-2">
            <select
              value={shippingCarrier}
              onChange={(e) => setShippingCarrier(e.target.value)}
              className="text-sm border border-neutral-200 rounded px-2 py-1.5 bg-white focus:outline-none focus:border-black"
            >
              <option value="">Carrier</option>
              {CARRIERS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Tracking number"
              className="flex-1 text-sm border border-neutral-200 rounded px-2 py-1.5 focus:outline-none focus:border-black"
            />
          </div>
        </div>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
