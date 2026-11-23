// Pure order-total math, shared by the checkout UI (preview) and the server
// (source of truth). Works in integer cents to avoid floating point drift.

export const FREE_SHIPPING_THRESHOLD_CENTS = 10_000;
export const FLAT_SHIPPING_CENTS = 999;
export const TAX_RATE = 0.08;

export const toCents = (dollars: number) => Math.round(dollars * 100);
export const fromCents = (cents: number) => cents / 100;

export interface TotalsInputCents {
  subtotalCents: number;
  discountCents?: number;
  giftCardCents?: number;
}

export interface TotalsCents {
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  giftCard: number;
  total: number;
}

export function computeTotalsCents({
  subtotalCents,
  discountCents = 0,
  giftCardCents = 0,
}: TotalsInputCents): TotalsCents {
  const discount = Math.min(Math.max(0, discountCents), subtotalCents);
  const discounted = subtotalCents - discount;
  const shipping = discounted >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : FLAT_SHIPPING_CENTS;
  const tax = Math.round(discounted * TAX_RATE);
  const beforeGiftCard = discounted + shipping + tax;
  const giftCard = Math.min(Math.max(0, giftCardCents), beforeGiftCard);
  return {
    subtotal: subtotalCents,
    discount,
    shipping,
    tax,
    giftCard,
    total: beforeGiftCard - giftCard,
  };
}
