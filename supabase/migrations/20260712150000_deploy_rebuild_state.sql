-- Migration — Sprint 11, Partie A (reconstruction contrôlée après publication)
-- État de reconstruction : trace la dernière demande de rebuild pour appliquer
-- un délai minimal entre deux appels au Deploy Hook Vercel (anti-rafale).
--
-- ⚠️ Fichier TRACÉ : à appliquer via MCP `apply_migration` / `supabase db push`.
-- Le secret du Deploy Hook NE VIT PAS ici : uniquement dans les secrets de
-- l'Edge Function `trigger-rebuild`. Cette table ne contient aucun secret.

create table public.deploy_rebuilds (
  id uuid primary key default gen_random_uuid(),
  requested_at timestamptz not null default now(),
  -- Résultat (« triggered » = Deploy Hook appelé, « debounced » = ignoré car
  -- trop rapproché, « error » = échec de l'appel). Aucune donnée sensible.
  outcome text not null default 'triggered'
    check (outcome in ('triggered', 'debounced', 'error'))
);

create index deploy_rebuilds_requested_at_idx
  on public.deploy_rebuilds (requested_at desc);

alter table public.deploy_rebuilds enable row level security;

-- Lecture admin seulement (statut/journal de reconstruction côté /admin).
-- Aucune écriture client : seul le service-role (Edge Function) insère.
create policy "deploy_rebuilds_admin_read"
  on public.deploy_rebuilds for select
  to authenticated
  using (public.is_admin());
