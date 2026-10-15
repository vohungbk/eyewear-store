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

const item = {
  productId: "p1",
  variantId: "v1",
  name: "Aviator",
  variantName: "Black / M",
  price: 149.99,
  quantity: 2,
  imageUrl: "https://img/x.png",
  stockQuantity: 10,
};

const body = {
  items: [item],
  contact: { email: "a@b.com", full_name: "Jane Doe" },
  shippingAddress: { line1: "1 St", city: "NYC", state: "NY", postal_code: "10001", country: "US" },
  totals: { subtotal: 299.98, discount: 0, shipping: 0, tax: 24, total: 323.98 },
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

  it("should create a payment intent with the total converted to cents", async () => {
    m.db = createDbMock({ "orders:insert": { data: { id: "order-1" } } }).db;

    await call(body);

    expect(m.create).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 32398, currency: "usd", receipt_email: "a@b.com" })
    );
  });

  it("should avoid floating point errors when converting to cents", async () => {
    m.db = createDbMock({ "orders:insert": { data: { id: "order-1" } } }).db;

    await call({ ...body, totals: { ...body.totals, total: 19.99 } });

    expect(m.create).toHaveBeenCalledWith(expect.objectContaining({ amount: 1999 }));
  });

  it("should create a pending order and its items for a guest", async () => {
    const mock = createDbMock({ "orders:insert": { data: { id: "order-1" } } });
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
    const mock = createDbMock({ "orders:insert": { data: { id: "order-1" } } });
    m.db = mock.db;

    await call(body);

    expect(mock.callsFor("orders", "insert")[0].payload).toMatchObject({ user_id: "user-7" });
  });

  it("should attach order_id and fb_event_id to the payment intent metadata", async () => {
    m.db = createDbMock({ "orders:insert": { data: { id: "order-1" } } }).db;

    const res = await call(body);
    const json = await res.json();

    expect(m.update).toHaveBeenCalledWith("pi_1", {
      metadata: { order_id: "order-1", fb_event_id: json.fbEventId },
    });
    expect(json).toMatchObject({ clientSecret: "secret_1", paymentIntentId: "pi_1", orderId: "order-1" });
  });

  it("should return 500 when the order insert fails", async () => {
    m.db = createDbMock({ "orders:insert": { error: new Error("insert failed") } }).db;

    const res = await call(body);

    expect(res.status).toBe(500);
  });

  it("should return 500 when Stripe fails", async () => {
    m.create.mockRejectedValue(new Error("stripe down"));
    m.db = createDbMock().db;

    const res = await call(body);

    expect(res.status).toBe(500);
  });

  // Known gap: totals come from the client. A tampered request can pay less than the cart is worth.
  it.todo("should recompute subtotal, discount and total on the server instead of trusting the client");
});
