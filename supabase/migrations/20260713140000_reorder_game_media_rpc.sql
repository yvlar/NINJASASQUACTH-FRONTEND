-- Prompt 5, item 9 — Réordonnancement transactionnel des médias d'un jeu.
--
-- Met à jour sort_order de plusieurs lignes game_media en UNE seule opération
-- (atomique) selon l'ordre du tableau d'identifiants fourni. Évite les rangs
-- dupliqués et les allers-retours réseau ligne par ligne.
--
-- SECURITY INVOKER (défaut) : l'UPDATE reste soumis à la RLS de game_media
-- (game_media_update_admin → is_admin()). Un admin peut réordonner ; l'anon
-- ne le peut pas — la barrière de sécurité reste la RLS, jamais le front.
-- Le filtre m.game_id = p_game_id empêche de toucher les médias d'un autre jeu.

create or replace function public.reorder_game_media(
  p_game_id uuid,
  p_ids uuid[]
)
returns void
language plpgsql
set search_path = ''
as $$
begin
  update public.game_media m
  set sort_order = pos.idx
  from (
    select id, (ord - 1)::int as idx
    from unnest(p_ids) with ordinality as u(id, ord)
  ) pos
  where m.id = pos.id
    and m.game_id = p_game_id;
end;
$$;

-- Exécutable par les utilisateurs authentifiés seulement (l'anon n'a aucun
-- besoin de réordonner ; la RLS bloquerait de toute façon l'UPDATE).
revoke all on function public.reorder_game_media(uuid, uuid[]) from public;
grant execute on function public.reorder_game_media(uuid, uuid[]) to authenticated;
