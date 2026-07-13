# NINJASASQUACTH-FRONTEND

Projet frontend de Ninja Sasquatch Games — site vitrine bilingue FR/EN
(français par défaut) avec fiches de jeux partageables et administration du
catalogue. La langue est portée par l'URL (`/fr`, `/en`), chaque jeu a une
route publique (`/fr/jeux/:slug`, `/en/games/:slug`).

Ninja Sasquatch Games est née de la passion de créer des moments inoubliables autour de la table. Nous croyons fermement que les jeux de société ont le pouvoir de rassembler les gens et de créer des souvenirs durables.

Notre engagement environnemental n'est pas qu'une promesse : tous nos jeux sont fabriqués avec des matériaux 100% compostables. Parce que s'amuser ne devrait jamais se faire au détriment de notre planète.

Basés au Québec, nous puisons notre inspiration dans les légendes locales, la nature mystérieuse et l'esprit d'aventure qui caractérise notre belle province.

## Démarrage rapide

Prérequis : Node ≥ 20 et npm.

```bash
npm install         # installer les dépendances
cp .env.example .env.local   # puis renseigner les valeurs Supabase du projet
npm run dev         # serveur de développement Vite (HMR)
npm run lint        # ESLint
npm test            # suite Vitest (run unique, sans réseau ni .env)
npm run test:watch  # Vitest en boucle
npm run build       # build de production dans dist/
npm run preview     # servir le build localement
```

Les valeurs de `.env.local` (URL du projet Supabase et clé publiable) se
trouvent dans le tableau de bord Supabase du projet `ninja-sasquatch-games`
(Settings → API). `.env.local` est ignoré par git — aucune clé ne se committe.
Sans ces variables, le build passe (la CI n'a pas de secrets) mais le
catalogue et l'admin afficheront une erreur à l'exécution.

Stack : **React 19 + Vite 7 + TypeScript strict**, `react-router-dom`
(routes localisées `/fr` · `/en` · `/fr/jeux/:slug` · `/en/games/:slug`,
`/admin` protégé par login, et une vraie page 404), **Tailwind CSS v4**
(`@tailwindcss/vite`, palette de marque en tokens `@theme`), **Supabase**
(`@supabase/supabase-js` — Auth, Postgres avec RLS, Storage), `lucide-react`.
Voir `CLAUDE.md` pour l'architecture et les conventions de code, et
`supabase/migrations/` pour le schéma de la base (copie tracée des migrations
appliquées, dont le modèle produit des jeux et la table `game_media`).

## Déploiement (Vercel)

**En production** : https://ninjasasquacth-frontend.vercel.app
(intégration Git Vercel — chaque push sur `main` redéploie la production).

Le site est **pré-rendu au build** (`npm run build`) : build client Vite +
bundle SSR + génération d'un HTML statique par route (`dist/fr/index.html`,
`dist/en/index.html`, une fiche par jeu publié, `404.html`, `sitemap.xml`,
`robots.txt`). Le HTML produit contient réellement le H1, le texte, les liens,
le canonical, les hreflang, l'OpenGraph et le JSON-LD — pas seulement après
hydratation (Sprint 11). Déployé par l'intégration Git Vercel : chaque push sur
`main` déclenche un déploiement de production, chaque branche une preview.

**Architecture de pré-rendu** : SSG maison (`react-dom/server` +
`StaticRouter`), pilotée par `scripts/prerender.mjs`. `vite-ssg` (cible Vue) et
`react-snap` (Puppeteer, fiabilité douteuse sous React 19/Vite 7) ont été
écartés ; le *framework mode* de React Router aurait imposé une réécriture
invasive de l'app en library mode. Le SSG maison n'ajoute aucune dépendance
(React core + StaticRouter déjà présent) et se teste sans réseau.

**Variables d'environnement** (dashboard Vercel → Settings → Environment
Variables, pour Production et Preview) :

| Variable | Rôle |
|---|---|
| `VITE_SUPABASE_URL` | URL d'API du projet Supabase `ninja-sasquatch-games` |
| `VITE_SUPABASE_ANON_KEY` | clé publiable (« publishable ») du même projet |
| `VITE_SITE_URL` / `SITE_URL` | domaine final (canonical, sitemap, JSON-LD) — défaut : le domaine Vercel actuel ; **à remplacer par le domaine personnalisé définitif** |
| `SUPABASE_URL` / `SUPABASE_ANON_KEY` (build) | lus par `scripts/prerender.mjs` pour pré-rendre les **fiches jeux** publiées ; sans eux, seuls l'accueil FR/EN et la 404 sont pré-rendus (les fiches restent rendues côté client) |

