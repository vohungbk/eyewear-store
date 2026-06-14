-- ============================================================
-- Eyewear Store — Feature Migration: Newsletter, Inventory, Order Tracking
-- ============================================================

-- ─────────────────────────────────────────
-- newsletter_subscribers
-- ─────────────────────────────────────────
create table newsletter_subscribers (
  id              uuid primary key default uuid_generate_v4(),
  email           text not null unique,
  name            text,
  source          text not null default 'footer',
  is_confirmed    boolean not null default false,
  subscribed_at   timestamptz not null default now(),
  unsubscribed_at timestamptz
);

create index newsletter_subscribers_email_idx on newsletter_subscribers (lower(email));

alter table newsletter_subscribers enable row level security;

create policy "Admins can manage newsletter subscribers"
  on newsletter_subscribers for all using (is_admin());

-- ─────────────────────────────────────────
-- product_variants — low_stock_threshold
-- ─────────────────────────────────────────
alter table product_variants
  add column if not exists low_stock_threshold integer not null default 5;

-- ─────────────────────────────────────────
-- orders — tracking info
-- ─────────────────────────────────────────
alter table orders
  add column if not exists tracking_number text,
  add column if not exists shipping_carrier text;
