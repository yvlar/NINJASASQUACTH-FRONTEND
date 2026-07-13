# Affirmations commerciales & environnementales — registre de validation

> **Statut du document :** source de vérité des allégations marketing du site.
> **Règle de gouvernance (OVERRIDE) :** le contenu de marque est une
> « Décision requise ». Ces textes ne sont **ni inventés ni modifiés
> automatiquement** : chaque allégation reste **à valider par le studio**
> (preuve/source à l'appui) **ou** à remplacer par la formulation prudente
> proposée ci-dessous **avant le lancement public**. Aucune certification n'est
> inventée.

Légende des statuts :

- 🟢 **confirmé** — preuve interne fournie et vérifiée (à cocher par le studio).
- 🟠 **à valider** — allégation présente sur le site, non encore prouvée.
- 🔴 **interdit temporairement** — allégation absolue à risque ; ne pas publier
  telle quelle sans preuve.

Aucune allégation n'est aujourd'hui marquée 🟢 : le studio doit fournir les
preuves ou approuver les formulations prudentes.

---

## 1. « 100 % compostable »

| | |
|---|---|
| **Texte FR** | « 100 % compostable(s) » |
| **Texte EN** | “100% compostable” |
| **Emplacements (clés i18n)** | `home.hero.brandLead`, `reassurance.items.eco`, `games.eco`, `games.materials`, `about.p2`, `about.stats.compostable` + `about.statValues.compostable` (« 100% »), `footer.tagline` |
| **Statut** | 🔴 interdit temporairement (allégation absolue non prouvée) |
| **Preuve/source attendue** | Certification ou rapport de compostabilité (norme p. ex. EN 13432 / ASTM D6400) pour **chaque composant** du jeu (cartes, boîte, encres, éléments plastiques éventuels). Une allégation « 100 % » exige que *tout* le produit soit compostable. |
| **Responsable de validation** | Studio Ninja Sasquatch (fondateur / production) |
| **Formulation prudente proposée (FR)** | « Pensés avec une attention particulière portée aux matériaux et à leur impact environnemental » / « matériaux en grande partie compostables » (si applicable). |
| **Formulation prudente proposée (EN)** | “Designed with particular care for materials and their environmental impact.” |

## 2. « Conçu et fabriqué au Québec » / « Fait au Québec »

| | |
|---|---|
| **Texte FR** | « Conçu et fabriqué au Québec » ; « Fait au Québec » |
| **Texte EN** | “Designed and made in Quebec” ; “Made in Quebec” |
| **Emplacements** | `games.madeIn`, `reassurance.items.quebec`, `about.statValues.quebec`, `footer.tagline`, `about.p3` (« Basés au Québec ») |
| **Statut** | 🟠 à valider |
| **Preuve/source attendue** | Distinguer **conception** (studio au Québec — plausible) et **fabrication** (lieu réel d'impression/assemblage). « Fabriqué au Québec » exige un fournisseur québécois documenté ; sinon se limiter à « Conçu au Québec ». |
| **Responsable de validation** | Studio Ninja Sasquatch |
| **Formulation prudente proposée** | FR : « Conçu au Québec » ; EN : “Designed in Quebec” (retirer « fabriqué » tant que le lieu de fabrication n'est pas confirmé). |

## 3. « Engagement environnemental garanti »

| | |
|---|---|
| **Texte FR** | « Engagement environnemental garanti » |
| **Texte EN** | “Guaranteed environmental commitment” |
| **Emplacements** | `games.commitment` |
| **Statut** | 🔴 interdit temporairement (le mot « garanti » engage juridiquement sans objet mesurable) |
| **Preuve/source attendue** | Définir ce qui est « garanti » et comment (politique environnementale publiée, indicateurs). Sinon retirer « garanti ». |
| **Responsable de validation** | Studio Ninja Sasquatch |
| **Formulation prudente proposée** | FR : « Une démarche environnementale au cœur de nos choix » ; EN : “Environmental care at the heart of our choices.” |

## 4. « Rires garantis »

| | |
|---|---|
| **Texte FR** | « Rires garantis » |
| **Texte EN** | “Laughs guaranteed” |
| **Emplacements** | `about.stats.fun` (+ `about.statValues.fun` « FUN ») |
| **Statut** | 🟠 à valider (hyperbole marketing, faible risque) |
| **Preuve/source attendue** | Formule d'ambiance acceptable en marketing ; à conserver si le studio l'assume. Risque faible mais reste une « garantie » de résultat. |
| **Responsable de validation** | Studio Ninja Sasquatch |
| **Formulation prudente proposée** | FR : « Fous rires en perspective » ; EN : “Plenty of laughs in store.” |

## 5. « Matériaux 100 % compostables et écoresponsables »

| | |
|---|---|
| **Texte FR** | « Matériaux 100% compostables et écoresponsables » ; « matériaux compostables et une production responsable » |
| **Texte EN** | “100% compostable and eco-responsible materials”; “compostable materials and responsible production” |
| **Emplacements** | `games.materials`, `about.ecoDesc`, `about.p2` |
| **Statut** | 🔴 interdit temporairement (même problème que §1 + « écoresponsable » non défini) |
| **Preuve/source attendue** | Idem §1, plus une définition de « écoresponsable » (critères, périmètre : matériaux, transport, production). |
| **Responsable de validation** | Studio Ninja Sasquatch |
| **Formulation prudente proposée** | FR : « Des matériaux choisis avec soin pour limiter l'impact environnemental » ; EN : “Materials chosen with care to limit environmental impact.” |

---

## Procédure de mise en conformité (avant lancement)

1. Le studio coche 🟢 chaque allégation qu'il peut **prouver** (joindre la
   source dans ce fichier), **ou** applique la formulation prudente proposée.
2. Une fois la décision prise, mettre à jour les clés i18n correspondantes dans
   `src/data/translations/{fr,en}.json` (les deux langues, parité obligatoire —
   verrouillée par `i18n-parity.test.ts`).
3. Consigner la décision dans le changelog de `ROADMAP.md` (comme toute
   « Décision requise » résolue).

> Tant que ce registre n'est pas traité, ces allégations restent des
> **actions utilisateur bloquantes** : elles n'ont **pas** été réécrites
> automatiquement, conformément à la règle de gouvernance interdisant de
> modifier le contenu de marque sans décision explicite.
