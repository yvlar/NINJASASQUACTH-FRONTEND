import { useEffect, useState } from "react";
import { useLanguage } from "../../../i18n/useLanguage";
import { supabase } from "../../../lib/supabase";
import {
  GAME_IMAGES_BUCKET,
  imagePathFromPublicUrl,
} from "../../../utils/storagePath";
import GameForm from "../GameForm";
import type { GameRow } from "../../../types/database";

type ManagerStatus = "loading" | "error" | "ready";

// Boutons d'action secondaires (modifier / annuler la confirmation).
const actionButton =
  "cursor-pointer rounded-lg border border-charcoal bg-transparent px-3 py-1.5 text-sm text-charcoal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest";
const deleteButton =
  "cursor-pointer rounded-lg border border-error bg-transparent px-3 py-1.5 text-sm font-semibold text-error focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest";

// Gestion des jeux côté admin : la RLS laisse l'admin voir aussi les
// brouillons (published = false), invisibles du site public.
export default function GamesManager() {
  const { t } = useLanguage();
  const [games, setGames] = useState<GameRow[]>([]);
  const [status, setStatus] = useState<ManagerStatus>("loading");
  const [creating, setCreating] = useState(false);
  // jeu en cours d'édition
  const [editing, setEditing] = useState<GameRow | null>(null);
  // confirmation de suppression en cours
  const [deletingId, setDeletingId] = useState<string | null>(null);
  // erreur d'action ponctuelle : échec de COLLECTE des médias (aucune
  // suppression alors effectuée), échec de suppression SQL, ou échec du
  // nettoyage Storage (jeu supprimé, orphelins signalés) — messages distincts.
  const [actionError, setActionError] = useState<
    "mediaCollect" | "delete" | "cleanup" | "saveCleanup" | null
  >(null);
  // Incrémentée pour relancer la lecture (après création/édition/suppression) :
  // le fetch vit dans l'effet, les setState n'y sont qu'en callbacks
  // asynchrones (règle react-hooks set-state-in-effect).
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    supabase
      .from("games")
      .select("*")
      .order("created_at", { ascending: true })
      .then(
        ({ data, error }) => {
          if (!active) return;
          if (error) {
            setStatus("error");
            return;
          }
          setGames(data ?? []);
          setStatus("ready");
        },
        // panne réseau avant toute réponse (même filet que useGames — D16)
        () => {
          if (active) setStatus("error");
        },
      );

    return () => {
      active = false;
    };
  }, [reloadKey]);

  const reload = () => {
    setStatus("loading");
    setReloadKey((key) => key + 1);
  };

  // Supprime un jeu ET ses fichiers Storage associés (photo principale + médias).
  // Les chemins sont rassemblés AVANT la suppression de la ligne (le cascade
  // efface les lignes game_media, pas les objets Storage) ; les fichiers ne
  // sont retirés qu'APRÈS le succès de la suppression. Un échec de nettoyage
  // laisse un orphelin sans compromettre la donnée : il est signalé clairement.
  const handleDelete = async (game: GameRow) => {
    setDeletingId(null);
    setActionError(null);

    // 1. Collecte des chemins Storage AVANT toute suppression. Si la lecture
    //    des médias échoue, on ARRÊTE : ne jamais supprimer le jeu sans avoir
    //    pu récupérer les chemins (sinon les fichiers deviennent orphelins et
    //    irrécupérables après le cascade).
    let media: { storage_path: string | null }[] | null = null;
    try {
      const { data, error: mediaError } = await supabase
        .from("game_media")
        .select("storage_path")
        .eq("game_id", game.id);
      if (mediaError) {
        setActionError("mediaCollect");
        return;
      }
      media = data as { storage_path: string | null }[] | null;
    } catch {
      // Panne réseau avant réponse : même filet, on n'efface rien.
      setActionError("mediaCollect");
      return;
    }

    const paths: string[] = [];
    const mainPath = imagePathFromPublicUrl(game.image_url);
    if (mainPath) paths.push(mainPath);
    for (const item of media ?? []) {
      if (item.storage_path) paths.push(item.storage_path);
    }
    // Déduplication (une photo principale peut aussi figurer en galerie).
    const uniquePaths = [...new Set(paths)];

    // 2. Suppression SQL (le cascade efface les lignes game_media).
    const { error } = await supabase.from("games").delete().eq("id", game.id);
    if (error) {
      setActionError("delete");
      return;
    }

    // 3. Nettoyage Storage APRÈS le succès SQL. Un échec ici laisse un
    //    orphelin sans compromettre la donnée : signalé distinctement.
    if (uniquePaths.length > 0) {
      const { error: removeError } = await supabase.storage
        .from(GAME_IMAGES_BUCKET)
        .remove(uniquePaths);
      if (removeError) setActionError("cleanup");
    }
    reload();
  };

  if (creating || editing) {
    return (
      <GameForm
        game={editing}
        onSaved={(warning) => {
          setCreating(false);
          setEditing(null);
          // Avertissement non bloquant : l'ancienne image n'a pas pu être
          // supprimée, mais le jeu EST enregistré.
          setActionError(warning === "oldImageCleanup" ? "saveCleanup" : null);
          reload();
        }}
        onCancel={() => {
          setCreating(false);
          setEditing(null);
        }}
      />
    );
  }

  return (
    <section className="mx-auto flex max-w-[60rem] flex-col gap-5">
      <button
        className="cursor-pointer self-start rounded-lg bg-forest px-4 py-2.5 font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-charcoal"
        type="button"
        onClick={() => setCreating(true)}
      >
        {t("admin.manager.newGame")}
      </button>

      {status === "loading" && <p>{t("admin.loading")}</p>}
      {status === "error" && (
        <p className="font-semibold text-error" role="alert">
          {t("admin.manager.loadError")}
        </p>
      )}
      {actionError && (
        <p className="font-semibold text-error" role="alert">
          {t(`admin.manager.${actionError}Error`)}
        </p>
      )}
      {status === "ready" && games.length === 0 && (
        <p>{t("admin.manager.empty")}</p>
      )}
      {status === "ready" && games.length > 0 && (
        <ul className="flex list-none flex-col gap-2">
          {games.map((game) => (
            <li
              className="flex items-center gap-4 rounded-lg border border-charcoal/20 bg-white px-4 py-3"
              key={game.id}
            >
              <span className="mr-auto font-semibold">{game.title_fr}</span>
              <span className="text-sm">
                {t(`games.categories.${game.category}`)}
              </span>
              {!game.published && (
                <span className="rounded-full bg-roux/15 px-2 py-0.5 text-sm font-semibold text-roux">
                  {t("admin.manager.draft")}
                </span>
              )}
              {deletingId === game.id ? (
                <span className="flex items-center gap-2">
                  <span className="font-semibold">
                    {t("admin.manager.confirmDelete")}
                  </span>
                  <button
                    className={deleteButton}
                    type="button"
                    onClick={() => handleDelete(game)}
                  >
                    {t("admin.manager.confirm")}
                  </button>
                  <button
                    className={actionButton}
                    type="button"
                    onClick={() => setDeletingId(null)}
                  >
                    {t("admin.form.cancel")}
                  </button>
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <button
                    className={actionButton}
                    type="button"
                    aria-label={`${t("admin.manager.edit")} : ${game.title_fr}`}
                    onClick={() => setEditing(game)}
                  >
                    {t("admin.manager.edit")}
                  </button>
                  <button
                    className={deleteButton}
                    type="button"
                    aria-label={`${t("admin.manager.delete")} : ${game.title_fr}`}
                    onClick={() => setDeletingId(game.id)}
                  >
                    {t("admin.manager.delete")}
                  </button>
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
