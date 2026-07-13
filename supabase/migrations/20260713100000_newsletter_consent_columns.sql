-- Migration ADDITIVE — Sprint 11.1 (durcissement newsletter)
-- Preuve de consentement vérifiée CÔTÉ SERVEUR : on trace la VERSION du
-- consentement acceptée et sa provenance. `consent_at` existait déjà mais
-- n'était écrit qu'après une validation React ; désormais l'Edge Function
-- `subscribe-kickstarter` exige `consent === true` ET une version attendue
-- avant d'écrire ces colonnes (aucune fausse preuve possible).
--
-- ⚠️ Fichier TRACÉ : à appliquer au projet `vgmqmifgdolccquyjcoc`.
-- Additif et idempotent (`add column if not exists`) → les lignes existantes
-- survivent (colonnes nullables).

alter table public.newsletter_subscribers
  add column if not exists consent_version text,
  add column if not exists consent_source text;

comment on column public.newsletter_subscribers.consent_version is
  'Version du libellé de consentement accepté (ex. newsletter-v1-2026-07). '
  'Écrite uniquement par l''Edge Function après validation serveur.';
comment on column public.newsletter_subscribers.consent_source is
  'Provenance de l''opt-in (ex. notify-launch), copiée de source à la capture.';
