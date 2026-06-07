-- ============================================================
-- Seed data for development
-- Run: npx supabase db seed  (or paste in Supabase SQL Editor)
-- ============================================================

-- ─────────────────────────────────────────
-- Categories
-- ─────────────────────────────────────────
insert into categories (id, name, slug, description, position) values
  ('11111111-0000-0000-0000-000000000001', 'Sunglasses',     'sunglasses',     'Protect your eyes in style',         1),
  ('11111111-0000-0000-0000-000000000002', 'Eyeglasses',     'eyeglasses',     'Prescription frames for every face',  2),
  ('11111111-0000-0000-0000-000000000003', 'Sports',         'sports',         'High-performance sports eyewear',     3),
  ('11111111-0000-0000-0000-000000000004', 'Kids',           'kids',           'Durable frames for children',         4),
  ('11111111-0000-0000-0000-000000000005', 'Blue Light',     'blue-light',     'Screen protection glasses',           5);

-- ─────────────────────────────────────────
-- Products
-- ─────────────────────────────────────────
insert into products (id, name, slug, description, price, compare_at_price, category_id, is_active, is_featured) values
  (
    'aaaaaaaa-0000-0000-0000-000000000001',
    'Classic Aviator',
    'classic-aviator',
    'Timeless aviator sunglasses with UV400 protection and lightweight metal frame. Perfect for everyday wear.',
    149.99, 199.99,
    '11111111-0000-0000-0000-000000000001',
    true, true
  ),
  (
    'aaaaaaaa-0000-0000-0000-000000000002',
    'Urban Wayfarer',
    'urban-wayfarer',
    'Bold acetate frames inspired by mid-century style. Available in multiple colorways.',
    129.99, null,
    '11111111-0000-0000-0000-000000000001',
    true, true
  ),
  (
    'aaaaaaaa-0000-0000-0000-000000000003',
    'Slim Rectangle',
    'slim-rectangle',
    'Minimalist rectangular prescription frames. Ultra-thin profile with spring hinges.',
    189.00, null,
    '11111111-0000-0000-0000-000000000002',
    true, false
  ),
  (
    'aaaaaaaa-0000-0000-0000-000000000004',
    'Sport Shield',
    'sport-shield',
    'Wrap-around shield lens for maximum coverage. Polarized lenses reduce glare on water and snow.',
    219.99, 259.99,
    '11111111-0000-0000-0000-000000000003',
    true, true
  ),
  (
    'aaaaaaaa-0000-0000-0000-000000000005',
    'Round Retro',
    'round-retro',
    'Vintage-inspired round frames with a modern twist. Thin metal construction.',
    109.99, null,
    '11111111-0000-0000-0000-000000000001',
    true, false
  ),
  (
    'aaaaaaaa-0000-0000-0000-000000000006',
    'Blue Shield Pro',
    'blue-shield-pro',
    'Block up to 90% of blue light from screens. Anti-reflective coating included.',
    89.99, null,
    '11111111-0000-0000-0000-000000000005',
    true, false
  );

-- ─────────────────────────────────────────
-- Product Variants
-- ─────────────────────────────────────────
insert into product_variants (product_id, name, sku, price_modifier, stock_quantity, attributes) values
  -- Classic Aviator
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Gold / Green',     'AVI-GLD-GRN', 0,    15, '{"color":"Gold","lens_color":"Green","frame_width":"Medium"}'),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Silver / Grey',    'AVI-SLV-GRY', 0,    10, '{"color":"Silver","lens_color":"Grey","frame_width":"Medium"}'),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Black / Dark Grey','AVI-BLK-DGY', 10,   8,  '{"color":"Black","lens_color":"Dark Grey","frame_width":"Medium"}'),

  -- Urban Wayfarer
  ('aaaaaaaa-0000-0000-0000-000000000002', 'Matte Black',      'WAY-MBK', 0,  20, '{"color":"Matte Black","frame_width":"Large"}'),
  ('aaaaaaaa-0000-0000-0000-000000000002', 'Tortoise',         'WAY-TRT', 0,  18, '{"color":"Tortoise","frame_width":"Large"}'),
  ('aaaaaaaa-0000-0000-0000-000000000002', 'Crystal Clear',    'WAY-CLR', 0,  12, '{"color":"Crystal Clear","frame_width":"Large"}'),

  -- Slim Rectangle
  ('aaaaaaaa-0000-0000-0000-000000000003', 'Black / Size 50',  'REC-BLK-50', 0,   10, '{"color":"Black","size":"50-18-140"}'),
  ('aaaaaaaa-0000-0000-0000-000000000003', 'Gold / Size 50',   'REC-GLD-50', 0,   8,  '{"color":"Gold","size":"50-18-140"}'),
  ('aaaaaaaa-0000-0000-0000-000000000003', 'Black / Size 52',  'REC-BLK-52', 0,   6,  '{"color":"Black","size":"52-18-145"}'),

  -- Sport Shield
  ('aaaaaaaa-0000-0000-0000-000000000004', 'Black / Smoke',    'SPT-BLK-SMK', 0,  15, '{"color":"Black","lens_color":"Smoke","polarized":true}'),
  ('aaaaaaaa-0000-0000-0000-000000000004', 'White / Blue',     'SPT-WHT-BLU', 0,  10, '{"color":"White","lens_color":"Blue Mirror","polarized":true}'),

  -- Round Retro
  ('aaaaaaaa-0000-0000-0000-000000000005', 'Gold / Brown',     'RND-GLD-BRN', 0,  20, '{"color":"Gold","lens_color":"Brown"}'),
  ('aaaaaaaa-0000-0000-0000-000000000005', 'Silver / Blue',    'RND-SLV-BLU', 0,  15, '{"color":"Silver","lens_color":"Blue Mirror"}'),

  -- Blue Shield Pro
  ('aaaaaaaa-0000-0000-0000-000000000006', 'Black',            'BLU-BLK', 0,  30, '{"color":"Black"}'),
  ('aaaaaaaa-0000-0000-0000-000000000006', 'Clear',            'BLU-CLR', 0,  25, '{"color":"Clear"}'),
  ('aaaaaaaa-0000-0000-0000-000000000006', 'Brown',            'BLU-BRN', 0,  20, '{"color":"Brown"}');

-- ─────────────────────────────────────────
-- Note: product_images will use Supabase Storage URLs.
-- After uploading images, insert rows like:
--
-- insert into product_images (product_id, url, alt_text, position, is_primary) values
--   ('aaaaaaaa-...', 'https://<project>.supabase.co/storage/v1/object/public/product-images/classic-aviator-1.jpg', 'Classic Aviator front view', 0, true);
-- ─────────────────────────────────────────
