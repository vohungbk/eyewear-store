import { revalidateTag } from "next/cache";

// The service client is intentionally untyped (same pattern as the API routes).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Db = any;

export type StockResult =
  | { ok: true; deducted: boolean }
  | { ok: false; reason: "insufficient_stock" | "error" };

// Deducts stock for a paid order via the `deduct_order_stock` database
// function (atomic and idempotent). Call it once the order is confirmed paid.
export async function deductOrderStock(db: Db, orderId: string): Promise<StockResult> {
  const { data, error } = await db.rpc("deduct_order_stock", { p_order_id: orderId });
  if (error) {
    const message = String((error as { message?: string }).message ?? "");
    return { ok: false, reason: message.includes("insufficient_stock") ? "insufficient_stock" : "error" };
  }
  const deducted = data === "deducted";
  if (deducted) revalidateTag("products", "minutes");
  return { ok: true, deducted };
}
