import { beforeEach, describe, expect, it, vi } from "vitest";
import { createDbMock } from "@/test/supabaseMock";

const m = vi.hoisted(() => ({
  db: null as unknown,
  signature: "sig_test" as string | null,
  constructEvent: vi.fn(),
  sendCAPIEvent: vi.fn(),
  sendOrderConfirmationEmail: vi.fn(),
  sendGiftCardEmail: vi.fn(),
  markCartRecovered: vi.fn(),
}));

vi.mock("@supabase/supabase-js", () => ({ createClient: () => m.db }));
vi.mock("next/headers", () => ({
  headers: async () => ({ get: () => m.signature }),
}));
vi.mock("@/lib/stripe", () => ({
  getStripe: () => ({ webhooks: { constructEvent: m.constructEvent } }),
}));
vi.mock("@/lib/facebook/capi", () => ({ sendCAPIEvent: m.sendCAPIEvent }));
vi.mock("@/lib/email", () => ({
  sendOrderConfirmationEmail: m.sendOrderConfirmationEmail,
  sendGiftCardEmail: m.sendGiftCardEmail,
}));
vi.mock("@/lib/actions/abandonedCart", () => ({ markCartRecovered: m.markCartRecovered }));

import { POST } from "./route";

const order = {
  id: "order-1",
  customer_email: "a@b.com",
  customer_name: "Jane Doe",
  shipping_address: { line1: "1 St", city: "NYC", state: "NY", postal_code: "10001", country: "US" },
  subtotal: 100,
  shipping: 5,
  tax: 8,
  total: 113,
  gift_card_code: null,
  gift_card_credit: 0,
  order_items: [{ product_id: "p1", unit_price: 100, quantity: 2, product_snapshot: { name: "Aviator" } }],
};

function event(type: string, metadata: Record<string, string>, id = "pi_1") {
  m.constructEvent.mockReturnValue({ type, data: { object: { id, metadata } } });
}

function post() {
  return POST(new Request("http://test/api/webhooks/stripe", { method: "POST", body: "{}" }));
}

describe("POST /api/webhooks/stripe", () => {
  beforeEach(() => {
    m.signature = "sig_test";
    m.db = createDbMock().db;
  });

  it("should return 400 when the stripe-signature header is missing", async () => {
    m.signature = null;
    const res = await post();
    expect(res.status).toBe(400);
    expect(m.constructEvent).not.toHaveBeenCalled();
  });

  it("should return 400 when the signature verification fails", async () => {
    m.constructEvent.mockImplementation(() => {
      throw new Error("bad signature");
    });
    const res = await post();
    expect(res.status).toBe(400);
    expect(await res.text()).toContain("bad signature");
  });

  it("should mark the order as paid and send the confirmation email on payment success", async () => {
    const mock = createDbMock({ "orders:select": { data: order } });
    m.db = mock.db;
    event("payment_intent.succeeded", { order_id: "order-1", fb_event_id: "fb-1" });

    const res = await post();

    expect(res.status).toBe(200);
    expect(mock.callsFor("orders", "update")[0].payload).toEqual({ status: "paid" });
    expect(m.sendOrderConfirmationEmail).toHaveBeenCalledWith(
      expect.objectContaining({ id: "order-1", customer_email: "a@b.com", total: 113 })
    );
    expect(m.markCartRecovered).toHaveBeenCalledWith("a@b.com");
  });

  it("should send a Facebook Purchase event with the deduplication id", async () => {
    m.db = createDbMock({ "orders:select": { data: order } }).db;
    event("payment_intent.succeeded", { order_id: "order-1", fb_event_id: "fb-1" });

    await post();

    expect(m.sendCAPIEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        eventName: "Purchase",
        eventId: "fb-1",
        customData: expect.objectContaining({ value: 113, numItems: 2, orderId: "order-1" }),
      })
    );
  });

  it("should skip the Facebook event when there is no fb_event_id", async () => {
    m.db = createDbMock({ "orders:select": { data: order } }).db;
    event("payment_intent.succeeded", { order_id: "order-1" });

    await post();

    expect(m.sendCAPIEvent).not.toHaveBeenCalled();
  });

  it("should deduct the gift card credit and record a redemption", async () => {
    const mock = createDbMock({
      "orders:select": { data: { ...order, gift_card_code: "GC-1", gift_card_credit: 30 } },
      "gift_cards:select": { data: { id: "gc-1", balance: 50 } },
    });
    m.db = mock.db;
    event("payment_intent.succeeded", { order_id: "order-1" });

    await post();

    expect(mock.callsFor("gift_cards", "update")[0].payload).toEqual({ balance: 20 });
    expect(mock.callsFor("gift_card_redemptions", "insert")[0].payload).toEqual({
      gift_card_id: "gc-1",
      order_id: "order-1",
      amount: 30,
    });
  });

  it("should never let the gift card balance go below zero", async () => {
    const mock = createDbMock({
      "orders:select": { data: { ...order, gift_card_code: "GC-1", gift_card_credit: 80 } },
      "gift_cards:select": { data: { id: "gc-1", balance: 50 } },
    });
    m.db = mock.db;
    event("payment_intent.succeeded", { order_id: "order-1" });

    await post();

    expect(mock.callsFor("gift_cards", "update")[0].payload).toEqual({ balance: 0 });
  });

  it("should activate the gift card and email the recipient on a gift card purchase", async () => {
    const mock = createDbMock({
      "gift_cards:select": {
        data: {
          id: "gc-9",
          code: "GC-9",
          initial_value: 100,
          recipient_email: "friend@x.com",
          recipient_name: "Friend",
          sender_name: "Me",
          message: "Enjoy",
        },
      },
    });
    m.db = mock.db;
    event("payment_intent.succeeded", { gift_card_code: "GC-9" });

    await post();

    expect(mock.callsFor("gift_cards", "update")[0].payload).toEqual({ is_active: true });
    expect(m.sendGiftCardEmail).toHaveBeenCalledWith(
      expect.objectContaining({ recipientEmail: "friend@x.com", code: "GC-9", value: 100 })
    );
    expect(m.sendOrderConfirmationEmail).not.toHaveBeenCalled();
  });

  it("should cancel the order when the payment fails", async () => {
    const mock = createDbMock();
    m.db = mock.db;
    event("payment_intent.payment_failed", { order_id: "order-1" });

    const res = await post();

    expect(res.status).toBe(200);
    expect(mock.callsFor("orders", "update")[0].payload).toEqual({ status: "cancelled" });
  });

  it("should return 200 and change nothing for unhandled event types", async () => {
    const mock = createDbMock();
    m.db = mock.db;
    event("charge.refunded", { order_id: "order-1" });

    const res = await post();

    expect(res.status).toBe(200);
    expect(mock.calls).toHaveLength(0);
  });
});
