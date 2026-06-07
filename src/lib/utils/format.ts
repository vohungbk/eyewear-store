export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function getPrimaryImage(
  images: { url: string; alt_text: string | null; is_primary: boolean }[]
): { url: string; alt: string } | null {
  if (!images || images.length === 0) return null;
  const primary = images.find((img) => img.is_primary) ?? images[0];
  return { url: primary.url, alt: primary.alt_text ?? "" };
}

export function getDiscountPercent(
  price: number,
  compareAtPrice: number | null
): number | null {
  if (!compareAtPrice || compareAtPrice <= price) return null;
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}
