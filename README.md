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
npm run dev         # serveur de développement Vite (HMR)
npm run lint        # ESLint
npm test            # suite Vitest (run unique)
npm run test:watch  # Vitest en boucle
npm run build       # build de production dans dist/
npm run preview     # servir le build localement
```

Stack : React 19 + Vite 7, CSS Modules, `lucide-react`. Pas de backend, pas de
routeur, pas de TypeScript — voir `CLAUDE.md` pour l'architecture et les
conventions de code.

## Déploiement (Vercel)

**En production** : https://ninjasasquacth-frontend.vercel.app
(intégration Git Vercel — chaque push sur `main` redéploie la production).

Le site est un build statique Vite (`npm run build` → `dist/`), prêt à être
déployé sur Vercel sans configuration particulière (framework détecté
automatiquement, aucune variable d'environnement requise). Deux voies :

- **Intégration Git (recommandé)** : importer le dépôt GitHub dans le
  tableau de bord Vercel (« Add New… → Project »). Chaque push sur `main`
  déclenche alors un déploiement de production, et chaque branche une preview.
- **CLI** : `npx vercel deploy --prod` depuis la racine du projet
  (authentification `vercel login` ou variable `VERCEL_TOKEN` requise).

La CI GitHub Actions (`.github/workflows/ci.yml`) reste la garde qualité
(lint + tests + build) en amont de tout déploiement.

## Documentation

- `ROADMAP.md` — source de vérité du workflow : sprints, découvertes, changelog,
  **état des tests** (le compte de tests ne vit que là).
- `prompt-executer-sprint.md` / `prompt-mise-a-jour-roadmap.md` — les deux
  prompts du workflow de sprint (gouvernés : ne pas modifier sans décision).
- `CLAUDE.md` — règles et conventions de code.
