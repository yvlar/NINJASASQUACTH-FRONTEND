import { useEffect, useState } from "react";
import { useLanguage } from "../../../i18n/useLanguage";
import { supabase } from "../../../lib/supabase";
import GameForm from "../GameForm";
import styles from "./GamesManager.module.css";
import type { GameRow } from "../../../types/database";

type ManagerStatus = "loading" | "error" | "ready";

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
    <section className={styles.manager}>
      <button
        className={styles.newGame}
        type="button"
        onClick={() => setCreating(true)}
      >
        {t("admin.manager.newGame")}
      </button>

      {status === "loading" && (
        <p className={styles.status}>{t("admin.loading")}</p>
      )}
      {status === "error" && (
        <p className={styles.error} role="alert">
          {t("admin.manager.loadError")}
        </p>
      )}
      {status === "ready" && games.length === 0 && (
        <p className={styles.status}>{t("admin.manager.empty")}</p>
      )}
      {status === "ready" && games.length > 0 && (
        <ul className={styles.list}>
          {games.map((game) => (
            <li className={styles.item} key={game.id}>
              <span className={styles.itemTitle}>{game.title_fr}</span>
              <span className={styles.itemCategory}>
                {t(`games.categories.${game.category}`)}
              </span>
              {!game.published && (
                <span className={styles.draft}>{t("admin.manager.draft")}</span>
              )}
              {deletingId === game.id ? (
                <span className={styles.confirmZone}>
                  <span className={styles.confirmText}>
                    {t("admin.manager.confirmDelete")}
                  </span>
                  <button
                    className={styles.deleteButton}
                    type="button"
                    onClick={() => handleDelete(game.id)}
                  >
                    {t("admin.manager.confirm")}
                  </button>
                  <button
                    className={styles.actionButton}
                    type="button"
                    onClick={() => setDeletingId(null)}
                  >
                    {t("admin.form.cancel")}
                  </button>
                </span>
              ) : (
                <span className={styles.confirmZone}>
                  <button
                    className={styles.actionButton}
                    type="button"
                    aria-label={`${t("admin.manager.edit")} : ${game.title_fr}`}
                    onClick={() => setEditing(game)}
                  >
                    {t("admin.manager.edit")}
                  </button>
                  <button
                    className={styles.deleteButton}
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
