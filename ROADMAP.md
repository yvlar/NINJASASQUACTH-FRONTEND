# ROADMAP — Site vitrine Ninja Sasquatch Games

> **Source de vérité du workflow.** Ce fichier est lu par `prompt-executer-sprint.md`
> (exécuter le sprint courant) et mis à jour par `prompt-mise-a-jour-roadmap.md`
> (clôturer le sprint). Ne pas l'éditer à la main hors de ce cycle, sauf pour
> ajouter une découverte.

## Tableau de bord

| Dimension        | Note /100 | Baseline (audit 2026-07-07) |
|------------------|-----------|------------------------------|
| **Architecture** | 75        | 75 — patterns propres (dossiers de composants + barrels, i18n bien découpé, données séparées du copy), pas de dette structurelle notable |
| **Qualité**      | 40        | 40 — ESLint strict configuré et vert, mais zéro test, zéro CI : les contrats critiques (parité i18n, IDs de catégories accentués, ancres de navigation) ne sont protégés par rien |
| **UX/Contenu**   | 50        | 50 — site bilingue fonctionnel (nav, jeux, formulaire), mais images Unsplash placeholder, favicon Vite par défaut, aucune balise SEO/OpenGraph |
| **Production**   | 30        | 30 — pas de CI, pas de déploiement documenté, README quasi vide (typo dans le titre) |

- **Dernière mise à jour** : 2026-07-07 — création du workflow (audit Phase 0, définition du Sprint 1).
- **Sprint courant** : **Sprint 1 — Fondations qualité & finitions production** (items 1.1 → 1.5 ci-dessous).
- **État des tests** : 0 test (aucun framework de test configuré — D1). À recalibrer à chaque sprint sur la sortie réelle de `npm test`.
- **Environnement de référence** : Node ≥ 20 + npm (`npm install`, `npm run lint`, `npm test`, `npm run build`). Pas de conteneur dédié.

## Audit Phase 0 — constats (2026-07-07)

Le site est fonctionnellement complet pour une SPA vitrine : navigation par ancres,
catalogue de jeux filtrable avec vue détail, bascule FR/EN, formulaire de contact
validé côté client (`mailto:`). L'architecture est saine et documentée dans
`CLAUDE.md`. En revanche :

- **Aucun test** : les contrats byte-for-byte (IDs de catégories accentués entre
  `src/data/games.js` et les JSON de traduction ; parité de structure entre
  `fr.json` et `en.json` ; ancres `accueil/jeux/univers/contact` entre
  `Header.jsx` et les sections) ne sont protégés que par la discipline humaine.
  `t()` retournant la clé en cas de trou, une clé manquante passe silencieusement.
- **Aucune CI** : rien ne vérifie lint/build sur push ou PR (3 PR déjà mergées sans
  garde mécanique).
- **Contenu placeholder** : images de jeux = URLs Unsplash distantes, favicon =
  `vite.svg` par défaut, titre de page `ninja-sasquatch-games` brut, aucune meta
  description/OpenGraph, email de contact possiblement non officiel.
- **README** : typo « Frond-ent » dans le titre, aucun quickstart développeur.

---

# 🔴 SPRINT 1 — Fondations qualité & finitions production — **sprint courant**

> **Objectif** : donner au dépôt la baseline verte dont ce workflow a besoin
> (tests + CI) et corriger les finitions production ne nécessitant aucun contenu
> de marque à inventer. Aucune dépendance amont. Ordre conseillé : 1.1 → 1.2 → 1.3
> (la CI a besoin de `npm test`) puis 1.4 → 1.5 (indépendants). Les vraies photos
> produits (D3) et l'email officiel (D7) sont exclus du sprint : « Décision requise ».

- [ ] **1.1** (D1) **Infrastructure de test** — `package.json:6` n'a aucun script
  `test` ; `vite.config.js:5` n'a pas de bloc `test`. Ajouter Vitest +
  `@testing-library/react` + `@testing-library/jest-dom` + `jsdom` en
  devDependencies, un bloc `test` (environnement jsdom, fichier de setup, globals)
  dans `vite.config.js`, les scripts `test` (`vitest run`) et `test:watch`, et un
  smoke test qui monte `<App>` sous `<LanguageProvider>`.
  **Acceptation** : `npm test` s'exécute et est vert ; `npm run lint` et
  `npm run build` restent verts.
