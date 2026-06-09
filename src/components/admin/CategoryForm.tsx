"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createCategory, updateCategory } from "@/lib/actions/admin";
import { CategorySchema, type CategoryFormValues } from "@/lib/validations/admin";
import type { AdminCategory } from "@/lib/data/admin";

interface Props {
  category?: AdminCategory | null;
  allCategories: AdminCategory[];
}

export default function CategoryForm({ category, allCategories }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverMessage, setServerMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(CategorySchema),
    defaultValues: {
      name: category?.name ?? "",
      slug: category?.slug ?? "",
      description: category?.description ?? "",
      image_url: category?.image_url ?? "",
      parent_id: category?.parent_id ?? null,
      position: category?.position ?? 0,
    },
  });

  const nameValue = watch("name");

  function autoSlug() {
    if (category) return;
    const slug = nameValue
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
    setValue("slug", slug, { shouldValidate: true });
  }

  function onSubmit(data: CategoryFormValues) {
    setServerMessage(null);
    startTransition(async () => {
      const result = category
        ? await updateCategory(category.id, data)
        : await createCategory(data);

      if (result?.success === false) {
        setServerMessage({ type: "error", text: result.message ?? "An error occurred." });
      } else if (result?.success) {
        setServerMessage({ type: "success", text: result.message ?? "Saved." });
        router.refresh();
      }
      // createCategory redirects on success — no further handling needed
    });
  }

  // Parent options exclude the current category to prevent circular references
  const parentOptions = allCategories.filter((c) => c.id !== category?.id);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <input
          {...register("name")}
          onBlur={autoSlug}
          placeholder="e.g. Sunglasses"
          className="w-full border border-neutral-200 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-black"
        />
        {errors.name && (
          <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
        )}
      </div>

      {/* Slug */}
      <div>
        <label className="block text-sm font-medium mb-1">Slug</label>
        <input
          {...register("slug")}
          placeholder="e.g. sunglasses"
          className="w-full border border-neutral-200 rounded-md px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-black"
        />
        {errors.slug && (
          <p className="text-xs text-red-500 mt-1">{errors.slug.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Description <span className="text-neutral-400 font-normal">(optional)</span>
        </label>
        <textarea
          {...register("description")}
          rows={3}
          placeholder="Short description of the category"
          className="w-full border border-neutral-200 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-black resize-none"
        />
      </div>

      {/* Image URL */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Image URL <span className="text-neutral-400 font-normal">(optional)</span>
        </label>
        <input
          {...register("image_url")}
          type="url"
          placeholder="https://..."
          className="w-full border border-neutral-200 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-black"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Parent category */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Parent Category <span className="text-neutral-400 font-normal">(optional)</span>
          </label>
          <select
            {...register("parent_id")}
            className="w-full border border-neutral-200 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-black bg-white"
          >
            <option value="">None (top-level)</option>
            {parentOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Position */}
        <div>
          <label className="block text-sm font-medium mb-1">Position</label>
          <input
            {...register("position", { valueAsNumber: true })}
            type="number"
            min="0"
            className="w-full border border-neutral-200 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-black"
          />
          {errors.position && (
            <p className="text-xs text-red-500 mt-1">{errors.position.message}</p>
          )}
        </div>
      </div>

      {serverMessage && (
        <p
          className={`text-sm px-3 py-2 rounded-md border ${
            serverMessage.type === "success"
              ? "bg-green-50 border-green-100 text-green-700"
              : "bg-red-50 border-red-100 text-red-600"
          }`}
        >
          {serverMessage.text}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="bg-black text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-60"
        >
          {isPending ? "Saving…" : category ? "Save Changes" : "Create Category"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/categories")}
          className="text-sm text-neutral-500 hover:text-black transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
