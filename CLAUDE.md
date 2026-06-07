# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

## Commands

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

No test runner is configured.

## Stack

- **Next.js 16** — App Router (`src/app/`), React 19, TypeScript 5
- **Styling** — Tailwind CSS v4 (`@import "tailwindcss"` in globals.css), Prettier with tailwindcss plugin for class sorting
- **Backend** — Supabase (`@supabase/supabase-js` + `@supabase/ssr`) via `src/lib/supabase/`
- **Payments** — Stripe (`stripe` + `@stripe/stripe-js`)
- **Email** — Resend
- **Forms** — React Hook Form + Zod + `@hookform/resolvers`
- **State** — Zustand (`src/store/`)

## Architecture

```
src/
  app/
    (store)/      # Public store pages (Header + Footer layout)
    (auth)/       # Login, register, account pages
    (admin)/      # Admin dashboard (role-gated)
    api/          # Route handlers (Stripe webhook, etc.)
  components/
    layout/       # Header, Footer, CartDrawer
    ui/           # Reusable UI primitives (ProductCard, etc.)
  lib/
    data/         # Cached data-fetching functions (products, categories)
    supabase/     # server.ts, client.ts — Supabase SSR clients
    utils/        # format.ts and other pure helpers
  store/          # Zustand stores (cartStore.ts)
  types/          # database.ts, cart.ts, checkout.ts
supabase/
  migrations/     # SQL schema (0001_initial_schema.sql)
  seed.sql        # Dev seed data
```

Path alias: `@/*` → `src/*`

## Next.js 16 Breaking Changes (confirmed in this codebase)

**`params` and `searchParams` are Promises — always await them:**
```tsx
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ sort?: string }>
}) {
  const { slug } = await params
  const { sort } = await searchParams
}
```

**Caching is opt-in with `'use cache'` directive** (`cacheComponents: true` is set in `next.config.ts`). Fetch calls are NOT cached by default:
```ts
import { cacheLife, cacheTag } from 'next/cache'

export async function getProducts() {
  'use cache'
  cacheLife('minutes')   // 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'max'
  cacheTag('products')   // for revalidateTag() invalidation
  // ...
}
```

**`generateMetadata` also receives params as a Promise:**
```tsx
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
}
```

## Supabase Patterns

**Server components / Route Handlers / Server Actions** — use `createClient()` from `src/lib/supabase/server.ts` (awaits `cookies()`):
```ts
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser() // never getSession() for auth
```

**Cached data functions** (public product/category data) — use a stateless client with empty cookies so the function result is safely cacheable:
```ts
// src/lib/data/products.ts pattern
function publicClient() {
  return createServerClient(url, anonKey, { cookies: { getAll: () => [], setAll: () => {} } })
}
```

**Browser / Client Components** — use `createClient()` from `src/lib/supabase/client.ts`.

**Middleware** — `src/middleware.ts` calls `supabase.auth.getUser()` on every request to refresh the session token. The `setAll` cookie handler writes the refreshed token back to the response.

## Key Conventions

- Tailwind v4 uses `@import "tailwindcss"` syntax — no `tailwind.config.ts`, no `@tailwind` directives.
- CSS custom properties for theme colors live in `src/app/globals.css`.
- Cart state is client-side Zustand with `persist` middleware (localStorage key: `eyewear-cart`).
- Admin role is checked via the `is_admin()` Postgres function (reads `profiles.role`). Never trust client-side role checks for data access — RLS policies enforce this server-side.
- `revalidateTag('products')` invalidates all product list caches; `revalidateTag('product-{slug}')` invalidates a single product. Call these from Server Actions after admin mutations.
