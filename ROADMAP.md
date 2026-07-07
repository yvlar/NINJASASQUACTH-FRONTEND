# ROADMAP — Site vitrine Ninja Sasquatch Games

> **Source de vérité du workflow.** Ce fichier est lu par `prompt-executer-sprint.md`
> (exécuter le sprint courant) et mis à jour par `prompt-mise-a-jour-roadmap.md`
> (clôturer le sprint). Ne pas l'éditer à la main hors de ce cycle, sauf pour
> ajouter une découverte.

## Tableau de bord

| Dimension        | Note /100 | Baseline (audit 2026-07-07) |
|------------------|-----------|------------------------------|
| **Architecture** | 76        | 75 — patterns propres (dossiers de composants + barrels, i18n bien découpé, données séparées du copy), pas de dette structurelle notable |
| **Qualité**      | 79        | 40 — ESLint strict configuré et vert, mais zéro test, zéro CI : les contrats critiques (parité i18n, IDs de catégories accentués, ancres de navigation) ne sont protégés par rien |
| **UX/Contenu**   | 59        | 50 — site bilingue fonctionnel (nav, jeux, formulaire), mais images Unsplash placeholder, favicon Vite par défaut, aucune balise SEO/OpenGraph |
| **Production**   | 70        | 30 — pas de CI, pas de déploiement documenté, README quasi vide (typo dans le titre) |

- **Dernière mise à jour** : 2026-07-07 — Sprint 4 en cours : **déploiement Vercel vérifié et consigné** (item 4.2, D13 résolu) — le site est en ligne et public à `https://ninjasasquacth-frontend.vercel.app` (confirmé live, build identique à `main`). Restent dans le Sprint 4 : garde-fou a11y (4.1, exécutable) et contenu réel (4.3/4.4, Décisions requises).
- **Sprint courant** : **Sprint 4 — Accessibilité, mise en ligne et contenu réel** (items 4.1 → 4.4 ci-dessous ; **4.2 fait** — site en ligne ; 4.1 exécutable sans action utilisateur ; 4.3/4.4 restent des **Décisions requises** — bloqués sans réponse utilisateur).
- **État des tests** : **24/24 verts** (9 fichiers dans `src/__tests__/`, sortie réelle de `npm test` après l'item 4.1 — Sprint 3 : 21 ; Sprint 1 : 16 ; baseline : 0). À recalibrer à chaque sprint sur la sortie réelle de `npm test`.
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

# 🟠 SPRINT 4 — Accessibilité, mise en ligne et contenu réel — **sprint courant**

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
- [ ] **4.4** (D7, D12) **Email officiel + liens sociaux réels** — **Décision
  requise** (report de 3.4, périmètre identique) : confirmer `CONTACT_EMAIL`
  (`src/data/site.js:1`), fournir les URLs Instagram/Facebook
  (`src/components/sections/Contact/ContactSection.jsx:137-142`, actuellement
  `href="#"`) ou décider de retirer les icônes.
  **Acceptation** : liens réels branchés, ou icônes retirées sur décision.

> **Definition of Done du Sprint 4** (en plus de la DoD standard) : le lint
> échoue sur violation a11y du préréglage `recommended` ; aucune mise en ligne
> sans URL vérifiée et consignée ; les items 4.2/4.3/4.4 ne sont cochés que sur
> accès/contenu fournis par l'utilisateur — jamais inventés.

---

# 🔵 SPRINT 5 — Backend : authentification (login) et extensions futures — pré-cadrage

> **Objectif décidé par l'utilisateur (2026-07-07)** : doter le site d'un
> backend pour un login et servir de socle aux extensions futures (D14).
> Changement structurel majeur : le dépôt est aujourd'hui une SPA statique
> sans backend, sans routeur et sans gestion d'état (voir `CLAUDE.md`).
> Ce bloc est un **pré-cadrage** : les items exécutables seront définis à la
> clôture du Sprint 4, une fois les décisions ci-dessous tranchées.

**Décisions requises avant tout code** :

- [x] **5.A** **Finalité du login** — **Décision prise (2026-07-07)** :
  **administration ET espace client** — deux rôles distincts (admin : gestion
  du contenu ; client : espace personnel). Implique un modèle de rôles dès la
  conception (RLS par rôle) ; le périmètre exact de chaque espace (quelles
  actions admin ? que voit le client ?) sera détaillé à la définition des
  items du Sprint 5.
- [x] **5.B** **Choix d'infrastructure** — **Décision prise (2026-07-07)** :
  **Supabase** (Auth + Postgres + RLS ; MCP déjà connecté à l'environnement
  de travail, patron éprouvé sur le projet GRANDFORD du même compte).
  Intégration avec le déploiement Vercel existant (item 4.2) ; clés côté
  variables d'environnement Vercel/Supabase uniquement.
- [ ] **5.C** **Impact sur l'architecture frontend** — **Décision requise** :
  un login implique probablement un routeur (routes protégées), une gestion
  de session et des conventions nouvelles — amendements à `CLAUDE.md`
  (« Règles de gouvernance » : toute modification des conventions passe par
  une décision utilisateur explicite).
- [ ] **5.D** (D6) **Synergie formulaire de contact** : le backend rendrait
  possible un vrai envoi du formulaire (`ContactSection`, aujourd'hui
  `mailto:` — D6) — à cadrer dans le même mouvement pour éviter deux
  chantiers d'infra successifs.

> **Garde-fous du Sprint 5** (rappel, non négociables) : aucun secret (clé
> API, token, service key) dans le code ou les commits — variables
> d'environnement Vercel/Supabase uniquement ; les conventions de `CLAUDE.md`
> ne changent que sur décision utilisateur consignée.

---

## Découvertes

| #   | Gravité | Constat | Affectation |
|-----|---------|---------|-------------|
| D1  | ✅ | Aucun framework de test : aucun script `test`, aucun fichier de test — les contrats byte-for-byte (parité i18n, catégories accentuées, ancres de nav) n'étaient protégés par rien, et `t()` masque les clés manquantes en retournant la clé | ✅ Sprint 1 (items 1.1 `0d6d903`, 1.2 `ee5cf70`) — 16 tests verrous |
| D2  | ✅ | Aucune CI : pas de répertoire `.github/`, lint/build jamais vérifiés sur push/PR | ✅ Sprint 1 (item 1.3 `db8f3bd`) |
| D3  | 🟠 | Images des 6 jeux = URLs Unsplash distantes (`src/data/games.js:10` et suiv.) — pas de vraies photos produits, dépendance à un CDN tiers | **Décision requise** — Sprint 3 (item 3.3, report de 2.4) |
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
| D14 | 🟡 | Décision utilisateur (2026-07-07) : ajouter un **backend** — authentification (login) et socle pour extensions futures. Changement structurel majeur vs l'architecture actuelle (SPA statique sans backend ni routeur ; lié à D6, formulaire en `mailto:`). **Décisions prises (2026-07-07)** : finalité = **admin + espace client** (5.A), infra = **Supabase** (5.B). Restent à cadrer : impact frontend/conventions `CLAUDE.md` (5.C) et synergie formulaire de contact (5.D) | Sprint 5 (pré-cadrage : 5.A/5.B décidés ; items exécutables définis à la clôture du Sprint 4) |

## Changelog

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
