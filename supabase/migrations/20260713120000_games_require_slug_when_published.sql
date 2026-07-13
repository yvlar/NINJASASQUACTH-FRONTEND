-- Prompt 5, item 4 — Interdire la publication d'un jeu sans slug.
--
-- Un jeu publié expose une fiche partageable (/fr/jeux/:slug · /en/games/:slug)
-- et alimente le sitemap ; sans slug, cette fiche ne peut être ni routée ni
-- pré-rendue. La contrainte garantit donc, côté base (autorité finale), qu'un
-- jeu publié possède toujours un slug non vide — un brouillon (published=false)
-- peut rester sans slug.
--
-- Additive et rétrocompatible : la table est vide au moment de l'ajout ; toute
-- ligne future publiée devra respecter la contrainte (miroir de la validation
-- client `slugRequiredWhenPublished`). L'unicité du slug reste portée par
-- l'index unique existant games_slug_key.

alter table public.games
  drop constraint if exists games_published_requires_slug;

alter table public.games
  add constraint games_published_requires_slug
  check (
    published = false
    or (slug is not null and length(btrim(slug)) > 0)
  );
