-- ─────────────────────────────────────────
-- gift_cards: scheduled delivery
-- delivery_date: day the e-gift card email should be sent (null = send right after payment)
-- sender_email:  email of the person who bought the card
-- email_sent_at: set once the gift card email has been delivered
-- ─────────────────────────────────────────

alter table gift_cards
  add column delivery_date date,
  add column sender_email  text,
  add column email_sent_at timestamptz;

-- Cards that are paid but still waiting for their delivery date
create index gift_cards_due_idx on gift_cards (delivery_date)
  where is_active = true and email_sent_at is null;
