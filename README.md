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

`vercel.json` contient le rewrite SPA (`/(.*) → /index.html`) — les fichiers
statiques pré-rendus ont priorité (Vercel sert le disque avant la réécriture) —
ainsi que les **headers de sécurité** (CSP stricte, HSTS, X-Frame-Options,
Referrer-Policy, Permissions-Policy) et `X-Robots-Tag: noindex` sur `/admin`.

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
