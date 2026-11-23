import { beforeEach, describe, expect, it, vi } from "vitest";
import { createDbMock, jsonRequest } from "@/test/supabaseMock";

const m = vi.hoisted(() => ({
  db: null as unknown,
  sendOrderConfirmationEmail: vi.fn(),
}));

vi.mock("@supabase/supabase-js", () => ({ createClient: () => m.db }));
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ auth: { getUser: async () => ({ data: { user: null } }) } }),
}));
vi.mock("next/cache", () => ({ revalidateTag: vi.fn() }));
vi.mock("@/lib/email", () => ({ sendOrderConfirmationEmail: m.sendOrderConfirmationEmail }));

import { POST } from "./route";

const future = new Date(Date.now() + 86_400_000).toISOString();
const past = new Date(Date.now() - 86_400_000).toISOString();

// Variant v1 costs 40.00 => 40 + 9.99 shipping + 3.20 tax = 53.19 due.
const variants = (price = 40) => ({
  "product_variants:select": {
    data: [
      {
        id: "v1",
        name: "Black",
        price_modifier: 0,
        stock_quantity: 5,
        products: { id: "p1", name: "Aviator", price, is_active: true, product_images: [] },
      },
    ],
  },
});

const body = {
  items: [{ variantId: "v1", quantity: 1 }],
  contact: { email: "a@b.com", full_name: "Jane Doe" },
  shippingAddress: { line1: "1 St", city: "NYC", state: "NY", postal_code: "10001", country: "US" },
  giftCardCode: " gc-1 ",
};

const call = (b: unknown) => POST(jsonRequest("http://test/api/orders/create-free", b));
const giftCard = (o: Record<string, unknown> = {}) => ({
  ...variants(),
  "gift_cards:select": { data: { id: "gc-1", balance: 100, is_active: true, expires_at: future, ...o } },
});

describe("POST /api/orders/create-free", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    m.sendOrderConfirmationEmail.mockResolvedValue(undefined);
  });

  it("should return 400 when the cart is empty", async () => {
    m.db = createDbMock().db;
    const res = await call({ ...body, items: [] });
    expect(res.status).toBe(400);
  });

  it("should return 400 when no gift card is provided", async () => {
    m.db = createDbMock().db;
    const res = await call({ ...body, giftCardCode: "" });
    expect(res.status).toBe(400);
  });

  it("should return 400 when the gift card does not cover the server-computed total", async () => {
    const mock = createDbMock({ ...giftCard({ balance: 10 }), "orders:insert": { data: { id: "order-1" } } });
    m.db = mock.db;

    // The client claims the order is free; the server computes 53.19 due.
    const res = await call({ ...body, totals: { total: 0, giftCardCredit: 10 } });

    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/not fully covered/i);
    expect(mock.callsFor("orders", "insert")).toHaveLength(0);
  });

  it("should not create a paid order for a tampered price with a tiny gift card balance", async () => {
    const mock = createDbMock({ ...giftCard({ balance: 0.01 }), "orders:insert": { data: { id: "order-1" } } });
    m.db = mock.db;

    const res = await call({
      ...body,
      items: [{ variantId: "v1", quantity: 1, price: 0.01 }],
      totals: { total: 0, giftCardCredit: 0.01 },
    });

    expect(res.status).toBe(400);
    expect(mock.callsFor("orders", "insert")).toHaveLength(0);
  });

  it("should return 400 when the gift card does not exist", async () => {
    m.db = createDbMock().db;
    const res = await call(body);
    expect(res.status).toBe(400);
  });

  it("should return 400 when the gift card is inactive", async () => {
    m.db = createDbMock(giftCard({ is_active: false })).db;
    const res = await call(body);
    expect(res.status).toBe(400);
  });

  it("should return 400 when the gift card has expired", async () => {
    m.db = createDbMock(giftCard({ expires_at: past })).db;
    const res = await call(body);
    expect((await res.json()).error).toMatch(/expired/i);
  });

  it("should create a paid order, deduct the balance and record the redemption", async () => {
    const mock = createDbMock({ ...giftCard({ balance: 100 }), "orders:insert": { data: { id: "order-1" } } });
    m.db = mock.db;

    const res = await call(body);

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ orderId: "order-1" });
    expect(mock.callsFor("orders", "insert")[0].payload).toMatchObject({
      status: "paid",
      total: 0,
      gift_card_code: "GC-1",
      gift_card_credit: 53.19,
      subtotal: 40,
      shipping: 9.99,
      tax: 3.2,
    });
    expect(mock.callsFor("gift_cards", "update")[0].payload).toEqual({ balance: 46.81 });
    expect(mock.callsFor("gift_card_redemptions", "insert")[0].payload).toEqual({
      gift_card_id: "gc-1",
      order_id: "order-1",
      amount: 53.19,
    });
  });

  it("should deduct stock for the order", async () => {
    const mock = createDbMock({ ...giftCard(), "orders:insert": { data: { id: "order-1" } } });
    m.db = mock.db;

    await call(body);

    expect(mock.rpcCalls[0]).toEqual({ fn: "deduct_order_stock", args: { p_order_id: "order-1" } });
  });

  it("should count the discount code use", async () => {
    const mock = createDbMock({ ...giftCard(), "orders:insert": { data: { id: "order-1" } } });
    m.db = mock.db;

    await call(body);

    expect(mock.rpcCalls).toContainEqual({ fn: "redeem_order_discount", args: { p_order_id: "order-1" } });
  });

  it("should not count the discount use when the item went out of stock", async () => {
    const mock = createDbMock({
      ...giftCard(),
      "orders:insert": { data: { id: "order-1" } },
      "rpc:deduct_order_stock": { error: { message: "insufficient_stock:v1" } },
    });
    m.db = mock.db;

    await call(body);

    expect(mock.rpcCalls.map((c) => c.fn)).not.toContain("redeem_order_discount");
  });

  it("should cancel the order and return 409 when the item just went out of stock", async () => {
    const mock = createDbMock({
      ...giftCard(),
      "orders:insert": { data: { id: "order-1" } },
      "rpc:deduct_order_stock": { error: { message: "insufficient_stock:v1" } },
    });
    m.db = mock.db;

    const res = await call(body);

    expect(res.status).toBe(409);
    expect(mock.callsFor("orders", "update")[0].payload).toEqual({ status: "cancelled" });
    expect(mock.callsFor("gift_cards", "update")).toHaveLength(0);
    expect(mock.callsFor("gift_card_redemptions", "insert")).toHaveLength(0);
    expect(m.sendOrderConfirmationEmail).not.toHaveBeenCalled();
  });

  it("should still succeed when the confirmation email fails", async () => {
    m.sendOrderConfirmationEmail.mockRejectedValue(new Error("resend down"));
    m.db = createDbMock({ ...giftCard(), "orders:insert": { data: { id: "order-1" } } }).db;

    const res = await call(body);

    expect(res.status).toBe(200);
  });
});
