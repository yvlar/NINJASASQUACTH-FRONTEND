// Gestion de la galerie d'un jeu (game_media) dans /admin. Charge les médias,
// gère l'upload multiple (JPEG/PNG/WebP ≤ 5 Mo), l'ordre (boutons Monter/
// Descendre → RPC transactionnelle reorder_game_media), l'alt FR/EN et la
// suppression. Toutes les erreurs partielles Storage/SQL sont VISIBLES
// (messages localisés). La barrière de sécurité reste la RLS (writes admin).
//
// Intégrité upload : upload fichier → insert ligne ; si l'insert échoue, le
// fichier tout juste téléversé est supprimé (rollback), et l'échec du rollback
// est signalé distinctement (orphelin Storage).
//
// Intégrité suppression : on supprime la LIGNE d'abord, puis le fichier Storage
// (même stratégie que GamesManager). Un échec du nettoyage Storage laisse un
// orphelin — signalé (donnée déjà cohérente, la référence a disparu).
import { useEffect, useState } from "react";
import { useLanguage } from "../../../i18n/useLanguage";
import { supabase } from "../../../lib/supabase";
import { GAME_IMAGES_BUCKET } from "../../../utils/storagePath";
import GameMediaItem from "./GameMediaItem";
import GameMediaUpload from "./GameMediaUpload";
import { IMAGE_EXTENSIONS, validateMediaFile } from "./gameMediaValidation";
import type { GameMediaRow } from "../../../types/database";

type Status = "loading" | "error" | "ready";
type Notice = { kind: "success" | "warning" | "error"; key: string } | null;

export default function GameMediaManager({ gameId }: { gameId: string }) {
  const { t } = useLanguage();
  const [items, setItems] = useState<GameMediaRow[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [notice, setNotice] = useState<Notice>(null);
  const [busy, setBusy] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    supabase
      .from("game_media")
      .select("*")
      .eq("game_id", gameId)
      .order("sort_order", { ascending: true })
      .then(
        ({ data, error }) => {
          if (!active) return;
          if (error) {
            setStatus("error");
            return;
          }
          setItems((data ?? []) as GameMediaRow[]);
          setStatus("ready");
        },
        () => {
          if (active) setStatus("error");
        },
      );
    return () => {
      active = false;
    };
  }, [gameId, reloadKey]);

  const reload = () => setReloadKey((k) => k + 1);
  const bucket = () => supabase.storage.from(GAME_IMAGES_BUCKET);
  const publicUrl = (path: string) => bucket().getPublicUrl(path).data.publicUrl;

  // —— Upload multiple ————————————————————————————————————————————————
  const handleUpload = async (files: File[]) => {
    setNotice(null);
    // Validation avant tout upload : un fichier invalide bloque le lot.
    for (const file of files) {
      const err = validateMediaFile(file);
      if (err) {
        setNotice({ kind: "error", key: err });
        return;
      }
    }
    setBusy(true);
    let nextOrder =
      items.reduce((max, m) => Math.max(max, m.sort_order), -1) + 1;

    for (const file of files) {
      const ext = IMAGE_EXTENSIONS[file.type];
      const path = `${gameId}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await bucket().upload(path, file);
      if (uploadError) {
        setNotice({ kind: "error", key: "admin.media.errors.upload" });
        setBusy(false);
        reload();
        return;
      }
      const { error: insertError } = await supabase.from("game_media").insert({
        game_id: gameId,
        storage_path: path,
        media_type: "image",
        sort_order: nextOrder,
      });
      if (insertError) {
        // Compensation : le fichier n'est référencé nulle part → le retirer.
        const { error: rollbackError } = await bucket().remove([path]);
        setNotice({
          kind: rollbackError ? "warning" : "error",
          key: rollbackError
            ? "admin.media.errors.rollback"
            : "admin.media.errors.insert",
        });
        setBusy(false);
        reload();
        return;
      }
      nextOrder += 1;
    }
    setNotice({ kind: "success", key: "admin.media.uploadSuccess" });
    setBusy(false);
    reload();
  };

  // —— Réordonnancement (Monter / Descendre) ——————————————————————————
  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    setNotice(null);
    setBusy(true);
    const reordered = [...items];
    const a = reordered[index];
    const b = reordered[target];
    if (!a || !b) {
      setBusy(false);
      return;
    }
    reordered[index] = b;
    reordered[target] = a;
    const { error } = await supabase.rpc("reorder_game_media", {
      p_game_id: gameId,
      p_ids: reordered.map((m) => m.id),
    });
    if (error) {
      setNotice({ kind: "error", key: "admin.media.errors.reorder" });
      setBusy(false);
      reload();
      return;
    }
    setNotice({ kind: "success", key: "admin.media.reorderSuccess" });
    setBusy(false);
    reload();
  };

  // —— Alt FR/EN ——————————————————————————————————————————————————————
  const saveAlt = async (id: string, altFr: string, altEn: string) => {
    setNotice(null);
    setBusy(true);
    const { error } = await supabase
      .from("game_media")
      .update({ alt_fr: altFr || null, alt_en: altEn || null })
      .eq("id", id);
    if (error) {
      setNotice({ kind: "error", key: "admin.media.errors.alt" });
      setBusy(false);
      return;
    }
    setNotice({ kind: "success", key: "admin.media.altSuccess" });
    setBusy(false);
    reload();
  };

  // —— Suppression (ligne puis Storage, orphelin signalé) ————————————————
  const remove = async (item: GameMediaRow) => {
    setNotice(null);
    setBusy(true);
    const { error } = await supabase
      .from("game_media")
      .delete()
      .eq("id", item.id);
    if (error) {
      setNotice({ kind: "error", key: "admin.media.errors.delete" });
      setBusy(false);
      return;
    }
    const { error: removeError } = await bucket().remove([item.storage_path]);
    setNotice({
      kind: removeError ? "warning" : "success",
      key: removeError
        ? "admin.media.errors.deleteOrphan"
        : "admin.media.deleteSuccess",
    });
    setBusy(false);
    reload();
  };

  const noticeClass =
    notice?.kind === "success"
      ? "font-semibold text-forest"
      : notice?.kind === "warning"
        ? "font-semibold text-roux"
        : "font-semibold text-error";

  return (
    <section className="mx-auto flex max-w-[40rem] flex-col gap-4">
      <h3 className="text-lg font-bold text-roux">{t("admin.media.title")}</h3>

      <GameMediaUpload onUpload={handleUpload} busy={busy} t={t} />

      {notice && (
        <p className={noticeClass} role={notice.kind === "success" ? "status" : "alert"}>
          {t(notice.key)}
        </p>
      )}

      {status === "loading" && <p>{t("admin.media.loading")}</p>}
      {status === "error" && (
        <p className="font-semibold text-error" role="alert">
          {t("admin.media.loadError")}
        </p>
      )}
      {status === "ready" && items.length === 0 && (
        <p>{t("admin.media.empty")}</p>
      )}
      {status === "ready" && items.length > 0 && (
        <ul className="flex list-none flex-col gap-3">
          {items.map((item, index) => (
            <GameMediaItem
              key={item.id}
              item={item}
              index={index}
              total={items.length}
              publicUrl={publicUrl}
              busy={busy}
              onMoveUp={() => move(index, -1)}
              onMoveDown={() => move(index, 1)}
              onSaveAlt={saveAlt}
              onDelete={() => remove(item)}
              t={t}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
