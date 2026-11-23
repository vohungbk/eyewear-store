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
  refund: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidateTag: vi.fn() }));

vi.mock("@supabase/supabase-js", () => ({ createClient: () => m.db }));
vi.mock("next/headers", () => ({
  headers: async () => ({ get: () => m.signature }),
}));
vi.mock("@/lib/stripe", () => ({
  getStripe: () => ({
    webhooks: { constructEvent: m.constructEvent },
    refunds: { create: m.refund },
  }),
}));
vi.mock("@/lib/facebook/capi", () => ({ sendCAPIEvent: m.sendCAPIEvent }));
vi.mock("@/lib/email", () => ({
  sendOrderConfirmationEmail: m.sendOrderConfirmationEmail,
  sendGiftCardEmail: m.sendGiftCardEmail,
}));
vi.mock("@/lib/actions/abandonedCart", () => ({
  markCartRecovered: m.markCartRecovered,
}));

import { POST } from "./route";

const order = {
  id: "order-1",
  customer_email: "a@b.com",
  customer_name: "Jane Doe",
  shipping_address: {
    line1: "1 St",
    city: "NYC",
    state: "NY",
    postal_code: "10001",
    country: "US",
  },
  subtotal: 100,
  shipping: 5,
  tax: 8,
  total: 113,
  gift_card_code: null,
  gift_card_credit: 0,
  order_items: [
    {
      product_id: "p1",
      unit_price: 100,
      quantity: 2,
      product_snapshot: { name: "Aviator" },
    },
  ],
};

function event(
  type: string,
  metadata: Record<string, string>,
  id = "pi_1",
  amountReceived = 11300,
) {
  m.constructEvent.mockReturnValue({
    type,
    data: { object: { id, metadata, amount_received: amountReceived } },
  });
}

