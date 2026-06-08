"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createProduct, updateProduct } from "@/lib/actions/admin";
import { ProductSchema, type ProductFormValues } from "@/lib/validations/admin";
import type { AdminProductDetail } from "@/lib/data/admin";
import type { Category } from "@/types/database";

interface Props {
  product?: AdminProductDetail | null;
  categories: Category[];
}

export default function ProductForm({ product, categories }: Props) {
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
  } = useForm<ProductFormValues>({
    resolver: zodResolver(ProductSchema),
    defaultValues: {
      name: product?.name ?? "",
      slug: product?.slug ?? "",
      description: product?.description ?? "",
      price: product?.price ?? 0,
      compare_at_price: product?.compare_at_price ?? null,
      category_id: product?.category_id ?? null,
      is_active: product?.is_active ?? true,
      is_featured: product?.is_featured ?? false,
      seo_title: product?.seo_title ?? "",
      seo_description: product?.seo_description ?? "",
    },
  });

  const nameValue = watch("name");

  function autoSlug() {
    if (product) return; // don't overwrite slug when editing
    const slug = nameValue
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
    setValue("slug", slug, { shouldValidate: true });
  }

  function onSubmit(data: ProductFormValues) {
    setServerMessage(null);
    startTransition(async () => {
      const result = product
        ? await updateProduct(product.id, data)
        : await createProduct(data);

      if (!result) return; // redirect happened (createProduct redirects on success)

      if (result.success) {
        setServerMessage({ type: "success", text: result.message ?? "Saved." });
      } else {
        setServerMessage({
          type: "error",
          text: result.message ?? "Something went wrong.",
        });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-2xl">
      {serverMessage && (
        <div
          className={`px-4 py-3 rounded-md text-sm ${
            serverMessage.type === "success"
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {serverMessage.text}
        </div>
      )}

      {/* Basic info */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-neutral-700">Basic Info</h2>

        <Field label="Name" error={errors.name?.message}>
          <input
            {...register("name")}
            onBlur={autoSlug}
            className={inputCls(!!errors.name)}
            placeholder="Classic Aviator Sunglasses"
          />
        </Field>

        <Field label="Slug" error={errors.slug?.message}>
          <input
            {...register("slug")}
            className={inputCls(!!errors.slug)}
            placeholder="classic-aviator-sunglasses"
          />
        </Field>

        <Field label="Description" error={errors.description?.message}>
          <textarea
            {...register("description")}
            rows={4}
            className={inputCls(false) + " resize-none"}
            placeholder="Product description…"
          />
        </Field>
      </section>

      {/* Pricing */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-neutral-700">Pricing</h2>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Price ($)" error={errors.price?.message}>
            <input
              {...register("price", { valueAsNumber: true })}
              type="number"
              step="0.01"
              min="0"
              className={inputCls(!!errors.price)}
              placeholder="149.99"
            />
          </Field>
          <Field label="Compare At Price ($) — optional" error={errors.compare_at_price?.message}>
            <input
              {...register("compare_at_price", {
                setValueAs: (v) => (v === "" || v === null ? null : Number(v)),
              })}
              type="number"
              step="0.01"
              min="0"
              className={inputCls(!!errors.compare_at_price)}
              placeholder="199.99"
            />
          </Field>
        </div>
      </section>

      {/* Organisation */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-neutral-700">Organisation</h2>

        <Field label="Category" error={errors.category_id?.message}>
          <select
            {...register("category_id", {
              setValueAs: (v) => (v === "" ? null : v),
            })}
            className={inputCls(false) + " bg-white"}
          >
            <option value="">No category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </Field>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              {...register("is_active")}
              type="checkbox"
              className="w-4 h-4 rounded border-neutral-300"
            />
            <span className="text-sm">Active</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              {...register("is_featured")}
              type="checkbox"
              className="w-4 h-4 rounded border-neutral-300"
            />
            <span className="text-sm">Featured</span>
          </label>
        </div>
      </section>

      {/* SEO */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-neutral-700">
          SEO{" "}
          <span className="font-normal text-neutral-400">(optional)</span>
        </h2>

        <Field label="SEO Title">
          <input
            {...register("seo_title")}
            className={inputCls(false)}
            placeholder="Leave blank to use product name"
          />
        </Field>
        <Field label="SEO Description">
          <textarea
            {...register("seo_description")}
            rows={2}
            className={inputCls(false) + " resize-none"}
          />
        </Field>
      </section>

      <div className="flex items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="bg-black text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-60"
        >
          {isPending ? "Saving…" : product ? "Save Changes" : "Create Product"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="text-sm text-neutral-500 hover:text-black transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      {children}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}

function inputCls(hasError: boolean) {
  return `w-full border rounded-md px-3 py-2.5 text-sm focus:outline-none transition-colors ${
    hasError
      ? "border-red-300 focus:border-red-500"
      : "border-neutral-200 focus:border-black"
  }`;
}
