import { beforeEach, describe, expect, it, vi } from "vitest";
import { createDbMock } from "@/test/supabaseMock";

const m = vi.hoisted(() => ({
  db: null as unknown,
  sendGiftCardEmail: vi.fn(),
}));

vi.mock("@supabase/supabase-js", () => ({ createClient: () => m.db }));
vi.mock("@/lib/email", () => ({ sendGiftCardEmail: m.sendGiftCardEmail }));

import { GET } from "./route";

const card = {
  id: "gc-1",
  code: "AAAA-BBBB-CCCC-DDDD",
  initial_value: 50,
  recipient_email: "to@b.com",
  recipient_name: "Sam",
  sender_name: "Jo",
  message: "Enjoy",
};

const get = (secret?: string) =>
  GET(
    new Request(
      `http://test/api/cron/gift-cards${secret ? `?secret=${secret}` : ""}`,
    ),
  );

describe("GET /api/cron/gift-cards", () => {
  beforeEach(() => {
    process.env.CRON_SECRET = "s3cret";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-key";
    m.db = createDbMock().db;
  });

  it("should return 401 when the secret is missing or wrong", async () => {
    expect((await get()).status).toBe(401);
    expect((await get("wrong")).status).toBe(401);
    expect(m.sendGiftCardEmail).not.toHaveBeenCalled();
  });

  it("should email due cards and mark them as sent", async () => {
    const mock = createDbMock({ "gift_cards:select": { data: [card] } });
    m.db = mock.db;

    const res = await get("s3cret");

    expect(await res.json()).toEqual({ sent: 1 });
    expect(m.sendGiftCardEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        recipientEmail: "to@b.com",
        code: card.code,
        value: 50,
      }),
    );
    expect(mock.callsFor("gift_cards", "update")[0].payload).toEqual({
      email_sent_at: expect.any(String),
    });
  });

  it("should return sent 0 when no card is due", async () => {
    m.db = createDbMock({ "gift_cards:select": { data: [] } }).db;
    const res = await get("s3cret");
    expect(await res.json()).toEqual({ sent: 0 });
  });

  it("should keep going and report an error when one email fails", async () => {
    const mock = createDbMock({
      "gift_cards:select": {
        data: [card, { ...card, id: "gc-2", code: "EEEE-FFFF-GGGG-HHHH" }],
      },
    });
    m.db = mock.db;
    m.sendGiftCardEmail.mockRejectedValueOnce(new Error("smtp down"));

    const body = await (await get("s3cret")).json();

    expect(body.sent).toBe(1);
    expect(body.errors).toEqual([expect.stringContaining("smtp down")]);
    expect(mock.callsFor("gift_cards", "update")).toHaveLength(1);
  });
});
