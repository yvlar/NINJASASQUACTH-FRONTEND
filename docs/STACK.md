# Stack technique — Ninja Sasquatch Games

Site vitrine + admin de catalogue de jeux. SPA React en JavaScript pur,
backend Supabase, déployée sur Vercel. Versions issues de `package.json`
(source de vérité).

## Frontend

| Rôle              | Techno               | Version |
|-------------------|----------------------|---------|
| Framework UI      | React                | 19.2    |
| DOM renderer      | react-dom            | 19.2    |
| Build / dev       | Vite                 | 7.2     |
| Plugin React      | @vitejs/plugin-react | 5.1     |
| Routage           | react-router-dom     | 7.18    |
| Icônes            | lucide-react         | 0.562   |
| Styles            | CSS Modules + `global.css` (palette `var(--...)`, Poppins) — pas de framework CSS |
| i18n              | Maison (Context + `t()` + JSON fr/en) — pas de lib |
| Langage           | JavaScript / JSX — pas de TypeScript |

## Backend — Supabase

| Rôle              | Détail |
|-------------------|--------|
| Client            | @supabase/supabase-js 2.110 (`src/lib/supabase.js`, singleton) |
| Base de données   | Postgres 17 (projet `ninja-sasquatch-games`, région `ca-central-1`) |
| Authentification  | Supabase Auth (email/mot de passe ; rôles `admin`/`client` via table `profiles`) |
| Sécurité          | RLS (lecture anon = jeux publiés ; écritures = admin) + fonction `is_admin()` |
| Stockage          | Supabase Storage — bucket public `game-images` (5 Mo, jpeg/png/webp) |
| Migrations        | SQL tracé dans `supabase/migrations/` |

## Tests & qualité

| Rôle   | Techno |
|--------|--------|
| Tests  | Vitest 4.1 + Testing Library (react 16.3, jest-dom 6.9) sous jsdom — suite 100 % mockée (zéro réseau) |
| Lint   | ESLint 9.39 (flat config) + plugins react-hooks, react-refresh, jsx-a11y (recommended) |
| CI     | GitHub Actions (`.github/workflows/ci.yml`) : `npm audit` → lint → tests → build |

> Le décompte exact de tests vit dans `ROADMAP.md` (« État des tests »).

## Déploiement & infra

| Rôle        | Détail |
|-------------|--------|
| Hébergement | Vercel (intégration Git, build statique Vite) |
| Routage SPA | `vercel.json` (rewrite `/(.*) → /index.html` pour l'accès direct à `/admin`) |
| Production  | https://ninjasasquacth-frontend.vercel.app |
| Config      | `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` (env Vercel + `.env.local` gitignoré — jamais dans le repo) |

## Résumé

SPA **React 19 + Vite 7** en JavaScript pur, backend **Supabase**
(Auth + Postgres/RLS + Storage), déployée sur **Vercel**, testée avec
**Vitest** et gardée par une **CI GitHub Actions**. Pas de TypeScript,
pas de framework CSS, pas de lib de state management ni d'i18n externe.

Voir aussi `CLAUDE.md` (architecture détaillée et conventions) et
`README.md` (démarrage rapide).
