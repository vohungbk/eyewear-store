-- ============================================================
-- Eyewear Store — Initial Schema
-- Run in Supabase SQL Editor or via: npx supabase db push
-- ============================================================

-- ─────────────────────────────────────────
-- Extensions
-- ─────────────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm"; -- for full-text search on products

-- ─────────────────────────────────────────
-- Enums
-- ─────────────────────────────────────────
create type user_role as enum ('customer', 'admin');
create type order_status as enum (
  'pending',
  'paid',
  'processing',
  'shipped',
  'delivered',
  'cancelled'
);

-- ─────────────────────────────────────────
-- profiles
-- Mirrors auth.users; one row per user.
-- ─────────────────────────────────────────
create table profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  full_name    text,
  avatar_url   text,
  role         user_role not null default 'customer',
  phone        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Auto-create profile when a user signs up
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Auto-update updated_at
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on profiles
  for each row execute procedure set_updated_at();

-- ─────────────────────────────────────────
-- categories
-- ─────────────────────────────────────────
create table categories (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  slug        text not null unique,
  description text,
  image_url   text,
  parent_id   uuid references categories (id) on delete set null,
  position    integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index categories_slug_idx on categories (slug);
create index categories_parent_id_idx on categories (parent_id);

create trigger categories_updated_at
  before update on categories
  for each row execute procedure set_updated_at();

-- ─────────────────────────────────────────
-- products
-- ─────────────────────────────────────────
create table products (
  id               uuid primary key default uuid_generate_v4(),
  name             text not null,
  slug             text not null unique,
  description      text,
  price            numeric(10, 2) not null check (price >= 0),
  compare_at_price numeric(10, 2) check (compare_at_price >= 0),
  category_id      uuid references categories (id) on delete set null,
  is_active        boolean not null default true,
  is_featured      boolean not null default false,
  seo_title        text,
  seo_description  text,
  -- tsvector for full-text search (auto-updated by trigger)
  search_vector    tsvector,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index products_slug_idx      on products (slug);
create index products_category_idx  on products (category_id);
create index products_is_active_idx on products (is_active);
create index products_is_featured_idx on products (is_featured);
create index products_search_idx    on products using gin (search_vector);

-- Keep search_vector in sync
create or replace function update_product_search_vector()
returns trigger language plpgsql as $$
begin
  new.search_vector :=
    setweight(to_tsvector('english', coalesce(new.name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.description, '')), 'B');
  new.updated_at = now();
  return new;
end;
$$;

create trigger products_search_vector_update
  before insert or update on products
  for each row execute procedure update_product_search_vector();

-- ─────────────────────────────────────────
-- product_variants
-- One row per size/color/material combination.
-- ─────────────────────────────────────────
create table product_variants (
  id             uuid primary key default uuid_generate_v4(),
  product_id     uuid not null references products (id) on delete cascade,
  name           text not null,         -- e.g. "Black / Large"
  sku            text unique,
  price_modifier numeric(10, 2) not null default 0,  -- added to product.price
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  -- { color: string, size: string, material: string, frame_width: string }
  attributes    jsonb not null default '{}',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index product_variants_product_id_idx on product_variants (product_id);
create index product_variants_sku_idx        on product_variants (sku);

create trigger product_variants_updated_at
  before update on product_variants
  for each row execute procedure set_updated_at();

-- ─────────────────────────────────────────
-- product_images
-- ─────────────────────────────────────────
create table product_images (
  id         uuid primary key default uuid_generate_v4(),
  product_id uuid not null references products (id) on delete cascade,
  url        text not null,
  alt_text   text,
  position   integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create index product_images_product_id_idx on product_images (product_id);

-- Only one primary image per product
create unique index product_images_one_primary_idx
  on product_images (product_id)
  where is_primary = true;

-- ─────────────────────────────────────────
-- orders
-- ─────────────────────────────────────────
create table orders (
  id                        uuid primary key default uuid_generate_v4(),
  user_id                   uuid references auth.users (id) on delete set null,
  status                    order_status not null default 'pending',
  subtotal                  numeric(10, 2) not null check (subtotal >= 0),
  shipping                  numeric(10, 2) not null default 0 check (shipping >= 0),
  tax                       numeric(10, 2) not null default 0 check (tax >= 0),
  total                     numeric(10, 2) not null check (total >= 0),
  stripe_payment_intent_id  text unique,
  -- { line1, line2, city, state, postal_code, country }
  shipping_address          jsonb not null,
  billing_address           jsonb,
  customer_email            text not null,
  customer_name             text not null,
  notes                     text,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

create index orders_user_id_idx              on orders (user_id);
create index orders_status_idx               on orders (status);
create index orders_stripe_intent_idx        on orders (stripe_payment_intent_id);
create index orders_created_at_idx           on orders (created_at desc);

create trigger orders_updated_at
  before update on orders
  for each row execute procedure set_updated_at();

-- ─────────────────────────────────────────
-- order_items
-- ─────────────────────────────────────────
create table order_items (
  id               uuid primary key default uuid_generate_v4(),
  order_id         uuid not null references orders (id) on delete cascade,
  product_id       uuid references products (id) on delete set null,
  variant_id       uuid references product_variants (id) on delete set null,
  quantity         integer not null check (quantity > 0),
  unit_price       numeric(10, 2) not null check (unit_price >= 0),
  -- Snapshot of product name/image at time of purchase (survives product edits)
  product_snapshot jsonb not null,
  created_at       timestamptz not null default now()
);

create index order_items_order_id_idx on order_items (order_id);

-- ─────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────
alter table profiles         enable row level security;
alter table categories       enable row level security;
alter table products         enable row level security;
alter table product_variants enable row level security;
alter table product_images   enable row level security;
alter table orders           enable row level security;
alter table order_items      enable row level security;

-- Helper: check if current user is admin
create or replace function is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ── profiles ──
create policy "Users can view their own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update using (auth.uid() = id);

create policy "Admins can view all profiles"
  on profiles for select using (is_admin());

-- ── categories (public read, admin write) ──
create policy "Anyone can view categories"
  on categories for select using (true);

create policy "Admins can manage categories"
  on categories for all using (is_admin());

-- ── products (public read active, admin write) ──
create policy "Anyone can view active products"
  on products for select using (is_active = true);

create policy "Admins can manage all products"
  on products for all using (is_admin());

-- ── product_variants (public read, admin write) ──
create policy "Anyone can view variants of active products"
  on product_variants for select
  using (
    exists (
      select 1 from products
      where id = product_variants.product_id and is_active = true
    )
  );

create policy "Admins can manage variants"
  on product_variants for all using (is_admin());

-- ── product_images (public read, admin write) ──
create policy "Anyone can view images of active products"
  on product_images for select
  using (
    exists (
      select 1 from products
      where id = product_images.product_id and is_active = true
    )
  );

create policy "Admins can manage images"
  on product_images for all using (is_admin());

-- ── orders ──
create policy "Users can view their own orders"
  on orders for select using (auth.uid() = user_id);

create policy "Users can insert their own orders"
  on orders for insert with check (auth.uid() = user_id or user_id is null);

create policy "Admins can manage all orders"
  on orders for all using (is_admin());

-- ── order_items ──
create policy "Users can view their own order items"
  on order_items for select
  using (
    exists (
      select 1 from orders
      where id = order_items.order_id
        and (orders.user_id = auth.uid() or is_admin())
    )
  );

create policy "Admins can manage all order items"
  on order_items for all using (is_admin());

-- ─────────────────────────────────────────
-- Storage Buckets
-- Run this after schema migration
-- ─────────────────────────────────────────
insert into storage.buckets (id, name, public)
  values ('product-images', 'product-images', true)
  on conflict (id) do nothing;

create policy "Anyone can view product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "Admins can upload product images"
  on storage.objects for insert
  with check (bucket_id = 'product-images' and is_admin());

create policy "Admins can delete product images"
  on storage.objects for delete
  using (bucket_id = 'product-images' and is_admin());

create policy "Admins can update product images"
  on storage.objects for update
  using (bucket_id = 'product-images' and is_admin());
