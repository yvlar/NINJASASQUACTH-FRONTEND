# ROADMAP — Site vitrine Ninja Sasquatch Games

> **Source de vérité du workflow.** Ce fichier est lu par `prompt-executer-sprint.md`
> (exécuter le sprint courant) et mis à jour par `prompt-mise-a-jour-roadmap.md`
> (clôturer le sprint). Ne pas l'éditer à la main hors de ce cycle, sauf pour
> ajouter une découverte.

## Tableau de bord

| Dimension        | Note /100 | Baseline (audit 2026-07-07) |
|------------------|-----------|------------------------------|
| **Architecture** | 75        | 75 — patterns propres (dossiers de composants + barrels, i18n bien découpé, données séparées du copy), pas de dette structurelle notable |
| **Qualité**      | 70        | 40 — ESLint strict configuré et vert, mais zéro test, zéro CI : les contrats critiques (parité i18n, IDs de catégories accentués, ancres de navigation) ne sont protégés par rien |
| **UX/Contenu**   | 57        | 50 — site bilingue fonctionnel (nav, jeux, formulaire), mais images Unsplash placeholder, favicon Vite par défaut, aucune balise SEO/OpenGraph |
| **Production**   | 55        | 30 — pas de CI, pas de déploiement documenté, README quasi vide (typo dans le titre) |

- **Dernière mise à jour** : 2026-07-07 — clôture du Sprint 1 : infrastructure Vitest + Testing Library, 16 tests verrous (parité i18n, contrat catégories/jeux, ancres de nav, formulaire, bascule de langue), CI GitHub Actions (lint + tests + build), SEO/favicon de marque, README corrigé. Quatre découvertes nouvelles (D9-D12), dont 10 vulnérabilités `npm audit` (D11) affectées au Sprint 2.
- **Sprint courant** : **Sprint 2 — Dette sécurité, verrou mailto et contenu réel** (items 2.1 → 2.5 ci-dessous ; 2.4 et 2.5 sont des **Décisions requises** — bloqués sans réponse utilisateur).
- **État des tests** : **16/16 verts** (6 fichiers dans `src/__tests__/`, sortie réelle de `npm test` à la clôture du Sprint 1 ; baseline : 0). À recalibrer à chaque sprint sur la sortie réelle de `npm test`.
- **Environnement de référence** : Node ≥ 20 + npm (`npm install`, `npm run lint`, `npm test`, `npm run build`). Pas de conteneur dédié. CI : `.github/workflows/ci.yml` (Node LTS, mêmes trois étapes).

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
  → résolu au Sprint 1 (items 1.1, 1.2).
- **Aucune CI** : rien ne vérifie lint/build sur push ou PR (3 PR déjà mergées sans
  garde mécanique). → résolu au Sprint 1 (item 1.3).
- **Contenu placeholder** : images de jeux = URLs Unsplash distantes, favicon =
  `vite.svg` par défaut, titre de page `ninja-sasquatch-games` brut, aucune meta
  description/OpenGraph, email de contact possiblement non officiel.
  → favicon/SEO résolus au Sprint 1 (item 1.4) ; images (D3) et email (D7)
  restent des Décisions requises.
- **README** : typo « Frond-ent » dans le titre, aucun quickstart développeur.
  → résolu au Sprint 1 (item 1.5).

---

# 🟢 SPRINT 1 — Fondations qualité & finitions production ✅ (clos le 2026-07-07, verdict : DoD satisfaite)

> **Objectif** : donner au dépôt la baseline verte dont ce workflow a besoin
> (tests + CI) et corriger les finitions production ne nécessitant aucun contenu
> de marque à inventer. Aucune dépendance amont. Ordre conseillé : 1.1 → 1.2 → 1.3
> (la CI a besoin de `npm test`) puis 1.4 → 1.5 (indépendants). Les vraies photos
> produits (D3) et l'email officiel (D7) sont exclus du sprint : « Décision requise ».

- [x] **1.1** (D1) **Infrastructure de test** → `0d6d903`
  Vitest + `@testing-library/react` + `@testing-library/jest-dom` + `jsdom` en
  devDependencies, bloc `test` (jsdom + setup) dans `vite.config.js`, scripts
  `test`/`test:watch`, setup avec matchers jest-dom + cleanup, smoke test qui
  monte `<App>` sous `<LanguageProvider>`.
  **Acceptation SATISFAITE** : `npm test` vert (1 test), lint et build restés verts.
