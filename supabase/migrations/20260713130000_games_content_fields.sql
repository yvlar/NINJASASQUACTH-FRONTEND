-- Prompt 5, items 12 & 13 — Séparer le contenu structuré de la description
-- marketing.
--
-- Jusqu'ici la fiche réutilisait la description longue (marketing) comme
-- « règles complètes » et présentait les mécaniques sous « Comment jouer ».
-- On ajoute des champs DÉDIÉS, alimentés uniquement quand du contenu réel
-- existe (jamais dérivés du marketing) :
--   - how_to_play_fr/en : étapes réelles de déroulement (une par ligne) ;
--   - rules_summary_fr/en : synthèse de règles (objectif, mise en place, tour
--     de jeu, fin de partie, victoire).
--
-- Additif et rétrocompatible : colonnes texte nullables. Tant qu'elles sont
-- vides, les sections correspondantes restent masquées côté fiche (aucune
-- invention de règles). La description longue reste une présentation marketing.

alter table public.games
  add column if not exists how_to_play_fr text,
  add column if not exists how_to_play_en text,
  add column if not exists rules_summary_fr text,
  add column if not exists rules_summary_en text;
