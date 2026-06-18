import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminProduct } from "@/lib/data/admin";
import { getCategories } from "@/lib/data/categories";
import ProductForm from "@/components/admin/ProductForm";
import ProductImageManager from "@/components/admin/ProductImageManager";
import VariantStockEditor from "@/components/admin/VariantStockEditor";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await getAdminProduct(id);
  return { title: product ? `Admin — Edit ${product.name}` : "Admin — Edit Product" };
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;

  const [product, categories] = await Promise.all([
    getAdminProduct(id),
    getCategories(),
  ]);

  if (!product) notFound();

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/products"
          className="text-sm text-neutral-500 hover:text-black transition-colors"
        >
          ← Products
        </Link>
        <span className="text-neutral-300">/</span>
        <h1 className="text-xl font-bold truncate">{product.name}</h1>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        <div className="xl:col-span-2">
          <ProductForm product={product} categories={categories} />
        </div>
        <div>
          <ProductImageManager
            productId={product.id}
            images={product.product_images}
          />

          {/* Variant stock editor */}
          {product.product_variants.length > 0 && (
            <div className="mt-8">
              <h2 className="text-sm font-semibold text-neutral-700 mb-3">
                Stock ({product.product_variants.length} variants)
              </h2>
              <VariantStockEditor variants={product.product_variants} />
              <p className="text-xs text-neutral-400 mt-2">
                Waitlist subscribers are emailed automatically when stock is restored from zero.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
