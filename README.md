# NINJASASQUACTH-FRONTEND

Projet frontend React de Ninja Sasquatch Games — site vitrine une page,
bilingue FR/EN (français par défaut).

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

Stack : React 19 + Vite 7, `react-router-dom` (`/` site vitrine, `/admin`
espace d'administration), Supabase (`@supabase/supabase-js` — Auth, Postgres
avec RLS, Storage), CSS Modules, `lucide-react`. Pas de TypeScript — voir
`CLAUDE.md` pour l'architecture et les conventions de code, et
`supabase/migrations/` pour le schéma de la base (copie tracée des migrations
appliquées).

## Déploiement (Vercel)

**En production** : https://ninjasasquacth-frontend.vercel.app
(intégration Git Vercel — chaque push sur `main` redéploie la production).

Le site est un build statique Vite (`npm run build` → `dist/`) déployé par
l'intégration Git Vercel : chaque push sur `main` déclenche un déploiement de
production, chaque branche une preview.

**Variables d'environnement requises** (dashboard Vercel → Settings →
Environment Variables, pour Production et Preview) :

| Variable | Valeur |
|---|---|
| `VITE_SUPABASE_URL` | l'URL d'API du projet Supabase `ninja-sasquatch-games` |
| `VITE_SUPABASE_ANON_KEY` | la clé publiable (« publishable ») du même projet |

Après avoir posé (ou changé) ces variables, relancer un déploiement — Vite
les fige dans le bundle au moment du build. Sans elles, le site se déploie
mais le catalogue et `/admin` affichent une erreur.

`vercel.json` contient le rewrite SPA (`/(.*) → /index.html`) qui rend
`/admin` accessible en accès direct (sans lui, Vercel répondrait 404 sur
toute URL profonde).

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
