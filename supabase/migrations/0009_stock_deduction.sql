-- ─────────────────────────────────────────
-- Stock deduction when an order is paid
-- ─────────────────────────────────────────

alter table orders
  add column stock_deducted_at timestamptz;

-- Deducts stock for every item of an order, once.
--  * Idempotent: a second call for the same order does nothing, so Stripe
--    webhook retries never deduct twice.
--  * All-or-nothing: if any variant lacks stock the function raises, and the
--    whole transaction (including the idempotency flag) is rolled back.
--  * Race-safe: each decrement is a single conditional UPDATE, so two buyers
--    of the last unit cannot both succeed.
create or replace function deduct_order_stock(p_order_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  claimed uuid;
  item    record;
begin
  update orders
     set stock_deducted_at = now()
   where id = p_order_id
     and stock_deducted_at is null
  returning id into claimed;

  if claimed is null then
    return 'skipped';
  end if;

  -- Lock rows in a stable order to avoid deadlocks between concurrent orders.
  for item in
    select variant_id, sum(quantity)::int as qty
      from order_items
     where order_id = p_order_id
       and variant_id is not null
     group by variant_id
     order by variant_id
  loop
    update product_variants
       set stock_quantity = stock_quantity - item.qty
     where id = item.variant_id
       and stock_quantity >= item.qty;

    if not found then
      raise exception 'insufficient_stock:%', item.variant_id;
    end if;
  end loop;

  return 'deducted';
end;
$$;

revoke all on function deduct_order_stock(uuid) from public, anon, authenticated;
grant execute on function deduct_order_stock(uuid) to service_role;
