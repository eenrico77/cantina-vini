# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

"Cantina Vini" — a mobile-first web app for wine enthusiasts to manage their cellar. Three pillars: add wines from a label photo (Gemini AI), per-vintage maturation windows, and food–wine pairing restricted to bottles the user actually owns (`quantity > 0`). Also diary of tastings, stats, wishlist. UI copy, code comments, commit messages, and planning docs are in **Italian** — keep it that way.

Key docs in the repo root (read them before larger changes):
- `ROADMAP.md` — the living plan: phases, decisions taken (with dates), open items, migrations still to run in production. Update it when finishing a roadmap item.
- `PRODUCT.md` — users, purpose, operating context (one hand, phone, low light).
- `DESIGN.md` — binding visual rules (palette tokens, typography classes, button/card recipes). New or modified components must follow it.

## Commands

```bash
npm run dev     # local dev server on :3000
npm run build   # production build (the only "check" available — also catches type errors)
npm run start
```

There is no test suite and no `lint` script (`eslint.config.mjs` exists but `eslint`/`eslint-config-next` are not installed). TypeScript runs with `strict: false`; `.js/.jsx` and `.ts/.tsx` files coexist.

Required env vars (`.env.local`): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `GEMINI_API_KEY`.

## Deploy

Pushing to `main` on GitHub auto-deploys to Vercel. Database schema changes are **not** automatic: they live as numbered SQL files in `supabase/migrations/` and are run manually in the Supabase SQL editor. When adding a migration, use the next number and note in `ROADMAP.md` that it must be run in production.

## Architecture

**Stack**: Next.js 14 App Router (React 18), Supabase (Postgres + Auth + Storage via `@supabase/ssr`), Tailwind 3, Gemini via `@google/genai`, `lucide-react` icons. Path alias `@/*` → repo root.

**Supabase clients** — two, use the right one:
- Server (Server Components, Server Actions, route handlers): `createClient()` from `lib/supabase/server.ts` (cookie-based).
- Browser: `createClient()` from `app/utils/supabase/client.js`.
- `middleware.js` refreshes the session and exchanges the `?code=` from email links (magic link/reset) for a session. The redirect-to-`/login` guard is currently **commented out for local testing** — re-enable before release.

**Data model** (`types.ts`): `Wine` is the conceptual wine (shared across vintages: producer, region, AI-enriched fields like `taste_profile`, `organoleptic`, `flavor_notes`, `food_pairings`, `image_url`). `Bottle` is what the user owns: `year`, `quantity`, prices, `peak_start/peak_end/aging_status`, `tags`, joined to its wine. Maturation is **per bottle/vintage**, not per wine — see `lib/domain/maturation.ts` (`getAgingStatus`, labels, badge colors). Each user has a default cellar created lazily by `lib/supabase/getOrCreateDefaultCellar.ts`. Supabase rows with joined `wines` are normalized through `lib/adapters/bottleAdapter.ts` (`mapBottleFromDB`). RLS is enabled on the core tables (migrations 0004, 0012) — queries rely on `user_id` filtering plus RLS.

**Mutations** are Server Actions colocated with routes (`app/actions.ts`, `app/cantina/new/actions.ts`, `app/cantina/[id]/actions.ts`, `app/wishlist/actions.ts`). `next.config.js` raises the Server Action body limit to 10mb because phone label photos exceed the 1MB default.

**Add-wine flow** (`/cantina/new`): photo → `analyzeWineLabel` (Gemini structured JSON output, schema in `lib/ai/enrichWine.ts`; throws a user-facing error if `recognized === false`) → pre-filled editable form → `createWine` writes `wines` + `bottles` → representative image generated afterwards in the background with `waitUntil` from `@vercel/functions` (`generateProfessionalWineImage`). `flavor_notes` must come from the closed key list defined in the schema (they map to images in `public/Flavors/`).

**AI** — all Gemini calls live in `lib/ai/enrichWine.ts` (label analysis, image generation, `getFoodPairingFull` for pairing against the inventory, `generateWineFoodPairings` per wine). Model IDs are chosen there.

**Mock fallback**: several pages and `getFoodPairingFullAction` fall back to `lib/mockData.ts` (`MOCK_BOTTLES`) when Supabase/auth is unavailable or returns nothing, to allow local testing without a session. Keep this in mind when debugging "data looks wrong" — you may be seeing mocks.

**Styling**: Tailwind with custom tokens (`brand-*`, `sand-*`, `ink-*`, `status-*`, `shadow-soft`) defined in the Tailwind config; `status-*` colors are reserved for maturation state. `app/layout.tsx` imports `app/globals.css`. Note there are duplicate copies — root `globals.css` alongside `app/globals.css`, and `tailwind.config.js` alongside `tailwind.config.cjs` (Tailwind picks up `tailwind.config.js` first). When changing styles/tokens, keep the duplicates in sync or consolidate them.
