import { useEffect, useState } from "react";
import { useLanguage } from "../../../i18n/useLanguage";
import { supabase } from "../../../lib/supabase";
import GameForm from "../GameForm";
import type { GameRow } from "../../../types/database";

type ManagerStatus = "loading" | "error" | "ready";

// Boutons d'action secondaires (modifier / annuler la confirmation).
const actionButton =
  "cursor-pointer rounded-lg border border-dark-green bg-transparent px-3 py-1.5 text-sm text-dark-green focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-eco-green";
const deleteButton =
  "cursor-pointer rounded-lg border border-error bg-transparent px-3 py-1.5 text-sm font-semibold text-error focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-eco-green";

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

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("games").delete().eq("id", id);
    setDeletingId(null);
    if (!error) reload();
  };

  if (creating || editing) {
    return (
      <GameForm
        game={editing}
        onSaved={() => {
          setCreating(false);
          setEditing(null);
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
        className="cursor-pointer self-start rounded-lg bg-eco-green px-4 py-2.5 font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dark-green"
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
      {status === "ready" && games.length === 0 && (
        <p>{t("admin.manager.empty")}</p>
      )}
      {status === "ready" && games.length > 0 && (
        <ul className="flex list-none flex-col gap-2">
          {games.map((game) => (
            <li
              className="flex items-center gap-4 rounded-lg border border-dark-green/20 bg-white px-4 py-3"
              key={game.id}
            >
              <span className="mr-auto font-semibold">{game.title_fr}</span>
              <span className="text-sm">
                {t(`games.categories.${game.category}`)}
              </span>
              {!game.published && (
                <span className="rounded-full bg-brown/15 px-2 py-0.5 text-sm font-semibold text-brown">
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
                    onClick={() => handleDelete(game.id)}
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
