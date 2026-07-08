-- Migration Storage — Sprint 5, item 5.3 (Ninja Sasquatch Games)
-- Copie de la migration appliquée au projet Supabase `vgmqmifgdolccquyjcoc`
-- via MCP `apply_migration`.
--
-- Bucket public des photos de jeux : lecture anonyme par URL publique
-- (cohérent avec un catalogue vitrine), écritures réservées au rôle admin.
-- Les limites taille/type sont portées par le bucket (autorité) ; le
-- formulaire admin les vérifie aussi côté client (UX immédiate).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'game-images',
  'game-images',
  true,
  5242880, -- 5 Mio
  array['image/jpeg', 'image/png', 'image/webp']
);

create policy "game_images_select_public"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'game-images');

create policy "game_images_insert_admin"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'game-images' and public.is_admin());

create policy "game_images_update_admin"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'game-images' and public.is_admin())
  with check (bucket_id = 'game-images' and public.is_admin());

create policy "game_images_delete_admin"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'game-images' and public.is_admin());
