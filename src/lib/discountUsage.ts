// The service client is intentionally untyped (same pattern as the API routes).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Db = any;

// Counts one use of the order's discount code (idempotent per order).
// The order is already paid when this runs, so a failure is logged and never
// blocks the order.
export async function redeemOrderDiscount(db: Db, orderId: string): Promise<void> {
  const { error } = await db.rpc("redeem_order_discount", { p_order_id: orderId });
  if (error) {
    console.error("[discount-usage] failed to count discount use", { orderId, error });
  }
}
