import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getWishlistProducts } from "@/lib/actions/wishlist";
import ProductCard from "@/components/ui/ProductCard";

export const metadata: Metadata = { title: "My Wishlist" };

export default async function WishlistPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirectTo=/account/wishlist");

  const items = await getWishlistProducts();
  const products = items.map((i) => i.products).filter(Boolean) as NonNullable<(typeof items)[number]["products"]>[];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">My Wishlist</h1>
          <p className="text-sm text-neutral-500 mt-1">{products.length} saved item{products.length !== 1 ? "s" : ""}</p>
        </div>
        <Link
          href="/account"
          className="text-sm text-neutral-500 hover:text-black transition-colors"
        >
          ← Back to account
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-neutral-200 rounded-lg">
          <p className="text-neutral-500 mb-3">Your wishlist is empty.</p>
          <Link href="/products" className="text-sm font-medium underline">
            Browse products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product as any}
              wishlisted={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}
