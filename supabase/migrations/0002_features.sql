-- ============================================================
-- Eyewear Store — Feature Migration: Discounts, Wishlists, Reviews
-- ============================================================

-- ─────────────────────────────────────────
-- discount_codes
-- ─────────────────────────────────────────
create table discount_codes (
  id           uuid primary key default uuid_generate_v4(),
  code         text not null unique,
  -- 'percent' = percentage off subtotal, 'fixed' = fixed amount off
  type         text not null check (type in ('percent', 'fixed')),
  value        numeric(10, 2) not null check (value > 0),
  min_order    numeric(10, 2) not null default 0 check (min_order >= 0),
  usage_limit  integer check (usage_limit > 0), -- null = unlimited
  usage_count  integer not null default 0 check (usage_count >= 0),
  is_active    boolean not null default true,
  expires_at   timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index discount_codes_code_idx on discount_codes (upper(code));

create trigger discount_codes_updated_at
  before update on discount_codes
  for each row execute procedure set_updated_at();

-- Add discount tracking columns to orders
alter table orders
  add column discount      numeric(10, 2) not null default 0 check (discount >= 0),
  add column discount_code text;

-- ─────────────────────────────────────────
-- wishlists
-- ─────────────────────────────────────────
create table wishlists (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  product_id  uuid not null references products (id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (user_id, product_id)
);

create index wishlists_user_id_idx    on wishlists (user_id);
create index wishlists_product_id_idx on wishlists (product_id);

-- ─────────────────────────────────────────
-- reviews
-- ─────────────────────────────────────────
create table reviews (
  id          uuid primary key default uuid_generate_v4(),
  product_id  uuid not null references products (id) on delete cascade,
  user_id     uuid not null references auth.users (id) on delete cascade,
  rating      integer not null check (rating between 1 and 5),
  title       text,
  body        text,
  is_approved boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, product_id) -- one review per user per product
);

create index reviews_product_id_idx on reviews (product_id);
create index reviews_user_id_idx    on reviews (user_id);
create index reviews_is_approved_idx on reviews (is_approved);

create trigger reviews_updated_at
  before update on reviews
  for each row execute procedure set_updated_at();

-- ─────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────
alter table discount_codes enable row level security;
alter table wishlists      enable row level security;
alter table reviews        enable row level security;

-- discount_codes: admins only
create policy "Admins can manage discount codes"
  on discount_codes for all using (is_admin());

-- wishlists: each user manages their own
create policy "Users can manage their own wishlist"
  on wishlists for all using (auth.uid() = user_id);

-- reviews: public read of approved only; users write/edit their own; admins full access
create policy "Anyone can view approved reviews"
  on reviews for select using (is_approved = true);

create policy "Users can insert their own review"
  on reviews for insert with check (auth.uid() = user_id);

create policy "Users can update their own review"
  on reviews for update using (auth.uid() = user_id);

create policy "Admins can manage all reviews"
  on reviews for all using (is_admin());
