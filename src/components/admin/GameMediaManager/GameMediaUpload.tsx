// Zone d'ajout d'images à la galerie : sélection multiple (JPEG/PNG/WebP,
// ≤ 5 Mo/fichier). La validation fine et l'upload vivent dans le gestionnaire
// (messages localisés) ; ce composant ne fait que collecter les fichiers.
import { useRef } from "react";
import { IMAGE_TYPES } from "./gameMediaValidation";

export default function GameMediaUpload({
  onUpload,
  busy,
  t,
}: {
  onUpload: (files: File[]) => void;
  busy: boolean;
  t: (key: string) => string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-semibold" htmlFor="game-media-upload">
        {t("admin.media.upload")}
      </label>
      <input
        ref={inputRef}
        className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
        id="game-media-upload"
        name="game-media-upload"
        type="file"
        multiple
        accept={IMAGE_TYPES.join(",")}
        disabled={busy}
        aria-describedby="game-media-upload-aide"
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          if (files.length > 0) onUpload(files);
          // Réinitialise pour permettre de re-sélectionner le même fichier.
          if (inputRef.current) inputRef.current.value = "";
        }}
      />
      <p className="text-sm" id="game-media-upload-aide">
        {t("admin.media.uploadHelp")}
      </p>
    </div>
  );
}
