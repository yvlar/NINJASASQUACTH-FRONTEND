-- Migration — Sprint 12, Partie G (Ninja Sasquatch Games)
-- Capture courriel sécurisée pour le prélancement Kickstarter.
--
-- ⚠️ Fichier TRACÉ : à appliquer au projet Supabase `vgmqmifgdolccquyjcoc`
-- (MCP `apply_migration` ou `supabase db push`). La source de vérité reste la
-- base ; ce fichier trace le SQL. Aucune donnée personnelle n'est jamais
-- exposée à un rôle public : l'email ne vit que derrière la RLS et n'est écrit
-- que par l'Edge Function `subscribe-kickstarter` (service-role, hors client).

-- 1. Table des abonnés (colonnes minimales, aucun IP ni PII superflue)
create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  -- Email NORMALISÉ (trim + minuscule) : unicité insensible à la casse.
  email_normalized text not null unique,
  locale text not null default 'fr' check (locale in ('fr', 'en')),
  -- Provenance (ex. « hero-heroes-rising ») — jamais de contenu libre non borné.
  source text,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'unsubscribed')),
  -- Preuve de consentement (horodatage de l'opt-in explicite).
  consent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.newsletter_subscribers enable row level security;

-- RLS : AUCUNE lecture anonyme, AUCUNE lecture client, AUCUNE insertion depuis
-- le navigateur. Table à RLS activée SANS policy d'écriture → seul le
-- service-role (Edge Function) peut insérer/mettre à jour, en contournant la
-- RLS. Une seule policy de LECTURE, réservée à l'admin (dénombrement éventuel).
create policy "newsletter_admin_read"
  on public.newsletter_subscribers for select
  to authenticated
  using (public.is_admin());

-- 2. Mise à jour automatique de updated_at
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger newsletter_subscribers_touch
  before update on public.newsletter_subscribers
  for each row execute function public.touch_updated_at();

-- 3. Limitation de fréquence : compteur par empreinte d'IP (jamais l'IP brute).
-- L'Edge Function hache l'IP avec un sel secret (RATE_LIMIT_SALT) avant d'écrire
-- ici → aucune donnée identifiante n'est stockée. Table interne au service-role
-- (RLS activée, aucune policy → invisible aux clients).
create table public.newsletter_rate_limits (
  ip_hash text primary key,
  window_start timestamptz not null default now(),
  attempts integer not null default 0
);

alter table public.newsletter_rate_limits enable row level security;
