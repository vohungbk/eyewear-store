-- ─────────────────────────────────────────
-- stock_waitlist
-- Stores email subscriptions for out-of-stock variants.
-- ─────────────────────────────────────────

create table stock_waitlist (
  id          uuid primary key default uuid_generate_v4(),
  email       text not null,
  product_id  uuid not null references products (id) on delete cascade,
  variant_id  uuid not null references product_variants (id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (email, variant_id)
);

create index stock_waitlist_variant_idx on stock_waitlist (variant_id);
create index stock_waitlist_email_idx   on stock_waitlist (email);

alter table stock_waitlist enable row level security;

-- Anyone can join the waitlist
create policy "Anyone can join waitlist"
  on stock_waitlist for insert
  with check (true);

-- Admins can read and clear the waitlist
create policy "Admins can read waitlist"
  on stock_waitlist for select
  using (is_admin());

create policy "Admins can delete waitlist"
  on stock_waitlist for delete
  using (is_admin());
