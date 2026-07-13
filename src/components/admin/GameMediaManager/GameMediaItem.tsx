// Un média de la galerie : miniature, alt FR/EN éditables, boutons Monter /
// Descendre (tri clavier, pas seulement glisser-déposer) et suppression avec
// confirmation en ligne. Tout est piloté par le gestionnaire via des callbacks.
import { useState } from "react";
import type { GameMediaRow } from "../../../types/database";

const actionButton =
  "cursor-pointer rounded-lg border border-charcoal bg-transparent px-3 py-1.5 text-sm text-charcoal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest disabled:cursor-not-allowed disabled:opacity-40";
const deleteButton =
  "cursor-pointer rounded-lg border border-error bg-transparent px-3 py-1.5 text-sm font-semibold text-error focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest disabled:opacity-40";
const inputBase =
  "rounded-lg border border-charcoal bg-white px-3 py-2 text-charcoal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest";

export default function GameMediaItem({
  item,
  index,
  total,
  publicUrl,
  busy,
  onMoveUp,
  onMoveDown,
  onSaveAlt,
  onDelete,
  t,
}: {
  item: GameMediaRow;
  index: number;
  total: number;
  publicUrl: (path: string) => string;
  busy: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onSaveAlt: (id: string, altFr: string, altEn: string) => void;
  onDelete: () => void;
  t: (key: string) => string;
}) {
  const [altFr, setAltFr] = useState(item.alt_fr ?? "");
  const [altEn, setAltEn] = useState(item.alt_en ?? "");
  const [confirming, setConfirming] = useState(false);
  const idFr = `game-media-alt-fr-${item.id}`;
  const idEn = `game-media-alt-en-${item.id}`;

  return (
    <li className="flex flex-col gap-3 rounded-lg border border-charcoal/20 bg-white p-3 sm:flex-row">
      <img
        src={publicUrl(item.storage_path)}
        alt={item.alt_fr || `${t("admin.media.thumbnailAlt")} ${index + 1}`}
        className="h-24 w-24 shrink-0 rounded-lg object-cover"
      />
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold" htmlFor={idFr}>
            {t("admin.media.altFr")}
          </label>
          <input
            id={idFr}
            className={inputBase}
            value={altFr}
            onChange={(event) => setAltFr(event.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold" htmlFor={idEn}>
            {t("admin.media.altEn")}
          </label>
          <input
            id={idEn}
            className={inputBase}
            value={altEn}
            onChange={(event) => setAltEn(event.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className={actionButton}
            onClick={() => onSaveAlt(item.id, altFr, altEn)}
            disabled={busy}
          >
            {t("admin.media.saveAlt")}
          </button>
          <button
            type="button"
            className={actionButton}
            aria-label={`${t("admin.media.moveUp")} (${index + 1})`}
            onClick={onMoveUp}
            disabled={busy || index === 0}
          >
            {t("admin.media.moveUp")}
          </button>
          <button
            type="button"
            className={actionButton}
            aria-label={`${t("admin.media.moveDown")} (${index + 1})`}
            onClick={onMoveDown}
            disabled={busy || index === total - 1}
          >
            {t("admin.media.moveDown")}
          </button>
          {confirming ? (
            <span className="flex items-center gap-2">
              <span className="text-sm font-semibold">
                {t("admin.media.confirmDelete")}
              </span>
              <button
                type="button"
                className={deleteButton}
                onClick={() => {
                  setConfirming(false);
                  onDelete();
                }}
                disabled={busy}
              >
                {t("admin.media.confirm")}
              </button>
              <button
                type="button"
                className={actionButton}
                onClick={() => setConfirming(false)}
                disabled={busy}
              >
                {t("admin.media.cancel")}
              </button>
            </span>
          ) : (
            <button
              type="button"
              className={deleteButton}
              onClick={() => setConfirming(true)}
              disabled={busy}
            >
              {t("admin.media.delete")}
            </button>
          )}
        </div>
      </div>
    </li>
  );
}
