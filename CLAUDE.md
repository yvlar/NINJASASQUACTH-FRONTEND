# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Marketing site + games-catalog admin for **Ninja Sasquatch Games**, a Québec board-game company. Bilingual FR/EN, French by default. `/` is the public one-page site; `/admin` is a login-protected space where the admin creates/edits the games (photos, bilingual descriptions) served to the public site.

Stack: **React 19** + **Vite 7**, **react-router-dom** (two routes: `/` and `/admin`), **Supabase** (`@supabase/supabase-js` — Auth, Postgres with RLS, Storage) as the backend, `lucide-react` for icons. No state-management library, no CSS framework, no TypeScript. *(Router + backend added by user decision of 2026-07-08 — Sprint 5, D14.)*

## Commands

```bash
npm run dev         # Vite dev server with HMR
npm run build       # production build to dist/
npm run preview     # serve the built dist/ locally
npm run lint        # ESLint over the repo
npm test            # Vitest, single run
npm run test:watch  # Vitest in watch mode
```

Tests run on **Vitest + Testing Library** (jsdom environment, configured in the `test` block of `vite.config.js`, setup in `src/__tests__/setup.js`). Test files live in `src/__tests__/*.test.{js,jsx}` and import `describe/it/expect` explicitly from `vitest` (no injected globals — keeps ESLint's `no-undef` happy without config changes). The suite locks the repo's byte-exact contracts (i18n key parity, category IDs, nav anchors) — see "Testing conventions". UI changes should still be eyeballed with `npm run dev`.

## Architecture

Entry: `src/main.jsx` mounts `<BrowserRouter><LanguageProvider><AppRoutes/></LanguageProvider></BrowserRouter>` in `StrictMode`. `src/AppRoutes.jsx` declares the routes: `/` → `App` (the public site), `/admin` → `AdminPage` in `React.lazy` (the visitor never downloads the admin bundle), `*` → redirect to `/`. `src/App.jsx` is the whole public page — it composes `Header` + `Footer` (layout) around `Hero`, `GamesSection`, `AboutSection`, `ContactSection` and uses **no router hook** (its tests render it without a router).

**Within `/`, navigation is scroll-based.** `App.jsx` defines `scrollToSection(id)` and passes it as `onNavigate` to `Header` and `Hero`. Buttons call it with section anchor IDs: `accueil`, `jeux`, `univers`, `contact`. These IDs are the contract between nav buttons and the `<section id="...">` targets — keep them in sync. `vercel.json` carries the SPA rewrite that makes `/admin` deep-linkable in production.

**Supabase.** `src/lib/supabase.js` is the single client (created from `import.meta.env.VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`, explicit error if missing; values live in `.env.local` — gitignored — and in Vercel env vars, never in the repo). `supabase/migrations/` holds the traced copy of every migration applied to the project (`ninja-sasquatch-games`, ref `vgmqmifgdolccquyjcoc`): tables `games` (flat bilingual columns `*_fr`/`*_en`, `category` CHECK mirroring the frontend category IDs byte-for-byte, `published`) and `profiles` (role `admin`/`client`, signup trigger), function `is_admin()`, RLS (anon reads published games only; writes require the admin role — **the RLS is the security boundary, frontend guards are UX only**), and the public `game-images` Storage bucket (5 MiB, jpeg/png/webp, admin-only writes).

**Auth.** `src/auth/` mirrors the `src/i18n/` three-file split (`context.js`, `AuthProvider.jsx`, `useAuth.js`). `AuthProvider` is mounted inside `AdminPage` only — the public site makes no auth calls. It exposes `{ session, role, loading, signIn, signOut }`; `role` is read from `profiles` (never writable from the client).

**Admin.** Components live in `src/components/admin/<Name>/` (same three-file pattern): `AdminPage` (h1 + sign-out + guard), `RequireAdmin` (anonymous → `LoginForm`, non-admin → refusal, admin → children), `GamesManager` (list, edit/delete with inline confirmation), `GameForm` (create/edit: FR **and** EN fields required — mirror of the DB NOT NULLs —, category select fed by `categories` minus `tous`, client-side image type/size validation **before** upload, Storage upload → `getPublicUrl` → insert/update).

**Component layout.** Every component lives in its own folder under `src/components/{layout,sections}/<Name>/` with three files:
- `<Name>.jsx` — the component (default export)
- `<Name>.module.css` — scoped styles
- `index.js` — a barrel: `export { default } from "./<Name>";`

Import components by folder (`import Header from "./components/layout/Header"`), which resolves through the barrel. Follow this exact pattern when adding components. Don't add `import React from "react"` — the automatic JSX transform makes it unnecessary.

**i18n.** `src/i18n/` holds three files, deliberately split so the `react-refresh/only-export-components` lint rule stays happy: `context.js` (the context object), `LanguageProvider.jsx` (state + `t()` + `toggleLang`, syncs `document.documentElement.lang`), and `useLanguage.js` (the hook). All user-visible strings live in `src/data/translations/{fr,en}.json` (same key structure in both files) and are looked up with `t("dot.path.key")` — `t` returns the key itself when a lookup misses, so a raw key showing in the UI means a missing/typo'd translation. The FR/EN toggle button is in `Header` (desktop nav and mobile menu). Default language is `"fr"`; `index.html` also declares `lang="fr"`.

**Games feature.** `GamesSection` reads the games through `src/hooks/useGames.js` (fetch on mount; the RLS serves anonymous visitors only the published games — the client filters nothing) and renders four states: loading / error / clean empty state (`games.empty` — the DB starts empty by decision 5.F) / grid. It holds `selectedCategory` (defaults to `"tous"`) and `selectedGame` state; clicking a card swaps the section view to `GameDetail` (back button) — no modal, no route. `GameCard`/`GameDetail` resolve the game copy with `localizeGame(game, lang)` (`src/utils/localizeGame.js`, pure) from the flat bilingual DB columns; `image_url` is nullable (no `<img>` rendered without it).

**Data layer.** Games live in the Supabase `games` table (`title_fr/title_en`, `short_desc_*`, `full_desc_*`, `category`, `image_url`, `players`, `duration`, `age`, `eco`, `published`) and are managed through `/admin`. `src/data/games.js` now exports only `categories` (`[{ id }]`). The four category IDs are `tous`, `famille`, `stratégie`, `party` — accented values are significant: filtering, translation lookups (`games.categories.<id>`) **and the DB CHECK constraint** match these exact strings byte-for-byte (`tous` is a pseudo-filter, never stored on a game). `src/data/site.js` exports `CONTACT_EMAIL`.

**Testing convention (Supabase).** Tests never touch the network: every test whose render reaches the Supabase client mocks it with `vi.mock("../lib/supabase", …)` backed by `src/__tests__/helpers/supabaseMock.js` (chainable thenable builders, auth listeners, storage stubs, `__*` control methods; a `{ reject }` table result simulates a network failure). Games for UI tests come from `src/__tests__/fixtures/games.js` (DB-shaped). The real client module is never executed under test, so no env vars are needed in CI.

**Contact form.** `ContactSection` is a controlled form with client-side validation; `errors` state stores i18n *keys* (not translated strings) so messages re-render in the current language. Submit builds a `mailto:` URL to `CONTACT_EMAIL`. The `<form>` has `noValidate` on purpose — native `type="email"` validation would short-circuit the custom messages.

**Icons.** Pulled from `lucide-react` as named imports (e.g. `Menu`/`X` in `Header`, `Leaf` in `About`/`Footer`/`GameCard`, `Users`/`Clock`/`Star` in the Games components, `Instagram`/`Facebook`/`Mail` in `Contact`).

## Styling

CSS Modules per component, plus one global reset/base in `src/styles/global.css` (imported once in `App.jsx`). No Tailwind, no CSS framework.

The brand palette is defined once as custom properties in `global.css` `:root` — always use `var(--...)`, never raw hex:
- `--color-cream` `#ffffe9` (background)
- `--color-dark-green` `#142d17` (body text)
- `--color-brown` `#9b5824` (headings)
- `--color-eco-green` `#077e16` (accents, CTAs, eco badge, success text)
- `--color-error` `#b3261e` (form errors)

A few `rgba(...)` tints derived from the palette remain hardcoded in modules (e.g. header backdrop, filter-button background).

Headings use **Poppins** (imported in `global.css`). Responsive breakpoints used in modules: 640px, 768px, 1024px.

## Lint convention

ESLint flat config (`eslint.config.js`) with `no-unused-vars` set to error but ignoring names matching `^[A-Z_]` — unused capitalized identifiers (e.g. SCREAMING_CASE constants) won't trip the rule. `react-refresh/only-export-components` is active: component files must export only components (this is why `src/i18n/` is split into three files). JS/JSX only; no TypeScript.

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
