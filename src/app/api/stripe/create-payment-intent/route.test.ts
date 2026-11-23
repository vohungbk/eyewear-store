import { beforeEach, describe, expect, it, vi } from "vitest";
import { createDbMock, jsonRequest } from "@/test/supabaseMock";

const m = vi.hoisted(() => ({
  db: null as unknown,
  user: null as { id: string } | null,
  create: vi.fn(),
  update: vi.fn(),
}));

vi.mock("@supabase/supabase-js", () => ({ createClient: () => m.db }));
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ auth: { getUser: async () => ({ data: { user: m.user } }) } }),
}));
vi.mock("@/lib/stripe", () => ({
  getStripe: () => ({ paymentIntents: { create: m.create, update: m.update } }),
}));

import { POST } from "./route";

// Variant v1 is priced at 149.99 in the database (see `variant` below).
const variant = (o: Record<string, unknown> = {}) => ({
  id: "v1",
  name: "Black / M",
  price_modifier: 0,
  stock_quantity: 10,
  products: {
    id: "p1",
    name: "Aviator",
    price: 149.99,
    is_active: true,
    product_images: [{ url: "https://img/x.png", is_primary: true }],
  },
  ...o,
});
const variants = (rows: unknown[] = [variant()]) => ({ "product_variants:select": { data: rows } });
const orderInsert = { "orders:insert": { data: { id: "order-1" } } };

const body = {
  items: [{ variantId: "v1", quantity: 2 }],
  contact: { email: "a@b.com", full_name: "Jane Doe" },
  shippingAddress: { line1: "1 St", city: "NYC", state: "NY", postal_code: "10001", country: "US" },
};

const call = (b: unknown) => POST(jsonRequest("http://test/api/stripe/create-payment-intent", b));

