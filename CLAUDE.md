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
  app/           # App Router: layouts, pages, route handlers
  components/
    layout/      # Page-level layout components
    shared/      # Reusable cross-feature components
    ui/          # Low-level UI primitives
  hooks/         # Custom React hooks
  lib/
    supabase/    # Supabase client setup (SSR-aware)
  store/         # Zustand stores
  types/         # Shared TypeScript types
```

Path alias: `@/*` → `src/*`

## Key Conventions

- Supabase SSR helpers (`@supabase/ssr`) must be used for server components and middleware — do not use the browser client in server context.
- Tailwind v4 uses `@import "tailwindcss"` syntax, not the v3 `@tailwind` directives.
- CSS custom properties for theme colors are defined in `src/app/globals.css`; extend there, not in a separate config file.
