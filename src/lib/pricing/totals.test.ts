import { describe, expect, it } from "vitest";
import { computeTotalsCents } from "./totals";

describe("computeTotalsCents", () => {
  it("should charge flat shipping and 8% tax below the free shipping threshold", () => {
    expect(computeTotalsCents({ subtotalCents: 4000 })).toEqual({
      subtotal: 4000, discount: 0, shipping: 999, tax: 320, giftCard: 0, total: 5319,
    });
  });

  it("should give free shipping when the discounted subtotal reaches 100", () => {
    expect(computeTotalsCents({ subtotalCents: 10000 }).shipping).toBe(0);
  });

  it("should apply the discount before shipping and tax", () => {
    const t = computeTotalsCents({ subtotalCents: 10000, discountCents: 1000 });
    expect(t).toMatchObject({ discount: 1000, shipping: 999, tax: 720, total: 10719 });
  });

  it("should cap the discount at the subtotal", () => {
    expect(computeTotalsCents({ subtotalCents: 500, discountCents: 9999 }).discount).toBe(500);
  });

  it("should cap the gift card credit at the amount due", () => {
    const t = computeTotalsCents({ subtotalCents: 4000, giftCardCents: 100000 });
    expect(t.giftCard).toBe(5319);
    expect(t.total).toBe(0);
  });

  it("should ignore negative discount and gift card values", () => {
    const t = computeTotalsCents({ subtotalCents: 4000, discountCents: -500, giftCardCents: -500 });
    expect(t).toMatchObject({ discount: 0, giftCard: 0, total: 5319 });
  });
});
