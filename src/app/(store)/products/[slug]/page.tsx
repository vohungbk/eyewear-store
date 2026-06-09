import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProduct, getRelatedProducts } from "@/lib/data/products";
import ProductGallery from "@/components/ui/ProductGallery";
import ProductDetail from "@/components/ui/ProductDetail";
import ProductCard from "@/components/ui/ProductCard";
import ViewContentTracker from "@/components/analytics/ViewContentTracker";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Product Not Found" };

  return {
    title: product.seo_title ?? product.name,
    description: product.seo_description ?? product.description ?? undefined,
    openGraph: {
      title: product.name,
      description: product.description ?? undefined,
      images: product.product_images?.[0]
        ? [{ url: product.product_images[0].url }]
        : [],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) notFound();

  const related = await getRelatedProducts(
    product.id,
    product.category_id,
    4
  );

  const category = (product as any).categories as {
    name: string;
    slug: string;
  } | null;

  const basePrice = product.product_variants?.[0]?.price ?? 0;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <ViewContentTracker productId={product.id} name={product.name} price={basePrice} />
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-neutral-500 mb-6">
        <a href="/" className="hover:text-black transition-colors">Home</a>
        <span>/</span>
        <a href="/products" className="hover:text-black transition-colors">Eyewear</a>
        {category && (
          <>
            <span>/</span>
            <a
              href={`/collections/${category.slug}`}
              className="hover:text-black transition-colors"
            >
              {category.name}
            </a>
          </>
        )}
        <span>/</span>
        <span className="text-neutral-700 font-medium">{product.name}</span>
      </nav>

      {/* Main product section */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <ProductGallery
          images={product.product_images ?? []}
          productName={product.name}
        />

        {/* Info */}
        <div className="space-y-6">
          {category && (
            <p className="text-xs font-medium tracking-wider uppercase text-neutral-400">
              {category.name}
            </p>
          )}
          <h1 className="text-3xl font-bold">{product.name}</h1>

          {product.description && (
            <p className="text-sm text-neutral-600 leading-relaxed">
              {product.description}
            </p>
          )}

          <hr className="border-neutral-200" />

          <ProductDetail product={product} />

          {/* Features */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            {[
              { icon: "🚚", label: "Free shipping over $150" },
              { icon: "↩", label: "30-day returns" },
              { icon: "🛡", label: "1-year warranty" },
            ].map(({ icon, label }) => (
              <div
                key={label}
                className="text-center p-3 rounded-lg bg-neutral-50 text-xs text-neutral-600"
              >
                <div className="text-lg mb-1">{icon}</div>
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="text-xl font-bold mb-6">You May Also Like</h2>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
