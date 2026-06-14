"use client";

import { useState } from "react";
import { deleteDiscount } from "@/lib/actions/discounts";

export default function DeleteDiscountButton({ id }: { id: string }) {
  const [isPending, setIsPending] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this discount code?")) return;
    setIsPending(true);
    const result = await deleteDiscount(id);
    if (result.error) {
      alert(result.error);
      setIsPending(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="text-red-500 hover:text-red-700 text-sm transition-colors disabled:opacity-50"
    >
      {isPending ? "Deleting…" : "Delete"}
    </button>
  );
}