- [x] **1.2** (D1) **Tests verrous des contrats existants** → `ee5cf70`
  Cinq familles : parité récursive `fr.json`/`en.json` (+ aucune feuille vide) ;
  contrat catégories/jeux (IDs accentués byte-for-byte, libellés et
  `title/shortDesc/fullDesc` dans les deux langues) ; contrat de navigation
  (ancres `accueil/jeux/univers/contact` rendues et atteintes par les boutons du
  Header, `scrollIntoView` espionné) ; formulaire de contact (erreurs i18n,
  message de succès) ; `LanguageProvider` (bascule FR/EN, `documentElement.lang`,
  clé manquante retournée telle quelle).
  **Acceptation SATISFAITE** : suite 1 → 16 tests, 100 % verte ; vérifié que les
  verrous rougissent sur contrat cassé (clé i18n renommée → rouge ; catégorie
  inconnue → rouge ; restaurés ensuite).
- [x] **1.3** (D2) **CI GitHub Actions** → `db8f3bd`
  `.github/workflows/ci.yml` : un job Node LTS (cache npm) sur push/PR —
  `npm ci` → `npm run lint` → `npm test` → `npm run build`.
  **Acceptation SATISFAITE** : YAML validé ; la DoD est vérifiée mécaniquement.
- [x] **1.4** (D4, D5) **SEO + favicon de marque** → `4df9994`
  Titre propre, meta description et OpenGraph FR dans `index.html` (texte repris
  du copy existant `hero.description` — rien d'inventé ; pas de `og:image` tant
  que D3 n'est pas résolu), favicon SVG monogramme NS (`#142d17`/`#077e16`),
  `public/vite.svg` supprimé.
  **Acceptation SATISFAITE** : build vert, metas + favicon présents dans `dist/`.
- [x] **1.5** (D8) **README corrigé + quickstart** → `4b3b507`
  Typo « Frond-ent » corrigée, quickstart npm, carte de la documentation ;
  l'état des tests renvoie vers ROADMAP.md (aucun compte dupliqué).
  **Acceptation SATISFAITE**.

> **Definition of Done du Sprint 1** (en plus de la DoD standard de
> `prompt-executer-sprint.md`) : à la clôture, `npm run lint`, `npm test` et
> `npm run build` sont verts en local ET la CI exécute ces trois mêmes étapes ;
> les cinq familles de tests verrous de l'item 1.2 existent et protègent les
> contrats listés ; aucune image, aucun email et aucun texte de marque n'a été
> inventé (D3/D7 restent des Décisions requises). — **SATISFAITE.**

---

# 🟠 SPRINT 2 — Dette sécurité, verrou mailto et contenu réel — **sprint courant**

> **Objectif** : résorber la dette révélée à la clôture du Sprint 1 (vulnérabilités
> npm, URL mailto non verrouillée, doublon de titres) et débloquer le contenu réel
> (photos, email, liens sociaux) via les décisions utilisateur. Ordre conseillé :
> 2.1 (indépendant, risque de bump de versions → le faire seul en premier pour
> isoler toute casse) → 2.2 → 2.3 ; 2.4 et 2.5 dès que l'utilisateur répond.

- [ ] **2.1** (D11) **Résorber les vulnérabilités npm** — `npm audit` remonte
  10 vulnérabilités (1 low, 4 moderate, 5 high) dans l'arbre de dépendances
  (`package.json:17-29`, devDependencies). Appliquer `npm audit fix` (sans
  `--force` d'abord), examiner le reliquat, documenter ce qui reste et pourquoi.
  **Acceptation** : `npm audit --audit-level=high` sans finding, OU reliquat
  documenté ici avec justification ; lint/tests/build restent verts.
- [ ] **2.2** (D10) **Verrouiller la construction du mailto** — la construction
  de l'URL (`src/components/sections/Contact/ContactSection.jsx:47-51`) n'est pas
  testable sous jsdom (navigation non implémentée). Extraire une fonction pure
  `buildMailtoUrl(values, subject)` (module non-composant, ex.
  `src/data/` ou utilitaire dédié, pour respecter `react-refresh/only-export-components`)
  et la verrouiller par un test (destinataire `CONTACT_EMAIL`, sujet/corps encodés).
  **Acceptation** : test unitaire vert sur l'URL exacte ; comportement du
  formulaire inchangé (tests existants verts).
- [ ] **2.3** (D9) **Doublon de titre accessible** — « Origines Mystérieuses »
  est à la fois le `<h1>` du hero (`src/components/sections/Hero/Hero.jsx:9`) et
  le titre de la carte du jeu 1 (données `games.items.1.title`) : les sélecteurs
  accessibles par nom sont ambigus. Vérifier la hiérarchie des headings
  (h1 unique, niveaux cohérents dans les sections) et corriger si besoin.
  **Acceptation** : un seul h1 dans la page, hiérarchie documentée par un test.
- [ ] **2.4** (D3) **Vraies photos produits** — **Décision requise** : les 6 jeux
  pointent sur des URLs Unsplash (`src/data/games.js:10` et suiv.). Attendre les
  vraies photos (fichiers locaux sous `public/` ou URLs officielles), puis les
  brancher et ajouter `og:image` (`index.html`).
  **Acceptation** : plus aucune URL Unsplash dans `src/data/games.js`.
- [ ] **2.5** (D7, D12) **Email officiel + liens sociaux réels** — **Décision
  requise** : confirmer `CONTACT_EMAIL` (`src/data/site.js:1`) et fournir les URLs
  Instagram/Facebook réelles (`ContactSection.jsx:140-145`, actuellement `href="#"`).
  **Acceptation** : liens réels branchés, ou décision de retirer les icônes.

> **Definition of Done du Sprint 2** (en plus de la DoD standard) : aucune
> vulnérabilité `high` non documentée ; l'URL mailto est verrouillée par un test ;
> les items 2.4/2.5 ne sont cochés que sur contenu fourni par l'utilisateur —
> jamais inventé.

---

## Découvertes

| #   | Gravité | Constat | Affectation |
|-----|---------|---------|-------------|
| D1  | ✅ | Aucun framework de test : aucun script `test`, aucun fichier de test — les contrats byte-for-byte (parité i18n, catégories accentuées, ancres de nav) n'étaient protégés par rien, et `t()` masque les clés manquantes en retournant la clé | ✅ Sprint 1 (items 1.1 `0d6d903`, 1.2 `ee5cf70`) — 16 tests verrous |
| D2  | ✅ | Aucune CI : pas de répertoire `.github/`, lint/build jamais vérifiés sur push/PR | ✅ Sprint 1 (item 1.3 `db8f3bd`) |
| D3  | 🟠 | Images des 6 jeux = URLs Unsplash distantes (`src/data/games.js:10` et suiv.) — pas de vraies photos produits, dépendance à un CDN tiers | **Décision requise** — Sprint 2 (item 2.4) |
| D4  | ✅ | Aucune balise SEO : pas de meta description ni OpenGraph, titre brut `ninja-sasquatch-games` | ✅ Sprint 1 (item 1.4 `4df9994`) — `og:image` reste lié à D3 |
| D5  | ✅ | Favicon = `vite.svg` par défaut | ✅ Sprint 1 (item 1.4 `4df9994`) — monogramme NS |
| D6  | 🟡 | Formulaire de contact en `mailto:` sans backend (`ContactSection.jsx:51`) — dépend du client mail de l'utilisateur ; un vrai envoi demanderait un service (API, Formspree…) | Backlog (choix d'infra à discuter) |
| D7  | 🟡 | Email de contact `info@ninjasasquatchgames.com` (`src/data/site.js:1`) possiblement placeholder — à confirmer avant toute mise en production | **Décision requise** — Sprint 2 (item 2.5) |
| D8  | ✅ | README : typo « Frond-ent », aucun quickstart développeur | ✅ Sprint 1 (item 1.5 `4b3b507`) |
| D9  | 🟡 | (Sprint 1) « Origines Mystérieuses » est à la fois le h1 du hero et le titre du jeu 1 : sélection accessible par nom ambiguë (le smoke test a dû cibler `level: 1`) — hiérarchie des headings à auditer | Sprint 2 (item 2.3) |
| D10 | 🟡 | (Sprint 1) La construction de l'URL `mailto:` (`ContactSection.jsx:47-51`) n'est pas interceptable sous jsdom : le verrou 1.2 couvre erreurs/succès mais pas l'URL elle-même | Sprint 2 (item 2.2) |
| D11 | 🟠 | (Sprint 1) `npm audit` : 10 vulnérabilités (1 low, 4 moderate, 5 high) dans l'arbre devDependencies, constatées à la clôture | Sprint 2 (item 2.1) |
| D12 | 🟡 | (Sprint 1) Liens sociaux Instagram/Facebook en `href="#"` (`ContactSection.jsx:140-145`) — placeholders cliquables sans destination | **Décision requise** — Sprint 2 (item 2.5) |

## Changelog

### Sprint 1 — Fondations qualité & finitions production (2026-07-07)

- **Contexte** : décision utilisateur du 2026-07-07 — répliquer le workflow de
  sprint de swingtradebot sur ce dépôt et exécuter immédiatement un Sprint 1
  couvrant fondations qualité ET finitions production (sans inventer de contenu
  de marque).
- **Baseline à l'ouverture** : `npm run lint` vert, `npm run build` vert,
  **0 test** (aucun framework — conforme au tableau de bord initial). Node 20+,
  npm 11. Aucun commit hors cycle à absorber (le dépôt part de `main` à jour).
- **Commits** :
  - `fdca579` docs : mise en place du workflow de sprint (prompts, ROADMAP, gouvernance)
  - `0d6d903` feat : infrastructure de test Vitest + Testing Library (item 1.1)
  - `ee5cf70` test : verrous des contrats existants (item 1.2)
  - `db8f3bd` feat : CI GitHub Actions — lint, tests, build sur push/PR (item 1.3)
  - `4df9994` feat : SEO et favicon de marque (item 1.4)
  - `4b3b507` docs : README corrigé + démarrage rapide (item 1.5)
  - (clôture) docs : clôture sprint 1 — mise à jour roadmap
- **Tests** : 0 → **16** (+16 ; 6 fichiers : smoke App, parité i18n, contrat
  catégories/jeux, navigation, formulaire de contact, LanguageProvider).
  Décompte relevé sur la sortie réelle de `npm test`.
- **Verdict de clôture** : DoD standard et DoD spécifique satisfaites — lint,
  tests et build verts en local ; CI en place exécutant les trois mêmes étapes ;
  verrous vérifiés rouges sur contrat cassé puis restaurés ; aucun contenu de
  marque inventé (D3, D7, D12 restent des Décisions requises) ; fichiers
  gouvernés (`prompt-*.md`, DoD) intacts après leur commit de création
  `fdca579` (vérifié par diff). Découvertes nouvelles : D9, D10, D11, D12.

## Rétrospectives

### Sprint 1 — Fondations qualité & finitions production (2026-07-07)

1. **Découpage** : bon. L'ordre 1.1 → 1.2 → 1.3 (la CI a besoin de `npm test`)
   s'est confirmé nécessaire ; 1.4/1.5 indépendants comme prévu. Aucun item n'a
   dû être découpé. Deux frictions mineures absorbées en cours d'item (collisions
   de sélecteurs accessibles : titre dupliqué → D9, `aria-label="Email"` du lien
   social vs label du champ), toutes deux attrapées par les tests eux-mêmes.
