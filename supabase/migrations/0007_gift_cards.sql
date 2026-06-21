-- ─────────────────────────────────────────
-- gift_cards
-- Stores issued gift cards with balance tracking.
-- ─────────────────────────────────────────

create table gift_cards (
  id                        uuid primary key default uuid_generate_v4(),
  code                      text not null unique,
  initial_value             numeric(10,2) not null check (initial_value > 0),
  balance                   numeric(10,2) not null check (balance >= 0),
  recipient_email           text not null,
  recipient_name            text,
  sender_name               text,
  message                   text,
  stripe_payment_intent_id  text,                  -- null when issued manually
  is_active                 boolean not null default false,  -- activated after payment
  expires_at                timestamptz,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

create index gift_cards_code_idx     on gift_cards (upper(code));
create index gift_cards_email_idx    on gift_cards (recipient_email);
create index gift_cards_active_idx   on gift_cards (is_active, balance);
create index gift_cards_pi_idx       on gift_cards (stripe_payment_intent_id)
  where stripe_payment_intent_id is not null;

alter table gift_cards enable row level security;

create policy "Admins can manage gift cards"
  on gift_cards for all using (is_admin());

create trigger gift_cards_updated_at
  before update on gift_cards
  for each row execute procedure set_updated_at();

-- ─────────────────────────────────────────
-- gift_card_redemptions
-- Audit trail for every balance deduction.
-- ─────────────────────────────────────────

create table gift_card_redemptions (
  id            uuid primary key default uuid_generate_v4(),
  gift_card_id  uuid not null references gift_cards (id) on delete cascade,
  order_id      uuid references orders (id) on delete set null,
  amount        numeric(10,2) not null check (amount > 0),
  created_at    timestamptz not null default now()
);

create index gift_card_redemptions_card_idx  on gift_card_redemptions (gift_card_id);
create index gift_card_redemptions_order_idx on gift_card_redemptions (order_id);

alter table gift_card_redemptions enable row level security;

create policy "Admins can view redemptions"
  on gift_card_redemptions for select using (is_admin());

-- ─────────────────────────────────────────
-- Track gift card usage on orders
-- ─────────────────────────────────────────

alter table orders
  add column gift_card_code   text,
  add column gift_card_credit numeric(10,2) not null default 0 check (gift_card_credit >= 0);
