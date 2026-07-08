# ROADMAP — Site vitrine Ninja Sasquatch Games

> **Source de vérité du workflow.** Ce fichier est lu par `prompt-executer-sprint.md`
> (exécuter le sprint courant) et mis à jour par `prompt-mise-a-jour-roadmap.md`
> (clôturer le sprint). Ne pas l'éditer à la main hors de ce cycle, sauf pour
> ajouter une découverte.

## Tableau de bord

| Dimension        | Note /100 | Baseline (audit 2026-07-07) |
|------------------|-----------|------------------------------|
| **Architecture** | 82        | 75 — patterns propres (dossiers de composants + barrels, i18n bien découpé, données séparées du copy), pas de dette structurelle notable |
| **Qualité**      | 83        | 40 — ESLint strict configuré et vert, mais zéro test, zéro CI : les contrats critiques (parité i18n, IDs de catégories accentués, ancres de navigation) ne sont protégés par rien |
| **UX/Contenu**   | 60        | 50 — site bilingue fonctionnel (nav, jeux, formulaire), mais images Unsplash placeholder, favicon Vite par défaut, aucune balise SEO/OpenGraph |
| **Production**   | 73        | 30 — pas de CI, pas de déploiement documenté, README quasi vide (typo dans le titre) |

- **Dernière mise à jour** : 2026-07-08 — **Sprint 5 mergé et en production** (PR #7 → `main`, merge `2799b70`, CI verte). Backend Supabase **en service** : compte admin actif (6.1), variables Vercel posées et build de production câblé à Supabase, vérifié par HTTP (6.2). Le site public sert le catalogue depuis la base (vide pour l'instant, décision 5.F). Reste au Sprint 6 : créer les vrais jeux via `/admin` (6.3), contenu D7/D12 (6.4), garde-fou anti-pause Supabase (6.5).
- **Sprint courant** : **Sprint 6 — Mise en service du backend et contenu réel** (items 6.1 → 6.5 ci-dessous ; 6.1/6.2/6.3/6.4 dépendent d'actions/contenus utilisateur, 6.5 est exécutable sans lui).
- **État des tests** : **62/62 verts** (18 fichiers dans `src/__tests__/`, sortie réelle de `npm test` à la clôture du Sprint 5 — Sprint 4 : 24 ; Sprint 3 : 21 ; Sprint 1 : 16 ; baseline : 0). À recalibrer à chaque sprint sur la sortie réelle de `npm test`.
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

# 🟠 SPRINT 6 — Mise en service du backend et contenu réel — **sprint courant**

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
- [x] **6.2** **Variables Vercel + vérification prod** (reliquat de 5.13) —
  **fait le 2026-07-08** : variables `VITE_SUPABASE_URL` /
  `VITE_SUPABASE_ANON_KEY` posées par l'utilisateur au dashboard Vercel ;
  Sprint 5 mergé dans `main` (PR #7, CI verte, merge `2799b70`) → déploiement
  de production déclenché.
  **Acceptation SATISFAITE** (vérifications HTTP directes, le navigateur du
  bac à sable n'ayant pas d'egress direct — mêmes limites qu'aux items
  4.2/5.13) : `https://ninjasasquacth-frontend.vercel.app/` → HTTP 200,
  `/admin` → HTTP 200 (rewrite SPA vérifié en accès direct) ; le bundle de
  production embarque bien l'URL et la clé Supabase (env vars intégrées au
  build) ; le backend ciblé répond conformément à la RLS — lecture anonyme
  `[]` (base vide, HTTP 200), écriture anonyme refusée (HTTP 401).
- [ ] **6.3** (D3) **Premiers vrais jeux + photos via l'admin** — **Décision/
  action utilisateur** : créer les jeux réels (textes FR/EN, photos produits
  uploadées dans `game-images`) via `/admin`. Dépend de 6.1 + 6.2.
  **Acceptation** : au moins un jeu réel publié visible sur le site public ;
  D3 clôturée (plus aucun placeholder nulle part). Ajouter `og:image`
  (`index.html`) dès qu'une vraie photo existe.
- [ ] **6.4** (D7, D12) **Email officiel + liens sociaux réels** — **Décision
  requise** (report de 4.4, périmètre identique) : confirmer `CONTACT_EMAIL`
  (`src/data/site.js:1`), fournir les URLs Instagram/Facebook
  (`src/components/sections/Contact/ContactSection.jsx:137-142`, `href="#"`)
  ou décider de retirer les icônes (retire aussi la suspension locale
  d'`anchor-is-valid` posée en 4.1).
  **Acceptation** : liens réels branchés, ou icônes retirées sur décision.
- [ ] **6.5** (D15) **Garde-fou anti-pause Supabase** — exécutable sans
  utilisateur : le palier gratuit met le projet en pause après ~1 semaine
  d'inactivité → le catalogue afficherait l'état d'erreur. Ajouter un ping
  hebdomadaire planifié dans la CI (`.github/workflows/`, cron + `curl` de
  l'endpoint REST public avec la clé publiable en secret GitHub Actions —
  clé publique par conception, mais hors dépôt par convention).
  **Acceptation** : workflow planifié vert ; la requête maintient le projet
  actif ; documentation d'une ligne au README.

> **Definition of Done du Sprint 6** (en plus de la DoD standard) : les items
> 6.1 → 6.4 ne sont cochés que sur action/contenu utilisateur effectifs —
> jamais à sa place ; aucune URL/statut de production consigné sans
> vérification HTTP directe ; aucun secret committé (la clé publiable vit en
> secret CI/variable d'env, jamais dans le YAML en clair).

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
| D12 | 🟡 | (Sprint 1) Liens sociaux Instagram/Facebook en `href="#"` (`ContactSection.jsx:137-142`) — placeholders cliquables sans destination | **Décision requise** — Sprint 3 (item 3.4, report de 2.5) |
| D13 | ✅ | (Sprint 2) Déploiement demandé (décision utilisateur 2026-07-07). Résolu au Sprint 4 : intégration Git Vercel en place, **site en ligne et public** à `https://ninjasasquacth-frontend.vercel.app` (HTTP 200, build identique à `main`). Reliquat connu, sans impact sur la mise en ligne : le token de l'intégration MCP Vercel est scoppé au seul projet `grandford`. Confirmé comme un refus d'autorisation (et non de découverte) : avec l'ID projet fourni `prj_mQkt78gkQIeDB1ccAHBV8895HAox`, `get_project`→404 et `list_deployments`→403. L'ID de déploiement/SHA n'est donc pas relevable via MCP tant que l'accès n'est pas accordé au projet côté Vercel — vérification faite par requête HTTP sur l'URL publique | ✅ Sprint 4 (item 4.2) — URL de production consignée (ROADMAP + README) |
| D14 | ✅ | Décision utilisateur (2026-07-07) : ajouter un **backend** — authentification (login) et socle pour extensions futures. Toutes les décisions de cadrage prises (5.A → 5.G, 2026-07-07/08) | ✅ Sprint 5 — backend Supabase livré (projet dédié, schéma+RLS, Storage, login/rôles, CRUD jeux, site branché). Mise en service = Sprint 6 ; espace client = sprint ultérieur (le modèle de rôles est prêt) |
| D15 | 🟡 | (Sprint 5) Le palier gratuit Supabase met le projet en **pause après ~1 semaine d'inactivité** → le catalogue public afficherait l'état d'erreur (message i18n en place comme filet). Constaté à la conception, garde-fou peu coûteux identifié : ping hebdomadaire en CI | Sprint 6 (item 6.5 — exécutable sans utilisateur) |
| D16 | ✅ | (Sprint 5) `useGames` ne gérait pas le **rejet** de la promesse (panne réseau avant réponse) : UI bloquée sur « Chargement… » au lieu de l'état d'erreur. Découvert en vérifiant l'app dans un vrai navigateur (item 5.13) — les tests unitaires ne simulaient que l'erreur applicative, pas le rejet | ✅ Sprint 5 (`18525a9`) — fix + cas de rejet ajouté au mock et aux tests |
| D17 | 🟠→✅ | (Clôture Sprint 5) **Faux vert lint local** : les preuves DoD passaient par `npm run lint 2>&1 \| tail -1 && …` — le code de sortie d'un pipeline bash est celui de la dernière commande (`tail` → 0), donc 2 erreurs `react-hooks/set-state-in-effect` (`AuthProvider.jsx`, `GamesManager.jsx`, introduites aux items 5.7/5.9) ont été rapportées « lint vert » à tort. **Attrapé par la CI sur la PR #7** — le garde-fou mécanique du Sprint 1 a fait exactement son travail. Garde-fou de méthode consigné : toute commande de preuve s'exécute sans pipe masquant (ou avec `set -o pipefail`) et son exit code est vérifié explicitement | ✅ Correctif `2cfe778` (rôle dérivé au rendu dans AuthProvider ; fetch inline + clé de rechargement dans GamesManager, filet de rejet réseau aligné sur D16) — lint exit 0, 62/62, build OK |

## Changelog

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
