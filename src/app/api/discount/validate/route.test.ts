import { beforeEach, describe, expect, it, vi } from "vitest";
import { createDbMock, jsonRequest } from "@/test/supabaseMock";

const holder = vi.hoisted(() => ({ db: null as unknown }));
vi.mock("@supabase/supabase-js", () => ({ createClient: () => holder.db }));

import { POST } from "./route";

const future = new Date(Date.now() + 86_400_000).toISOString();
const past = new Date(Date.now() - 86_400_000).toISOString();

function code(overrides: Record<string, unknown> = {}) {
  return {
    id: "dc-1",
    type: "percent",
    value: 10,
    min_order: 0,
    usage_limit: null,
    usage_count: 0,
    expires_at: null,
    ...overrides,
  };
}

async function validate(body: { code: string; subtotal: number }, row: unknown) {
  holder.db = createDbMock({ "discount_codes:select": { data: row } }).db;
  const res = await POST(jsonRequest("http://test/api/discount/validate", body));
  return res.json();
}

describe("POST /api/discount/validate", () => {
  beforeEach(() => {
    holder.db = createDbMock().db;
  });

  it("should return invalid when the code is empty", async () => {
    const json = await validate({ code: "   ", subtotal: 100 }, null);
    expect(json).toEqual({ valid: false, message: "Please enter a discount code." });
  });

  it("should return invalid when the code does not exist", async () => {
    const json = await validate({ code: "NOPE", subtotal: 100 }, null);
    expect(json.valid).toBe(false);
    expect(json.message).toMatch(/invalid or expired/i);
  });

  it("should return invalid when the code is expired", async () => {
    const json = await validate({ code: "OLD", subtotal: 100 }, code({ expires_at: past }));
    expect(json).toEqual({ valid: false, message: "This discount code has expired." });
  });

  it("should accept a code that expires in the future", async () => {
    const json = await validate({ code: "NEW", subtotal: 100 }, code({ expires_at: future }));
    expect(json.valid).toBe(true);
  });

  it("should return invalid when the usage limit is reached", async () => {
    const json = await validate(
      { code: "FULL", subtotal: 100 },
      code({ usage_limit: 5, usage_count: 5 })
    );
    expect(json.message).toMatch(/usage limit/i);
  });

  it("should return invalid when the subtotal is below the minimum order", async () => {
    const json = await validate({ code: "BIG", subtotal: 49.99 }, code({ min_order: 50 }));
    expect(json).toEqual({
      valid: false,
      message: "Minimum order of $50.00 required for this code.",
    });
  });

  it("should accept a subtotal equal to the minimum order", async () => {
    const json = await validate({ code: "BIG", subtotal: 50 }, code({ min_order: 50 }));
    expect(json.valid).toBe(true);
  });

  it("should calculate a percent discount rounded to 2 decimals", async () => {
    const json = await validate({ code: "TEN", subtotal: 33.33 }, code({ type: "percent", value: 15 }));
    expect(json).toMatchObject({ valid: true, discountAmount: 5, discountType: "percent", discountValue: 15 });
  });

  it("should apply a fixed discount as is when below the subtotal", async () => {
    const json = await validate({ code: "FIVE", subtotal: 100 }, code({ type: "fixed", value: 5 }));
    expect(json).toMatchObject({ valid: true, discountAmount: 5, discountType: "fixed" });
  });

  it("should cap a fixed discount at the subtotal so the total never goes negative", async () => {
    const json = await validate({ code: "BIGOFF", subtotal: 20 }, code({ type: "fixed", value: 50 }));
    expect(json.discountAmount).toBe(20);
  });

  it("should return 500 when the database throws", async () => {
    holder.db = {
      from: () => {
        throw new Error("db down");
      },
    };
    vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await POST(jsonRequest("http://test", { code: "X", subtotal: 10 }));
    expect(res.status).toBe(500);
  });
});
