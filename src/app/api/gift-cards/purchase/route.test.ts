import { beforeEach, describe, expect, it, vi } from "vitest";
import { createDbMock, jsonRequest } from "@/test/supabaseMock";

const m = vi.hoisted(() => ({
  db: null as unknown,
  createPaymentIntent: vi.fn(),
}));

vi.mock("@supabase/supabase-js", () => ({ createClient: () => m.db }));
vi.mock("@/lib/stripe", () => ({
  getStripe: () => ({ paymentIntents: { create: m.createPaymentIntent } }),
}));

import { POST } from "./route";

const dayOffset = (days: number) =>
  new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

const valid = {
  amount: 50,
  recipientEmail: "to@b.com",
  recipientName: "Sam",
  senderName: "Jo",
};

function post(body: Record<string, unknown>) {
  return POST(jsonRequest("http://test/api/gift-cards/purchase", body));
}

describe("POST /api/gift-cards/purchase", () => {
  beforeEach(() => {
    m.db = createDbMock().db;
    m.createPaymentIntent.mockResolvedValue({
      id: "pi_1",
      client_secret: "secret_1",
    });
  });

  it("should return the client secret and store the delivery date and sender email", async () => {
    const mock = createDbMock();
    m.db = mock.db;
    const deliveryDate = dayOffset(3);

    const res = await post({
      ...valid,
      senderEmail: "from@b.com",
      deliveryDate,
    });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(
      expect.objectContaining({ clientSecret: "secret_1" }),
    );
    expect(mock.callsFor("gift_cards", "insert")[0].payload).toEqual(
      expect.objectContaining({
        sender_email: "from@b.com",
        delivery_date: deliveryDate,
        is_active: false,
      }),
    );
  });

  it("should store null delivery date and sender email when they are not provided", async () => {
    const mock = createDbMock();
    m.db = mock.db;

    await post(valid);

    expect(mock.callsFor("gift_cards", "insert")[0].payload).toEqual(
      expect.objectContaining({ sender_email: null, delivery_date: null }),
    );
  });

  it("should return 400 when the delivery date is in the past", async () => {
    const res = await post({ ...valid, deliveryDate: dayOffset(-3) });
    expect(res.status).toBe(400);
    expect(m.createPaymentIntent).not.toHaveBeenCalled();
  });

  it("should return 400 when the delivery date is not a real calendar day", async () => {
    const res = await post({ ...valid, deliveryDate: "2027-02-31" });
    expect(res.status).toBe(400);
  });

  it("should return 400 when the sender email is invalid", async () => {
    const res = await post({ ...valid, senderEmail: "not-an-email" });
    expect(res.status).toBe(400);
  });
});
