import Link from "next/link";
import Image from "next/image";
import { formatPrice, getPrimaryImage, getDiscountPercent } from "@/lib/utils/format";
import type { ProductWithImages } from "@/types/database";

interface ProductCardProps {
  product: ProductWithImages;
}

export default function ProductCard({ product }: ProductCardProps) {
  const image = getPrimaryImage(product.product_images ?? []);
  const discount = getDiscountPercent(product.price, product.compare_at_price);

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block"
      aria-label={product.name}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden rounded-lg bg-neutral-100">
        {image ? (
          <Image
            src={image.url}
            alt={image.alt || product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="text-neutral-300"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            </svg>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {discount && (
            <span className="bg-black text-white text-[10px] font-bold px-2 py-0.5 rounded">
              -{discount}%
            </span>
          )}
          {product.is_featured && !discount && (
            <span className="bg-neutral-800 text-white text-[10px] font-bold px-2 py-0.5 rounded">
              Featured
            </span>
          )}
        </div>

        {/* Quick view overlay */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-200 bg-black/80 text-white text-xs font-semibold text-center py-2.5">
          View Details
        </div>
      </div>

      {/* Info */}
      <div className="mt-3 space-y-0.5">
        <p className="text-xs text-neutral-400 truncate">
          {(product as any).categories?.name ?? ""}
        </p>
        <h3 className="text-sm font-medium truncate group-hover:underline">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">
            {formatPrice(product.price)}
          </span>
          {product.compare_at_price && (
            <span className="text-xs text-neutral-400 line-through">
              {formatPrice(product.compare_at_price)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
