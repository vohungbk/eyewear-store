-- ─────────────────────────────────────────
-- bundles & bundle_items
-- ─────────────────────────────────────────

create table bundles (
  id               uuid primary key default uuid_generate_v4(),
  name             text not null,
  description      text,
  discount_type    text not null default 'percent' check (discount_type in ('percent', 'fixed')),
  discount_value   numeric(10, 2) not null default 0 check (discount_value >= 0),
  is_active        boolean not null default true,
  created_at       timestamptz not null default now()
);

create table bundle_items (
  id          uuid primary key default uuid_generate_v4(),
  bundle_id   uuid not null references bundles (id) on delete cascade,
  product_id  uuid not null references products (id) on delete cascade,
  quantity    integer not null default 1 check (quantity > 0),
  position    integer not null default 0,
  unique (bundle_id, product_id)
);

create index bundle_items_bundle_id_idx  on bundle_items (bundle_id);
create index bundle_items_product_id_idx on bundle_items (product_id);

-- RLS
alter table bundles      enable row level security;
alter table bundle_items enable row level security;

create policy "public_read_active_bundles"
  on bundles for select using (is_active = true);

create policy "public_read_bundle_items"
  on bundle_items for select using (true);

create policy "admin_all_bundles"
  on bundles for all using (is_admin());

create policy "admin_all_bundle_items"
  on bundle_items for all using (is_admin());
