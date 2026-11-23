import { computeTotalsCents, fromCents, toCents } from "@/lib/pricing/totals";

// The service client is intentionally untyped (same pattern as the API routes).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Db = any;

export class PricingError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

export interface OrderInput {
  items: { variantId: string; quantity: number }[];
  discountCode?: string | null;
  giftCardCode?: string | null;
}

export interface PricedItem {
  productId: string;
  variantId: string;
  quantity: number;
  unitPrice: number;
  name: string;
  variantName: string;
  imageUrl: string | null;
}

export interface PricedOrder {
  items: PricedItem[];
  discountCode: string | null;
  giftCard: { id: string; code: string; balance: number } | null;
  totals: {
    subtotal: number;
    discount: number;
    shipping: number;
    tax: number;
    giftCardCredit: number;
    total: number;
  };
}

type VariantRow = {
  id: string;
  name: string;
  price_modifier: number;
  stock_quantity: number;
  products: {
    id: string;
    name: string;
    price: number;
    is_active: boolean;
    product_images?: { url: string; is_primary: boolean }[];
  } | null;
};

// Builds the priced order from the database. Client input is limited to
// variant ids, quantities and promo codes; every amount is computed here.
export async function calculateOrder(db: Db, input: OrderInput): Promise<PricedOrder> {
  // 1. Normalise cart lines (merge duplicates, reject bad quantities).
  const lines = new Map<string, number>();
  for (const line of input.items ?? []) {
    const variantId = line?.variantId;
    const quantity = line?.quantity;
    if (typeof variantId !== "string" || !variantId) {
      throw new PricingError("Invalid cart item.");
    }
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new PricingError("Invalid item quantity.");
    }
    lines.set(variantId, (lines.get(variantId) ?? 0) + quantity);
  }
  if (lines.size === 0) throw new PricingError("Cart is empty.");

  // 2. Load variants + products with current prices.
  const { data: rows } = await db
    .from("product_variants")
    .select(
      "id, name, price_modifier, stock_quantity, products(id, name, price, is_active, product_images(url, is_primary))"
    )
    .in("id", [...lines.keys()]);
  const variants = new Map<string, VariantRow>(
    ((rows ?? []) as VariantRow[]).map((v) => [v.id, v])
  );

  const items: PricedItem[] = [];
  let subtotalCents = 0;
  for (const [variantId, quantity] of lines) {
    const v = variants.get(variantId);
    if (!v || !v.products || !v.products.is_active) {
      throw new PricingError("An item in your cart is no longer available.");
    }
    if (v.stock_quantity < quantity) {
      throw new PricingError(`Not enough stock for ${v.products.name}.`);
    }
    const unitCents = toCents(v.products.price) + toCents(v.price_modifier);
    subtotalCents += unitCents * quantity;
    const images = v.products.product_images ?? [];
    items.push({
      productId: v.products.id,
      variantId,
      quantity,
      unitPrice: fromCents(unitCents),
      name: v.products.name,
      variantName: v.name,
      imageUrl: (images.find((i) => i.is_primary) ?? images[0])?.url ?? null,
    });
  }

  // 3. Discount code.
  let discountCents = 0;
  let discountCode: string | null = null;
  if (input.discountCode?.trim()) {
    const code = input.discountCode.trim().toUpperCase();
    const { data: dc } = await db
      .from("discount_codes")
      .select("type, value, min_order, usage_limit, usage_count, expires_at")
      .eq("code", code)
      .eq("is_active", true)
      .single();
    if (!dc) throw new PricingError("Invalid or expired discount code.");
    if (dc.expires_at && new Date(dc.expires_at) < new Date()) {
      throw new PricingError("This discount code has expired.");
    }
    if (dc.usage_limit !== null && dc.usage_count >= dc.usage_limit) {
      throw new PricingError("This discount code has reached its usage limit.");
    }
    if (subtotalCents < toCents(dc.min_order)) {
      throw new PricingError(
        `Minimum order of $${Number(dc.min_order).toFixed(2)} required for this code.`
      );
    }
    discountCents =
      dc.type === "percent"
        ? Math.round((subtotalCents * dc.value) / 100)
        : Math.min(toCents(dc.value), subtotalCents);
    discountCode = code;
  }

  // 4. Gift card (balance is applied after tax and shipping).
  let giftCard: PricedOrder["giftCard"] = null;
  if (input.giftCardCode?.trim()) {
    const code = input.giftCardCode.trim().toUpperCase();
    const { data: gc } = await db
      .from("gift_cards")
      .select("id, balance, is_active, expires_at")
      .eq("code", code)
      .single();
    if (!gc || !gc.is_active) throw new PricingError("Invalid or inactive gift card.");
    if (gc.expires_at && new Date(gc.expires_at) < new Date()) {
      throw new PricingError("Gift card has expired.");
    }
    if (gc.balance <= 0) throw new PricingError("This gift card has no remaining balance.");
    giftCard = { id: gc.id, code, balance: gc.balance };
  }

  const t = computeTotalsCents({
    subtotalCents,
    discountCents,
    giftCardCents: giftCard ? toCents(giftCard.balance) : 0,
  });

  return {
    items,
    discountCode,
    giftCard,
    totals: {
      subtotal: fromCents(t.subtotal),
      discount: fromCents(t.discount),
      shipping: fromCents(t.shipping),
      tax: fromCents(t.tax),
      giftCardCredit: fromCents(t.giftCard),
      total: fromCents(t.total),
    },
  };
}
