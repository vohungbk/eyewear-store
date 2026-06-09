"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteCategory } from "@/lib/actions/admin";

export default function DeleteCategoryButton({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    if (!confirm(`Delete "${name}"? Products in this category will be unassigned.`)) return;
    startTransition(async () => {
      const result = await deleteCategory(id);
      if (result.error) {
        alert(result.error);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="text-xs text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
    >
      {isPending ? "Deleting…" : "Delete"}
    </button>
  );
}
