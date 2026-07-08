-- Migration initiale — Sprint 5, item 5.2 (Ninja Sasquatch Games)
-- Copie de la migration appliquée au projet Supabase `vgmqmifgdolccquyjcoc`
-- via MCP `apply_migration` (source de vérité : la base ; ce fichier trace le SQL).
--
-- Contenu : profils avec rôles (admin/client, extensible espace client),
-- fonction is_admin(), table games (contenu bilingue FR/EN à plat), RLS.

-- 1. Profils : un par utilisateur auth, rôle par défaut « client »
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'client' check (role in ('admin', 'client')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Chaque utilisateur ne lit que son propre profil ; aucune écriture côté
-- client — la promotion admin ne se fait qu'en SQL (hors API publique)
create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (id = (select auth.uid()));

-- 2. Création automatique du profil à l'inscription
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Fonction de trigger : ne pas l'exposer via /rest/v1/rpc (advisor 0028/0029) ;
-- le trigger s'exécute indépendamment des privilèges EXECUTE de l'appelant
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- 3. is_admin() : security definer — les policies de games lisent profiles
-- sans déclencher la RLS de profiles (pas de récursion)
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

-- EXECUTE volontairement accordé à anon/authenticated : les policies RLS de
-- games évaluent is_admin() sous ces rôles (l'advisor 0028/0029 signale un
-- WARN attendu ici — la fonction ne divulgue qu'un booléen sur soi-même)
revoke execute on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- 4. Jeux : colonnes bilingues à plat — la parité FR/EN est une contrainte DB
-- (NOT NULL par langue), miroir du test de parité i18n du frontend.
-- Les IDs de catégories sont byte-for-byte ceux du frontend (accents compris).
create table public.games (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('famille', 'stratégie', 'party')),
  title_fr text not null check (length(trim(title_fr)) > 0),
  title_en text not null check (length(trim(title_en)) > 0),
  short_desc_fr text not null,
  short_desc_en text not null,
  full_desc_fr text not null,
  full_desc_en text not null,
  image_url text,
  players text not null,
  duration text not null,
  age text not null,
  eco boolean not null default true,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.games enable row level security;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger games_set_updated_at
  before update on public.games
  for each row execute function public.set_updated_at();

-- 5. RLS jeux : le filtrage « published » est fait ici, jamais par le client ;
-- les écritures exigent le rôle admin (la garde frontend n'est que de l'UX)
create policy "games_select_published_or_admin"
  on public.games for select
  to anon, authenticated
  using (published or public.is_admin());

create policy "games_insert_admin"
  on public.games for insert
  to authenticated
  with check (public.is_admin());

create policy "games_update_admin"
  on public.games for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "games_delete_admin"
  on public.games for delete
  to authenticated
  using (public.is_admin());
