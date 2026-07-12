# ROADMAP — Site vitrine Ninja Sasquatch Games

> **Source de vérité du workflow.** Ce fichier est lu par `prompt-executer-sprint.md`
> (exécuter le sprint courant) et mis à jour par `prompt-mise-a-jour-roadmap.md`
> (clôturer le sprint). Ne pas l'éditer à la main hors de ce cycle, sauf pour
> ajouter une découverte.

## Tableau de bord

| Dimension        | Note /100 | Baseline (audit 2026-07-07) |
|------------------|-----------|------------------------------|
| **Architecture** | 91        | 75 — patterns propres (dossiers de composants + barrels, i18n bien découpé, données séparées du copy), pas de dette structurelle notable |
| **Qualité**      | 92        | 40 — ESLint strict configuré et vert, mais zéro test, zéro CI : les contrats critiques (parité i18n, IDs de catégories accentués, ancres de navigation) ne sont protégés par rien |
| **UX/Contenu**   | 68        | 50 — site bilingue fonctionnel (nav, jeux, formulaire), mais images Unsplash placeholder, favicon Vite par défaut, aucune balise SEO/OpenGraph |
| **Production**   | 80        | 30 — pas de CI, pas de déploiement documenté, README quasi vide (typo dans le titre) |

- **Dernière mise à jour** : 2026-07-12 — **Sprint 10 clos** : refonte visuelle Ninja Sasquatch Games. Nouvelle palette (Sasquatch roux, vert forêt, crème, charbon) + sous-palettes locales aux jeux (Heroes Rising, Burgle Jack) et typographie (Alfa Slab One, Atkinson Hyperlegible, Black Ops One) centralisées dans `@theme` ; `src/data/gameThemes.ts` (variantes statiques typées) ; **liens sociaux réels** (`src/data/socialLinks.ts` — Facebook/YouTube/LinkedIn, résout D12) ; header à menu mobile **accessible** (aria + Échap + focus) et logo cliquable ; **accueil refondu** (hero Heroes Rising alimenté par Supabase, bandeau de réassurance, univers, créations, fondateur, notification de lancement, contact) ; fiches homogènes (badge « contenu en anglais », accent de sous-palette, crédits). Aucun contenu de marque inventé : logo officiel, photo/biographie du fondateur, photos produits et URLs Kickstarter restent des actions utilisateur (D3/D21/D22).
- **Sprint courant** : **Sprint 11 — à définir** (candidats : E2E Playwright 8.1, headers de sécurité D19/8.2, actions utilisateur en attente 8.3, backend de contact D6/8.4 ; contenu réel des jeux via `/admin` + spec `brand-seo-spec.md` D21 ; logo/portrait fondateur D22).
- **État des tests** : **114/114 verts** (27 fichiers dans `src/__tests__/`, sortie réelle de `npm test` à la clôture du Sprint 10 — Sprint 9 : 96 ; Sprint 7 : 64 ; Sprint 6 : 62 ; Sprint 5 : 62 ; Sprint 4 : 24 ; Sprint 3 : 21 ; Sprint 1 : 16 ; baseline : 0). À recalibrer à chaque sprint sur la sortie réelle de `npm test`.
- **Environnement de référence** : Node ≥ 20 + npm (`npm install`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`). Pas de conteneur dédié. CI : `.github/workflows/ci.yml` (Node LTS : audit → lint → typecheck → tests → build) + `.github/workflows/supabase-keepalive.yml` (ping REST hebdomadaire, D15).

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

# 🟢 SPRINT 2 — Dette sécurité, verrou mailto et contenu réel ✅ (clos le 2026-07-07, verdict : DoD satisfaite — 2.4/2.5 reportés au Sprint 3, Décisions requises restées sans réponse)

> **Objectif** : résorber la dette révélée à la clôture du Sprint 1 (vulnérabilités
> npm, URL mailto non verrouillée, doublon de titres) et débloquer le contenu réel
> (photos, email, liens sociaux) via les décisions utilisateur. Ordre conseillé :
> 2.1 (indépendant, risque de bump de versions → le faire seul en premier pour
> isoler toute casse) → 2.2 → 2.3 ; 2.4 et 2.5 dès que l'utilisateur répond.

- [x] **2.1** (D11) **Résorber les vulnérabilités npm** → `ede7103`
  `npm audit fix` (sans `--force`) : 34 paquets mis à jour dans
  `package-lock.json` seul (les plages de `package.json` couvraient déjà les
  versions corrigées).
  **Acceptation SATISFAITE** : `npm audit --audit-level=low` (plus strict que
  le critère) → **0 vulnérabilité**, aucun reliquat à documenter ;
  lint/tests/build restés verts.
- [x] **2.2** (D10) **Verrouiller la construction du mailto** → `42cc330`
  Fonction pure `buildMailtoUrl(values, subject)` extraite dans
  `src/utils/mailto.js` (module non-composant), branchée dans `ContactSection` ;
  3 tests verrouillent l'URL exacte (destinataire `CONTACT_EMAIL`, sujet/corps
  encodés, valeurs trimées, corps « Nom \<email\>\n\nmessage »).
  **Acceptation SATISFAITE** : test rouge avant extraction (module absent),
  vert après ; les 3 tests formulaire existants inchangés et verts.
- [x] **2.3** (D9) **Doublon de titre accessible** → `a474915`
  La vue détail (`GameDetail`) rendait un second h1 : passé en h2 (style porté
  par la classe, aucun changement visuel). Hiérarchie verrouillée par
  `src/__tests__/headings.test.jsx` : h1 unique dans la vue par défaut ET la
  vue détail, aucun saut de niveau (h1 hero → h2 sections/détail → h3 cartes).
  **Acceptation SATISFAITE** : le test rougissait avant le fix (2 h1), vert après.
- [ ] **2.4** (D3) **Vraies photos produits** — **Décision requise** : les 6 jeux
  pointent sur des URLs Unsplash (`src/data/games.js:10` et suiv.). Attendre les
  vraies photos (fichiers locaux sous `public/` ou URLs officielles), puis les
  brancher et ajouter `og:image` (`index.html`).
  **Acceptation** : plus aucune URL Unsplash dans `src/data/games.js`.
  **Reliquat** : aucun contenu fourni pendant le sprint → reporté tel quel au
  Sprint 3 (item 3.3).
- [ ] **2.5** (D7, D12) **Email officiel + liens sociaux réels** — **Décision
  requise** : confirmer `CONTACT_EMAIL` (`src/data/site.js:1`) et fournir les URLs
  Instagram/Facebook réelles (`ContactSection.jsx:140-145`, actuellement `href="#"`).
  **Acceptation** : liens réels branchés, ou décision de retirer les icônes.
  **Reliquat** : aucun contenu fourni pendant le sprint → reporté tel quel au
  Sprint 3 (item 3.4).

> **Definition of Done du Sprint 2** (en plus de la DoD standard) : aucune
> vulnérabilité `high` non documentée ; l'URL mailto est verrouillée par un test ;
> les items 2.4/2.5 ne sont cochés que sur contenu fourni par l'utilisateur —
> jamais inventé. — **SATISFAITE** (2.4/2.5 non cochés, conformément au garde-fou
> contenu ; 0 vulnérabilité restante ; mailto verrouillé par `mailto.test.js`).

---

# 🟢 SPRINT 3 — Mise en ligne et contenu réel ✅ (clos le 2026-07-07, verdict : DoD satisfaite — 3.2/3.3/3.4 reportés au Sprint 4, accès/contenus utilisateur toujours manquants)

> **Objectif** : mettre le site en production (décision utilisateur du
> 2026-07-07 : « Déployer l'application ») et absorber le contenu réel dès que
> l'utilisateur le fournit. 3.1 est le seul item exécutable sans action
> utilisateur ; 3.2 (D13) attend l'import du dépôt dans le tableau de bord
> Vercel (décision prise : intégration Git) ; 3.3/3.4 reprennent 2.4/2.5.
> Ordre conseillé : 3.1 → 3.2 dès l'import fait → 3.3/3.4 dès le contenu fourni.

- [x] **3.1** **Étape `npm audit` dans la CI** → `5854503`
  Garde-fou identifié à la rétro du Sprint 1 et rendu viable par l'item 2.1
  (reliquat = 0) : étape `npm audit --audit-level=high` ajoutée dans
  `.github/workflows/ci.yml:27-28` (après `npm ci`, avant le lint) pour que la
  dette sécurité ne se réinstalle pas silencieusement.
  **Acceptation SATISFAITE** : `npm audit --audit-level=high` exit 0 en local
  (0 vulnérabilité — la CI passe aujourd'hui) et exit non nul par construction
  sur vulnérabilité ≥ high (comportement documenté de npm audit) ; YAML validé
  par parseur ; lint/tests (21/21)/build inchangés et verts.
- [ ] **3.2** (D13) **Déployer sur Vercel** — **Décision prise (2026-07-07)** :
  **intégration Git Vercel** (la voie `VERCEL_TOKEN` est écartée).
  Reste-à-faire : l'utilisateur importe `yvlar/ninjasasquacth-frontend` dans le
  tableau de bord Vercel (« Add New… → Project » — procédure dans le README,
  section « Déploiement »), puis un push/merge sur `main` déclenche le
  déploiement de production ; enfin, vérifier l'URL (MCP Vercel
  `list_projects`/`list_deployments`, équipe `yvlars-projects`) et la consigner
  ici + dans le README.
  **Acceptation** : URL de production accessible et consignée ici + dans le
  README ; le build déployé est celui de `main` (ou de la branche décidée).
  **Reliquat** : import re-vérifié via MCP Vercel en début ET en fin de sprint
  (équipe `yvlars-projects`) — toujours aucun projet pour ce dépôt → reporté
  tel quel au Sprint 4 (item 4.2).
- [ ] **3.3** (D3) **Vraies photos produits** — **Décision requise** (report de
  2.4, périmètre identique) : brancher les vraies photos (`src/data/games.js:11`
  et suiv.) et ajouter `og:image` (`index.html`).
  **Acceptation** : plus aucune URL Unsplash dans `src/data/games.js`.
  **Reliquat** : aucun contenu fourni pendant le sprint → reporté tel quel au
  Sprint 4 (item 4.3).
- [ ] **3.4** (D7, D12) **Email officiel + liens sociaux réels** — **Décision
  requise** (report de 2.5, périmètre identique) : confirmer `CONTACT_EMAIL`
  (`src/data/site.js:1`), fournir les URLs Instagram/Facebook
  (`ContactSection.jsx:137-142`, actuellement `href="#"`) ou décider de retirer
  les icônes.
  **Acceptation** : liens réels branchés, ou icônes retirées sur décision.
  **Reliquat** : aucun contenu fourni pendant le sprint → reporté tel quel au
  Sprint 4 (item 4.4).

> **Definition of Done du Sprint 3** (en plus de la DoD standard) : la CI
> échoue sur vulnérabilité `high` ; aucune mise en ligne sans URL vérifiée et
> consignée ; les items 3.2/3.3/3.4 ne sont cochés que sur accès/contenu fournis
> par l'utilisateur — jamais inventés. — **SATISFAITE** (garde-fou audit actif
> dans la CI ; aucune mise en ligne effectuée donc aucune URL à consigner ;
> 3.2/3.3/3.4 non cochés, conformément au garde-fou contenu).

---

# 🟢 SPRINT 4 — Accessibilité, mise en ligne et contenu réel ✅ (clos le 2026-07-08, verdict : DoD satisfaite — 4.3/4.4 reportés, Décisions requises restées sans réponse)

> **Objectif** : ajouter le garde-fou d'accessibilité identifié à la rétro du
> Sprint 2 (« audit a11y plus large ») — seul travail exécutable sans action
> utilisateur — et absorber l'accès Vercel et le contenu réel dès que
> l'utilisateur les fournit. 4.2/4.3/4.4 reprennent 3.2/3.3/3.4 à périmètre
> identique. Ordre conseillé : 4.1 → 4.2 dès l'import fait → 4.3/4.4 dès le
> contenu fourni. **Avancement** : 4.2 fait dès l'ouverture (site mis en ligne
> par l'utilisateur, URL vérifiée et consignée) ; reste 4.1 (exécutable) et
> 4.3/4.4 (Décisions requises).

- [x] **4.1** **Garde-fou a11y dans le lint** → `6b445c5`
  `eslint-plugin-jsx-a11y` (préréglage `recommended`) branché dans le flat
  config (`eslint.config.js`). Le préréglage a révélé 4 erreurs : cartes de
  jeu cliquables mais inaccessibles au clavier (`GameCard.jsx`) — corrigé
  (role=button, tabIndex 0, Entrée/Espace, focus visible) et verrouillé par
  3 tests rouges avant le fix (`src/__tests__/game-card-a11y.test.jsx`) ;
  les deux `href="#"` Instagram/Facebook = placeholders D12 (item 4.4,
  Décision requise) — verrou `anchor-is-valid` suspendu localement avec
  commentaire pointant 4.4, à retirer en résolvant la décision.
  **Acceptation SATISFAITE** : plugin actif, lint vert (zéro erreur, zéro
  warning), 24/24 tests verts, build OK, audit high = 0.
- [x] **4.2** (D13) **Déployer sur Vercel** → **URL de production** :
  `https://ninjasasquacth-frontend.vercel.app`
  Intégration Git Vercel en place (décision du 2026-07-07). Site vérifié **en
  ligne et public** : réponse HTTP 200, titre et meta description **identiques
  byte-for-byte** à `index.html` (SEO de l'item 1.4) → le build servi est bien
  celui de `main`. Consigné ici + dans le README (section « Déploiement »).
  **Note** : la vérification s'est faite par requête HTTP directe sur l'URL
  publique. Les API de gestion de l'intégration MCP Vercel ne couvrent pas ce
  projet — **problème d'autorisation, pas de découverte** : même avec l'ID
  projet fourni (`prj_mQkt78gkQIeDB1ccAHBV8895HAox`, équipe
  `team_q1UhvyjnHoxIanQhyp9HCdBF`), `get_project`→404 et `list_deployments`→403.
  Le token de l'intégration est scoppé au seul projet `grandford`. Pour piloter
  ce projet via MCP (ID de déploiement, SHA, logs), il faut accorder à
  l'intégration/au token l'accès au projet `ninjasasquacth-frontend` côté
  tableau de bord Vercel. L'alias équipe
  `ninjasasquacth-frontend-yvlars-projects.vercel.app` est protégé (SSO Vercel) ;
  le domaine de production propre reste public.
  **Acceptation SATISFAITE** : URL de production accessible et consignée ici +
  dans le README ; contenu servi conforme à `main`.
- [ ] **4.3** (D3) **Vraies photos produits** — **Décision requise** (report de
  3.3, périmètre identique) : brancher les vraies photos (`src/data/games.js:11`
  et suiv. — 6 URLs Unsplash) et ajouter `og:image` (`index.html`).
  **Acceptation** : plus aucune URL Unsplash dans `src/data/games.js`.
  **Reliquat** : aucun contenu fourni pendant le sprint → le Sprint 5 (backend)
  change la nature du problème : les jeux (et leurs photos, uploadées par
  l'admin dans Supabase Storage) sortiront du code — l'item 5.12 purge les URLs
  Unsplash, l'upload des vraies photos devient une action admin (D3).
- [ ] **4.4** (D7, D12) **Email officiel + liens sociaux réels** — **Décision
  requise** (report de 3.4, périmètre identique) : confirmer `CONTACT_EMAIL`
  (`src/data/site.js:1`), fournir les URLs Instagram/Facebook
  (`src/components/sections/Contact/ContactSection.jsx:137-142`, actuellement
  `href="#"`) ou décider de retirer les icônes.
  **Acceptation** : liens réels branchés, ou icônes retirées sur décision.
  **Reliquat** : aucun contenu fourni pendant le sprint → D7/D12 restent des
  Décisions requises au registre (hors périmètre du Sprint 5 backend).

> **Definition of Done du Sprint 4** (en plus de la DoD standard) : le lint
> échoue sur violation a11y du préréglage `recommended` ; aucune mise en ligne
> sans URL vérifiée et consignée ; les items 4.2/4.3/4.4 ne sont cochés que sur
> accès/contenu fournis par l'utilisateur — jamais inventés. — **SATISFAITE**
> (lint a11y actif et vert ; URL de production vérifiée et consignée ; 4.3/4.4
> non cochés, conformément au garde-fou contenu — reportés : D3 trouvera son
> canal naturel dans l'admin du Sprint 5, D7/D12 restent au registre).

---

# 🟢 SPRINT 5 — Backend Supabase : auth admin, création de jeux, lecture publique ✅ (clos le 2026-07-08, verdict : DoD satisfaite — 5.4 reporté, action utilisateur restée en attente)

> **Objectif** (décisions utilisateur 2026-07-07 et 2026-07-08) : doter le site
> d'un backend Supabase — authentification avec rôle admin, interface admin de
> **création de jeux (photos, descriptions)**, et site public lisant les jeux
> depuis Supabase. But ultime exprimé par l'utilisateur : la création de jeux.
> Espace client = sprint ultérieur (le modèle de rôles le prépare, 5.A).
> Prérequis d'accès utilisateur : mot de passe admin (5.4), variables Vercel
> (5.13). Ordre : 5.1 → 5.14 (backend MCP d'abord, le front a besoin du schéma).

**Décisions de cadrage** (toutes prises) :

- [x] **5.A** **Finalité du login** — **Décision prise (2026-07-07)** :
  administration ET espace client — deux rôles distincts. Modèle de rôles dès
  la conception (RLS par rôle). **Périmètre 2026-07-08** : ce sprint livre le
  rôle admin (gestion des jeux) ; l'espace client attend un sprint ultérieur.
- [x] **5.B** **Choix d'infrastructure** — **Décision prise (2026-07-07)** :
  Supabase (Auth + Postgres + RLS). **2026-07-08** : nouveau projet dédié
  (0 $/mois vérifié) — le projet existant du compte appartient à GRANDFORD,
  on n'y touche pas. Clés côté variables d'environnement uniquement.
- [x] **5.C** **Impact sur l'architecture frontend** — **Décision prise
  (2026-07-08)** : `react-router-dom` — `/` = site vitrine inchangé,
  `/admin` = espace protégé par login. Amendement `CLAUDE.md` autorisé,
  consigné à l'item 5.14 (commit dédié citant cette décision).
- [x] **5.D** (D6) **Synergie formulaire de contact** — **Décision prise
  (2026-07-08)** : **reporté** — le formulaire reste en `mailto:` ce sprint
  (D6 au backlog, à recadrer une fois le socle Supabase en place).
- [x] **5.E** **Compte admin** — **Décision prise (2026-07-08)** :
  `ivess49@gmail.com` (créé côté Supabase, jamais en dur dans le code).
- [x] **5.F** **Données initiales** — **Décision prise (2026-07-08)** :
  **base vide** — pas de seed des 6 jeux statiques ; le site public affiche un
  état vide propre (message i18n) jusqu'à création des jeux par l'admin. Les
  données statiques `games` et les clés `games.items.*` sont purgées (5.12).
- [x] **5.G** **Catégories** — **Décision prise (2026-07-08)** : fixes ce
  sprint (`famille`/`stratégie`/`party` dans le code/i18n, `tous` =
  pseudo-filtre) ; l'admin choisit parmi les trois.

**Items** :

- [x] **5.1** **Projet Supabase dédié** → créé le 2026-07-08 :
  **`ninja-sasquatch-games`** (ref `vgmqmifgdolccquyjcoc`, org
  `mfaahgznohhnqguffoah`, région `ca-central-1`, statut `ACTIVE_HEALTHY`),
  URL d'API : `https://vgmqmifgdolccquyjcoc.supabase.co`. Coût confirmé
  0 $/mois avant création (`confirm_cost`). La clé publiable vit dans l'env
  (`.env.local`, variables Vercel) — jamais dans le dépôt.
  **Acceptation SATISFAITE** : `get_project` → `ACTIVE_HEALTHY`, ref/URL
  consignés, aucun secret committé.
- [x] **5.2** **Migration schéma + RLS** → `a216f6f`
  Tables `profiles` (rôles admin/client, trigger signup) et `games`
  (catégorie CHECK accentuée, colonnes bilingues NOT NULL `*_fr`/`*_en`,
  `image_url`, `published`, timestamps), fonction `is_admin()` security
  definer, RLS. SQL tracé sous `supabase/migrations/20260708032500_*.sql`.
  **Acceptation SATISFAITE** : `execute_sql` sous rôle `anon` — 1 seul jeu
  visible sur 2 (le publié), insert rejeté (42501) ; advisors sécurité : les
  2 WARN restants sur `is_admin()` sont intentionnels et documentés
  (`handle_new_user` dé-exposée du RPC en correctif).
- [x] **5.3** **Bucket Storage `game-images`** → `65f58cf`
  Public en lecture, 5 Mio, jpeg/png/webp, écritures `is_admin()`. SQL tracé.
  **Acceptation SATISFAITE** : insert anon dans `storage.objects` rejeté
  (42501), config du bucket vérifiée en base.
- [ ] **5.4** **Compte admin** — **Prérequis d'accès utilisateur** : créer
  l'utilisateur `ivess49@gmail.com` dans le dashboard Supabase
  (Authentication → Add user, auto-confirm, mot de passe choisi par lui).
  Ensuite : promotion `role='admin'` en SQL via MCP.
  **Acceptation** : `execute_sql` prouve le rôle admin ; aucun identifiant
  dans le dépôt.
  **Reliquat** : action utilisateur non réalisée pendant le sprint → reporté
  tel quel au Sprint 6 (item 6.1). Sans elle, personne ne peut se connecter
  à `/admin` (le reste du livré n'en dépend pas).
- [x] **5.5** **Dépendances + client Supabase + env** → `148c512`
  `@supabase/supabase-js` + `react-router-dom`, `src/lib/supabase.js`
  (singleton, erreur explicite si env manquante), `.env.example`.
  **Acceptation SATISFAITE** : `supabase-client.test.js` vert (rouge avant),
  audit high = 0, build vert sans variables (prouvé en déplaçant `.env.local`).
- [x] **5.6** **Routage `/` et `/admin` + rewrite Vercel** → `a8690df`
  `BrowserRouter` dans `main.jsx`, `AppRoutes` (`/` → `App` intact, `/admin`
  → `AdminPage` lazy, `*` → `/`), `vercel.json`.
  **Acceptation SATISFAITE** : `routing.test.jsx` vert (rouge avant), les
  24 tests existants inchangés, code-splitting visible au build.
- [x] **5.7** **Session + login admin** → `b343e63`
  `src/auth/` (calqué sur `src/i18n/`), `LoginForm` accessible, clés
  `admin.login.*` fr+en, helper `supabaseMock.js` (avancé depuis 5.11 : les
  tests d'auth en dépendent).
  **Acceptation SATISFAITE** : `auth-login.test.jsx` vert — identifiants
  transmis, erreur i18n, zone protégée après succès, signOut.
- [x] **5.8** **Garde `RequireAdmin`** → `04b1c08`
  Rôle lu dans `profiles` ; anonyme → login, non-admin → accès refusé
  (bouton déconnexion), admin → contenu. La barrière réelle reste la RLS.
  **Acceptation SATISFAITE** : `require-admin.test.jsx` vert (3 cas).
- [x] **5.9** **Création de jeux dans l'admin** → `f82a9d2`
  `GamesManager` (liste, brouillons signalés) + `GameForm` (FR+EN
  obligatoires, catégorie parmi les 3, validation type/taille AVANT upload,
  upload → `getPublicUrl` → insert).
  **Acceptation SATISFAITE** : `admin-game-create.test.jsx` vert (7 tests :
  payload exact avec catégorie accentuée, fichier invalide/trop gros bloqué
  sans upload, EN vide bloqué, upload → URL publique insérée) ; jsx-a11y vert.
- [x] **5.10** **Édition + suppression** → `7d7a06d`
  `GameForm` pré-rempli (update sur le bon id, image conservée sans nouveau
  fichier), suppression avec confirmation inline.
  **Acceptation SATISFAITE** : `admin-game-edit.test.jsx` vert (4 tests,
  delete jamais appelé avant confirmation).
- [x] **5.11** **`localizeGame` + `useGames` + fixtures** → `b1fc36a`
  Util pur + hook + `fixtures/games.js` (copy des anciens jeux 1-3, format
  table). Le helper de mock était déjà livré en 5.7.
  **Acceptation SATISFAITE** : tests dédiés verts, suite existante intacte.
- [x] **5.12** **Bascule lecture publique + purge statique** → `53547e9`
  `GamesSection` → `useGames` (loading/error/**empty**), `GameCard`/
  `GameDetail` → `localizeGame` (+ `image_url` nullable), suppression de
  l'export `games` (`categories` conservé) et de `games.items.*` des deux
  JSON, `games-contract.test.js` réécrit (verrous catégories + fixtures au
  format table), tests UI adaptés sur mocks+fixtures.
  **Acceptation SATISFAITE** : test « base vide → `games.empty` » rouge
  avant / vert après ; grep : zéro URL Unsplash, zéro `games.items` dans le
  code (périmètre code de D3 résolu) ; parité i18n verte ; suite complète
  verte (62 tests).
- [x] **5.13** **Build/preview + déploiement** → `78546ce` (+ fix `18525a9`)
  Localement : build sans env vert, preview parcourue (`/` et `/admin`),
  README « Déploiement » réécrit (variables Vercel, rewrite SPA). Preuves
  réseau réelles : lecture anonyme REST → 200 `[]` (RLS, base vide), insert
  anonyme → 401. La vérification navigateur a révélé et corrigé un bug
  (D16 : rejet réseau non géré dans `useGames` → UI bloquée en chargement) ;
  état d'erreur validé en navigateur réel après le fix.
  **Reliquat** : pose des variables `VITE_*` au dashboard Vercel +
  vérification HTTP de `/admin` en production = action utilisateur → Sprint 6
  (item 6.2). Le MCP Vercel reste scoppé à `grandford` (D13).
- [x] **5.14** **Clôture documentaire** → `433a2f5` (amendement CLAUDE.md en
  commit dédié citant la décision du 2026-07-08) + le commit de clôture.
  **Acceptation SATISFAITE** : DoD complète — lint 0/0, 62/62 tests, build
  vert, audit high 0, parité i18n verte, aucun secret committé.
  **Rectification post-clôture (D17)** : le « lint 0/0 » de ce verdict était
  un faux vert (exit code masqué par un pipe dans les commandes de preuve) —
  2 erreurs react-hooks corrigées en `2cfe778` après que la CI de la PR #7
  les a attrapées ; lint réellement 0/0 depuis.

> **Definition of Done du Sprint 5** (en plus de la DoD standard) : aucun
> secret (clé API, token, service key) dans le code ou les commits —
> variables d'environnement uniquement ; les tests restent 100 % sans réseau
> (client Supabase mocké) ; la sécurité d'écriture repose sur la RLS (prouvée
> par `execute_sql` sous rôle anon), jamais sur la seule garde frontend ;
> les items 5.4 et 5.13 ne sont cochés que sur action utilisateur effectuée —
> jamais à sa place ; les conventions de `CLAUDE.md` ne changent que par le
> commit dédié de l'item 5.14 citant la décision du 2026-07-08. —
> **SATISFAITE** (zéro secret — `.env.local` gitignoré, clé publiable en env
> seulement ; 62 tests mockés sans réseau ; RLS prouvée par SQL sous rôle
> anon ET par requêtes REST réelles — lecture 200 `[]`, insert 401 ; 5.4 non
> coché, action utilisateur en attente ; le volet local de 5.13 est livré,
> son volet production reste tracé en reliquat vers 6.2 ; CLAUDE.md amendé
> par le seul commit dédié `433a2f5`).

---

# 🟢 SPRINT 6 — Mise en service du backend et contenu réel ✅ (clos le 2026-07-08, verdict : DoD satisfaite — 6.2/6.3/6.4 reportés, actions/contenus utilisateur toujours manquants)

> **Objectif** : mettre le backend livré au Sprint 5 en service réel — compte
> admin actif, variables Vercel posées, premiers vrais jeux créés (avec
> photos → résout D3 côté contenu) — et absorber les décisions de contenu
> restantes (D7/D12). Leçon des rétros : au moins un item exécutable sans
> utilisateur → 6.5 (garde-fou anti-pause Supabase, D15). Ordre conseillé :
> 6.1 → 6.2 → 6.3 (dépendances strictes), 6.4/6.5 indépendants.

- [x] **6.1** **Compte admin actif** (report de 5.4) — **fait le 2026-07-08
  sur instruction utilisateur** (« le MCP Supabase est connecté, fais ces
  2 étapes ») : utilisateur `ivess49@gmail.com` créé via l'API publique
  `/auth/v1/signup` (mot de passe temporaire transmis en session, à changer),
  email confirmé et promotion `role='admin'` en SQL via MCP.
  **Acceptation SATISFAITE** : rôle admin prouvé en base (`profiles.role =
  'admin'`), connexion par mot de passe vérifiée (HTTP 200, jeton émis),
  écriture RLS prouvée sous le vrai JWT (insert 201 / delete 204 d'un
  brouillon de test, base revenue à 0) ; aucun identifiant committé.
- [ ] **6.2** **Variables Vercel + vérification prod** (reliquat de 5.13) —
  **Prérequis d'accès utilisateur** : poser `VITE_SUPABASE_URL` et
  `VITE_SUPABASE_ANON_KEY` dans le dashboard Vercel (Settings → Environment
  Variables, procédure au README) puis redéployer.
  **Acceptation** : `https://ninjasasquacth-frontend.vercel.app/` affiche
  l'état du catalogue servi par Supabase (vide ou jeux réels) et `/admin`
  répond en accès direct (rewrite `vercel.json` vérifié en production) —
  vérification HTTP directe, consignée ici.
  **Reliquat** : action utilisateur non réalisée pendant le sprint → reporté
  tel quel en « Actions utilisateur » du Sprint 7.
- [ ] **6.3** (D3) **Premiers vrais jeux + photos via l'admin** — **Décision/
  action utilisateur** : créer les jeux réels (textes FR/EN, photos produits
  uploadées dans `game-images`) via `/admin`. Dépend de 6.1 + 6.2.
  **Acceptation** : au moins un jeu réel publié visible sur le site public ;
  D3 clôturée (plus aucun placeholder nulle part). Ajouter `og:image`
  (`index.html`) dès qu'une vraie photo existe.
  **Reliquat** : aucun contenu créé pendant le sprint → reporté tel quel en
  « Actions utilisateur » du Sprint 7.
- [ ] **6.4** (D7, D12) **Email officiel + liens sociaux réels** — **Décision
  requise** (report de 4.4, périmètre identique) : confirmer `CONTACT_EMAIL`
  (`src/data/site.js:1`), fournir les URLs Instagram/Facebook
  (`src/components/sections/Contact/ContactSection.jsx:137-142`, `href="#"`)
  ou décider de retirer les icônes (retire aussi la suspension locale
  d'`anchor-is-valid` posée en 4.1).
  **Acceptation** : liens réels branchés, ou icônes retirées sur décision.
  **Reliquat** : aucun contenu fourni pendant le sprint → D7/D12 restent des
  Décisions requises, reportées en « Actions utilisateur » du Sprint 7.
- [x] **6.5** (D15) **Garde-fou anti-pause Supabase** → `cac264a`
  `.github/workflows/supabase-keepalive.yml` : cron hebdomadaire (lundi
  06:00 UTC) + `workflow_dispatch`, GET REST public sur `games` avec la clé
  publiable en secret GitHub Actions (`SUPABASE_URL`/`SUPABASE_ANON_KEY` —
  clé publique par conception, hors dépôt par convention) ; procédure et
  ligne de documentation au README.
  **Acceptation SATISFAITE sur le volet code** : YAML validé par parseur,
  committé, README documenté. **Exécution verte en attente du secret
  utilisateur** : les secrets GitHub Actions ne sont pas posés (action
  dashboard) — au premier `workflow_dispatch` vert, consigner ici.

> **Definition of Done du Sprint 6** (en plus de la DoD standard) : les items
> 6.1 → 6.4 ne sont cochés que sur action/contenu utilisateur effectifs —
> jamais à sa place ; aucune URL/statut de production consigné sans
> vérification HTTP directe ; aucun secret committé (la clé publiable vit en
> secret CI/variable d'env, jamais dans le YAML en clair). — **SATISFAITE**
> (6.1 coché sur action utilisateur effective — instruction et preuves en
> session ; 6.5 coché sur son volet code, l'exécution verte attend le secret
> utilisateur, consigné dans l'item ; 6.2/6.3/6.4 non cochés, reportés ;
> zéro secret committé — la clé vit en secrets GitHub Actions).

---

# 🟢 SPRINT 7 — Production : TypeScript strict, Tailwind v4 et durcissement ✅ (clos le 2026-07-08, verdict : DoD satisfaite)

> **Objectif** (décision utilisateur du 2026-07-08) : transformer le site en
> qualité production — migration complète de `src/` vers **TypeScript
> strict**, remplacement des CSS Modules par **Tailwind CSS v4** (palette de
> marque conservée en tokens `@theme`), et **socle robustesse** (error
> boundary, `tsc --noEmit` en CI, typescript-eslint, types Database Supabase,
> fallback Suspense visible, tests migrés en `.test.ts(x)`). Cette décision
> amende les conventions « pas de TypeScript / pas de framework CSS » de
> CLAUDE.md et des prompts — amendements en commits dédiés citant la décision
> (règles de gouvernance) : prompts AVANT l'exécution (7.0), CLAUDE.md à la
> fin (7.14, état réel documenté). Ordre strict : chaque commit laisse lint,
> typecheck (dès 7.1), tests, build et audit high verts.
>
> **Actions utilisateur rattachées (hors items — reports du Sprint 6)** :
> secrets GitHub Actions `SUPABASE_URL`/`SUPABASE_ANON_KEY` (6.5) ; variables
> Vercel + redéploiement (6.2) ; premiers vrais jeux + photos via `/admin`
> (6.3, D3) ; email officiel + liens sociaux (6.4, D7/D12).

- [x] **7.0** **Amendement des prompts de workflow** → `1add2e1`
  Commit dédié citant la décision du 2026-07-08 : pattern composant à
  2 fichiers, styles Tailwind v4 (tokens `@theme`), tests `*.test.{ts,tsx}`,
  DoD + `npm run typecheck`. Seul `prompt-executer-sprint.md` touché
  (`prompt-mise-a-jour-roadmap.md` ne véhicule aucune convention TS/CSS).
  **Acceptation SATISFAITE**.
- [x] **7.1** **Socle TypeScript** → `7768b34` — `typescript` + `typescript-eslint` +
  `@types/react{,-dom}` ; `tsconfig.json` strict (`noUncheckedIndexedAccess`,
  `verbatimModuleSyntax`, `moduleResolution: bundler`, `allowJs: true`
  transitoire — retiré en 7.5) ; `src/vite-env.d.ts` ; `vite.config.js` →
  `.ts` ; bloc TS dans `eslint.config.js` (convention `^[A-Z_]` transférée à
  `@typescript-eslint/no-unused-vars`) ; script `typecheck` + étape CI.
  **Acceptation** : `npm run typecheck` vert ; lint/tests/build verts ;
  étape Typecheck dans `.github/workflows/ci.yml` ; audit high 0 après
  installation.
- [x] **7.2** **Types Database Supabase + client typé** → `d65bd69`
  `src/types/database.ts` écrit à la main au format codegen supabase-js,
  dérivé de `supabase/migrations/20260708032500_init_games_auth.sql`
  (`GameCategory` = CHECK byte-for-byte, `CatalogCategoryId`, `GameRow`) ;
  `src/lib/supabase.js` → `.ts` avec `createClient<Database>` ;
  `src/data/games.js` → `.ts` typé (valeur runtime byte-identique).
  **Acceptation** : `games-contract.test.js` et `supabase-client.test.js`
  verts SANS modification (preuve que contrat et imports survivent).
- [x] **7.3** **Migration TS des modules feuilles** → `26922ce` — `utils/{localizeGame,
  mailto}`, `data/site`, `i18n/*`, `auth/*`, `hooks/useGames` → `.ts(x)`
  typés (`Lang`, interfaces de contexte, `GameRow[]`) ; spécificateur
  `./i18n/LanguageProvider.jsx` de `main.jsx` corrigé ; accès calculé de
  `localizeGame` réécrit compatible `noUncheckedIndexedAccess`.
  **Acceptation** : suite complète verte avec zéro modification de test ;
  typecheck vert.
- [x] **7.4** **Migration TS des composants et de l'entrée** → `82934cc` — tous les
  `.jsx` → `.tsx` (layout, sections, admin, App, AppRoutes, main), barrels
  `index.js` → `index.ts`, `index.html` → `/src/main.tsx`, interfaces de
  props partout, état de `GameForm` typé contre `Insert` ; eslint-disable
  `anchor-is-valid` (D12) conservé.
  **Acceptation** : suite verte sans modification de test ; build vert ;
  typecheck vert ; parcours dev-server `/` et `/admin`.
- [x] **7.5** **Migration TS des tests + strict intégral** → `a07fdee`
  `src/__tests__/**` → `.test.ts(x)`, `setup.ts`, `helpers/supabaseMock.ts`,
  `fixtures/games.ts` typé `GameRow[]` ; `setupFiles` mis à jour ; retrait
  de `allowJs` ; nettoyage du bloc ESLint JS.
  **Acceptation** : `git ls-files 'src/**/*.js' 'src/**/*.jsx'` vide ;
  Vitest rapporte **62 tests / 18 fichiers** (aucun test perdu au
  renommage) ; typecheck strict vert sur tout, tests compris.
- [x] **7.6** (D18) **Error boundary + fallback Suspense visible** → `9ddc150`
  `src/components/ErrorBoundary/` (classe + `ErrorFallback` scindé pour
  react-refresh, TS), monté dans `main.tsx` sous
  `LanguageProvider` autour d'`AppRoutes` (fallback i18n
  `errors.boundary.*`, clés fr+en) ; `fallback={null}` d'`AppRoutes` →
  élément de chargement i18n (`admin.loading`). Limite consignée : le throw
  à l'import de `lib/supabase.ts` (env manquante) reste un fail-fast avant
  React, non couvert — intentionnel.
  **Acceptation** : tests rouges avant fix (enfant qui throw → fallback ;
  `/admin` en attente → « Chargement… ») ; parité i18n verte ; décompte > 62.
- [x] **7.7** (D20) **Socle Tailwind v4** → `06fa650` — `tailwindcss` +
  `@tailwindcss/vite` dans `vite.config.ts` ; `src/styles/global.css`
  réécrit : `@import "tailwindcss"` + `@theme` (5 couleurs de marque →
  génère `bg-cream`, `text-dark-green`, … et conserve les `var(--color-*)`
  pour les modules pas encore convertis ; `--font-heading` Poppins) ;
  préflight remplace le reset universel (re-déclarer en `@layer base` :
  scroll-behavior + `prefers-reduced-motion`, stack body + line-height 1.6,
  Poppins h1-h6) ; import `global.css` déplacé vers `main.tsx` ; Poppins en
  `<link>` préconnecté dans `index.html` (D20).
  **Acceptation** : build vert ; parcours visuel `/` et `/admin` sans
  régression (les modules portent encore les styles) ; audit high 0.
- [x] **7.8** **Conversion Tailwind : Header + Footer** → `780ee08` — supprime
  `Header.module.css` + `Footer.module.css`.
- [x] **7.9** **Conversion Tailwind : Hero + About** → `39e25ec` — 2 modules
  supprimés.
- [x] **7.10** **Conversion Tailwind : section Jeux** → `2820da1` — 4 composants,
  `Games.module.css` partagé supprimé en un commit.
- [x] **7.11** **Conversion Tailwind : Contact** → `914ec00` — erreurs en
  `text-error`, disable a11y D12 conservé ; supprime `Contact.module.css`.
- [x] **7.12** **Conversion Tailwind : admin** → `2473a35` — 5 composants,
  5 modules supprimés.
  **Acceptation 7.8 → 7.12 (chacun)** : les `.module.css` nommés supprimés ;
  zéro référence `styles.`/`module.css` restante dans les composants
  convertis ; lint/typecheck/tests/build verts ; vérification visuelle
  documentée à 375/768/1280 px, deux langues ; `focus-visible:` et
  `motion-reduce:` ajoutés sur les interactifs (additif seulement).
- [x] **7.13** **Purge finale CSS Modules** → `836217c` — dernier style inline
  (div racine d'App) converti en classes ; `git grep -l "module.css" src/`
  vide ; seul CSS restant : `global.css` (bundle CSS unique 21,8 kB / gzip
  4,7 kB).
- [x] **7.14** **Amendement CLAUDE.md** → `5947b4c` — commit dédié citant la
  décision du 2026-07-08 : stack (TS strict, Tailwind v4), commandes
  (+`typecheck`), pattern 2 fichiers, section Styling réécrite (tokens
  `@theme`, préflight), convention lint & types, section tests.
  **Acceptation SATISFAITE** : seul CLAUDE.md touché ; décision citée.
- [x] **7.15** **Clôture Sprint 7** → ce commit — `prompt-mise-a-jour-roadmap.md`
  déroulé (hashs, découvertes, changelog avec décompte réel, rétrospective,
  notes /100, Sprint 8 défini), puis push de la branche.

> **Definition of Done du Sprint 7** (en plus de la DoD standard) :
> `npm run typecheck` zéro erreur dès 7.1 ; aucun test perdu à la migration
> (62 tests / 18 fichiers prouvés à 7.5, décompte strictement supérieur
> après 7.6) ; parité visuelle vérifiée à chaque conversion (375/768/1280 px,
> FR et EN) ; les fichiers gouvernés ne changent que par les commits dédiés
> 7.0 et 7.14 citant la décision utilisateur du 2026-07-08 ; aucun hex brut
> hors `@theme` ; aucun secret committé. — **SATISFAITE** (lint 0/0,
> `tsc --noEmit` 0, **64 tests / 19 fichiers** verts, build vert, audit high
> 0 ; migration sans perte — 62→64 tests, les 2 ajoutés couvrent l'error
> boundary et le fallback /admin, rougis avant le fix ; zéro `.module.css` et
> zéro `styles.` sous `src/`, seul `global.css` subsiste ; parité visuelle
> contrôlée par captures preview aux 3 largeurs ; prompts et CLAUDE.md
> amendés par les seuls commits dédiés `1add2e1` et `5947b4c` citant la
> décision ; palette exclusivement en tokens `@theme` ; aucun secret).

---

# ⚪ SPRINT 8 — Durcissement production & mise en service (à ouvrir)

> **Objectif** : consolider la qualité production livrée au Sprint 7 et
> absorber les actions utilisateur en attente. Ordre conseillé : 8.1
> (exécutable sans utilisateur) d'abord ; 8.2 dès le « go » ; 8.3/8.4 dès
> l'action/contenu utilisateur. Leçon des rétros : garder au moins un item
> exécutable sans utilisateur → 8.1.

- [ ] **8.1** **Parcours E2E automatisé (Playwright)** — exécutable sans
  utilisateur : le manque d'un vrai E2E est identifié aux rétros des
  Sprints 5 et 7 (parité visuelle et parcours seulement vérifiés à l'œil).
  Ajouter un parcours headless (Chromium déjà présent) : navigation par
  ancres, filtre catégories (dont « stratégie »), bascule FR/EN, deep-link
  `/admin` → « Chargement… » → login. Mock ou env de test pour Supabase.
  **Acceptation** : un script E2E vert en local et en CI, sans secret.
- [ ] **8.2** (D19) **Headers de sécurité `vercel.json`** — **Décision
  requise** (« go » utilisateur) : ajouter CSP, HSTS, X-Frame-Options,
  X-Content-Type-Options via la clé `headers` de `vercel.json:1` (aujourd'hui
  rewrite SPA seul). **Acceptation** : headers servis en production
  (vérification HTTP directe), site et `/admin` toujours fonctionnels.
- [ ] **8.3** **Actions utilisateur en attente** (reports du Sprint 6) —
  secrets CI keepalive (6.5), variables Vercel + redéploiement (6.2), premiers
  vrais jeux + photos via `/admin` (6.3, D3, + `og:image`), email officiel +
  liens sociaux (6.4, D7/D12). Chacune reste bloquée sur action/contenu
  utilisateur — jamais faite à sa place.
- [ ] **8.4** (D6) **Formulaire de contact avec backend réel** — **Décision
  requise** (choix d'infra) : le formulaire reste en `mailto:`
  (`ContactSection.tsx`) ; un envoi réel demanderait un service (Edge Function
  Supabase, Formspree…). À recadrer maintenant que le socle Supabase est en
  place.

---

# 🟢 SPRINT 9 — Modèle Supabase, administration et vraies routes de jeux ✅ (clos le 2026-07-12, verdict : DoD satisfaite)

> **Objectif** (décision utilisateur 2026-07-12) : permettre au site et à
> l'administration de gérer de vraies fiches de jeux bilingues — modèle de
> données produit, galerie/documents, routes publiques partageables, langue
> portée par l'URL — sans jamais inventer de contenu de marque. La spec produit
> `docs/brand-seo-spec.md` référencée par le prompt est **absente du dépôt**
> (D21) : sur décision utilisateur (« Build the infrastructure now »),
> l'infrastructure est livrée et le contenu réel (copies SEO, jeux Heroes
> Rising / Burgle Jack / Flickle Mania) reste une action utilisateur via
> `/admin`. Migration additive uniquement ; aucune donnée existante perdue.

- [x] **9.1** **Migration additive + `game_media` + RLS** → `0b35b53`
  Colonnes produit sur `games` (slug unique, taglines, players/duration
  min/max, minimum_age, complexity, mechanics[], game_languages[], theme_key
  CHECK, campaign_status CHECK, kickstarter_url, rules_pdf_*, featured_order,
  coming_soon — toutes nullables ou défaut sûr) ; table `game_media` (FK cascade,
  storage_path, media_type, alt_*, sort_order) + RLS. Appliquée au projet
  `vgmqmifgdolccquyjcoc`, tracée dans `supabase/migrations/`.
  **Acceptation SATISFAITE** : RLS prouvée sous rôle `anon` (lecture publiés
  seuls pour games ET game_media, écritures rejetées 42501) et sous JWT admin
  (écritures autorisées, en transactions annulées) ; ligne existante « Mario »
  préservée, `campaign_status`/`coming_soon` backfillés sûrs ; advisors : seuls
  les 3 WARN pré-existants documentés (is_admin 0028/0029, bucket, mot de passe).
- [x] **9.2** **Types alignés sur le schéma réel** → `aac6cfe`
  `src/types/database.ts` couvre toutes les colonnes ; `GameMediaRow/Insert/
  Update`, `GameThemeKey`, `CampaignStatus` exposés. Les unions des colonnes
  sous CHECK (category/theme_key/campaign_status) sont écrites à la main — le
  codegen supabase-js les émet en `string` (une CHECK n'est pas un enum) — et
  miroir byte-for-byte la migration.
  **Acceptation SATISFAITE** : typecheck vert, fixtures alignées, contrat
  catégories inchangé.
- [x] **9.3** **`GameForm` scindé en groupes de champs** → `de3250b`
  BasicInformation/Gameplay/Campaign/Media/PublishingFields + `gameFormTypes`
  (état, buildPayload, dérivation players/duration/age) + `gameFormValidation`
  (pure, clés i18n) + `FormField`. Thème stocké comme clé contrôlée, jamais une
  classe/hex. Validation client complète, base autorité finale.
  **Acceptation SATISFAITE** : tests de création réécrits, i18n FR/EN à parité.
- [x] **9.4** **Cycle de vie des images sans orphelin** → `a4bf89c`
  `imagePathFromPublicUrl` (chemin déduit de l'URL) ; rollback du fichier après
  échec SQL ; suppression de l'ancienne image seulement après update réussie ;
  suppression des fichiers (photo + game_media) à la suppression d'un jeu ;
  erreur claire si le nettoyage échoue. Compensation côté client (admin-only,
  simple, testable) plutôt qu'Edge Function.
  **Acceptation SATISFAITE** : tests rollback/replace/delete rouges avant fix.
- [x] **9.5** **Routes localisées + fiches + cartes-liens + PDF + 404** → `b4420eb`
  `/`→`/fr` ; `/fr`,`/en` ; `/fr/jeux/:slug`,`/en/games/:slug` ; `/admin` ;
  vraie 404. `setLang`/`useSyncLang`/`LanguageToggle` (bascule conservant le
  slug). `useGameBySlug` (chargement/erreur/rejet/absent/démontage, publié via
  RLS). Fiche en 9 sections réutilisables recevant la donnée Supabase (aucun
  jeu codé en dur). Cartes = vrais `Link` (plus de `selectedGame`, `GameDetail`
  supprimé). `RulesDownload` = vrai `<a download>` annonçant le PDF, ou mention
  « bientôt disponible » (aucun lien mort, aucun faux PDF).
  **Acceptation SATISFAITE** : tests routes FR/EN, 404, trouvé/absent/rejet,
  PDF présent/absent, bascule langue conservant le slug.
- [x] **9.6** **Tests complémentaires** → `79bf43e`
  Validation joueurs/durée/URL Kickstarter (`game-form-validation`), chemins
  localisés (`routes`).
  **Acceptation SATISFAITE** : 64 → 96 tests, chaque comportement rouge avant vert.
- [x] **9.7** **Documentation** → `923cd21`
  README : incohérence de stack corrigée (TypeScript strict + Tailwind v4,
  routes localisées). CLAUDE.md : architecture Sprint 9 (routes, modèle produit,
  game_media, GameForm scindé, cycle image, fiches, dossiers pages/game).
- [x] **9.8** **Clôture Sprint 9** → ce commit (ROADMAP).

> **Definition of Done du Sprint 9** (en plus de la DoD standard) : migration
> appliquée ET tracée ; RLS prouvée (anon + admin) ; types conformes au schéma
> réel ; admin gère les nouveaux champs ; images non-orphelines dans les
> scénarios testés ; routes FR/EN fonctionnelles ; cartes = vrais liens ; vraie
> 404 ; aucune donnée existante perdue ; aucun contenu de marque manquant
> inventé ; aucun secret committé ; lint/typecheck/tests/build/audit verts. —
> **SATISFAITE** (migration additive appliquée et tracée, RLS prouvée sous anon
> et JWT admin ; types = schéma réel ; GameForm gère tous les champs produit ;
> tests d'images verts ; routes localisées et 404 réelles vérifiées par tests ;
> « Mario » préservé ; D21 : contenu de marque laissé aux actions utilisateur ;
> zéro secret ; lint 0, typecheck 0, 96 tests, build OK, audit high 0).

---

# 🟢 SPRINT 10 — Refonte visuelle Ninja Sasquatch et accueil Heroes Rising ✅ (clos le 2026-07-12, verdict : DoD satisfaite)

> **Objectif** (prompt utilisateur du 2026-07-12) : appliquer la nouvelle
> direction visuelle Ninja Sasquatch Games (palette, sous-palettes locales aux
> jeux, typographie) sans casser bilinguisme, accessibilité, responsive, routes,
> administration, tests ni sécurité Supabase. Heroes Rising devient le hero
> principal, **lu depuis Supabase**. **Aucun contenu de marque inventé** : logo
> officiel, photo/biographie du fondateur, photos produits et URLs Kickstarter
> restent des actions utilisateur ; les contenus manquants utilisent un état
> neutre ou restent masqués. La spec `docs/brand-seo-spec.md` reste **absente**
> (D21) — la direction de marque (palette, polices, liens sociaux réels) est
> fournie par le prompt lui-même et appliquée telle quelle.

- [x] **10.1** **Tokens de marque + typographie** → `feat(theme)`
  `global.css` réécrit : palette principale (roux/forêt/crème/charbon) + sous-
  palettes Heroes Rising / Burgle Jack + polices (`--font-brand` Alfa Slab One,
  `--font-body` Atkinson Hyperlegible, `--font-accent` Black Ops One) dans
  `@theme` ; tokens de couleur renommés dans tous les composants (aucun hex de
  marque hors `@theme`) ; `index.html` charge les 3 polices. Nouveau
  `src/data/gameThemes.ts` : registre statique, exhaustif, typé sur
  `GameThemeKey` (jamais de classe Tailwind construite dynamiquement).
  **Acceptation SATISFAITE** : lint/typecheck/tests/build verts, grep sans hex de
  marque dans les composants.
- [x] **10.2** **Liens sociaux réels + composant accessible** → `feat(social)`
  `src/data/socialLinks.ts` (URLs réelles Facebook/YouTube/LinkedIn — **résout
  D12**) ; composant partagé `SocialLinks` (nouvel onglet, `rel="noreferrer"`,
  `aria-label` localisé, icônes décoratives masquées) dans Footer + Contact ;
  suppression des `href="#"` et de la suspension `anchor-is-valid` ; champs de
  contact reliés à leurs erreurs par `aria-describedby` + `role="alert"`.
  **Acceptation SATISFAITE** : `social-links.test` (4 cas) rouge avant vert,
  aucun `href="#"` restant.
- [x] **10.3** **Header accessible + logo cliquable** → `feat(header)`
  Menu mobile : `aria-label`/`aria-expanded`/`aria-controls`, fermeture par Échap
  avec retour du focus au bouton ; wordmark = lien vers l'accueil localisé
  (aucun logo officiel fourni → repli textuel) ; micro-interactions avec
  `motion-reduce`. Header dans l'identité de marque (aucune sous-palette).
  **Acceptation SATISFAITE** : `header-a11y.test` (4 cas) vert.
- [x] **10.4** **Accueil refondu** → `feat(home)`
  Ordre : hero vedette → réassurance → univers → créations → fondateur →
  notification de lancement → contact. Hero **alimenté par Supabase**
  (`selectFeaturedGame`, Heroes Rising prioritaire) : titre, accroche, mention
  Kickstarter selon `campaign_status`, CTA « Être notifié au lancement » + CTA
  secondaire vers la fiche, badge « contenu en anglais » (`isEnglishOnly`) ;
  sans image → composition de marque sobre ; base vide → repli de marque.
  Bandeau de réassurance (3 promesses validées). « Origines Mystérieuses »
  réutilisé dans la section univers. Cartes stylées par `theme_key` (structure
  identique). Section fondateur sans biographie/photo inventée. Notification :
  Kickstarter seulement si URL publique.
  **Acceptation SATISFAITE** : `home-redesign.test` (7 cas) vert.
- [x] **10.5** **Fiches homogènes** → `feat(fiche)`
  GameHero applique la sous-palette en accent local (barre + pastille) et le
  badge « contenu en anglais » ; texte jamais sur la photo ; section crédits
  (crédit studio réel) ; bouton PDF visible hors accordéon.
  **Acceptation SATISFAITE** : `game-page.test` étendu (badge présent/absent,
  crédits) vert.
- [x] **10.6** **Vérifications visuelles + clôture** → ce commit
  Captures Chromium headless (Playwright) à 375/768/1280 px en FR et EN
  (accueil + menu mobile ouvert) ; CLAUDE.md (styling/architecture) et ROADMAP
  mis à jour.

> **Definition of Done du Sprint 10** (en plus de la DoD standard) : nouvelle
> identité appliquée ; logo officiel utilisé seulement s'il est fourni (il ne
> l'est pas → repli) ; Heroes Rising = hero principal lu depuis Supabase ; site
> cohérent sans photos manquantes ; trois fiches à structure homogène ; menu
> mobile accessible ; réseaux sociaux réels fonctionnels ; aucun lien fictif ;
> aucun contenu manquant inventé ; aucun hex de marque hors `@theme` ; FR/EN
> fonctionnels ; responsive validé (375/768/1280) ; lint/typecheck/tests/build/
> audit high verts. — **SATISFAITE** (lint 0, typecheck 0, **114 tests**, build
> OK, audit high 0 ; palette + polices en `@theme` seul ; D12 résolue ; hero
> Supabase + repli sobre ; menu mobile aria + Échap + focus ; captures FR/EN aux
> 3 largeurs ; logo/portrait fondateur/photos produits/URLs Kickstarter non
> inventés — D3/D21/D22 restent des actions utilisateur).

---

## Découvertes

| #   | Gravité | Constat | Affectation |
|-----|---------|---------|-------------|
| D1  | ✅ | Aucun framework de test : aucun script `test`, aucun fichier de test — les contrats byte-for-byte (parité i18n, catégories accentuées, ancres de nav) n'étaient protégés par rien, et `t()` masque les clés manquantes en retournant la clé | ✅ Sprint 1 (items 1.1 `0d6d903`, 1.2 `ee5cf70`) — 16 tests verrous |
| D2  | ✅ | Aucune CI : pas de répertoire `.github/`, lint/build jamais vérifiés sur push/PR | ✅ Sprint 1 (item 1.3 `db8f3bd`) |
| D3  | 🟡 | Images des 6 jeux = URLs Unsplash distantes — pas de vraies photos produits, dépendance à un CDN tiers. **Périmètre code résolu au Sprint 5** (item 5.12 `53547e9`) : plus aucune URL Unsplash dans le dépôt, les jeux statiques sont purgés (base vide, décision 5.F). Reste le volet contenu : créer les vrais jeux avec photos via `/admin` (upload Storage) + `og:image` | Sprint 6 (item 6.3 — action utilisateur via l'admin) |
| D4  | ✅ | Aucune balise SEO : pas de meta description ni OpenGraph, titre brut `ninja-sasquatch-games` | ✅ Sprint 1 (item 1.4 `4df9994`) — `og:image` reste lié à D3 |
| D5  | ✅ | Favicon = `vite.svg` par défaut | ✅ Sprint 1 (item 1.4 `4df9994`) — monogramme NS |
| D6  | 🟡 | Formulaire de contact en `mailto:` sans backend (`ContactSection.jsx:51`) — dépend du client mail de l'utilisateur ; un vrai envoi demanderait un service (API, Formspree…) | Backlog (choix d'infra à discuter) |
| D7  | 🟡 | Email de contact `info@ninjasasquatchgames.com` (`src/data/site.js:1`) possiblement placeholder — à confirmer avant toute mise en production | **Décision requise** — Sprint 3 (item 3.4, report de 2.5) |
| D8  | ✅ | README : typo « Frond-ent », aucun quickstart développeur | ✅ Sprint 1 (item 1.5 `4b3b507`) |
| D9  | ✅ | (Sprint 1) « Origines Mystérieuses » est à la fois le h1 du hero et le titre du jeu 1 : sélection accessible par nom ambiguë — et la vue détail rendait un second h1 | ✅ Sprint 2 (item 2.3 `a474915`) — h1 unique verrouillé par test |
| D10 | ✅ | (Sprint 1) La construction de l'URL `mailto:` (`ContactSection.jsx:47-51`) n'est pas interceptable sous jsdom : le verrou 1.2 couvre erreurs/succès mais pas l'URL elle-même | ✅ Sprint 2 (item 2.2 `42cc330`) — `src/utils/mailto.js` + 3 tests |
| D11 | ✅ | (Sprint 1) `npm audit` : 10 vulnérabilités (1 low, 4 moderate, 5 high) dans l'arbre devDependencies, constatées à la clôture | ✅ Sprint 2 (item 2.1 `ede7103`) — 0 vulnérabilité ; garde-fou CI proposé en 3.1 |
| D12 | ✅ | (Sprint 1) Liens sociaux Instagram/Facebook en `href="#"` — placeholders cliquables sans destination | ✅ Sprint 10 (item 10.2) — URLs réelles fournies par l'utilisateur (Facebook, YouTube, LinkedIn) dans `src/data/socialLinks.ts`, composant `SocialLinks` accessible ; suppression des `href="#"` et de la suspension `anchor-is-valid`. Instagram non fourni → retiré |
| D13 | ✅ | (Sprint 2) Déploiement demandé (décision utilisateur 2026-07-07). Résolu au Sprint 4 : intégration Git Vercel en place, **site en ligne et public** à `https://ninjasasquacth-frontend.vercel.app` (HTTP 200, build identique à `main`). Reliquat connu, sans impact sur la mise en ligne : le token de l'intégration MCP Vercel est scoppé au seul projet `grandford`. Confirmé comme un refus d'autorisation (et non de découverte) : avec l'ID projet fourni `prj_mQkt78gkQIeDB1ccAHBV8895HAox`, `get_project`→404 et `list_deployments`→403. L'ID de déploiement/SHA n'est donc pas relevable via MCP tant que l'accès n'est pas accordé au projet côté Vercel — vérification faite par requête HTTP sur l'URL publique | ✅ Sprint 4 (item 4.2) — URL de production consignée (ROADMAP + README) |
| D14 | ✅ | Décision utilisateur (2026-07-07) : ajouter un **backend** — authentification (login) et socle pour extensions futures. Toutes les décisions de cadrage prises (5.A → 5.G, 2026-07-07/08) | ✅ Sprint 5 — backend Supabase livré (projet dédié, schéma+RLS, Storage, login/rôles, CRUD jeux, site branché). Mise en service = Sprint 6 ; espace client = sprint ultérieur (le modèle de rôles est prêt) |
| D15 | 🟡 | (Sprint 5) Le palier gratuit Supabase met le projet en **pause après ~1 semaine d'inactivité** → le catalogue public afficherait l'état d'erreur (message i18n en place comme filet). Constaté à la conception, garde-fou peu coûteux identifié : ping hebdomadaire en CI | Sprint 6 (item 6.5 — exécutable sans utilisateur) |
| D16 | ✅ | (Sprint 5) `useGames` ne gérait pas le **rejet** de la promesse (panne réseau avant réponse) : UI bloquée sur « Chargement… » au lieu de l'état d'erreur. Découvert en vérifiant l'app dans un vrai navigateur (item 5.13) — les tests unitaires ne simulaient que l'erreur applicative, pas le rejet | ✅ Sprint 5 (`18525a9`) — fix + cas de rejet ajouté au mock et aux tests |
| D17 | 🟠→✅ | (Clôture Sprint 5) **Faux vert lint local** : les preuves DoD passaient par `npm run lint 2>&1 \| tail -1 && …` — le code de sortie d'un pipeline bash est celui de la dernière commande (`tail` → 0), donc 2 erreurs `react-hooks/set-state-in-effect` (`AuthProvider.jsx`, `GamesManager.jsx`, introduites aux items 5.7/5.9) ont été rapportées « lint vert » à tort. **Attrapé par la CI sur la PR #7** — le garde-fou mécanique du Sprint 1 a fait exactement son travail. Garde-fou de méthode consigné : toute commande de preuve s'exécute sans pipe masquant (ou avec `set -o pipefail`) et son exit code est vérifié explicitement | ✅ Correctif `2cfe778` (rôle dérivé au rendu dans AuthProvider ; fetch inline + clé de rechargement dans GamesManager, filet de rejet réseau aligné sur D16) — lint exit 0, 62/62, build OK |
| D18 | ✅ | (Sprint 6) **Aucun error boundary React** : toute exception au rendu produisait un écran blanc ; et `/admin` chargeait son chunk lazy avec `Suspense fallback={null}` — rien d'affiché pendant le chargement | ✅ Sprint 7 (item 7.6 `9ddc150`) — `ErrorBoundary` + repli i18n, fallback /admin visible ; limite documentée : le throw à l'import de `lib/supabase.ts` (env manquante) précède React (fail-fast intentionnel) |
| D19 | 🟡 | (Sprint 6) **Aucun header de sécurité** dans `vercel.json` (pas de CSP, HSTS, X-Frame-Options, X-Content-Type-Options) — le fichier ne porte que le rewrite SPA. Hors périmètre décidé du Sprint 7 (TS + Tailwind + socle robustesse) | Backlog — proposé pour le Sprint 8, attend un « go » utilisateur |
| D20 | ✅ | (Sprint 6) **Poppins chargée par `@import` CSS bloquant** : police résolue après le CSS, sans préconnexion | ✅ Sprint 7 (item 7.7 `06fa650`) — bascule en `<link rel="preconnect">` + `<link>` dans `index.html` pendant la réécriture de `global.css` |
| D21 | 🟡 | (Sprint 9) **Spec produit `docs/brand-seo-spec.md` absente** : le prompt la déclare lecture obligatoire (copies SEO, données des jeux Heroes Rising / Burgle Jack / Flickle Mania), mais le fichier n'existe ni dans le dépôt, ni dans l'historique, ni sur une branche. Sur décision utilisateur (« Build the infrastructure now »), l'infrastructure est livrée sans inventer de contenu de marque — le contenu réel passe par `/admin` (comme D3). Sprint 10 : la direction de marque (palette, polices, liens sociaux réels) est fournie par le prompt lui-même et appliquée ; la spec produit détaillée reste absente | **Action utilisateur** : fournir `docs/brand-seo-spec.md` + saisir les vrais jeux via `/admin` |
| D22 | 🟡 | (Sprint 10) **Aucun logo officiel ni portrait/biographie du fondateur fourni** : le prompt interdit d'inventer un logo, une photo produit, une photo du fondateur ou un lien Kickstarter. Le header retombe donc sur un wordmark textuel propre, la section fondateur affiche du contenu studio validé sans photo ni biographie nominative, le hero sans image officielle utilise une composition de marque sobre (jamais de fausse boîte), et aucun `og:image` n'est ajouté. Rien n'est inventé | **Action utilisateur** : fournir le logo officiel (SVG/PNG sous `public/`), le portrait + la biographie du fondateur, et les vraies photos produits + URLs Kickstarter via `/admin` |

## Changelog

### Sprint 10 — Refonte visuelle Ninja Sasquatch et accueil Heroes Rising (2026-07-12)

- **Contexte** : prompt utilisateur — appliquer la nouvelle direction visuelle
  (palette Sasquatch roux / vert forêt / crème / charbon + sous-palettes locales
  Heroes Rising / Burgle Jack, typographie Alfa Slab One / Atkinson Hyperlegible
  / Black Ops One) sans casser bilinguisme, a11y, responsive, routes, admin,
  tests ni sécurité. Heroes Rising = hero principal **lu depuis Supabase**. La
  spec `docs/brand-seo-spec.md` reste absente (D21) ; la direction de marque et
  les liens sociaux réels sont fournis par le prompt et appliqués. **Aucun
  contenu de marque inventé** (logo, photo/bio fondateur, photos produits, URLs
  Kickstarter → D3/D22).
- **Baseline à l'ouverture** : lint 0, typecheck 0, **96 tests**, build vert,
  audit high 0 (branche partie de `2eaf942`). Captures visuelles de référence
  prises avant/après (Chromium headless) aux largeurs 375/768/1280, FR et EN.
- **Commits** :
  - `feat(theme)` : palette + sous-palettes + polices en `@theme`, tokens
    renommés, `src/data/gameThemes.ts` (étape 2)
  - `feat(social)` : liens sociaux réels + composant `SocialLinks` accessible,
    D12 résolue (étape 6)
  - `feat(header)` : menu mobile accessible (aria/Échap/focus) + logo cliquable
    (étape 3)
  - `feat(home)` : accueil refondu — hero Heroes Rising alimenté par Supabase,
    réassurance, univers, créations, fondateur, notification, contact (étape 4)
  - `feat(fiche)` : badge « contenu en anglais », accent de sous-palette,
    crédits (étape 5)
  - (clôture) `docs` : CLAUDE.md (styling/architecture) + ROADMAP (étape 6)
- **Tests** : 96 → **114** (+18 ; nouveaux fichiers `social-links`,
  `header-a11y`, `home-redesign` ; `game-page` étendu ; `App`/`routing` adaptés
  au nouveau hero de repli). Chaque comportement rouge avant vert. Zéro réseau.
- **Front** : `global.css` réécrit (palette + polices en `@theme` seul, body
  Atkinson + interligne 1.6 + alignement gauche, headings Alfa Slab poids 400) ;
  tokens de couleur renommés dans tous les composants (aucun hex de marque hors
  `@theme`, vérifié par grep) ; `src/data/gameThemes.ts` (variantes statiques
  typées, jamais de classe construite dynamiquement) ; `src/data/socialLinks.ts`
  + `SocialLinks` (nouvel onglet, `rel=noreferrer`, `aria-label` localisé, icônes
  décoratives masquées) ; header à menu mobile accessible ; accueil réordonné
  avec hero vedette lu depuis Supabase (`selectFeaturedGame`, `isEnglishOnly`) et
  repli de marque sobre ; fiches homogènes (badge anglais, accent, crédits).
- **Accessibilité** : cartes = vrais liens (déjà) ; `aria-describedby` +
  `role="alert"` sur les champs de contact ; icônes décoratives `aria-hidden` ;
  hiérarchie des headings préservée (verrou `headings.test`) ; micro-interactions
  toutes accompagnées d'une variante `motion-reduce`.
- **Sécurité/contenu** : audit high 0 ; aucun secret committé ; aucun contenu de
  marque inventé (D3/D21/D22 restent des actions utilisateur) ; sécurité Supabase
  (RLS) inchangée.
- **Verdict de clôture** : DoD standard et DoD Sprint 10 satisfaites. Découverte
  nouvelle : D22 (logo officiel + portrait/bio fondateur non fournis). D12
  résolue.

### Sprint 9 — Modèle Supabase, administration et vraies routes de jeux (2026-07-12)

- **Contexte** : décision utilisateur du 2026-07-12 — gérer de vraies fiches
  de jeux bilingues (modèle produit, galerie/PDF, routes partageables, langue
  portée par l'URL). Spec produit `docs/brand-seo-spec.md` **absente** (D21) :
  cadrage via AskUserQuestion → « Build the infrastructure now » (infrastructure
  livrée, contenu de marque laissé aux actions utilisateur, rien inventé).
- **Baseline à l'ouverture** : lint 0, typecheck 0, **64 tests**, build vert,
  audit high 0 (branche partie de `main` à `746c792`). Schéma Supabase réel
  conforme au dépôt (divergence mineure non destructive tracée en D21) ; table
  `games` contenait 1 ligne de test « Mario » — préservée.
- **Commits** :
  - `0b35b53` feat(db) : modèle produit games + game_media + RLS (étape 2)
  - `aac6cfe` feat(types) : database.ts au schéma produit + game_media (étape 3)
  - `de3250b` refactor(admin) : GameForm modulaire + champs produit (étape 4)
  - `a4bf89c` feat(admin) : intégrité des images Storage (étape 5)
  - `b4420eb` feat(routes) : routes FR/EN, fiches, cartes-liens, PDF, 404 (6-9)
  - `79bf43e` test : validation + chemins localisés (étape 10)
  - `923cd21` docs : README (stack réelle) + CLAUDE.md (architecture Sprint 9)
  - (clôture) docs : clôture sprint 9 — mise à jour roadmap
- **Tests** : 64 → **96** (+32 ; nouveaux fichiers : image-lifecycle, game-page,
  use-game-by-slug, game-form-validation, routes ; tests existants adaptés au
  routeur et au nouveau payload). Chaque comportement rouge avant vert. Zéro
  réseau (client mocké, mock étendu `__setRemoveError`).
- **Supabase** : migration additive `20260712120000_games_product_fields_media`
  appliquée et tracée. RLS prouvée sous rôle `anon` (lecture publiés seuls games
  ET game_media ; écritures 42501) et sous JWT admin (écritures autorisées, en
  transactions annulées — aucune donnée de test laissée). Advisors : 3 WARN
  pré-existants documentés, aucun nouveau.
- **Front** : routes localisées (langue portée par l'URL) + vraie 404 ;
  `useGameBySlug` ; fiche en sections réutilisables recevant la donnée Supabase ;
  cartes = vrais `Link` ; téléchargement PDF sans lien mort ; cycle de vie des
  images sans orphelin.
- **Sécurité/contenu** : audit high 0 ; aucun secret committé ; aucun contenu
  de marque inventé (D21 — copies SEO et jeux réels = actions utilisateur via
  `/admin`) ; aucune donnée existante perdue (« Mario » intact).
- **Verdict de clôture** : DoD standard et DoD Sprint 9 satisfaites. Découverte
  nouvelle : D21 (spec absente + contenu de marque en action utilisateur).

### Sprint 7 — Production : TypeScript strict, Tailwind v4 et durcissement (2026-07-08)

- **Contexte** : décision utilisateur du 2026-07-08 — transformer le site
  vitrine en site de production de qualité, en suivant les bonnes pratiques
  (clean code), avec un front en **TypeScript** et le framework **Tailwind**.
  Cadrage via AskUserQuestion : migration complète (TS strict + Tailwind, pas
  d'entre-deux), organisation en Sprint 7 dédié après clôture du Sprint 6,
  durcissement « socle robustesse ». Cette décision amende les conventions
  « pas de TypeScript / pas de framework CSS » de CLAUDE.md et des prompts —
  amendements en commits dédiés (7.0 prompts AVANT l'exécution, 7.14 CLAUDE.md
  à la fin) citant la décision, conformément aux règles de gouvernance.
- **Baseline à l'ouverture** : lint 0/0, tests 62/62, build vert, audit
  high 0 (tip `2799b70`, merge PR #7). Exit codes vérifiés sans pipe masquant
  (leçon D17).
- **Nouvelles devDependencies** : `typescript`, `typescript-eslint`,
  `@types/react`, `@types/react-dom`, `tailwindcss`, `@tailwindcss/vite` —
  audit high resté à 0 après chaque installation.
- **Commits** (dans l'ordre) :
  - `1add2e1` docs : amendement du prompt de sprint (7.0, décision 2026-07-08)
  - `7768b34` feat : socle TypeScript — tsconfig strict, typescript-eslint,
    tsc --noEmit en CI (7.1)
  - `d65bd69` feat : types Database Supabase et client typé (7.2)
  - `26922ce` refactor : migration TS des modules feuilles (7.3)
  - `82934cc` refactor : migration TS des composants et de l'entrée (7.4)
  - `a07fdee` refactor : migration TS de la suite de tests, strict intégral (7.5)
  - `9ddc150` feat : error boundary + fallback de chargement /admin (D18, 7.6)
  - `06fa650` feat : socle Tailwind v4 — @theme, base globale (D20, 7.7)
  - `780ee08` refactor : Header et Footer en Tailwind (7.8)
  - `39e25ec` refactor : Hero et About en Tailwind (7.9)
  - `2820da1` refactor : section Jeux en Tailwind (7.10)
  - `914ec00` refactor : section Contact en Tailwind (7.11)
  - `2473a35` refactor : espace admin en Tailwind (7.12)
  - `836217c` refactor : purge des derniers vestiges CSS Modules (7.13)
  - `5947b4c` docs : amendement CLAUDE.md (7.14, décision 2026-07-08)
  - (clôture) docs : clôture sprint 7 — mise à jour roadmap (7.15)
- **Tests** : 62 → **64** (+2 ; 1 fichier nouveau `error-boundary.test.tsx`,
  + 1 cas de fallback /admin ajouté à `routing.test.tsx`). Les 18 fichiers
  existants ont été renommés `.test.ts(x)` sans perte (prouvé à 7.5 :
  62 tests / 18 fichiers inchangés au renommage) ; les 2 nouveaux tests ont
  rougi avant le fix. Décompte relevé sur la sortie réelle de `npm test`.
- **Migration TypeScript** : tout `src/` en `.ts/.tsx` strict
  (`noUncheckedIndexedAccess`, `verbatimModuleSyntax`, `isolatedModules`),
  `allowJs` retiré à 7.5 — zéro `.js/.jsx` sous `src/`. Types Database écrits
  à la main (`src/types/database.ts`, format codegen), client
  `createClient<Database>`, props typées partout. `tsc --noEmit` ajouté à la
  CI (entre lint et tests) et à la DoD.
- **Migration Tailwind v4** : `@tailwindcss/vite`, palette de marque en tokens
  `@theme` de `global.css` (utilitaires `bg-cream`/… + `var(--color-*)`
  conservé le temps de la conversion), préflight en remplacement du reset ;
  les 11 `.module.css` supprimés (~1 251 lignes de CSS → un seul `global.css`).
  Poppins passée d'un `@import` bloquant à un `<link>` préconnecté (D20).
  Durcissement additif : `focus-visible:` sur les interactifs,
  `motion-reduce:` sur les transitions.
- **Durcissement robustesse** : `ErrorBoundary` (D18) monté sous
  `LanguageProvider` — les exceptions de rendu affichent un repli i18n au lieu
  d'un écran blanc ; le `fallback={null}` de `/admin` devient un état de
  chargement visible.
- **Vérifications de bout en bout** : à chaque item, lint + typecheck + tests
  + build + audit high, exit codes vérifiés sans pipe masquant. Parité
  visuelle contrôlée par captures preview (Chromium headless) à 375/768/
  1280 px contre des références prises avant conversion ; écran `/admin`
  (login) vérifié après 7.12.
- **Verdict de clôture** : DoD standard et DoD Sprint 7 satisfaites — voir le
  bloc DoD du sprint. Découvertes traitées : D18 (résolue, 7.6), D20 (résolue,
  7.7) ; D19 (headers de sécurité) reste ouverte, proposée au Sprint 8.
  Actions utilisateur en attente inchangées (6.2/6.3/6.4 + secrets CI 6.5).

### Sprint 6 — Mise en service du backend et contenu réel (2026-07-08)

- **Contexte** : sprint courant défini à la clôture du Sprint 5 (mise en
  service du backend : compte admin 6.1, variables Vercel 6.2, premiers
  jeux réels 6.3, contenus D7/D12 en 6.4, garde-fou anti-pause 6.5). 6.1 a
  été fait en début de sprint sur instruction utilisateur explicite (MCP
  Supabase connecté). Clôture déclenchée le 2026-07-08 par la décision
  utilisateur de transformer le site en qualité production (TypeScript +
  Tailwind → Sprint 7) ; conformément à la leçon des rétros, le seul item
  exécutable sans utilisateur (6.5) a été livré avant la clôture.
- **Baseline à l'ouverture du travail de clôture** : lint 0/0, tests 62/62
  (conforme au tableau de bord — aucune dérive, branche partie de `main` à
  `2799b70`, merge de la PR #7), build vert, audit high 0. Exit codes
  vérifiés sans pipe masquant (leçon D17).
- **Commits** :
  - `30bf3d6` ci : ping hebdomadaire anti-pause Supabase (D15, item 6.5)
  - (clôture) docs : clôture sprint 6 — mise à jour roadmap
- **Tests** : 62 → **62** (aucun nouveau test Vitest : 6.5 est un garde-fou
  CI planifié, prouvé par validation YAML et committé ; son exécution verte
  attend les secrets utilisateur). Décompte relevé sur la sortie réelle de
  `npm test`.
- **Décision utilisateur (2026-07-08, consignée)** : transformation en site
  de production — migration **TypeScript strict** + **Tailwind CSS v4** +
  socle robustesse (error boundary, typecheck en CI, types Supabase,
  fallback Suspense, tests migrés). Organisation choisie via AskUserQuestion :
  exécuter 6.5, clôturer le Sprint 6 (reports consignés), Sprint 7 dédié.
  Cette décision amende les conventions « pas de TypeScript / pas de
  framework CSS » — amendements des fichiers gouvernés en commits dédiés
  citant la décision (7.0 prompts, 7.14 CLAUDE.md).
- **Verdict de clôture** : DoD standard et DoD Sprint 6 satisfaites — voir
  le bloc DoD du sprint. 6.2/6.3/6.4 non cochés (actions/contenus
  utilisateur), reportés en « Actions utilisateur » du Sprint 7. Découvertes
  nouvelles : D18 (error boundary, affectée à 7.6), D19 (headers de
  sécurité, backlog Sprint 8), D20 (Poppins bloquante, absorbée par 7.7).

### Sprint 5 — Backend Supabase : auth admin, création de jeux, lecture publique (2026-07-08)

- **Contexte** : décision utilisateur du 2026-07-08 — exécuter le sprint
  backend (D14, pré-cadré en 5.A/5.B). Cadrage complété le jour même via
  AskUserQuestion (7 décisions 5.A → 5.G consignées en tête de sprint :
  projet Supabase dédié, périmètre admin+site branché, react-router,
  formulaire reporté, admin `ivess49@gmail.com`, **base vide**, catégories
  fixes). La clôture du Sprint 4 (restée en attente) a été régularisée à
  l'ouverture (`247f4c7`).
- **Baseline à l'ouverture** : lint, tests (24/24, conforme au tableau de
  bord — aucune dérive, branche partie de `main` à `d1ff2c6`) et build
  verts ; audit high = 0.
- **Infrastructure créée (via MCP Supabase)** : projet `ninja-sasquatch-games`
  (ref `vgmqmifgdolccquyjcoc`, ca-central-1, 0 $/mois confirmé avant
  création) ; tables `profiles`/`games` + `is_admin()` + RLS ; bucket
  `game-images`. Preuves : lecture anon filtrée `published`, écritures anon
  rejetées (SQL 42501 et REST 401), advisors sécurité propres (2 WARN
  intentionnels documentés).
- **Commits** :
  - `247f4c7` docs : clôture sprint 4 — mise à jour roadmap
  - `cbb9fc3` docs : sprint 5 défini et ouvert + projet Supabase créé (5.1)
  - `a216f6f` feat : schéma games/profiles + RLS par rôle (5.2)
  - `65f58cf` feat : bucket Storage game-images (5.3)
  - `148c512` feat : client Supabase injectable + env Vite (5.5)
  - `a8690df` feat : react-router-dom — route /admin (5.6)
  - `b343e63` feat : session Supabase et écran de login admin (5.7)
  - `04b1c08` feat : garde d'accès admin par rôle profiles (5.8)
  - `f82a9d2` feat : création de jeux dans l'admin (5.9)
  - `7d7a06d` feat : édition et suppression de jeux (5.10)
  - `b1fc36a` feat : hook useGames et localisation des jeux (5.11)
  - `53547e9` feat : site public sur Supabase, purge du statique (5.12)
  - `18525a9` fix : useGames signale la panne réseau (D16, vérification 5.13)
  - `78546ce` docs : procédure de déploiement Supabase/Vercel (5.13)
  - `433a2f5` docs : amendement CLAUDE.md (décision 2026-07-08, 5.14)
  - (clôture) docs : clôture sprint 5 — mise à jour roadmap
- **Tests** : 24 → **62** (+38 ; 9 fichiers nouveaux : client env, routage,
  login, garde admin, création/édition admin, localizeGame, useGames,
  GamesSection-Supabase ; 5 fichiers adaptés à la purge du statique).
  Chaque item de code a eu son test rouge avant le vert. Décompte relevé sur
  la sortie réelle de `npm test`. Zéro réseau : client mocké partout
  (`helpers/supabaseMock.js`), prouvé mécaniquement (module réel jamais
  exécuté sous test).
- **Vérifications de bout en bout** : build sans env vert (CI sans secrets) ;
  preview parcourue ; REST réel — lecture anonyme 200 `[]`, insert anonyme
  401 ; parcours navigateur (Playwright) sur `/` et `/admin` — a révélé D16
  (corrigé) ; état d'erreur validé en navigateur réel après le fix.
- **Sécurité** : audit high = 0 après ajout des dépendances ; aucun secret
  committé (`.env.local` gitignoré, `.env.example` en placeholders, clé
  publiable en env seulement) ; RLS = barrière d'écriture réelle.
- **Contenu** : conformément à la décision 5.F, la base part **vide** — le
  site public affiche un état vide propre. Les anciens jeux statiques
  (placeholder Unsplash) sont purgés : le périmètre code de D3 est résolu,
  le contenu réel passe désormais par `/admin` (Sprint 6).
- **Verdict de clôture** : DoD standard et DoD Sprint 5 satisfaites — voir
  le bloc DoD du sprint. 5.4 non coché (action utilisateur), reliquat prod
  de 5.13 tracé vers 6.2. Découvertes nouvelles : D15, D16 (résolue).

### Sprint 4 — Accessibilité, mise en ligne et contenu réel (2026-07-08)

- **Contexte** : sprint courant défini à la clôture du Sprint 3 (garde-fou a11y
  4.1 + mise en ligne 4.2 + contenus 4.3/4.4). En cours de sprint, l'utilisateur
  a mis le site en ligne via l'intégration Git Vercel (4.2 vérifié et consigné)
  et pris les décisions de pré-cadrage du Sprint 5 (5.A admin + espace client,
  5.B Supabase — commits `25ec6fb`, `19aaebf`). Clôture déclenchée le 2026-07-08
  par la décision utilisateur d'exécuter le sprint backend.
- **Baseline à l'ouverture** : lint, tests (21/21) et build verts ;
  audit high = 0.
- **Commits** :
  - `6b445c5` feat : garde-fou a11y dans le lint + cartes de jeu accessibles
    au clavier (item 4.1)
  - `aa44aef` docs : item 4.1 coché — garde-fou a11y actif, décompte de tests
    recalibré (24)
  - (clôture) docs : clôture sprint 4 — mise à jour roadmap
- **Tests** : 21 → **24** (+3 : `game-card-a11y.test.jsx`, rouges avant le fix
  clavier des cartes). Décompte relevé sur la sortie réelle de `npm test`.
- **Déploiement** : site **en ligne et public** à
  `https://ninjasasquacth-frontend.vercel.app` (D13 résolu — vérification HTTP
  directe, build identique à `main` ; MCP Vercel toujours scoppé à `grandford`).
- **Verdict de clôture** : DoD standard et DoD Sprint 4 satisfaites — lint
  (préréglage jsx-a11y `recommended` actif) 0/0, 24 tests verts, build vert,
  audit high 0 ; URL de production consignée ; aucun contenu de marque inventé
  (4.3/4.4 non cochés — D3 bascule vers le canal admin du Sprint 5, D7/D12
  restent au registre). Fichiers gouvernés intacts.

### Sprint 3 — Mise en ligne et contenu réel (2026-07-07)

- **Contexte** : sprint courant défini à la clôture du Sprint 2 (garde-fou
  audit 3.1 + mise en ligne 3.2 + contenus 3.3/3.4). Le canal de question
  utilisateur (AskUserQuestion) a échoué techniquement pendant tout le sprint
  (« permission stream closed », plusieurs tentatives) : impossible de
  débloquer 3.3/3.4 en cours de route → les défauts du workflow s'appliquent
  (items bloqués consignés, jamais inventés). L'import Vercel (prérequis de
  3.2) a été vérifié via MCP en début et en fin de sprint : non fait.
- **Baseline à l'ouverture** : `npm run lint`, `npm test` (21/21, conforme au
  tableau de bord — aucune dérive, aucun commit hors cycle à absorber : la
  branche part de `main` à `19c00b2`) et `npm run build` verts ;
  `npm audit --audit-level=high` exit 0.
- **Commits** :
  - `5854503` feat : étape npm audit dans la CI — la dette sécurité ne se
    réinstalle plus silencieusement (item 3.1)
  - (clôture) docs : clôture sprint 3 — mise à jour roadmap
- **Tests** : 21 → **21** (aucun nouveau test Vitest : 3.1 est un garde-fou
  CI, prouvé par exécution locale de la commande — exit 0 aujourd'hui, exit
  non nul sur vulnérabilité ≥ high par construction — et par validation du
  YAML). Décompte relevé sur la sortie réelle de `npm test`.
- **Sécurité** : reliquat toujours 0 ; la CI échoue désormais mécaniquement
  sur toute vulnérabilité `high`/`critical` (`.github/workflows/ci.yml:27-28`).
- **Déploiement** : NON réalisé — le prérequis d'accès (import du dépôt dans
  le tableau de bord Vercel) n'est toujours pas rempli (D13). Aucune écriture
  côté Vercel.
- **Verdict de clôture** : DoD standard et DoD Sprint 3 satisfaites — lint,
  21 tests et build verts ; garde-fou audit actif ; aucune mise en ligne (donc
  aucune URL à consigner) ; aucun contenu de marque inventé (3.2/3.3/3.4 non
  cochés, reportés en 4.2/4.3/4.4) ; fichiers gouvernés intacts. Aucune
  découverte produit nouvelle.

### Sprint 2 — Dette sécurité, verrou mailto et contenu réel (2026-07-07)

- **Contexte** : sprint courant défini à la clôture du Sprint 1 (dette D9/D10/D11
  + décisions contenu D3/D7/D12). Décision utilisateur en cours de sprint
  (2026-07-07, en réponse à la question sur 2.4/2.5) : **« Déployer
  l'application »** — ajout d'un objectif de mise en ligne (Vercel, seule
  intégration de déploiement connectée) ; aucun contenu fourni pour 2.4/2.5,
  qui restent bloqués.
- **Baseline à l'ouverture** : `npm run lint`, `npm test` (16/16, conforme au
  tableau de bord — aucune dérive, aucun commit hors cycle à absorber) et
  `npm run build` verts sur `main` à `789c967`.
- **Commits** :
  - `ede7103` fix : résorption des 10 vulnérabilités npm audit (item 2.1, D11)
  - `42cc330` feat : extraction et verrou de la construction du mailto (item 2.2, D10)
  - `a474915` fix : h1 unique et hiérarchie des headings verrouillée (item 2.3, D9)
  - `5645547` docs : procédure de déploiement Vercel documentée dans le README
  - (clôture) docs : clôture sprint 2 — mise à jour roadmap
- **Tests** : 16 → **21** (+5 ; 2 fichiers nouveaux : `mailto.test.js` — 3 tests
  d'URL exacte, `headings.test.jsx` — 2 tests de hiérarchie). Décompte relevé
  sur la sortie réelle de `npm test`. Chaque fix (2.2, 2.3) a eu son test rouge
  avant le vert.
- **Sécurité** : `npm audit` 10 vulnérabilités (1 low, 4 moderate, 5 high) → **0**,
  via `npm audit fix` sans `--force` (`package-lock.json` seul modifié).
- **Déploiement** : NON réalisé — bloqué sur l'authentification Vercel (D13,
  item 3.2). Procédure documentée dans le README. Décision utilisateur
  post-clôture (2026-07-07) : **intégration Git Vercel** (import du dépôt dans
  le tableau de bord par l'utilisateur ; `VERCEL_TOKEN` écarté).
- **Verdict de clôture** : DoD standard et DoD Sprint 2 satisfaites — lint,
  21 tests et build verts ; 0 vulnérabilité ; mailto verrouillé ; h1 unique ;
  aucun contenu de marque inventé (2.4/2.5 non cochés, reportés en 3.3/3.4) ;
  fichiers gouvernés intacts. Découverte nouvelle : D13.

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

### Sprint 9 — Modèle Supabase, administration et vraies routes de jeux (2026-07-12)

1. **Découpage** : bon pour un sprint transverse de 8 items. L'ordre
   backend-d'abord (migration → types → form → images → routes) a tenu chaque
   commit vert. La dérivation des colonnes texte héritées (players/duration/age)
   depuis les champs structurés a évité une double saisie et gardé la migration
   strictement additive (contrainte NOT NULL héritée respectée sans casse). Le
   remontage de la fiche par slug (clé de route) a résolu proprement l'état de
   chargement sans setState synchrone dans l'effet (leçon D17 respectée).
2. **Suffisance des prompts** : suffisants. Cas limite majeur : la lecture
   obligatoire `docs/brand-seo-spec.md` était **absente** — traité par le
   garde-fou contenu (ne rien inventer) + AskUserQuestion (décision « build the
   infrastructure now »), exactement comme D3. Aucun diff de prompt proposé.
3. **À détecter plus tôt** : le partage d'un résultat par table dans le mock
   Supabase aurait pu piéger la fiche (useGameBySlug + useGames lisent `games`) ;
   anticipé en filtrant côté client par slug (robuste pour le mock ET le vrai
   serveur). Garde-fou général retenu : pour tout code Storage, écrire les
   scénarios de compensation (rollback, suppression d'orphelins) AVANT de livrer
   — fait ici (tests rouges d'abord). La spec produit manquante aurait dû être
   détectée à la première lecture obligatoire (elle l'a été, avant tout code).
4. **Notes /100** (précédent : 88/89/62/78) :
   - **Architecture 91 (+3)** : modèle produit typé de bout en bout, routes
     localisées propres (langue portée par l'URL), fiche en sections découplées
     recevant la donnée, GameForm scindé, cycle d'images robuste. Réserve : la
     compensation d'images reste côté client (acceptable, admin-only).
   - **Qualité 92 (+3)** : 96 tests (rollback/replace/delete d'images, routes,
     hook, validation), RLS prouvée anon + admin, zéro réseau. Manque toujours
     un E2E automatisé (candidat 8.1).
   - **UX/Contenu 68 (+6)** : vraies fiches partageables, galerie, PDF sans lien
     mort, bilingue par l'URL — le socle UX bondit ; toujours plafonné par le
     contenu réel des jeux (D21/D3, action utilisateur via `/admin`).
   - **Production 80 (+2)** : modèle de données prêt pour le catalogue réel,
     migration additive prouvée non destructive ; retenue par les headers de
     sécurité (D19) et les actions utilisateur en attente.

### Sprint 7 — Production : TypeScript strict, Tailwind v4 et durcissement (2026-07-08)

1. **Découpage** : très bon pour un sprint de refonte transverse de 16 items.
   L'ordre bottom-up de la migration TS (socle → types → feuilles → composants
   → tests) a tenu chaque commit vert, l'`allowJs` transitoire servant
   d'amortisseur exactement comme prévu (aucun aller-retour). La conversion
   Tailwind découpée par zone (un commit = les `.module.css` supprimés) a
   permis de garder les modules non convertis fonctionnels grâce aux
   `var(--color-*)` doublés dans `@theme` — décision de conception qui a payé.
   Deux découpes fines non anticipées mais sensées : `ErrorBoundary` scindé
   classe/fallback pour `react-refresh` (attrapé par le lint, corrigé
   immédiatement), et 7.13 qui a trouvé un vrai reliquat (style inline d'App)
   à purger plutôt que d'être un no-op.
2. **Suffisance des prompts** : suffisants une fois amendés (7.0). Le point
   clé de méthode a été respecté : amender les prompts AVANT d'exécuter les
   items qui en dépendent (sinon chaque commit Sprint 7 aurait violé les
   conventions vivantes), CLAUDE.md à la fin (il documente l'état réel). Le
   mécanisme de gouvernance (commit dédié citant la décision) a couvert le cas
   « la décision utilisateur contredit les conventions que les prompts
   véhiculent » sans improvisation. Aucun diff de prompt hors décision.
3. **À détecter plus tôt** : la règle `react-refresh/only-export-components`
   sur l'`ErrorBoundary` (fallback fonctionnel + classe dans le même fichier)
   aurait pu être anticipée — c'est le même motif qui a imposé les découpes
   `src/i18n/` et `src/auth/`. Le lint l'a attrapée au premier `npm run lint`,
   coût nul. Garde-fou déjà en place (lint en CI + local). Autre point : la
   parité visuelle ne repose que sur l'œil (captures preview) — un test de
   régression visuelle automatisé serait le seul vrai garde-fou ; candidat
   Sprint 8 (avec l'E2E Playwright), non ajouté ici pour rester dans le
   périmètre décidé.
4. **Notes /100** (précédent : 82/84/60/78) :
   - **Architecture 88 (+6)** : typage strict de bout en bout (client
     Supabase `<Database>`, props, hooks, contrats de catégories partagés à la
     compilation), error boundary, pattern de composant simplifié à 2 fichiers.
     Réserve : le `Database` est écrit à la main (swap codegen à prévoir).
   - **Qualité 89 (+5)** : `tsc --noEmit` strict en CI et DoD, 64 tests tous
     typés, lint TS (typescript-eslint) ; le typage élimine une classe entière
     de bugs que les tests ne couvraient pas. Manque toujours un E2E automatisé
     et la régression visuelle.
   - **UX/Contenu 62 (+2)** : durcissement a11y additif (focus-visible,
     motion-reduce, prefers-reduced-motion), police non bloquante ; toujours
     plafonné par la base vide (6.3) et les contenus D7/D12.
   - **Production 78 (+3)** : garde-fou d'erreur (plus d'écran blanc), CI
     renforcée (typecheck), bundle CSS consolidé ; retenue par les headers de
     sécurité absents (D19) et les actions utilisateur en attente.

### Sprint 6 — Mise en service du backend et contenu réel (2026-07-08)

1. **Découpage** : correct et conforme à la leçon des rétros précédentes —
   un item exécutable sans utilisateur (6.5) a produit de la valeur pendant
   que 6.2/6.3/6.4 restaient bloqués. 6.1 s'est débloqué en début de sprint
   sur instruction utilisateur. Confirmation (3e fois) : les items
   « Décision/Action requise » ne coûtent rien mais ne produisent rien —
   ils sont désormais rattachés au sprint suivant comme « Actions
   utilisateur » hors items, pour que le sprint ne compte que du travail
   exécutable.
2. **Suffisance des prompts** : suffisants pour 6.1/6.5. Cas limite
   rencontré : une transformation d'architecture décidée par l'utilisateur
   (TypeScript + Tailwind) contredit les conventions que les prompts
   eux-mêmes véhiculent — le mécanisme prévu (amendement en commit dédié
   citant la décision, règles de gouvernance) couvre le cas ; l'amendement
   des prompts est planifié comme premier item (7.0) du sprint qui en a
   besoin, AVANT le code. Aucun diff hors décision appliqué.
3. **À détecter plus tôt** : D18 (aucun error boundary — écran blanc sur
   toute exception de rendu) existait depuis le Sprint 5 (introduction du
   lazy loading) et n'a été constatée qu'à l'audit de transformation. Un
   garde-fou peu coûteux aurait été un test « composant qui throw »
   dès l'introduction du routeur ; il arrive en 7.6 avec test rouge d'abord.
   D19/D20 (headers, police bloquante) sont des constats d'audit classiques
   à faire à chaque revue de production.
4. **Notes /100** (précédent : 82/83/60/73) :
   - **Architecture 82 (=)** : aucun changement structurel (un YAML CI).
   - **Qualité 84 (+1)** : le catalogue ne peut plus tomber en erreur par
     simple inactivité du free tier (garde-fou D15 planifié en CI) ;
     62 tests inchangés.
   - **UX/Contenu 60 (=)** : rien de visible ; toujours plafonné par la
     base vide (6.3) et les contenus D7/D12.
   - **Production 75 (+2)** : compte admin actif prouvé en base (6.1),
     garde-fou anti-pause committé ; retenue par les variables Vercel
     manquantes (6.2) et l'exécution du keepalive en attente de secrets.

### Sprint 5 — Backend Supabase (2026-07-08)

1. **Découpage** : bon dans l'ensemble pour un sprint structurel de 14 items.
   L'ordre backend-d'abord (5.1-5.3 via MCP avant tout code front) s'est
   vérifié : aucun aller-retour de schéma. Deux ajustements en cours de
   route, tous deux sains : le helper de mock (prévu en 5.11) a été avancé
   à 5.7 car les tests d'auth en dépendaient — à retenir : les outils de
   test se planifient AVANT le premier item qui teste ; et 5.11 (livrer
   util/hook/fixtures non branchés) a tenu sa promesse d'amortisseur : 5.12,
   l'item le plus risqué (bascule + purge + 5 fichiers de tests), est passé
   en un seul commit sans casse.
2. **Suffisance des prompts** : suffisants — la procédure standard (baseline,
   rouge → vert, commits atomiques, question utilisateur) a couvert un sprint
   pourtant hors de son gabarit d'origine (infra via MCP, décisions produit
   en rafale). Le canal AskUserQuestion a fonctionné (7 décisions consignées),
   contrairement au Sprint 3. Cas non couvert par la lettre du prompt : les
   « tests rouges d'infrastructure » (preuves `execute_sql`/advisors au lieu
   de Vitest) — traités dans l'esprit de la procédure, consignés comme
   preuves dans les items. Aucun diff de prompt proposé.
3. **À détecter plus tôt** : D16 (rejet réseau non géré → UI bloquée en
   chargement) n'a été vu qu'en pilotant l'app dans un vrai navigateur à
   5.13 — les tests unitaires ne simulaient que l'erreur applicative
   `{ data, error }`, pas le rejet de la promesse. Garde-fou peu coûteux
   appliqué immédiatement : le mock supporte `{ reject }` et le cas est
   verrouillé dans `use-games.test.jsx`. Leçon générale : pour tout code
   réseau, écrire systématiquement les DEUX cas d'échec (erreur retournée ET
   promesse rejetée). D15 (pause auto du free tier) a été identifiée à la
   conception plutôt qu'en production — le garde-fou (ping CI) est planifié
   en 6.5 avant que la pause ne morde.
4. **Notes /100** (précédent : 76/79/61/70) :
   - **Architecture 82 (+6)** : changement structurel majeur absorbé sans
     casser les patterns existants — router à deux routes (App intact),
     `src/auth/` calqué sur `src/i18n/`, client Supabase en point unique
     mockable, contenu bilingue porté par le schéma (NOT NULL par langue,
     CHECK partagé avec le front), conventions consignées dans CLAUDE.md
     par commit dédié. Réserve : l'admin est un rendu conditionnel à états
     dans GamesManager — acceptable aujourd'hui, à surveiller si l'espace
     client arrive.
   - **Qualité 83 (+4)** : 62 tests (24 → 62), chaque item prouvé rouge →
     vert, mocks sans réseau garantis mécaniquement, RLS prouvée par SQL et
     REST réels, bug D16 attrapé par une vérification navigateur puis
     verrouillé. Manque : un vrai parcours E2E automatisé (le parcours
     Playwright de 5.13 était manuel/jetable).
   - **UX/Contenu 60 (-1)** : le socle UX progresse (admin complet,
     formulaires accessibles, états loading/vide/erreur propres) mais le
     site public affiche désormais un catalogue **vide** (décision 5.F
     assumée : plus de placeholder) tant que 6.1 → 6.3 ne sont pas faits —
     la note remontera avec le premier jeu réel publié.
   - **Production 73 (+3)** : backend réel en place et prouvé, procédure de
     déploiement documentée, CI toujours sans secrets ; retenue par les deux
     actions utilisateur bloquantes (compte admin, variables Vercel) et par
     D15 (pause free tier) — les trois sont le cœur du Sprint 6.

### Sprint 4 — Accessibilité, mise en ligne et contenu réel (2026-07-08)

1. **Découpage** : bon. La leçon des Sprints 2/3 (« au moins un item exécutable
   sans utilisateur ») a payé : 4.1 a produit de la valeur (garde-fou lint +
   3 tests) pendant que 4.2 se débloquait côté utilisateur. 4.3/4.4 confirment
   qu'un item « Décision requise » ne coûte rien mais ne produit rien tant que
   le contenu n'arrive pas.
2. **Suffisance des prompts** : suffisants. Le préréglage jsx-a11y a révélé un
   vrai défaut (cartes inaccessibles au clavier) traité en test rouge → fix —
   la procédure standard a couvert le cas sans improvisation.
3. **À détecter plus tôt** : le scope du token MCP Vercel (limité à `grandford`)
   a été correctement diagnostiqué comme problème d'autorisation, pas contourné.
   À retenir pour le Sprint 5 : toute action dashboard (variables d'env,
   création d'utilisateur) est un **prérequis d'accès utilisateur** à lister
   dans l'item dès sa définition — c'est fait pour 5.4 et 5.13.
4. **Notes /100** (précédent : 76/79/59/64 ; le tableau de bord avait été
   partiellement mis à jour en cours de sprint) :
   - **Architecture 76 (=)** : aucun changement structurel.
   - **Qualité 79 (=, consolidé)** : garde-fou a11y mécanique dans le lint,
     24 tests ; prochain levier : découpler les tests des données statiques
     (arrive mécaniquement au Sprint 5).
   - **UX/Contenu 61 (+2)** : cartes de jeu utilisables au clavier ; toujours
     plafonné par le contenu placeholder (D3, D7, D12, `og:image`).
   - **Production 70 (consolidé)** : site en ligne, CI complète (audit, lint,
     tests, build) ; prochain saut : le backend (données réelles gérées hors
     du code).

### Sprint 3 — Mise en ligne et contenu réel (2026-07-07)

1. **Découpage** : correct mais déséquilibré : un seul item exécutable (3.1)
   pour trois items en attente d'accès/contenu. 3.1 était bien dimensionné
   (un diff de 7 lignes, preuve locale, un commit). La leçon du Sprint 2
   (« les décisions ne se planifient pas, elles se débloquent ») se confirme :
   le Sprint 4 est donc construit avec au moins un item exécutable sans
   utilisateur (4.1, garde-fou a11y issu de la rétro du Sprint 2) pour que
   chaque sprint produise de la valeur même si les blocages persistent.
2. **Suffisance des prompts** : suffisants pour 3.1, aucune improvisation.
   Cas non couvert rencontré : le point 4 du prompt (« poser la question à
   l'utilisateur ») suppose un canal de question fonctionnel — il a échoué
   techniquement pendant tout le sprint. Le comportement adopté (items
   « Décision requise » laissés bloqués et reportés, échec consigné au
   changelog) découle déjà de la lettre du prompt (« ne se font pas sans
   réponse ») : aucun diff de prompt nécessaire, donc aucun proposé.
3. **À détecter plus tôt** : rien de nouveau côté produit. Le contrôle d'accès
   en début de sprint (garde-fou retenu à la rétro du Sprint 2) a fonctionné :
   l'import Vercel manquant a été constaté via MCP AVANT tout travail, pas au
   moment de déployer. À maintenir : chaque item « Action requise » du
   Sprint 4 liste explicitement son prérequis d'accès.
4. **Notes /100** (précédent : 76/78/59/62) :
   - **Architecture 76 (=)** : aucun changement structurel (un fichier YAML
     touché).
   - **Qualité 79 (+1)** : la dette sécurité ne peut plus se réinstaller
     silencieusement (audit bloquant en CI) ; le compte de tests ne bouge pas.
     Prochain levier : le garde-fou a11y (4.1).
   - **UX/Contenu 59 (=)** : rien de visible n'a changé ; toujours plafonné
     par le contenu placeholder (D3, D7, D12, `og:image`).
   - **Production 64 (+2)** : la CI vérifie désormais les quatre marches
     (audit, lint, tests, build) ; le site n'est toujours PAS en ligne (D13) —
     la mise en ligne effective (4.2) reste le prochain vrai saut.

### Sprint 2 — Dette sécurité, verrou mailto et contenu réel (2026-07-07)

1. **Découpage** : bon. L'ordre 2.1 seul en premier (bump de versions isolé)
   s'est vérifié utile : `npm audit fix` n'a touché que `package-lock.json` et
   la casse potentielle était triviale à écarter (suite verte inchangée).
   2.2 et 2.3 étaient bien dimensionnés (un test rouge, un fix minimal chacun).
   Mettre 2.4/2.5 (Décisions requises) dans le sprint n'a pas coûté, mais n'a
   rien produit : les décisions ne se planifient pas, elles se débloquent —
   reportées en 3.3/3.4 tant que le contenu n'arrive pas.
2. **Suffisance des prompts** : suffisants pour les items 2.1-2.3, aucune
   improvisation. L'objectif de déploiement ajouté en cours de sprint
   (décision utilisateur) sort du périmètre des prompts actuels — traité comme
   décision consignée au changelog + item 3.2, sans modifier les prompts.
   Aucun diff de prompt proposé : le cas « décision utilisateur en cours de
   sprint » est déjà couvert par l'esprit du point 4 (question posée, réponse
   consignée).
3. **À détecter plus tôt** : l'absence d'authentification Vercel (D13) n'a été
   constatée qu'au moment de déployer — un contrôle d'accès en début de sprint
   (« l'environnement peut-il faire ce que le sprint promet ? ») l'aurait
   remontée avant de committer le README. Garde-fou retenu : les items
   « Action requise » (3.2) listent explicitement le prérequis d'accès dans
   leur énoncé. Par ailleurs le garde-fou `npm audit` en CI (rétro Sprint 1)
   devient viable maintenant que le reliquat est 0 → item 3.1.
4. **Notes /100** (précédent : 75/70/57/55) :
   - **Architecture 76 (+1)** : extraction de la première fonction utilitaire
     pure (`src/utils/mailto.js`) — la logique métier sort du composant sans
     casser le pattern ; rien d'autre ne bouge.
   - **Qualité 78 (+8)** : 21 tests (mailto verrouillé, hiérarchie des headings),
     0 vulnérabilité npm, chaque fix prouvé par un test rouge → vert ; manquent
     encore le garde-fou audit en CI (3.1) et un audit a11y plus large.
   - **UX/Contenu 59 (+2)** : h1 unique dans toutes les vues (navigation par
     technologies d'assistance moins ambiguë) ; toujours plafonné par le
     contenu placeholder (D3, D7, D12, `og:image`).
   - **Production 62 (+7)** : dette sécurité à zéro, procédure de déploiement
     documentée, CI verte ; le site n'est PAS encore en ligne (D13) — la mise
     en ligne effective (3.2) portera le prochain saut.

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
