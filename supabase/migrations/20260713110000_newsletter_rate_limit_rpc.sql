-- Migration ADDITIVE — Sprint 11.1 (limitation de fréquence ATOMIQUE)
-- Remplace le schéma lecture→calcul→upsert de l'Edge Function (condition de
-- course + erreurs ignorées) par une fonction Postgres atomique. Un verrou de
-- ligne (`for update`) sérialise les appels simultanés d'une même empreinte
-- d'IP : lecture, réinitialisation de fenêtre et incrément dans UNE transaction.
--
-- L'Edge Function appelle ceci en RPC ; en cas d'erreur, elle échoue fermée
-- (aucune inscription). L'IP brute n'est jamais reçue : seul son haché salé.
--
-- ⚠️ Fichier TRACÉ : à appliquer au projet `vgmqmifgdolccquyjcoc`.

create or replace function public.check_newsletter_rate_limit(
  p_ip_hash text,
  p_window_seconds integer,
  p_max_attempts integer
) returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_now timestamptz := now();
  v_window_start timestamptz;
  v_attempts integer;
begin
  -- Crée la fenêtre si absente (atomique, ne lève jamais sur doublon).
  insert into public.newsletter_rate_limits (ip_hash, window_start, attempts)
  values (p_ip_hash, v_now, 0)
  on conflict (ip_hash) do nothing;

  -- Verrouille la ligne : les appels concurrents de la même IP attendent ici.
  select window_start, attempts
    into v_window_start, v_attempts
    from public.newsletter_rate_limits
    where ip_hash = p_ip_hash
    for update;

  -- Fenêtre expirée → on repart de zéro.
  if v_now - v_window_start >= make_interval(secs => p_window_seconds) then
    v_window_start := v_now;
    v_attempts := 0;
  end if;

  v_attempts := v_attempts + 1;

  update public.newsletter_rate_limits
    set window_start = v_window_start, attempts = v_attempts
    where ip_hash = p_ip_hash;

  -- Autorisé tant que le compteur ne dépasse pas le maximum de la fenêtre.
  return v_attempts <= p_max_attempts;
end;
$$;

-- Exécutable UNIQUEMENT par le service-role (Edge Function) : jamais anon,
-- jamais un client authentifié.
revoke all on function public.check_newsletter_rate_limit(text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.check_newsletter_rate_limit(text, integer, integer)
  to service_role;
