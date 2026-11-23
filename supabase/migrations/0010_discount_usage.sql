-- ─────────────────────────────────────────
-- Discount code usage counting
-- ─────────────────────────────────────────

alter table orders
  add column discount_redeemed_at timestamptz;

-- Counts one use of the order's discount code, once per order.
-- Idempotent, so Stripe webhook retries never count the same order twice.
-- The limit is enforced when the order is priced; this only records usage.
create or replace function redeem_order_discount(p_order_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text;
begin
  update orders
     set discount_redeemed_at = now()
   where id = p_order_id
     and discount_code is not null
     and discount_redeemed_at is null
  returning discount_code into v_code;

  if v_code is null then
    return 'skipped';
  end if;

  update discount_codes
     set usage_count = usage_count + 1
   where code = v_code;

  return 'redeemed';
end;
$$;

revoke all on function redeem_order_discount(uuid) from public, anon, authenticated;
grant execute on function redeem_order_discount(uuid) to service_role;