describe("POST /api/stripe/create-payment-intent", () => {
  beforeEach(() => {
    m.user = null;
    m.create.mockResolvedValue({ id: "pi_1", client_secret: "secret_1" });
    m.update.mockResolvedValue({});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("should return 400 when the cart is empty", async () => {
    const res = await call({ ...body, items: [] });
    expect(res.status).toBe(400);
    expect(m.create).not.toHaveBeenCalled();
  });

  it("should create a payment intent with the total computed by the server, in cents", async () => {
    m.db = createDbMock({ ...variants(), ...orderInsert }).db;

    await call(body);

    // 2 x 149.99 = 299.98, free shipping, 8% tax = 24.00
    expect(m.create).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 32398, currency: "usd", receipt_email: "a@b.com" })
    );
  });

  it("should ignore prices and totals tampered with by the client", async () => {
    const mock = createDbMock({ ...variants(), ...orderInsert });
    m.db = mock.db;

    await call({
      ...body,
      items: [{ variantId: "v1", quantity: 2, price: 0.01, name: "Free" }],
      totals: { subtotal: 0.02, discount: 0, shipping: 0, tax: 0, total: 0.5 },
    });

    expect(m.create).toHaveBeenCalledWith(expect.objectContaining({ amount: 32398 }));
    expect(mock.callsFor("orders", "insert")[0].payload).toMatchObject({
      subtotal: 299.98,
      shipping: 0,
      tax: 24,
      total: 323.98,
    });
    expect(mock.callsFor("order_items", "insert")[0].payload).toEqual([
      expect.objectContaining({ unit_price: 149.99, product_snapshot: expect.objectContaining({ name: "Aviator" }) }),
    ]);
  });

  it("should add the variant price modifier to the product price", async () => {
    const mock = createDbMock({ ...variants([variant({ price_modifier: 10 })]), ...orderInsert });
    m.db = mock.db;

    await call({ ...body, items: [{ variantId: "v1", quantity: 1 }] });

    expect(mock.callsFor("order_items", "insert")[0].payload).toEqual([
      expect.objectContaining({ unit_price: 159.99 }),
    ]);
  });

  it("should apply a discount code validated against the database", async () => {
    const mock = createDbMock({
      ...variants(),
      ...orderInsert,
      "discount_codes:select": {
        data: { type: "percent", value: 10, min_order: 0, usage_limit: null, usage_count: 0, expires_at: null },
      },
    });
    m.db = mock.db;

    await call({ ...body, discountCode: "save10", totals: { total: 1 } });

    // 299.98 - 10% (30.00) = 269.98, free shipping, tax 21.60 => 291.58
    expect(mock.callsFor("orders", "insert")[0].payload).toMatchObject({
      discount: 30,
      discount_code: "SAVE10",
      total: 291.58,
    });
    expect(m.create).toHaveBeenCalledWith(expect.objectContaining({ amount: 29158 }));
  });

  it("should return 400 when the discount code is not valid", async () => {
    m.db = createDbMock(variants()).db;

    const res = await call({ ...body, discountCode: "FAKE" });

    expect(res.status).toBe(400);
    expect(m.create).not.toHaveBeenCalled();
  });

  it("should apply a partial gift card credit computed by the server", async () => {
    const mock = createDbMock({
      ...variants(),
      ...orderInsert,
      "gift_cards:select": { data: { id: "gc-1", balance: 50, is_active: true, expires_at: null } },
    });
    m.db = mock.db;

    await call({ ...body, giftCardCode: "gc-1", totals: { giftCardCredit: 9999 } });

    expect(mock.callsFor("orders", "insert")[0].payload).toMatchObject({
      gift_card_code: "GC-1",
      gift_card_credit: 50,
      total: 273.98,
    });
    expect(m.create).toHaveBeenCalledWith(expect.objectContaining({ amount: 27398 }));
  });

  it.each([
    ["is zero", 0],
    ["is negative", -1],
    ["is not an integer", 1.5],
  ])("should return 400 when the quantity %s", async (_name, quantity) => {
    m.db = createDbMock(variants()).db;

    const res = await call({ ...body, items: [{ variantId: "v1", quantity }] });

    expect(res.status).toBe(400);
    expect(m.create).not.toHaveBeenCalled();
  });

  it("should return 400 when the product is inactive", async () => {
    const v = variant();
    m.db = createDbMock(variants([{ ...v, products: { ...v.products, is_active: false } }])).db;

    const res = await call(body);

    expect(res.status).toBe(400);
    expect(m.create).not.toHaveBeenCalled();
  });

  it("should return 400 when the variant does not exist", async () => {
    m.db = createDbMock(variants([])).db;

    const res = await call(body);

    expect(res.status).toBe(400);
  });

  it("should return 400 when the quantity exceeds the stock", async () => {
    m.db = createDbMock(variants([variant({ stock_quantity: 1 })])).db;

    const res = await call(body);

    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/stock/i);
  });

  it("should return 400 when a gift card covers the whole order", async () => {
    m.db = createDbMock({
      ...variants(),
      "gift_cards:select": { data: { id: "gc-1", balance: 1000, is_active: true, expires_at: null } },
    }).db;

    const res = await call({ ...body, giftCardCode: "GC-1" });

    expect(res.status).toBe(400);
    expect(m.create).not.toHaveBeenCalled();
  });

  it("should create a pending order and its items for a guest", async () => {
    const mock = createDbMock({ ...variants(), ...orderInsert });
    m.db = mock.db;

    await call(body);

    expect(mock.callsFor("orders", "insert")[0].payload).toMatchObject({
      user_id: null,
      status: "pending",
      total: 323.98,
      stripe_payment_intent_id: "pi_1",
      customer_email: "a@b.com",
    });
    expect(mock.callsFor("order_items", "insert")[0].payload).toEqual([
      expect.objectContaining({ order_id: "order-1", variant_id: "v1", quantity: 2, unit_price: 149.99 }),
    ]);
  });

  it("should link the order to the signed-in user", async () => {
    m.user = { id: "user-7" };
    const mock = createDbMock({ ...variants(), ...orderInsert });
    m.db = mock.db;

    await call(body);

    expect(mock.callsFor("orders", "insert")[0].payload).toMatchObject({ user_id: "user-7" });
  });

  it("should attach order_id and fb_event_id to the payment intent metadata", async () => {
    m.db = createDbMock({ ...variants(), ...orderInsert }).db;

    const res = await call(body);
    const json = await res.json();

    expect(m.update).toHaveBeenCalledWith("pi_1", {
      metadata: { order_id: "order-1", fb_event_id: json.fbEventId },
    });
    expect(json).toMatchObject({ clientSecret: "secret_1", paymentIntentId: "pi_1", orderId: "order-1" });
  });

  it("should return 500 when the order insert fails", async () => {
    m.db = createDbMock({ ...variants(), "orders:insert": { error: new Error("insert failed") } }).db;

    const res = await call(body);

    expect(res.status).toBe(500);
  });

  it("should return 500 when Stripe fails", async () => {
    m.create.mockRejectedValue(new Error("stripe down"));
    m.db = createDbMock(variants()).db;

    const res = await call(body);

    expect(res.status).toBe(500);
  });
});
