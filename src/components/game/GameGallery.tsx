// Galerie : images de game_media, résolues en URL publique depuis leur
// storage_path. Masquée si aucun média image. Reçoit les lignes Supabase.
import { useLanguage } from "../../i18n/useLanguage";
import { supabase } from "../../lib/supabase";
import { GAME_IMAGES_BUCKET } from "../../utils/storagePath";
import type { GameMediaRow } from "../../types/database";

export default function GameGallery({ media }: { media: GameMediaRow[] }) {
  const { t, lang } = useLanguage();
  const images = media.filter((item) => item.media_type === "image");
  if (images.length === 0) return null;

  const publicUrl = (path: string) =>
    supabase.storage.from(GAME_IMAGES_BUCKET).getPublicUrl(path).data.publicUrl;

  return (
    <section className="mx-auto max-w-6xl px-4 py-6">
      <h2 className="mb-3 text-2xl font-bold text-brown">
        {t("games.detail.gallery")}
      </h2>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] gap-4">
        {images.map((item) => (
          <img
            key={item.id}
            src={publicUrl(item.storage_path)}
            alt={(lang === "en" ? item.alt_en : item.alt_fr) ?? ""}
            className="h-48 w-full rounded-lg object-cover shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)]"
          />
        ))}
      </div>
    </section>
  );
}
