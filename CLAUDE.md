# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Marketing site + games-catalog admin for **Ninja Sasquatch Games**, a Québec board-game company. Bilingual FR/EN, French by default — **the language is carried by the URL** (`/fr`, `/en`). The home page is the public one-page marketing site; each game has a **shareable public route** (`/fr/jeux/:slug`, `/en/games/:slug`); `/admin` is a login-protected space where the admin creates/edits the games (photos, bilingual copy, gameplay/campaign/media metadata) served to the public site.

Stack: **React 19** + **Vite 7** + **TypeScript** (strict), **react-router-dom** (localized routes: `/` → `/fr`, `/fr`/`/en` home, `/fr/jeux/:slug` · `/en/games/:slug` game pages, `/admin`, and a real 404), **Tailwind CSS v4** (`@tailwindcss/vite`) for styling, **Supabase** (`@supabase/supabase-js` — Auth, Postgres with RLS, Storage) as the backend, `lucide-react` for icons. No state-management library. *(Router + backend added by user decision of 2026-07-08 — Sprint 5, D14. TypeScript strict + Tailwind v4 — Sprint 7. Localized routes, shareable game pages, product data model + `game_media` — Sprint 9.)*

## Commands

```bash
npm run dev         # Vite dev server with HMR
npm run build       # production build to dist/
npm run preview     # serve the built dist/ locally
npm run lint        # ESLint over the repo
npm run typecheck   # tsc --noEmit (TypeScript strict)
npm test            # Vitest, single run
npm run test:watch  # Vitest in watch mode
```

