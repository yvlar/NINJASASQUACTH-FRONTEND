import { useCallback, useEffect, useState } from "react";
import { useLanguage } from "../../../i18n/useLanguage";
import { supabase } from "../../../lib/supabase";
import GameForm from "../GameForm";
import styles from "./GamesManager.module.css";

// Gestion des jeux côté admin : la RLS laisse l'admin voir aussi les
// brouillons (published = false), invisibles du site public.
export default function GamesManager() {
  const { t } = useLanguage();
  const [games, setGames] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | error | ready
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setStatus("loading");
    const { data, error } = await supabase
      .from("games")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) {
      setStatus("error");
      return;
    }
    setGames(data ?? []);
    setStatus("ready");
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (creating) {
    return (
      <GameForm
        onSaved={() => {
          setCreating(false);
          load();
        }}
        onCancel={() => setCreating(false)}
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
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
