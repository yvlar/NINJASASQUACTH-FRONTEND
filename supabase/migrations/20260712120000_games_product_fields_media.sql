-- Migration additive — Sprint 9 (Ninja Sasquatch Games)
-- Copie du SQL appliqué au projet Supabase `vgmqmifgdolccquyjcoc`
-- via MCP `apply_migration` (source de vérité : la base ; ce fichier trace le SQL).
--
-- But : donner à `public.games` un modèle produit complet (slug partageable,
-- taglines, plages joueurs/durée, âge, complexité, mécaniques, langues du
-- matériel, thème, campagne Kickstarter, PDF de règles, mise en avant) et
-- ajouter une table `public.game_media` pour la galerie.
--
-- Sécurité de la migration (lignes déjà présentes) : TOUTES les colonnes
-- ajoutées sont soit NULLABLES, soit dotées d'un DEFAULT sûr et non-marketing
-- (`campaign_status = 'none'`, `coming_soon = false`) — jamais de faux contenu
-- de marque pour satisfaire une contrainte. Les CHECK laissent passer NULL.
-- Aucune donnée existante n'est supprimée ni modifiée dans son contenu.

-- 1. Colonnes produit sur games (additives, nullables sauf défauts sûrs)
alter table public.games
  add column if not exists slug text,
  add column if not exists tagline_fr text,
  add column if not exists tagline_en text,
  add column if not exists players_min integer,
  add column if not exists players_max integer,
  add column if not exists duration_min integer,
  add column if not exists duration_max integer,
  add column if not exists minimum_age integer,
  add column if not exists complexity text,
  add column if not exists mechanics text[],
  add column if not exists game_languages text[],
  add column if not exists theme_key text,
  add column if not exists campaign_status text not null default 'none',
  add column if not exists kickstarter_url text,
  add column if not exists rules_pdf_fr text,
  add column if not exists rules_pdf_en text,
  add column if not exists featured_order integer,
  add column if not exists coming_soon boolean not null default false;

-- 2. Contraintes (toutes tolérantes au NULL pour rester rétrocompatibles)

-- slug unique et partageable (plusieurs NULL restent autorisés en Postgres)
create unique index if not exists games_slug_key on public.games (slug);

alter table public.games
  drop constraint if exists games_players_min_positive,
  add constraint games_players_min_positive
    check (players_min is null or players_min > 0);
alter table public.games
  drop constraint if exists games_players_max_positive,
  add constraint games_players_max_positive
    check (players_max is null or players_max > 0);
alter table public.games
  drop constraint if exists games_duration_min_positive,
  add constraint games_duration_min_positive
    check (duration_min is null or duration_min > 0);
alter table public.games
  drop constraint if exists games_duration_max_positive,
  add constraint games_duration_max_positive
    check (duration_max is null or duration_max > 0);
alter table public.games
  drop constraint if exists games_minimum_age_positive,
  add constraint games_minimum_age_positive
    check (minimum_age is null or minimum_age > 0);

-- players_max >= players_min et duration_max >= duration_min
alter table public.games
  drop constraint if exists games_players_range,
  add constraint games_players_range
    check (players_min is null or players_max is null or players_max >= players_min);
alter table public.games
  drop constraint if exists games_duration_range,
  add constraint games_duration_range
    check (duration_min is null or duration_max is null or duration_max >= duration_min);

-- theme_key : clé de thème CONTRÔLÉE (jamais une classe Tailwind ni un hex)
alter table public.games
  drop constraint if exists games_theme_key_valid,
  add constraint games_theme_key_valid
    check (theme_key is null or theme_key in
      ('brand', 'heroes-rising', 'burgle-jack', 'flickle-mania'));

-- campaign_status : statut de campagne Kickstarter
alter table public.games
  drop constraint if exists games_campaign_status_valid,
  add constraint games_campaign_status_valid
    check (campaign_status in ('none', 'coming-soon', 'live', 'completed'));

-- 3. Médias : galerie et documents attachés à un jeu
create table if not exists public.game_media (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games (id) on delete cascade,
  storage_path text not null,
  media_type text not null default 'image'
    check (media_type in ('image', 'pdf')),
  alt_fr text,
  alt_en text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists game_media_game_id_idx
  on public.game_media (game_id);

alter table public.game_media enable row level security;

-- Lecture publique UNIQUEMENT si le jeu associé est publié ; l'admin voit tout.
-- La sous-requête sur games respecte la RLS de games (un anonyme n'y voit que
-- les jeux publiés) — le prédicat `g.published` est explicite et défensif.
create policy "game_media_select_published_or_admin"
  on public.game_media for select
  to anon, authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.games g
      where g.id = game_media.game_id and g.published
    )
  );

create policy "game_media_insert_admin"
  on public.game_media for insert
  to authenticated
  with check (public.is_admin());

create policy "game_media_update_admin"
  on public.game_media for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "game_media_delete_admin"
  on public.game_media for delete
  to authenticated
  using (public.is_admin());
