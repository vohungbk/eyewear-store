"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { deleteProductImage, setPrimaryImage, saveProductImage } from "@/lib/actions/admin";
import type { AdminProductDetail } from "@/lib/data/admin";

type ProductImage = AdminProductDetail["product_images"][number];

export default function ProductImageManager({
  productId,
  images: initialImages,
}: {
  productId: string;
  images: ProductImage[];
}) {
  const router = useRouter();
  const [images, setImages] = useState(initialImages);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [isPending, startTransition] = useTransition();

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError("");

    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `products/${productId}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(path, file, { contentType: file.type });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("product-images").getPublicUrl(path);

      const isPrimary = images.length === 0;
      const result = await saveProductImage(productId, publicUrl, isPrimary);

      if (result.error) {
        setUploadError(result.error);
      } else {
        router.refresh();
      }
    } catch {
      setUploadError("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  }

  function handleSetPrimary(imageId: string) {
    startTransition(async () => {
      const result = await setPrimaryImage(productId, imageId);
      if (!result.error) {
        setImages((imgs) =>
          imgs.map((img) => ({ ...img, is_primary: img.id === imageId }))
        );
      }
    });
  }

  function handleDelete(imageId: string) {
    if (!confirm("Delete this image?")) return;
    startTransition(async () => {
      const result = await deleteProductImage(productId, imageId);
      if (!result.error) {
        setImages((imgs) => imgs.filter((img) => img.id !== imageId));
      }
    });
  }

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-neutral-700">Images</h2>

      {/* Image grid */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {images.map((img) => (
            <div
              key={img.id}
              className={`relative group w-24 h-24 rounded-lg overflow-hidden border-2 transition-colors ${
                img.is_primary
                  ? "border-black"
                  : "border-neutral-200 hover:border-neutral-400"
              }`}
            >
              <Image
                src={img.url}
                alt=""
                fill
                className="object-cover"
                sizes="96px"
              />
              {img.is_primary && (
                <span className="absolute top-1 left-1 text-[9px] font-bold bg-black text-white px-1.5 py-0.5 rounded">
                  Primary
                </span>
              )}
              {/* Hover actions */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {!img.is_primary && (
                  <button
                    type="button"
                    onClick={() => handleSetPrimary(img.id)}
                    disabled={isPending}
                    title="Set as primary"
                    className="text-white text-[10px] bg-white/20 hover:bg-white/30 rounded px-1.5 py-1"
                  >
                    ★
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(img.id)}
                  disabled={isPending}
                  title="Delete"
                  className="text-white text-[10px] bg-red-500/80 hover:bg-red-600 rounded px-1.5 py-1"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload */}
      <label className="block">
        <div
          className={`border-2 border-dashed rounded-lg px-4 py-6 text-center cursor-pointer transition-colors ${
            isUploading
              ? "border-neutral-300 bg-neutral-50"
              : "border-neutral-200 hover:border-black"
          }`}
        >
          <p className="text-sm text-neutral-500">
            {isUploading ? "Uploading…" : "Click to upload image"}
          </p>
          <p className="text-xs text-neutral-400 mt-1">PNG, JPG up to 5 MB</p>
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          disabled={isUploading}
          className="sr-only"
        />
      </label>

      {uploadError && (
        <p className="text-xs text-red-600">{uploadError}</p>
      )}
    </div>
  );
}