2. **Suffisance des prompts** : suffisants, aucune improvisation hors procédure.
   Aucun diff de prompt à proposer. (Adaptation notable vs swingtradebot : le
   « garde-fou live » devient un « garde-fou contenu » — ne jamais inventer de
   contenu de marque — qui a joué son rôle sur D3/D7/D12.)
3. **À détecter plus tôt** : les 10 vulnérabilités `npm audit` (D11) étaient
   observables dès la baseline — le prompt ne demande que lint/tests/build.
   Garde-fou peu coûteux : une étape `npm audit --audit-level=high` (non
   bloquante d'abord) dans la CI — ajoutée au backlog via l'item 2.1 plutôt
   qu'imposée dans la DoD tant que le reliquat n'est pas maîtrisé.
4. **Notes /100** (baseline 75/40/50/30, audit 2026-07-07) :
   - **Architecture 75 (=)** : rien de structurel n'a changé ; `src/__tests__/`
     suit les conventions existantes.
   - **Qualité 70 (+30)** : 16 tests verrous sur les contrats critiques + CI qui
     les exécute à chaque push ; il manque encore la couverture du mailto (D10),
     un audit a11y (D9) et la dette `npm audit` (D11) pour viser plus haut.
   - **UX/Contenu 57 (+7)** : SEO/OpenGraph, titre et favicon de marque en place ;
     plafonné par le contenu placeholder restant (images D3, liens sociaux D12,
     `og:image` manquant).
   - **Production 55 (+25)** : CI verte, README exploitable, favicon/metas prêts
     pour la mise en ligne ; pas encore de déploiement documenté ni de politique
     de dépendances (D11).