- [ ] **1.2** (D1) **Tests verrous des contrats existants** — protéger les
  invariants documentés dans `CLAUDE.md` :
  - parité récursive des clés `src/data/translations/fr.json` / `en.json`
    (même structure exacte) ;
  - contrat catégories/jeux (`src/data/games.js:6-74`) : chaque `game.category`
    ∈ `categories[].id`, et les clés `games.categories.<id>` +
    `games.items.<id>.{title,shortDesc,fullDesc}` existent dans les deux langues
    (IDs accentués byte-for-byte) ;
  - contrat de navigation (`src/App.jsx:10`, `Header.jsx:15-20`) : chaque ancre
    de `navItems` (`accueil`, `jeux`, `univers`, `contact`) correspond à une
    `<section id>` rendue par `App` ;
  - formulaire de contact (`ContactSection.jsx:23-53`) : erreurs affichées via
    clés i18n quand les champs sont vides/invalides, `mailto:` construit vers
    `CONTACT_EMAIL` quand le formulaire est valide ;
  - `LanguageProvider.jsx:8-27` : la bascule change les chaînes rendues et
    `document.documentElement.lang`.
  **Acceptation** : suite verte ET vérification ponctuelle que chaque verrou
  rougit si on casse son contrat (ex. clé i18n renommée temporairement).
- [ ] **1.3** (D2) **CI GitHub Actions** — le dépôt n'a pas de répertoire
  `.github/`. Créer `.github/workflows/ci.yml` : un job Node LTS sur push/PR
  exécutant `npm ci` → `npm run lint` → `npm test` → `npm run build`.
  **Acceptation** : YAML valide, la DoD du workflow devient vérifiée
  mécaniquement à chaque push. Dépend de 1.1.
- [ ] **1.4** (D4, D5) **SEO + favicon de marque** — `index.html:5` pointe sur
  `/vite.svg` (logo Vite par défaut) et `index.html:7` a le titre brut
  `ninja-sasquatch-games` ; aucune meta description/OpenGraph. Ajouter un titre
  propre, `<meta name="description">` et balises OpenGraph (FR par défaut), et
  remplacer le favicon par un SVG simple aux couleurs de la marque
  (`--color-dark-green` `#142d17` / `--color-eco-green` `#077e16`).
  **Acceptation** : `npm run build` vert, favicon et metas visibles dans le HTML
  généré ; aucun texte de marque inventé au-delà du descriptif déjà présent dans
  les traductions.
- [ ] **1.5** (D8) **README corrigé + quickstart** — `README.md:3` contient la
  typo « Frond-ent » et le fichier n'a aucun quickstart. Corriger la typo,
  ajouter les commandes npm et renvoyer vers ROADMAP.md pour l'état des tests
  (le compte de tests ne vit que dans le tableau de bord).
  **Acceptation** : README à jour, aucun compte de tests dupliqué hors ROADMAP.

> **Definition of Done du Sprint 1** (en plus de la DoD standard de
> `prompt-executer-sprint.md`) : à la clôture, `npm run lint`, `npm test` et
> `npm run build` sont verts en local ET la CI exécute ces trois mêmes étapes ;
> les cinq familles de tests verrous de l'item 1.2 existent et protègent les
> contrats listés ; aucune image, aucun email et aucun texte de marque n'a été
> inventé (D3/D7 restent des Décisions requises).

---

## Découvertes

| #  | Gravité | Constat | Affectation |
|----|---------|---------|-------------|
| D1 | 🔴 | Aucun framework de test : aucun script `test` (`package.json:6`), aucun fichier de test — les contrats byte-for-byte (parité i18n, catégories accentuées, ancres de nav) ne sont protégés par rien, et `t()` masque les clés manquantes en retournant la clé | Sprint 1 (items 1.1, 1.2) |
| D2 | 🔴 | Aucune CI : pas de répertoire `.github/`, lint/build jamais vérifiés sur push/PR | Sprint 1 (item 1.3) |
| D3 | 🟠 | Images des 6 jeux = URLs Unsplash distantes (`src/data/games.js:10` et suiv.) — pas de vraies photos produits, dépendance à un CDN tiers | **Décision requise** (fournir les vraies photos) — Sprint 2 candidat |
| D4 | 🟠 | Aucune balise SEO : pas de meta description ni OpenGraph, titre brut `ninja-sasquatch-games` (`index.html:7`) | Sprint 1 (item 1.4) |
| D5 | 🟡 | Favicon = `vite.svg` par défaut (`index.html:5`, `public/vite.svg`) | Sprint 1 (item 1.4) |
| D6 | 🟡 | Formulaire de contact en `mailto:` sans backend (`ContactSection.jsx:51`) — dépend du client mail de l'utilisateur ; un vrai envoi demanderait un service (API, Formspree…) | Backlog (choix d'infra à discuter) |
| D7 | 🟡 | Email de contact `info@ninjasasquatchgames.com` (`src/data/site.js:1`) possiblement placeholder — à confirmer avant toute mise en production | **Décision requise** (confirmer l'adresse officielle) |
| D8 | 🟢 | README : typo « Frond-ent » (`README.md:3`), aucun quickstart développeur | Sprint 1 (item 1.5) |

## Changelog

*(rempli à la clôture de chaque sprint par `prompt-mise-a-jour-roadmap.md` —
bloc `### Sprint N — <titre> (<date>)` : contexte, baseline à l'ouverture,
commits, tests avant → après, verdict de clôture)*

## Rétrospectives

*(rempli à la clôture de chaque sprint — les 4 questions : découpage,
suffisance des prompts, garde-fous manqués, notes /100 par dimension)*
