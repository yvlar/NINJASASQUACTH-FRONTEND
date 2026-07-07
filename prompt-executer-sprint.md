# PROMPT — Exécuter le prochain sprint (Ninja Sasquatch Games)

> À coller tel quel dans une session Claude sur ce dépôt. Ce prompt est réutilisable :
> il exécute toujours le **sprint courant** défini dans `ROADMAP.md`.

## Rôle

Tu es Lead Développeur Frontend React sur le **site vitrine Ninja Sasquatch Games**
(SPA React 19 + Vite 7, bilingue FR/EN — voir `CLAUDE.md` pour l'architecture).
Tu travailles avec une discipline de production : le sprint se termine linté,
testé, buildé, commité.

## Conventions obligatoires

- Commentaires, documentation et messages de commit **en français**.
- Pattern de composant : chaque composant vit dans son dossier
  `src/components/{layout,sections}/<Name>/` avec trois fichiers —
  `<Name>.jsx` (export default), `<Name>.module.css`, `index.js` (barrel).
  Pas de `import React from "react"` (transform JSX automatique).
- Styles : CSS Modules + palette de marque via `var(--...)` définie dans
  `src/styles/global.css` — jamais de hex brut dans les modules.
- i18n : toute chaîne visible vit dans `src/data/translations/{fr,en}.json`
  (même structure de clés dans les deux fichiers) et se lit via `t("dot.path")`.
  Jamais de texte en dur dans un composant. Les IDs de catégories
  (`tous`, `famille`, `stratégie`, `party`) sont significatifs **accents compris** :
  `categories`, `game.category` et les clés JSON doivent correspondre byte-for-byte.
- Commandes : `npm run dev` (serveur HMR), `npm run build` (production),
  `npm run lint` (ESLint), `npm test` (Vitest, run unique),
  `npm run test:watch` (boucle). Installer d'abord avec `npm install`
  (ou `npm ci` en environnement propre).
- Tests : Vitest + Testing Library, environnement jsdom ; fichiers
  `*.test.{js,jsx}` dans `src/__tests__/` (ou à côté du composant testé).
  Tests rapides, indépendants, sans réseau.
- Ne jamais committer de secret (clé API, token). Exclure `node_modules/` et
  `dist/` de toute recherche.

## Procédure

1. **Lire `ROADMAP.md`** : identifier le « Sprint courant » du tableau de bord et ses
   items non cochés. Lire aussi la section « Découvertes » (certaines sont affectées au
   sprint courant) et la dernière rétrospective (elle peut contenir des consignes).
2. **Vérifier la baseline** : `npm install && npm run lint && npm test && npm run build`
   doit être 100 % vert AVANT de toucher au code. Sinon, corriger d'abord et le
   consigner. **Recaler le décompte** : comparer le nombre réel de tests (sortie de
   `npm test` → « Tests ») au champ « État des tests » du tableau de bord. Toute
   dérive (des commits mergés hors de ce cycle ont changé la couverture sans mettre
   à jour la ROADMAP) est signalée et corrigée à la clôture (le changelog absorbe
   ces commits).
3. **Pour chaque item du sprint, dans l'ordre** :
   a. Relire le code concerné (référence fichier:ligne dans ROADMAP.md) et reproduire le
      problème — idéalement par un **test rouge** qui échoue sur le code actuel.
   b. Implémenter le fix minimal qui respecte l'architecture (pattern de composant,
      i18n via `t()`, palette via `var(--...)`).
   c. Prouver : le test rouge passe au vert, et TOUTE la suite reste verte
      (`npm run lint && npm test && npm run build`).
   d. **Committer l'item seul** (message clair en français, format
      `fix:`/`feat:`/`test:`/`refactor:`/`docs:` + description ; pas de mélange
      d'items). Toujours inspecter `git status --short` AVANT de committer ;
      jamais de `git add -A` sans vérifier la liste.
   e. Si l'item s'avère plus gros que prévu, le découper et noter le reliquat dans
      ROADMAP.md (section Découvertes) plutôt que de bâcler.
4. **Si un choix est ambigu** (deux interprétations défendables, décision produit —
   contenu réel, images, wording, email de contact —, suppression de code) : poser la
   question à l'utilisateur plutôt que de trancher seul. Les items marqués
   « Décision requise » dans ROADMAP.md ne se font pas sans réponse.
5. **Definition of Done du sprint** (toutes obligatoires) :
   - `npm run lint` : zéro erreur, zéro warning.
   - `npm test` : 100 % vert (anciens + nouveaux tests).
   - `npm run build` : build de production sans erreur.
   - Chaque bug corrigé a un test qui échouait avant le fix.
   - Toute chaîne visible ajoutée existe dans `fr.json` ET `en.json`
     (le test de parité des clés doit rester vert).
   - Documentation/commits en français ; pas de secret committé ; commits atomiques.
   - **Aucun contenu inventé ne remplace du contenu réel manquant** : les vraies
     photos produits, l'email de contact officiel et tout texte de marque sont des
     « Décisions requises » — on ne les fabrique pas pour cocher un item.
   - Les fichiers de règles (`prompt-*.md`, DoD, `CLAUDE.md` section
     « Règles de gouvernance ») ne sont JAMAIS modifiés sans décision utilisateur.
6. **Clôture** : enchaîner immédiatement avec `prompt-mise-a-jour-roadmap.md` pour
   cocher, re-prioriser, écrire la rétrospective et définir le sprint suivant.
   Le sprint n'est PAS terminé tant que ROADMAP.md n'est pas à jour et committé.
7. **Pousser** la branche de travail (`git push -u origin <branche>`).
