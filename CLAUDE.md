# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Single-page marketing site for **Ninja Sasquatch Games**, a Québec board-game company. Bilingual FR/EN, French by default.

Stack: **React 19** + **Vite 7**, `lucide-react` for icons. No backend, no router, no state-management library, no CSS framework, no TypeScript.

## Commands

```bash
npm run dev      # Vite dev server with HMR
npm run build    # production build to dist/
npm run preview  # serve the built dist/ locally
npm run lint     # ESLint over the repo
```

There is **no test framework** configured — no `npm test`, no test files. Don't claim tests pass; verify changes by running `npm run dev` and checking the browser.

## Architecture

Entry: `src/main.jsx` mounts `<App>` in `StrictMode`, wrapped in `<LanguageProvider>`. `src/App.jsx` is the whole page — it composes `Header` + `Footer` (layout) around `Hero`, `GamesSection`, `AboutSection`, `ContactSection`.

**Navigation is scroll-based, not routed.** `App.jsx` defines `scrollToSection(id)` and passes it as `onNavigate` to `Header` and `Hero`. Buttons call it with section anchor IDs: `accueil`, `jeux`, `univers`, `contact`. These IDs are the contract between nav buttons and the `<section id="...">` targets — keep them in sync.

**Component layout.** Every component lives in its own folder under `src/components/{layout,sections}/<Name>/` with three files:
- `<Name>.jsx` — the component (default export)
- `<Name>.module.css` — scoped styles
- `index.js` — a barrel: `export { default } from "./<Name>";`

Import components by folder (`import Header from "./components/layout/Header"`), which resolves through the barrel. Follow this exact pattern when adding components. Don't add `import React from "react"` — the automatic JSX transform makes it unnecessary.

**i18n.** `src/i18n/` holds three files, deliberately split so the `react-refresh/only-export-components` lint rule stays happy: `context.js` (the context object), `LanguageProvider.jsx` (state + `t()` + `toggleLang`, syncs `document.documentElement.lang`), and `useLanguage.js` (the hook). All user-visible strings live in `src/data/translations/{fr,en}.json` (same key structure in both files) and are looked up with `t("dot.path.key")` — `t` returns the key itself when a lookup misses, so a raw key showing in the UI means a missing/typo'd translation. The FR/EN toggle button is in `Header` (desktop nav and mobile menu). Default language is `"fr"`; `index.html` also declares `lang="fr"`.

**Games feature.** `GamesSection` holds `selectedCategory` (defaults to `"tous"`, i.e. all) and `selectedGame` state. It filters `games` by category and renders `GameCard`s; clicking a card sets `selectedGame`, which swaps the entire section view to `GameDetail` (with a back button) — there's no modal or route.

**Data layer.** `src/data/games.js` exports `games` and `categories`, holding only non-translatable data: each `game` is `{ id, category, image, players, duration, age, eco }` (images are remote Unsplash URLs) and `categories` is `[{ id }]`. Game copy (`title`, `shortDesc`, `fullDesc`) lives in the translation JSONs under `games.items.<id>`, category labels under `games.categories.<id>`. The four category IDs are `tous`, `famille`, `stratégie`, `party` — accented values are significant: filtering and translation lookups match these exact strings, so `categories` IDs, each game's `category`, and the JSON keys must agree byte-for-byte. `src/data/site.js` exports `CONTACT_EMAIL`.

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
