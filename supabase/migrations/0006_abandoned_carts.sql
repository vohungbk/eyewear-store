-- ─────────────────────────────────────────
-- abandoned_carts
-- Stores checkout cart snapshots for recovery emails.
-- ─────────────────────────────────────────

create table abandoned_carts (
  id             uuid primary key default uuid_generate_v4(),
  email          text not null,
  name           text,
  cart_items     jsonb not null default '[]',
  cart_total     numeric(10,2) not null default 0,
  token          text not null unique default gen_random_uuid()::text,
  email_sent_at  timestamptz,
  recovered_at   timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index abandoned_carts_email_idx    on abandoned_carts (email);
create index abandoned_carts_token_idx    on abandoned_carts (token);
-- Index to speed up the cron query for unsent, unrecovered carts
create index abandoned_carts_pending_idx  on abandoned_carts (created_at)
  where email_sent_at is null and recovered_at is null;

alter table abandoned_carts enable row level security;

-- Admins can read via the is_admin() helper
create policy "Admins can read abandoned carts"
  on abandoned_carts for select
  using (is_admin());

-- All mutations go through the service role (cron, server actions)
-- No customer-facing insert/update policies needed

create trigger abandoned_carts_updated_at
  before update on abandoned_carts
  for each row execute procedure set_updated_at();