Tests run on **Vitest + Testing Library** (jsdom environment, configured in the `test` block of `vite.config.ts`, setup in `src/__tests__/setup.ts`). Test files live in `src/__tests__/*.test.{ts,tsx}` and import `describe/it/expect` explicitly from `vitest` (no injected globals — keeps ESLint's `no-undef` happy without config changes). The suite locks the repo's byte-exact contracts (i18n key parity, category IDs, nav anchors) — see "Testing conventions". UI changes should still be eyeballed with `npm run dev`.

## Architecture

Entry: `src/main.tsx` mounts `<BrowserRouter><LanguageProvider><ErrorBoundary><AppRoutes/></ErrorBoundary></LanguageProvider></BrowserRouter>` in `StrictMode`, and imports `src/styles/global.css` once (so every route inherits the Tailwind base). `src/AppRoutes.tsx` declares the **localized routes**: `/` → redirect to `/fr`; `/fr` and `/en` → `HomePage lang=…`; `/fr/jeux/:slug` and `/en/games/:slug` → `GamePage lang=…`; `/admin` → `AdminPage` in `React.lazy` behind a `<Suspense>` whose fallback is a visible i18n loading state (`admin.loading`); `*` → **a real `NotFoundPage` (404)** — no more silent redirect to home. Pages live under `src/pages/{HomePage,GamePage,NotFoundPage}/`. `src/App.tsx` is the marketing page body (composes `Header` + `Footer` around `Hero`, `GamesSection`, `AboutSection`, `ContactSection`); `HomePage` renders `<App/>` after syncing the language to the URL. `App` and its sections now use router primitives (`Link`), so their tests render them inside a `MemoryRouter`.

**Language is URL-driven.** `LanguageProvider` holds `lang` state and exposes `{ lang, t, toggleLang, setLang }`. Each localized page calls `useSyncLang(lang)` (`src/i18n/useSyncLang.ts`) to reconcile the provider with the route. The FR/EN button is `LanguageToggle` (`src/components/layout/LanguageToggle/`): it **navigates to the equivalent route in the other language, keeping the slug** (`otherLangPath` in `src/utils/routes.ts`; `gamePath`/`gamesSegment` build the localized `/fr/jeux/…` vs `/en/games/…` paths — the games segment differs by language, the slug is shared).

**Error boundary.** `src/components/ErrorBoundary/` (class `ErrorBoundary.tsx` + functional `ErrorFallback.tsx` split for `react-refresh`) wraps `AppRoutes` inside `LanguageProvider` so the fallback reads `t("errors.boundary.*")`. It catches render exceptions (no more white screen) and logs to `console.error`. Known limit: the import-time throw in `lib/supabase.ts` when env is missing precedes React mount — an intentional fail-fast, locked by `supabase-client.test.ts`.

**Within `/`, navigation is scroll-based.** `App.tsx` defines `scrollToSection(id)` and passes it as `onNavigate` to `Header` and `Hero`. Buttons call it with section anchor IDs: `accueil`, `jeux`, `univers`, `contact`. These IDs are the contract between nav buttons and the `<section id="...">` targets — keep them in sync. `vercel.json` carries the SPA rewrite that makes `/admin` deep-linkable in production.

**Supabase.** `src/lib/supabase.ts` is the single client (typed `createClient<Database>` — the `Database` type is hand-written in `src/types/database.ts`, mirroring the traced migrations; swap-in target for a future `supabase gen types`. `GameRow`/`GameInsert`/`GameUpdate` and the `GameCategory`/`CatalogCategoryId` unions are exported from there; created from `import.meta.env.VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`, explicit error if missing; values live in `.env.local` — gitignored — and in Vercel env vars, never in the repo). `supabase/migrations/` holds the traced copy of every migration applied to the project (`ninja-sasquatch-games`, ref `vgmqmifgdolccquyjcoc`): tables `games` (flat bilingual columns `*_fr`/`*_en`, `category` CHECK mirroring the frontend category IDs byte-for-byte, `published`, plus the Sprint-9 **product model**: `slug` unique, `tagline_*`, `players_min/max`, `duration_min/max`, `minimum_age`, `complexity`, `mechanics[]`, `game_languages[]`, `theme_key` CHECK ∈ {brand, heroes-rising, burgle-jack, flickle-mania}, `campaign_status` CHECK ∈ {none, coming-soon, live, completed}, `kickstarter_url`, `rules_pdf_fr/en`, `featured_order`, `coming_soon` — all additive/nullable-or-safe-default so existing rows survive; the legacy text columns `players`/`duration`/`age` remain NOT NULL and are **derived** from the structured fields by the admin form), `game_media` (gallery/PDF rows: `game_id` FK `on delete cascade`, `storage_path`, `media_type`, `alt_*`, `sort_order`), and `profiles` (role `admin`/`client`, signup trigger); function `is_admin()`; RLS (anon reads published games — and media of published games — only; writes require the admin role — **the RLS is the security boundary, frontend guards are UX only**); the public `game-images` Storage bucket (5 MiB, jpeg/png/webp, admin-only writes). `theme_key` is a **controlled key** (e.g. `heroes-rising`), never a Tailwind class or hex. Migrations are additive and backward-compatible; RLS is proven under the `anon` role and an admin JWT before tracing.

**Auth.** `src/auth/` mirrors the `src/i18n/` three-file split (`context.ts`, `AuthProvider.tsx`, `useAuth.ts`). `AuthProvider` is mounted inside `AdminPage` only — the public site makes no auth calls. It exposes `{ session, role, loading, signIn, signOut }`; `role` is read from `profiles` (never writable from the client).

**Admin.** Components live in `src/components/admin/<Name>/` (same two-file pattern): `AdminPage` (h1 + sign-out + guard), `RequireAdmin` (anonymous → `LoginForm`, non-admin → refusal, admin → children), `GamesManager` (list, edit/delete with inline confirmation). `GameForm/` is **split into field groups** (create/edit for the full product model): `BasicInformationFields` (slug, bilingual titles/taglines/summaries/descriptions, category), `GameplayFields` (players/duration ranges, age, complexity, mechanics, languages, eco), `CampaignFields` (Kickstarter status/URL, coming-soon), `MediaFields` (photo upload, rules-PDF paths), `PublishingFields` (theme key, featured order, published), plus non-component modules `gameFormTypes.ts` (form state, `valuesFromGame`, `buildGamePayload` — derives the legacy `players`/`duration`/`age` text from the structured fields) and `gameFormValidation.ts` (pure client validation → i18n error keys: parity/required, slug shape, positive ints, players/duration ranges, Kickstarter URL). Client validation mirrors the DB but **the base is the final authority**.

**Image lifecycle (no orphans).** The Storage path is recoverable from the stored public URL (`imagePathFromPublicUrl`, `src/utils/storagePath.ts`), so no extra column is needed. On save: upload → build payload → insert/update; if the SQL write fails after an upload, the just-uploaded file is **removed (rollback)**; on a successful *replace*, the old file is removed **only after** the update succeeds; deleting a game removes its main photo and `game_media` files (paths gathered before the row cascade). Compensating-cleanup failures surface a clear i18n error rather than being hidden. Client-side compensation was chosen over an Edge Function (admin-only, low-concurrency writes; simple and testable).

**Component layout.** Most components live in their own folder under `src/components/{layout,sections,admin}/<Name>/` with two files:
- `<Name>.tsx` — the component (default export), typed props via an inline interface
- `index.ts` — a barrel: `export { default } from "./<Name>";`

Route-level pages follow the same folder+barrel pattern under `src/pages/<Name>/`. Two cohesive component sets are kept as **flat files in a shared folder** (default-exported, imported directly): the game-fiche sections in `src/components/game/` and the `GameForm/` field groups — both are tightly-coupled families of one feature, so a folder-per-file split would add noise without value.

Styling is Tailwind utility classes in the JSX `className` — there is no per-component stylesheet. Import components by folder (`import Header from "./components/layout/Header"`), which resolves through the barrel. Follow this exact pattern when adding components. Don't add `import React from "react"` — the automatic JSX transform makes it unnecessary. Use `import type` for type-only imports (`verbatimModuleSyntax` is on).

**i18n.** `src/i18n/` holds files deliberately split so the `react-refresh/only-export-components` lint rule stays happy: `context.ts` (the context object + the `Lang`/`LanguageContextValue` types), `LanguageProvider.tsx` (state + `t()` + `toggleLang` + `setLang`, syncs `document.documentElement.lang`), `useLanguage.ts` (the hook), and `useSyncLang.ts` (reconciles the provider language with the URL-carried language on each localized page). All user-visible strings live in `src/data/translations/{fr,en}.json` (same key structure in both files) and are looked up with `t("dot.path.key")` — `t` returns the key itself when a lookup misses, so a raw key showing in the UI means a missing/typo'd translation. The FR/EN toggle button is in `Header` (desktop nav and mobile menu). Default language is `"fr"`; `index.html` also declares `lang="fr"`.

**Games feature.** `GamesSection` reads the games through `src/hooks/useGames.ts` (fetch on mount; the RLS serves anonymous visitors only the published games — the client filters nothing) and renders four states: loading / error / clean empty state (`games.empty`) / grid. It holds only `selectedCategory` (defaults to `"tous"`); **each `GameCard` is a real `Link`** to the game's shareable route (`gamePath(lang, slug)`) — no more `selectedGame` state, no `div role="button"`, no inline detail view. `GameCard` resolves copy with `localizeGame(game, lang)` (`src/utils/localizeGame.ts`, pure); `image_url` is nullable (no `<img>` without it).

**Game page.** `GamePage` (`src/pages/GamePage/`) reads the slug from the route and, remounted per slug via a `key` (clean loading state), loads the game with `src/hooks/useGameBySlug.ts` (loading / Supabase error / network reject / `notFound` → renders `NotFoundPage` / unmount-safe; "published only" enforced by RLS) plus its `game_media`. The fiche is composed of **reusable sections that receive Supabase data — no game is hardcoded**: `src/components/game/{GameHero, GameBadges, NarrativeSummary, HowToPlay, GameGallery, RulesDownload, KickstarterCallToAction, FullRulesAccordion, RelatedGames}`. Empty data hides its section (no mechanics → no HowToPlay, etc.). `RulesDownload` renders a real `<a download>` announcing the PDF format, or a translated "coming soon" when the path is empty (no dead links; real PDFs go under `public/rules/`, never committed as fakes).

**Data layer.** Games live in the Supabase `games` table (`title_fr/title_en`, `short_desc_*`, `full_desc_*`, `category`, `image_url`, `players`, `duration`, `age`, `eco`, `published`) and are managed through `/admin`. `src/data/games.ts` now exports only `categories` (typed `ReadonlyArray<{ id: CatalogCategoryId }>`). The four category IDs are `tous`, `famille`, `stratégie`, `party` — accented values are significant: filtering, translation lookups (`games.categories.<id>`) **and the DB CHECK constraint** match these exact strings byte-for-byte (`tous` is a pseudo-filter, never stored on a game). `src/data/site.js` exports `CONTACT_EMAIL`.

**Testing convention (Supabase).** Tests never touch the network: every test whose render reaches the Supabase client mocks it with `vi.mock("../lib/supabase", …)` backed by `src/__tests__/helpers/supabaseMock.ts` (chainable thenable builders, auth listeners, storage stubs, `__*` control methods; a `{ reject }` table result simulates a network failure). The mock exports a `SupabaseMock` type; tests that hand it to typed code cast once (`as unknown as SupabaseMock`). Games for UI tests come from `src/__tests__/fixtures/games.ts` (typed `GameRow` tuple). The real client module is never executed under test, so no env vars are needed in CI.

**Contact form.** `ContactSection` is a controlled form with client-side validation; `errors` state stores i18n *keys* (not translated strings) so messages re-render in the current language. Submit builds a `mailto:` URL to `CONTACT_EMAIL`. The `<form>` has `noValidate` on purpose — native `type="email"` validation would short-circuit the custom messages.

**Icons.** Pulled from `lucide-react` as named imports (e.g. `Menu`/`X` in `Header`, `Leaf` in `About`/`Footer`/`GameCard`, `Users`/`Clock`/`Star` in the Games components, `Instagram`/`Facebook`/`Mail` in `Contact`).

## Styling

**Tailwind CSS v4** utility classes in the JSX, plus one entry stylesheet `src/styles/global.css` (imported once in `main.tsx`) that does `@import "tailwindcss"`, declares the brand palette in an `@theme` block, and re-adds the few base rules the preflight doesn't cover (`@layer base`: `scroll-behavior` + `prefers-reduced-motion`, the body font stack + `line-height`, Poppins on headings). No per-component stylesheet.

The brand palette lives once, in the `@theme` block of `global.css` — each token generates utilities **and** stays available as `var(--color-*)`. Always use the utility (or the var inside an arbitrary value), **never a raw hex** outside `@theme`:
- `--color-cream` `#ffffe9` → `bg-cream` (background)
- `--color-dark-green` `#142d17` → `text-dark-green` (body text)
- `--color-brown` `#9b5824` → `text-brown` (headings)
- `--color-eco-green` `#077e16` → `bg-eco-green`/`text-eco-green` (accents, CTAs, eco badge, success text)
- `--color-error` `#b3261e` → `text-error` (form errors)

Palette-derived tints use opacity modifiers (`bg-brown/5`, `bg-eco-green/10`); non-token values (shadows, exact sizes) use arbitrary-value classes (`shadow-[…]`, `max-w-[60rem]`, `text-[2.5rem]`) — the raw value is allowed **only inside the brackets**. Headings get **Poppins** from `@layer base` (token `--font-heading`, loaded via `<link>` in `index.html`); add `font-heading` only on a non-heading element. Default Tailwind breakpoints match the old modules byte-for-byte: `sm:` 640px, `md:` 768px, `lg:` 1024px. Interactive elements carry a `focus-visible:` ring and animated ones a `motion-reduce:` variant.

## Lint & types convention

ESLint flat config (`eslint.config.js`): a `**/*.{ts,tsx}` block extends `typescript-eslint` recommended (not type-checked — `tsc` gates that separately) + `react-hooks` + `react-refresh` + `jsx-a11y`, with `@typescript-eslint/no-unused-vars` set to error but ignoring names matching `^[A-Z_]` (SCREAMING_CASE constants). A minimal `**/*.{js,jsx}` block remains only for the root JS config files. `react-refresh/only-export-components` is active: component files export only components (this is why `src/i18n/`, `src/auth/`, and `ErrorBoundary` split their non-component exports into separate files). **TypeScript is strict** (`tsconfig.json`: `strict`, `noUncheckedIndexedAccess`, `verbatimModuleSyntax`, `isolatedModules`); `npm run typecheck` (`tsc --noEmit`) must be clean and is a CI step and a DoD gate.

## Sprint workflow

Development runs as a disciplined sprint loop, in French, driven by two reusable prompts:

- `prompt-executer-sprint.md` — executes the **current sprint** defined in `ROADMAP.md`: verify the green baseline first, then per item: red test → minimal fix → green suite → one atomic commit.
- `prompt-mise-a-jour-roadmap.md` — closes the sprint: check off items with commit hashes, record discoveries (`D<n>` with 🔴🟠🟡🟢 severity), write the changelog block and the 4-question retrospective, update the dashboard scores, define the next sprint.

`ROADMAP.md` is the **workflow source of truth**: dashboard (scores /100, current sprint, test count), Phase-0 audit, sprint definitions with file:line references and acceptance criteria, discovery register, changelog, retrospectives. The test count lives ONLY in the ROADMAP dashboard ("État des tests", recalibrated from the real `npm test` output every sprint) — other docs reference it, never carry their own number. Items marked « Décision requise » are blocked until the user answers.

## Règles de gouvernance (OVERRIDE everything else)

- **Do not modify `prompt-executer-sprint.md`, `prompt-mise-a-jour-roadmap.md`, or any DoD wording on your own.** Propose the diff and wait for an explicit user decision — the process must not be able to rewrite its own guardrails. An accepted amendment lands in a dedicated commit citing the decision.
- **Never invent brand content to close an item.** Real product photos (D3), the official contact email (D7), social links, and any brand copy are « Décisions requises » — they stay tracked as discoveries until the user provides or validates the content (decision recorded in the ROADMAP changelog).
- **Secrets never live in code or commits.**

## Documentation map

- `README.md` — overview + developer quickstart.
- `ROADMAP.md` — the workflow source of truth: sprints, discoveries (`D<n>`), test-state, changelog, retrospectives.
- `prompt-executer-sprint.md` / `prompt-mise-a-jour-roadmap.md` — the two workflow prompts (governed, see above).
- `CLAUDE.md` — this file: code rules and conventions.