function post() {
  return POST(
    new Request("http://test/api/webhooks/stripe", {
      method: "POST",
      body: "{}",
    }),
  );
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

  describe("gift card purchase", () => {
    const card = {
      id: "gc-1",
      code: "AAAA-BBBB-CCCC-DDDD",
      initial_value: 50,
      recipient_email: "to@b.com",
      recipient_name: "Sam",
      sender_name: "Jo",
      message: "Enjoy",
      delivery_date: null as string | null,
      email_sent_at: null as string | null,
    };
    const tomorrow = () =>
      new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    it("should activate the card and email it right away when there is no delivery date", async () => {
      const mock = createDbMock({ "gift_cards:select": { data: card } });
      m.db = mock.db;
      event("payment_intent.succeeded", { gift_card_code: card.code });

      await post();

      expect(mock.callsFor("gift_cards", "update")[0].payload).toEqual({
        is_active: true,
      });
      expect(m.sendGiftCardEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          recipientEmail: "to@b.com",
          code: card.code,
          value: 50,
        }),
      );
      expect(mock.callsFor("gift_cards", "update")[1].payload).toEqual({
        email_sent_at: expect.any(String),
      });
    });

    it("should activate the card but not email it when the delivery date is in the future", async () => {
      const mock = createDbMock({
        "gift_cards:select": { data: { ...card, delivery_date: tomorrow() } },
      });
      m.db = mock.db;
      event("payment_intent.succeeded", { gift_card_code: card.code });

      await post();

      expect(mock.callsFor("gift_cards", "update")[0].payload).toEqual({
        is_active: true,
      });
      expect(m.sendGiftCardEmail).not.toHaveBeenCalled();
    });

    it("should not email the card again when the webhook is retried", async () => {
      m.db = createDbMock({
        "gift_cards:select": {
          data: { ...card, email_sent_at: "2026-11-22T00:00:00Z" },
        },
      }).db;
      event("payment_intent.succeeded", { gift_card_code: card.code });

      await post();

      expect(m.sendGiftCardEmail).not.toHaveBeenCalled();
    });
  });

  it("should mark the order as paid and send the confirmation email on payment success", async () => {
    const mock = createDbMock({ "orders:select": { data: order } });
    m.db = mock.db;
    event("payment_intent.succeeded", {
      order_id: "order-1",
      fb_event_id: "fb-1",
    });

    const res = await post();

    expect(res.status).toBe(200);
    expect(mock.callsFor("orders", "update")[0].payload).toEqual({
      status: "paid",
    });
    expect(m.sendOrderConfirmationEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "order-1",
        customer_email: "a@b.com",
        total: 113,
      }),
    );
    expect(m.markCartRecovered).toHaveBeenCalledWith("a@b.com");
  });

  it("should not mark the order as paid when the amount received differs from the order total", async () => {
    const mock = createDbMock({ "orders:select": { data: order } });
    m.db = mock.db;
    vi.spyOn(console, "error").mockImplementation(() => {});
    event("payment_intent.succeeded", { order_id: "order-1" }, "pi_1", 50);

    const res = await post();

    expect(res.status).toBe(200);
    expect(mock.callsFor("orders", "update")).toHaveLength(0);
    expect(m.sendOrderConfirmationEmail).not.toHaveBeenCalled();
  });

  it("should deduct stock for the order before marking it paid", async () => {
    const mock = createDbMock({ "orders:select": { data: order }, "rpc:deduct_order_stock": { data: "deducted" } });
    m.db = mock.db;
    event("payment_intent.succeeded", { order_id: "order-1" });

    await post();

    expect(mock.rpcCalls[0]).toEqual({ fn: "deduct_order_stock", args: { p_order_id: "order-1" } });
    expect(mock.callsFor("orders", "update")[0].payload).toEqual({ status: "paid" });
  });

  it("should count the discount code use after marking the order paid", async () => {
    const mock = createDbMock({ "orders:select": { data: order } });
    m.db = mock.db;
    event("payment_intent.succeeded", { order_id: "order-1" });

    await post();

    expect(mock.rpcCalls).toContainEqual({ fn: "redeem_order_discount", args: { p_order_id: "order-1" } });
    expect(mock.callsFor("orders", "update")[0].payload).toEqual({ status: "paid" });
  });

  it("should still confirm the order when counting the discount use fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    m.db = createDbMock({
      "orders:select": { data: order },
      "rpc:redeem_order_discount": { error: { message: "boom" } },
    }).db;
    event("payment_intent.succeeded", { order_id: "order-1" });

    const res = await post();

    expect(res.status).toBe(200);
    expect(m.sendOrderConfirmationEmail).toHaveBeenCalled();
  });

  it("should not count the discount use when the order was refunded for lack of stock", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    m.refund.mockResolvedValue({});
    const mock = createDbMock({
      "orders:select": { data: order },
      "rpc:deduct_order_stock": { error: { message: "insufficient_stock:v1" } },
    });
    m.db = mock.db;
    event("payment_intent.succeeded", { order_id: "order-1" });

    await post();

    expect(mock.rpcCalls.map((c) => c.fn)).not.toContain("redeem_order_discount");
  });

  it("should refund, cancel the order and skip the email when stock ran out", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    m.refund.mockResolvedValue({});
    const mock = createDbMock({
      "orders:select": { data: order },
      "rpc:deduct_order_stock": { error: { message: "insufficient_stock:v1" } },
    });
    m.db = mock.db;
    event("payment_intent.succeeded", { order_id: "order-1" });

    const res = await post();

    expect(res.status).toBe(200);
    expect(m.refund).toHaveBeenCalledWith(
      { payment_intent: "pi_1" },
      { idempotencyKey: "oos-refund-order-1" },
    );
    expect(mock.callsFor("orders", "update")).toEqual([
      expect.objectContaining({ payload: expect.objectContaining({ status: "cancelled" }) }),
    ]);
    expect(m.sendOrderConfirmationEmail).not.toHaveBeenCalled();
    expect(m.markCartRecovered).not.toHaveBeenCalled();
  });

  it("should return 500 so Stripe retries when stock deduction fails unexpectedly", async () => {
    const mock = createDbMock({
      "orders:select": { data: order },
      "rpc:deduct_order_stock": { error: { message: "connection lost" } },
    });
    m.db = mock.db;
    event("payment_intent.succeeded", { order_id: "order-1" });

    const res = await post();

    expect(res.status).toBe(500);
    expect(mock.callsFor("orders", "update")).toHaveLength(0);
    expect(m.refund).not.toHaveBeenCalled();
  });

  it("should not revive an order that was already cancelled for lack of stock", async () => {
    const mock = createDbMock({
      "orders:select": { data: { ...order, notes: "Out of stock: payment refunded" } },
    });
    m.db = mock.db;
    event("payment_intent.succeeded", { order_id: "order-1" });

    await post();

    expect(mock.rpcCalls).toHaveLength(0);
    expect(mock.callsFor("orders", "update")).toHaveLength(0);
    expect(m.sendOrderConfirmationEmail).not.toHaveBeenCalled();
  });

  it("should send a Facebook Purchase event with the deduplication id", async () => {
    m.db = createDbMock({ "orders:select": { data: order } }).db;
    event("payment_intent.succeeded", {
      order_id: "order-1",
      fb_event_id: "fb-1",
    });

    await post();

    expect(m.sendCAPIEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        eventName: "Purchase",
        eventId: "fb-1",
        customData: expect.objectContaining({
          value: 113,
          numItems: 2,
          orderId: "order-1",
        }),
      }),
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
      "orders:select": {
        data: { ...order, gift_card_code: "GC-1", gift_card_credit: 30 },
      },
      "gift_cards:select": { data: { id: "gc-1", balance: 50 } },
    });
    m.db = mock.db;
    event("payment_intent.succeeded", { order_id: "order-1" });

    await post();

    expect(mock.callsFor("gift_cards", "update")[0].payload).toEqual({
      balance: 20,
    });
    expect(mock.callsFor("gift_card_redemptions", "insert")[0].payload).toEqual(
      {
        gift_card_id: "gc-1",
        order_id: "order-1",
        amount: 30,
      },
    );
  });

  it("should never let the gift card balance go below zero", async () => {
    const mock = createDbMock({
      "orders:select": {
        data: { ...order, gift_card_code: "GC-1", gift_card_credit: 80 },
      },
      "gift_cards:select": { data: { id: "gc-1", balance: 50 } },
    });
    m.db = mock.db;
    event("payment_intent.succeeded", { order_id: "order-1" });

    await post();

    expect(mock.callsFor("gift_cards", "update")[0].payload).toEqual({
      balance: 0,
    });
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

    expect(mock.callsFor("gift_cards", "update")[0].payload).toEqual({
      is_active: true,
    });
    expect(m.sendGiftCardEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        recipientEmail: "friend@x.com",
        code: "GC-9",
        value: 100,
      }),
    );
    expect(m.sendOrderConfirmationEmail).not.toHaveBeenCalled();
  });

  it("should cancel the order when the payment fails", async () => {
    const mock = createDbMock();
    m.db = mock.db;
    event("payment_intent.payment_failed", { order_id: "order-1" });

    const res = await post();

    expect(res.status).toBe(200);
    expect(mock.callsFor("orders", "update")[0].payload).toEqual({
      status: "cancelled",
    });
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