Après avoir posé (ou changé) ces variables, relancer un déploiement — Vite
les fige dans le bundle au moment du build. Sans elles, le site se déploie
mais le catalogue affiche une erreur localisée (le reste de la vitrine reste
visible — plus d'écran blanc, Sprint 11 Partie B).

`vercel.json` (Sprint 11.1 — routage réel) :
- **redirect** `/` → `/fr` (permanent) — plus de shell client à la racine ;
- **rewrites limités à `/admin`** (seule route rendue côté client) → shell SPA.
  Le rewrite catch-all vers `/index.html` a été **supprimé** : il masquait les
  fichiers pré-rendus et servait une *soft-404* en HTTP 200. Désormais Vercel
  sert `dist/fr/index.html`, `dist/en/...`, les fiches, et **`dist/404.html`
  en vrai HTTP 404** pour toute route inconnue ;
- `cleanUrls` + `trailingSlash: false` ;
- **headers de sécurité** (CSP stricte, HSTS, X-Frame-Options, Referrer-Policy,
  Permissions-Policy) et `X-Robots-Tag: noindex` sur `/admin`.

**Hydratation** : le client lit l'amorce `<script id="__PRERENDER_DATA__">`
(données publiques du build, échappées) AVANT le premier rendu et **hydrate**
(`hydrateRoot`) le HTML pré-rendu au lieu de le remplacer ; la langue initiale
est déduite de l'URL (`/en` démarre en anglais, aucun flash FR→EN). Les données
sont ensuite rafraîchies en arrière-plan sans vider le contenu.

### Reconstruction après publication admin (Deploy Hook)

Le contenu pré-rendu se périme après une modification dans `/admin`. Stratégie
de reconstruction contrôlée :

1. créer un **Deploy Hook** Vercel (Settings → Git → Deploy Hooks) ;
2. déployer l'Edge Function : `supabase functions deploy trigger-rebuild` puis
   `supabase secrets set VERCEL_DEPLOY_HOOK_URL=… WEBHOOK_SECRET=…` ;
3. brancher un **Database Webhook** Supabase sur la table `games` (insert/update)
   qui POST vers la fonction avec l'en-tête `x-webhook-secret`.

Le secret du Deploy Hook vit **uniquement** dans les secrets de l'Edge Function :
jamais dans la base publique, jamais envoyé au navigateur, jamais préfixé
`VITE_`, jamais committé. La fonction applique un **délai minimal** entre deux
rebuilds (anti-rafale) et journalise chaque demande dans `deploy_rebuilds`
(lisible par l'admin) sans aucun secret.

### Newsletter Kickstarter (Edge Function)

La capture courriel passe par l'Edge Function `subscribe-kickstarter` — jamais
une insertion Supabase publique. Déploiement :
`supabase functions deploy subscribe-kickstarter`, puis
`supabase secrets set ALLOWED_ORIGIN=… RATE_LIMIT_SALT=…`
(`SUPABASE_SERVICE_ROLE_KEY` est fourni par la plateforme). Appliquer d'abord
la migration `20260712140000_newsletter_subscribers.sql`. La table des abonnés
n'est **jamais** lisible publiquement (RLS : lecture admin seule, aucune
écriture navigateur). Antispam : honeypot + limitation de fréquence + validation
serveur ; réponse toujours générique (aucune fuite d'existence) ; l'email n'est
jamais journalisé.

**Stratégie d'opt-in** : **opt-in simple explicite**. Le serveur exige
`consent === true` ET une version de consentement attendue
(`newsletter-v1-2026-07`) avant d'écrire quoi que ce soit ; l'abonné est alors
enregistré en statut `confirmed`. Pas de statut `pending` orphelin : aucun
double opt-in tant qu'aucun courriel de confirmation n'est envoyé. La preuve de
consentement (`consent_at`, `consent_version`, `consent_source`) n'est écrite
qu'après cette validation serveur — **aucune fausse preuve possible**.

**Désinscription** (procédure manuelle temporaire) : aucun lien automatique
n'est encore implémenté ; le libellé de consentement le dit honnêtement
(« se désinscrire en nous écrivant »). Pour désinscrire une adresse, un admin
passe son statut à `unsubscribed` :
`update public.newsletter_subscribers set status = 'unsubscribed' where email_normalized = lower('…');`
Une Edge Function `unsubscribe-newsletter` à jeton signé reste une évolution
possible (voir ROADMAP, risques résiduels).

### CORS de l'Edge Function newsletter

`ALLOWED_ORIGIN` est une **liste blanche** d'origines (séparées par des
virgules) — jamais `*`. Le preflight autorise `authorization, x-client-info,
apikey, content-type` (les en-têtes que `supabase.functions.invoke` envoie).
Une origine hors liste ne reçoit aucun `Access-Control-Allow-Origin`.

### Limitation de fréquence atomique

La fonction `check_newsletter_rate_limit(p_ip_hash, p_window_seconds,
p_max_attempts)` (Postgres, verrou de ligne) remplace le schéma
lecture→calcul→écriture (condition de course). L'Edge Function l'appelle en RPC
et **échoue fermée** si le limiteur est indisponible (aucune inscription). L'IP
n'est jamais stockée en clair (haché salé par `RATE_LIMIT_SALT`).

## État réel de production (Sprint 11.1)

Distinction stricte entre *code présent* et *réellement opérationnel*. Vérifié
le 2026-07-13 sur le projet Supabase `vgmqmifgdolccquyjcoc` et le déploiement
Vercel actuel (`https://ninjasasquacth-frontend.vercel.app`), re-vérifié après la
fusion de la PR de stabilisation dans `main` : `npm run verify:production` passe
au vert (`/`→308→/fr, /fr et /en 200, route inconnue 404, en-têtes présents).

| Élément | Code | Migration/déploiement | Secret/config | Testé |
|---|---|---|---|---|
| Migrations produit + `game_media` | ✅ | ✅ appliquées | — | ✅ |
| Migration `newsletter_subscribers` (+ rate_limits) | ✅ | ✅ **appliquée ce sprint** | — | ✅ |
| Colonnes `consent_version` / `consent_source` | ✅ | ✅ appliquée | — | ✅ |
| RPC `check_newsletter_rate_limit` | ✅ | ✅ appliquée | — | ✅ vérifié sur la base (5 ok, 6e refusé) |
| Migration `deploy_rebuilds` | ✅ | ✅ **appliquée ce sprint** | — | ✅ |
| Edge Function `subscribe-kickstarter` | ✅ | ✅ **déployée (ACTIVE)** | ⛔ `ALLOWED_ORIGIN`, `RATE_LIMIT_SALT` à poser | ✅ live : `not_configured` (fail-closed) |
| Edge Function `trigger-rebuild` | ✅ | ✅ **déployée (ACTIVE)** | ⛔ Deploy Hook, `WEBHOOK_SECRET` à poser | ✅ live : `unauthorized` (fail-closed) |
| Database Webhook (games → rebuild) | — | ⛔ à créer | ⛔ | ⛔ |
| Routage Vercel (`/`→/fr, vraie 404, fiches statiques) | ✅ | ✅ **déployé sur `main`** | — | ✅ `npm run verify:production` vert le 2026-07-13 (redirection, 404 réelle, en-têtes, pré-rendu servi) |

**Actions utilisateur restantes (ne peuvent pas être automatisées)** :
1. Poser les secrets des Edge Functions (domaine de prod pour `ALLOWED_ORIGIN`,
   `RATE_LIMIT_SALT`, `VERCEL_DEPLOY_HOOK_URL`, `WEBHOOK_SECRET`) :
   `supabase secrets set …` — **valeurs jamais committées**.
2. Créer le Database Webhook Supabase (games insert/update → `trigger-rebuild`,
   en-tête `x-webhook-secret`).
3. Fixer `VITE_SITE_URL` / `SITE_URL` sur le domaine définitif et, pour les
   builds de production, `REQUIRE_PRERENDER_GAMES=true` (échoue si une fiche
   attendue n'est pas générée).
4. Le routage Vercel est **déployé et vérifié** (`verify:production` vert). Après
   avoir posé les secrets (point 1) et le webhook (point 2), redéployer une fois
   pour que la newsletter et le rebuild deviennent réellement opérationnels, puis
   ré-exécuter `npm run verify:production https://<domaine>`.
5. Donner un `slug` au jeu publié « Mario » (ou le repasser en brouillon) :
   il est publié **sans slug**, donc sans fiche partageable — capté par le
   garde `REQUIRE_PRERENDER_GAMES`.

### Procédure de vérification

```bash
npm run lint && npm run typecheck && npm test   # qualité
npm run build && npm run verify:dist            # pré-rendu + absence de secret
npm run verify:production https://<domaine> [slug-fiche]   # prod HTTP réelle
```

La CI GitHub Actions (`.github/workflows/ci.yml`) reste la garde qualité
(audit + lint + tests + build) en amont de tout déploiement ; elle n'a besoin
d'aucun secret (tests 100 % mockés, build tolérant l'absence d'env).

Un workflow planifié (`.github/workflows/supabase-keepalive.yml`) pingue
l'API REST Supabase chaque lundi pour éviter la pause automatique du palier
gratuit (~1 semaine d'inactivité) ; il requiert les secrets GitHub Actions
`SUPABASE_URL` et `SUPABASE_ANON_KEY` (mêmes valeurs que `.env.local`).

## Documentation

- `ROADMAP.md` — source de vérité du workflow : sprints, découvertes, changelog,
  **état des tests** (le compte de tests ne vit que là).
- `prompt-executer-sprint.md` / `prompt-mise-a-jour-roadmap.md` — les deux
  prompts du workflow de sprint (gouvernés : ne pas modifier sans décision).
- `CLAUDE.md` — règles et conventions de code.
