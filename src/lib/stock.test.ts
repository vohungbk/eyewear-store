import { describe, expect, it, vi } from "vitest";
import { createDbMock } from "@/test/supabaseMock";

const m = vi.hoisted(() => ({ revalidateTag: vi.fn() }));
vi.mock("next/cache", () => ({ revalidateTag: m.revalidateTag }));

import { deductOrderStock } from "./stock";

describe("deductOrderStock", () => {
  it("should return deducted and refresh the product cache when stock was deducted", async () => {
    const { db } = createDbMock({ "rpc:deduct_order_stock": { data: "deducted" } });

    expect(await deductOrderStock(db, "o1")).toEqual({ ok: true, deducted: true });
    expect(m.revalidateTag).toHaveBeenCalledWith("products", "minutes");
  });

  it("should not deduct or refresh the cache when the order was already processed", async () => {
    m.revalidateTag.mockClear();
    const { db } = createDbMock({ "rpc:deduct_order_stock": { data: "skipped" } });

    expect(await deductOrderStock(db, "o1")).toEqual({ ok: true, deducted: false });
    expect(m.revalidateTag).not.toHaveBeenCalled();
  });

  it("should report insufficient stock", async () => {
    const { db } = createDbMock({ "rpc:deduct_order_stock": { error: { message: "insufficient_stock:v1" } } });

    expect(await deductOrderStock(db, "o1")).toEqual({ ok: false, reason: "insufficient_stock" });
  });

  it("should report other database errors separately", async () => {
    const { db } = createDbMock({ "rpc:deduct_order_stock": { error: { message: "boom" } } });

    expect(await deductOrderStock(db, "o1")).toEqual({ ok: false, reason: "error" });
  });
});
