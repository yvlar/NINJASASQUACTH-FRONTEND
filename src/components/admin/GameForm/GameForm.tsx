import { useState } from "react";
import type { FormEvent } from "react";
import { useLanguage } from "../../../i18n/useLanguage";
import { supabase } from "../../../lib/supabase";
import {
  GAME_IMAGES_BUCKET,
  imagePathFromPublicUrl,
} from "../../../utils/storagePath";
import BasicInformationFields from "./BasicInformationFields";
import GameplayFields from "./GameplayFields";
import CampaignFields from "./CampaignFields";
import MediaFields from "./MediaFields";
import PublishingFields from "./PublishingFields";
import {
  buildGamePayload,
  INITIAL_VALUES,
  valuesFromGame,
  type GameFormErrors,
  type GameFormValues,
} from "./gameFormTypes";
import {
  IMAGE_EXTENSIONS,
  validateGameForm,
} from "./gameFormValidation";
import type { GameRow } from "../../../types/database";

type FormStatus = "idle" | "saving" | "error" | "cleanup-error";

// Sans `game` : création ; avec `game` : édition du jeu existant (formulaire
// pré-rempli, update sur son id, image conservée sauf nouveau fichier).
export default function GameForm({
  game = null,
  onSaved,
  onCancel,
}: {
  game?: GameRow | null;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const { t } = useLanguage();
  const edition = game !== null;
  const [values, setValues] = useState<GameFormValues>(() =>
    game ? valuesFromGame(game) : INITIAL_VALUES,
  );
  const [file, setFile] = useState<File | null>(null);
  // erreurs = clés i18n (jamais du texte) : re-traduites au changement de langue
  const [errors, setErrors] = useState<GameFormErrors>({});
  const [status, setStatus] = useState<FormStatus>("idle");

  const onText = (name: keyof GameFormValues, value: string) =>
    setValues((previous) => ({ ...previous, [name]: value }));
  const onBool = (name: keyof GameFormValues, checked: boolean) =>
    setValues((previous) => ({ ...previous, [name]: checked }));

  const bucket = () => supabase.storage.from(GAME_IMAGES_BUCKET);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next = validateGameForm(values, file);
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setStatus("saving");
    const oldImageUrl = game?.image_url ?? null;
    let imageUrl = oldImageUrl;
    // Chemin du fichier fraîchement téléversé (à supprimer si l'écriture échoue)
    let uploadedPath: string | null = null;

    if (file) {
      const extension = IMAGE_EXTENSIONS[file.type];
      if (!extension) {
        setStatus("error");
        return;
      }
      const path = `${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await bucket().upload(path, file);
      if (uploadError) {
        setStatus("error");
        return;
      }
      uploadedPath = path;
      imageUrl = bucket().getPublicUrl(path).data.publicUrl;
    }

    const payload = buildGamePayload(values, imageUrl);
    const { error } = game
      ? await supabase.from("games").update(payload).eq("id", game.id)
      : await supabase.from("games").insert(payload);

    if (error) {
      // Écriture échouée : le fichier tout juste téléversé n'est référencé
      // nulle part → le supprimer (compensation). Si ce nettoyage échoue à son
      // tour, un orphelin subsiste : on le signale clairement.
      if (uploadedPath) {
        const { error: cleanupError } = await bucket().remove([uploadedPath]);
        if (cleanupError) {
          setStatus("cleanup-error");
          return;
        }
      }
      setStatus("error");
      return;
    }

    // Écriture réussie AVEC nouvelle image : supprimer l'ancienne SEULEMENT
    // maintenant (jamais avant de savoir la nouvelle opération réussie).
    if (uploadedPath && oldImageUrl) {
      const oldPath = imagePathFromPublicUrl(oldImageUrl);
      if (oldPath) {
        // L'ancien fichier n'est plus référencé ; son échec de suppression ne
        // compromet pas la donnée (déjà cohérente) — orphelin journalisé.
        const { error: removeOldError } = await bucket().remove([oldPath]);
        if (removeOldError) {
          console.error(
            "Ancienne image non supprimée (orphelin Storage) :",
            oldPath,
          );
        }
      }
    }

    setStatus("idle");
    onSaved();
  };

  const groupProps = { values, errors, onText, onBool, t };

  return (
    <form
      className="mx-auto flex max-w-[40rem] flex-col gap-8"
      onSubmit={handleSubmit}
      noValidate
    >
      <h2 className="text-brown">
        {t(edition ? "admin.form.editTitle" : "admin.form.createTitle")}
      </h2>

      <BasicInformationFields {...groupProps} />
      <GameplayFields {...groupProps} />
      <CampaignFields {...groupProps} />
      <MediaFields {...groupProps} onFile={setFile} />
      <PublishingFields {...groupProps} />

      {status === "error" && (
        <p className="font-semibold text-error" role="alert">
          {t("admin.form.errors.save")}
        </p>
      )}
      {status === "cleanup-error" && (
        <p className="font-semibold text-error" role="alert">
          {t("admin.form.errors.cleanup")}
        </p>
      )}

      <div className="flex gap-3">
        <button
          className="cursor-pointer rounded-lg bg-eco-green px-4 py-2.5 font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dark-green disabled:cursor-wait disabled:opacity-70"
          type="submit"
          disabled={status === "saving"}
        >
          {status === "saving"
            ? t("admin.form.saving")
            : t(edition ? "admin.form.submitEdit" : "admin.form.submitCreate")}
        </button>
        <button
          className="cursor-pointer rounded-lg border border-dark-green bg-transparent px-4 py-2.5 text-dark-green focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dark-green"
          type="button"
          onClick={onCancel}
        >
          {t("admin.form.cancel")}
        </button>
      </div>
    </form>
  );
}
