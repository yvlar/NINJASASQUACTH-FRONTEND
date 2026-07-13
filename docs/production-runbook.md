# Runbook de mise en production — actions nécessitant un accès tableau de bord

Ce document liste les actions qui **ne peuvent pas être exécutées depuis le
code ni via les outils MCP disponibles** (elles exigent le tableau de bord
Supabase/Vercel ou la CLI avec un jeton d'accès). Chaque secret reste **hors du
dépôt** : ne jamais committer ces valeurs, ne jamais les préfixer `VITE_` (sauf
les clés publiques explicitement destinées au client).

État vérifié en live le 2026-07-13 (projet Supabase `vgmqmifgdolccquyjcoc`,
déploiement `https://ninjasasquacth-frontend.vercel.app`) :

- Table `games` : **vide (0 jeu)** → aucune fiche à pré-rendre pour l'instant.
- Edge Function `subscribe-kickstarter` : **ACTIVE**, réponse live
  `500 not_configured` → secrets `ALLOWED_ORIGIN` / `RATE_LIMIT_SALT` **absents**.
- Edge Function `trigger-rebuild` : **ACTIVE**, secrets rebuild à poser.
- Migrations à jour, dont celles ajoutées ce sprint (slug requis à la
  publication, `how_to_play_*` / `rules_summary_*`, RPC `reorder_game_media`).

---

## 1. Secrets de la newsletter (`subscribe-kickstarter`)

```bash
# Liste blanche EXACTE d'origines (jamais *). Domaine Vercel de prod, plus le
# domaine personnalisé UNIQUEMENT s'il existe réellement.
supabase secrets set \
  ALLOWED_ORIGIN="https://ninjasasquacth-frontend.vercel.app" \
  RATE_LIMIT_SALT="$(openssl rand -hex 32)" \
  --project-ref vgmqmifgdolccquyjcoc

supabase functions deploy subscribe-kickstarter --project-ref vgmqmifgdolccquyjcoc
```

`SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` sont fournis automatiquement par la
plateforme aux Edge Functions — ne pas les poser à la main.

**Validation** (sans jamais afficher l'adresse complète en clair) :

```bash
BASE="https://vgmqmifgdolccquyjcoc.supabase.co/functions/v1/subscribe-kickstarter"
ANON="<clé anon publique>"
# Preflight depuis l'origine autorisée → 204 + Access-Control-Allow-Origin.
curl -si -X OPTIONS "$BASE" -H "Origin: https://ninjasasquacth-frontend.vercel.app" -H "apikey: $ANON" | head -n 5
# Origine non autorisée → 403 forbidden_origin.
curl -s -X POST "$BASE" -H "Origin: https://mechant.example" -H "apikey: $ANON" -H "content-type: application/json" -d '{}'
# Inscription valide (adresse de TEST contrôlée) :
curl -s -X POST "$BASE" -H "Origin: https://ninjasasquacth-frontend.vercel.app" -H "apikey: $ANON" -H "content-type: application/json" \
  -d '{"email":"test+prod@exemple.test","consent":true,"consentVersion":"newsletter-v1-2026-07","locale":"fr","source":"runbook"}'
```

Puis vérifier la ligne (email masqué) et nettoyer la donnée de test :

```sql
select left(email_normalized,1) || '***' as email, locale, source, status,
       consent_at is not null as has_consent, consent_version, consent_source
from public.newsletter_subscribers where source = 'runbook';
-- après validation :
delete from public.newsletter_subscribers where source = 'runbook';
```

Cas à tester : email invalide, consentement absent, `consent:false`, mauvaise
version de consentement, honeypot (`website` non vide), doublon (2ᵉ envoi →
même réponse générique), dépassement du rate limit (6ᵉ tentative dans l'heure).

---

## 2. Rebuild automatique (`trigger-rebuild` + Deploy Hook + Database Webhook)

1. **Deploy Hook Vercel** — Project → Settings → Git → Deploy Hooks : créer un
   hook sur la branche `main`. Copier l'URL (`https://api.vercel.com/v1/integrations/deploy/…`).
2. **Secrets de la fonction** :
   ```bash
   supabase secrets set \
     VERCEL_DEPLOY_HOOK_URL="<url du deploy hook>" \
     WEBHOOK_SECRET="$(openssl rand -hex 32)" \
     --project-ref vgmqmifgdolccquyjcoc
   supabase functions deploy trigger-rebuild --project-ref vgmqmifgdolccquyjcoc
   ```
3. **Database Webhook Supabase** — Dashboard → Database → Webhooks → Create :
   - Table : `public.games`
   - Événements : **INSERT, UPDATE, DELETE** (le DELETE retire aussi la fiche et
     l'entrée sitemap).
   - Type : HTTP POST vers l'URL de la fonction `trigger-rebuild`.
   - En-tête : `x-webhook-secret: <la même valeur que WEBHOOK_SECRET>`.

   Le secret vit **uniquement** dans le webhook et les secrets de la fonction —
   jamais dans une migration ni dans la base publique.

**Validation** : faire une modification réversible sur un jeu de test, puis
vérifier `select outcome, requested_at from public.deploy_rebuilds order by requested_at desc limit 3;`
(`triggered` ou `debounced`), qu'un nouveau déploiement Vercel démarre, puis
restaurer la donnée.

---

## 3. Variables d'environnement Vercel (Production)

Project → Settings → Environment Variables (Production) :

| Variable | Valeur |
|---|---|
| `VITE_SUPABASE_URL` | URL API du projet Supabase |
| `VITE_SUPABASE_ANON_KEY` | clé publiable (publishable) |
| `SUPABASE_URL` / `SUPABASE_ANON_KEY` | mêmes valeurs (lues par le pré-rendu au build) |
| `SITE_URL` / `VITE_SITE_URL` | domaine réellement utilisé (canonical/sitemap/JSON-LD) |
| `REQUIRE_PRERENDER_GAMES` | `true` — **seulement une fois qu'au moins un jeu publié avec slug existe** (sinon le build échoue volontairement) |

Redéployer après toute modification (Vite fige les variables au build).

---

## 4. Variable GitHub Actions

Repo → Settings → Secrets and variables → Actions → **Variables** :
`PRODUCTION_URL = https://<domaine de production>`
(utilisée par `.github/workflows/verify-production.yml` ; non secrète).

---

## 5. Créer au moins un jeu publié réel (prérequis du pré-rendu strict)

Le catalogue est **vide**. Tant qu'aucun jeu publié avec slug n'existe :

- aucune fiche FR/EN ne peut être pré-rendue ;
- `REQUIRE_PRERENDER_GAMES=true` fera **échouer** le build (comportement voulu) ;
- `npm run verify:production` en strict échoue (aucune fiche dans le sitemap).

Créer le premier jeu **via `/admin`** (le formulaire refuse désormais une
publication sans slug ; la contrainte base `games_published_requires_slug` en
est l'autorité finale). Le contenu de marque (titres, textes, photos réelles,
règles) est une **décision du studio** — ne rien inventer (voir
`docs/commercial-claims.md`). Une fois un jeu publié avec slug :

```bash
REQUIRE_PRERENDER_GAMES=true SUPABASE_URL=… SUPABASE_ANON_KEY=… npm run build
npm run verify:dist
npm run verify:production -- https://<domaine>   # teste automatiquement une fiche FR+EN
```

---

## Récapitulatif des conditions « réellement opérationnel »

| Condition | Bloqué par |
|---|---|
| Newsletter opérationnelle | §1 (secrets) + test live d'une inscription depuis le domaine réel |
| Rebuild opérationnel | §2 (Deploy Hook + Webhook) + modif de jeu déclenchant un déploiement |
| Catalogue SEO complet (fiche FR+EN pré-rendue) | §5 (créer un jeu réel) + §3 (`REQUIRE_PRERENDER_GAMES`) |
| Vérif HTTP post-déploiement en CI | §4 (`PRODUCTION_URL`) |

Aucune de ces actions ne peut être réalisée sans accès au tableau de bord
Supabase/Vercel ou un jeton CLI — elles restent des **actions utilisateur**.
