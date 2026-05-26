# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Single-page marketing site for **Ninja Sasquatch Games**, a Québec board-game company. Content is French-first (the live UI hardcodes French strings). React 19 + Vite, no backend.

## Commands

```bash
npm run dev      # Vite dev server with HMR
npm run build    # production build to dist/
npm run preview  # serve the built dist/ locally
npm run lint     # ESLint over the repo
```

There is **no test framework** configured — no `npm test`, no test files. Don't claim tests pass; verify changes by running `npm run dev` and checking the browser.

## Architecture

Entry: `src/main.jsx` mounts `<App>` in `StrictMode`. `src/App.jsx` is the whole page — it composes `Header` + `Footer` (layout) around `Hero`, `GamesSection`, `AboutSection`, `ContactSection`.

**Navigation is scroll-based, not routed.** `App.jsx` defines `scrollToSection(id)` and passes it as `onNavigate` to `Header` and `Hero`. Buttons call it with section anchor IDs: `accueil`, `jeux`, `univers`, `contact`. These IDs are the contract between nav buttons and the `<section id="...">` targets — keep them in sync.

**Component layout.** Every component lives in its own folder under `src/components/{layout,sections}/<Name>/` with three files:
- `<Name>.jsx` — the component (default export)
- `<Name>.module.css` — scoped styles
- `index.js` — a barrel: `export { default } from "./<Name>";`

Import components by folder (`import Header from "./components/layout/Header"`), which resolves through the barrel. Follow this exact pattern when adding components.

**Games feature.** `GamesSection` holds `selectedCategory` and `selectedGame` state. It filters `games` by category and renders `GameCard`s; clicking a card sets `selectedGame`, which swaps the entire section view to `GameDetail` (with a back button) — there's no modal or route.

**Data layer.** `src/data/games.js` exports `games` and `categories` arrays — this is the single source of truth for game content. Category IDs include accented values (e.g. `"stratégie"`); filtering matches on these exact strings, so the `categories` IDs and each game's `category` must agree byte-for-byte.

## Styling

CSS Modules per component, plus one global reset/base in `src/styles/global.css` (imported once in `App.jsx`). No Tailwind, no CSS framework.

Brand palette is hardcoded throughout (both in `.module.css` and inline `style={{}}`):
- `#ffffe9` cream (background)
- `#142d17` dark green (body text)
- `#9b5824` brown (headings)
- `#077e16` eco green (accents, CTAs, eco badge)

Headings use **Poppins** (imported in `global.css`). Responsive breakpoints used in modules: 640px, 768px, 1024px.

## Gotchas

- **`src/claude.jsx` is dead code.** It's the original single-file prototype (one monolithic `NinjaSasquatchGames` component) and is **not imported anywhere**. The live app is the modular version under `components/`. Editing `claude.jsx` has no effect on the site. It also uses Tailwind utility classes (`min-h-screen`, `max-w-7xl`, etc.) — **Tailwind is not installed**, so those classes are inert; they only document the original design.

- **i18n is scaffolded but not wired up.** `src/data/translations/{fr,en}.json` contain a complete FR/EN key structure, but no component imports them — all visible strings are hardcoded French in the JSX. The "FR / EN" toggle button (in the dead `claude.jsx`) is non-functional and absent from the live `Header`. Building real language switching means consuming these JSON files and adding a language state/provider.

- **`CategoryFiltes.jsx` is misspelled** (missing the `r` in "Filters"). `GamesSection` imports it as `./CategoryFiltes`. If you rename the file, update that import too — don't "fix" the import string without renaming the file.

## Lint convention

ESLint flat config (`eslint.config.js`) with `no-unused-vars` set to error but ignoring names matching `^[A-Z_]` — unused capitalized identifiers (e.g. the `React` import, SCREAMING_CASE constants) won't trip the rule. JS/JSX only; no TypeScript.
