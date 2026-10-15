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
vi.mock("@/lib/email", () => ({ sendOrderConfirmationEmail: m.sendOrderConfirmationEmail }));

import { POST } from "./route";

const future = new Date(Date.now() + 86_400_000).toISOString();
const past = new Date(Date.now() - 86_400_000).toISOString();

const body = {
  items: [
    { productId: "p1", variantId: "v1", name: "Aviator", variantName: "Black", price: 40, quantity: 1, stockQuantity: 5 },
  ],
  contact: { email: "a@b.com", full_name: "Jane Doe" },
  shippingAddress: { line1: "1 St", city: "NYC", state: "NY", postal_code: "10001", country: "US" },
  totals: { subtotal: 40, discount: 0, shipping: 0, tax: 0, giftCardCredit: 40, total: 0 },
  giftCardCode: " gc-1 ",
};

const call = (b: unknown) => POST(jsonRequest("http://test/api/orders/create-free", b));
const giftCard = (o: Record<string, unknown> = {}) => ({
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

  it("should return 400 when the order total is not fully covered", async () => {
    m.db = createDbMock().db;
    const res = await call({ ...body, totals: { ...body.totals, total: 10 } });
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/not fully covered/i);
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

  it("should return 400 when the balance is lower than the credit", async () => {
    m.db = createDbMock(giftCard({ balance: 10 })).db;
    const res = await call(body);
    expect((await res.json()).error).toMatch(/insufficient/i);
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
      gift_card_credit: 40,
    });
    expect(mock.callsFor("gift_cards", "update")[0].payload).toEqual({ balance: 60 });
    expect(mock.callsFor("gift_card_redemptions", "insert")[0].payload).toEqual({
      gift_card_id: "gc-1",
      order_id: "order-1",
      amount: 40,
    });
  });

  it("should still succeed when the confirmation email fails", async () => {
    m.sendOrderConfirmationEmail.mockRejectedValue(new Error("resend down"));
    m.db = createDbMock({ ...giftCard(), "orders:insert": { data: { id: "order-1" } } }).db;

    const res = await call(body);

    expect(res.status).toBe(200);
  });
});
