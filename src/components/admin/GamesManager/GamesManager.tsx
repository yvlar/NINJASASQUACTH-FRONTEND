import { useEffect, useState } from "react";
import {
  Clock,
  ExternalLink,
  Pencil,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { useLanguage } from "../../../i18n/useLanguage";
import { supabase } from "../../../lib/supabase";
import { gamePath } from "../../../utils/routes";
import {
  GAME_IMAGES_BUCKET,
  imagePathFromPublicUrl,
} from "../../../utils/storagePath";
import GameForm from "../GameForm";
import GameMediaManager from "../GameMediaManager";
import type { GameRow } from "../../../types/database";

type ManagerStatus = "loading" | "error" | "ready";

const actionButton =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-charcoal/25 bg-white px-3 py-2 text-sm font-semibold text-charcoal transition-colors duration-200 hover:border-roux hover:text-roux motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest";
const deleteButton =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-error/40 bg-white px-3 py-2 text-sm font-semibold text-error transition-colors duration-200 hover:bg-error hover:text-white motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest";

export default function GamesManager() {
  const { t, lang } = useLanguage();
  const [games, setGames] = useState<GameRow[]>([]);
  const [status, setStatus] = useState<ManagerStatus>("loading");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<GameRow | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<
    "mediaCollect" | "delete" | "cleanup" | "saveCleanup" | null
  >(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    supabase
      .from("games")
      .select("*")
      .order("updated_at", { ascending: false })
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

  const handleDelete = async (game: GameRow) => {
    setDeletingId(null);
    setActionError(null);

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
      setActionError("mediaCollect");
      return;
    }

    const paths: string[] = [];
    const mainPath = imagePathFromPublicUrl(game.image_url);
    if (mainPath) paths.push(mainPath);
    for (const item of media ?? []) {
      if (item.storage_path) paths.push(item.storage_path);
    }
    const uniquePaths = [...new Set(paths)];

    const { error } = await supabase.from("games").delete().eq("id", game.id);
    if (error) {
      setActionError("delete");
      return;
    }

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
        mediaManager={
          editing ? <GameMediaManager gameId={editing.id} /> : undefined
        }
        onSaved={(warning) => {
          setCreating(false);
          setEditing(null);
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
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 rounded-xl border border-charcoal/10 bg-white p-5 shadow-[0_8px_24px_-18px_rgba(43,36,32,0.35)] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl text-roux">{t("games.title")}</h2>
          {status === "ready" && (
            <p className="mt-1 text-sm text-charcoal/70">
              {games.length} · {t("admin.form.published")} / {t("admin.manager.draft")}
            </p>
          )}
        </div>
        <button
          className="inline-flex cursor-pointer items-center justify-center gap-2 self-start rounded-lg bg-forest px-4 py-3 font-semibold text-white shadow-[0_8px_18px_-10px_rgba(31,58,31,0.75)] transition-transform duration-200 hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-charcoal"
          type="button"
          onClick={() => setCreating(true)}
        >
          <Plus size={18} aria-hidden />
          {t("admin.manager.newGame")}
        </button>
      </div>

      {status === "loading" && (
        <div className="rounded-xl border border-charcoal/10 bg-white p-6" role="status">
          {t("admin.loading")}
        </div>
      )}
      {status === "error" && (
        <p className="rounded-xl border border-error/25 bg-white p-5 font-semibold text-error" role="alert">
          {t("admin.manager.loadError")}
        </p>
      )}
      {actionError && (
        <p className="rounded-xl border border-error/25 bg-white p-5 font-semibold text-error" role="alert">
          {t(`admin.manager.${actionError}Error`)}
        </p>
      )}
      {status === "ready" && games.length === 0 && (
        <div className="rounded-xl border border-dashed border-charcoal/25 bg-white p-10 text-center">
          <p>{t("admin.manager.empty")}</p>
        </div>
      )}

      {status === "ready" && games.length > 0 && (
        <ul className="grid list-none gap-5 md:grid-cols-2">
          {games.map((game) => {
            const monogram = game.title_fr.trim().charAt(0).toUpperCase() || "NS";
            const previewable = game.published && Boolean(game.slug);

            return (
              <li
                className="overflow-hidden rounded-xl border border-charcoal/10 bg-white shadow-[0_8px_24px_-18px_rgba(43,36,32,0.45)]"
                key={game.id}
              >
                <article className="flex h-full flex-col">
                  <div className="relative h-44 overflow-hidden bg-forest/90">
                    {game.image_url ? (
                      <img
                        src={game.image_url}
                        alt={game.title_fr}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center" aria-hidden>
                        <span className="font-brand text-6xl text-cream">{monogram}</span>
                      </div>
                    )}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold shadow-sm ${
                          game.published
                            ? "bg-forest text-cream"
                            : "bg-cream text-roux"
                        }`}
                      >
                        {game.published
                          ? t("admin.form.published")
                          : t("admin.manager.draft")}
                      </span>
                      {game.coming_soon && (
                        <span className="rounded-full bg-charcoal px-3 py-1 text-xs font-bold text-cream shadow-sm">
                          {t("games.detail.comingSoon")}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col gap-4 p-5">
                    <div>
                      <p className="mb-1 text-sm font-semibold text-forest">
                        {t(`games.categories.${game.category}`)}
                      </p>
                      <h3 className="text-2xl text-roux">{game.title_fr}</h3>
                      {game.title_en !== game.title_fr && (
                        <p className="mt-1 text-sm text-charcoal/65">{game.title_en}</p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-3 text-sm text-charcoal/75">
                      {game.players && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-roux/10 px-3 py-1.5">
                          <Users size={15} aria-hidden />
                          {game.players}
                        </span>
                      )}
                      {game.duration && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-roux/10 px-3 py-1.5">
                          <Clock size={15} aria-hidden />
                          {game.duration}
                        </span>
                      )}
                    </div>

                    <div className="mt-auto flex flex-wrap gap-2 border-t border-charcoal/10 pt-4">
                      {previewable && game.slug && (
                        <a
                          href={gamePath(lang, game.slug)}
                          target="_blank"
                          rel="noreferrer"
                          className={actionButton}
                        >
                          <ExternalLink size={16} aria-hidden />
                          {t("games.viewGame")}
                        </a>
                      )}
                      <button
                        className={actionButton}
                        type="button"
                        aria-label={`${t("admin.manager.edit")} : ${game.title_fr}`}
                        onClick={() => setEditing(game)}
                      >
                        <Pencil size={16} aria-hidden />
                        {t("admin.manager.edit")}
                      </button>

                      {deletingId === game.id ? (
                        <div className="flex w-full flex-wrap items-center gap-2 rounded-lg bg-error/5 p-3">
                          <span className="mr-auto text-sm font-semibold">
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
                        </div>
                      ) : (
                        <button
                          className={deleteButton}
                          type="button"
                          aria-label={`${t("admin.manager.delete")} : ${game.title_fr}`}
                          onClick={() => setDeletingId(game.id)}
                        >
                          <Trash2 size={16} aria-hidden />
                          {t("admin.manager.delete")}
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
