import { describe, expect, it, vi } from "vitest";
import { createDbMock } from "@/test/supabaseMock";
import { redeemOrderDiscount } from "./discountUsage";

describe("redeemOrderDiscount", () => {
  it("should call the database function for the order", async () => {
    const mock = createDbMock({ "rpc:redeem_order_discount": { data: "redeemed" } });

    await redeemOrderDiscount(mock.db, "o1");

    expect(mock.rpcCalls).toEqual([{ fn: "redeem_order_discount", args: { p_order_id: "o1" } }]);
  });

  it("should log and not throw when the database call fails", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const mock = createDbMock({ "rpc:redeem_order_discount": { error: { message: "boom" } } });

    await expect(redeemOrderDiscount(mock.db, "o1")).resolves.toBeUndefined();
    expect(spy).toHaveBeenCalled();
  });
});
