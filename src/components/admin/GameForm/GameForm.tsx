import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { categories } from "../../../data/games";
import { useLanguage } from "../../../i18n/useLanguage";
import { supabase } from "../../../lib/supabase";
import styles from "./GameForm.module.css";
import type {
  GameCategory,
  GameInsert,
  GameRow,
} from "../../../types/database";

// Le bucket est l'autorité sur ces limites (voir la migration Storage) ;
// on les vérifie aussi ici pour une erreur immédiate, avant tout upload.
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const IMAGE_MAX_OCTETS = 5 * 1024 * 1024;
const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

// Champs texte de la table games : la parité FR/EN est obligatoire à la
// saisie (miroir des contraintes NOT NULL de la base).
const CHAMPS_COURTS = [
  "title_fr",
  "title_en",
  "players",
  "duration",
  "age",
] as const;
const CHAMPS_LONGS = [
  "short_desc_fr",
  "short_desc_en",
  "full_desc_fr",
  "full_desc_en",
] as const;
const CHAMPS_TEXTE = [...CHAMPS_COURTS, ...CHAMPS_LONGS] as const;

type ChampTexte = (typeof CHAMPS_TEXTE)[number];
type FormValues = Record<ChampTexte, string>;
type FormErrors = Partial<Record<ChampTexte | "image", string>>;
type FormStatus = "idle" | "saving" | "error";

const VALEURS_INITIALES = Object.fromEntries(
  CHAMPS_TEXTE.map((champ) => [champ, ""]),
) as FormValues;

// Sans `game` : création ; avec `game` : édition du jeu existant
// (formulaire pré-rempli, update sur son id, image conservée sauf
// nouveau fichier téléversé).
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
  const [values, setValues] = useState<FormValues>(() =>
    game
      ? (Object.fromEntries(
          CHAMPS_TEXTE.map((champ) => [champ, game[champ] ?? ""]),
        ) as FormValues)
      : VALEURS_INITIALES,
  );
  const [category, setCategory] = useState<GameCategory>(
    game?.category ?? "famille",
  );
  const [eco, setEco] = useState(game?.eco ?? true);
  const [published, setPublished] = useState(game?.published ?? true);
  const [file, setFile] = useState<File | null>(null);
  // erreurs = clés i18n (jamais du texte) : re-traduites au changement de langue
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<FormStatus>("idle");

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setValues((previous) => ({ ...previous, [name]: value }));
  };

  const validate = (): FormErrors => {
    const next: FormErrors = {};
    for (const champ of CHAMPS_TEXTE) {
      if (!values[champ].trim()) next[champ] = "admin.form.errors.required";
    }
    if (file) {
      if (!IMAGE_TYPES.includes(file.type)) {
        next.image = "admin.form.errors.imageType";
      } else if (file.size > IMAGE_MAX_OCTETS) {
        next.image = "admin.form.errors.imageSize";
      }
    }
    return next;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setStatus("saving");
    let imageUrl = game?.image_url ?? null;
    if (file) {
      // validate() garantit file.type ∈ IMAGE_TYPES avant tout upload
      const extension = EXTENSIONS[file.type];
      if (!extension) {
        setStatus("error");
        return;
      }
      const chemin = `${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await supabase.storage
        .from("game-images")
        .upload(chemin, file);
      if (uploadError) {
        setStatus("error");
        return;
      }
      imageUrl = supabase.storage.from("game-images").getPublicUrl(chemin)
        .data.publicUrl;
    }

    const payload: GameInsert = {
      ...(Object.fromEntries(
        CHAMPS_TEXTE.map((champ) => [champ, values[champ].trim()]),
      ) as FormValues),
      category,
      eco,
      published,
      image_url: imageUrl,
    };
    const { error } = game
      ? await supabase.from("games").update(payload).eq("id", game.id)
      : await supabase.from("games").insert(payload);
    if (error) {
      setStatus("error");
      return;
    }
    setStatus("idle");
    onSaved();
  };

  const renderErreur = (champ: ChampTexte | "image", id: string) =>
    errors[champ] ? (
      <p className={styles.fieldError} id={id}>
        {t(errors[champ])}
      </p>
    ) : null;

  const renderChampTexte = (champ: ChampTexte, multiline: boolean) => {
    const id = `game-form-${champ}`;
    const idErreur = `${id}-erreur`;
    const props = {
      className: multiline ? styles.textarea : styles.input,
      id,
      name: champ,
      value: values[champ],
      onChange: handleChange,
      "aria-invalid": Boolean(errors[champ]),
      "aria-describedby": errors[champ] ? idErreur : undefined,
    };
    return (
      <div className={styles.field} key={champ}>
        <label className={styles.label} htmlFor={id}>
          {t(`admin.form.${champ}`)}
        </label>
        {multiline ? (
          <textarea rows={4} {...props} />
        ) : (
          <input type="text" {...props} />
        )}
        {renderErreur(champ, idErreur)}
      </div>
    );
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <h2 className={styles.formTitle}>
        {t(edition ? "admin.form.editTitle" : "admin.form.createTitle")}
      </h2>

      {CHAMPS_COURTS.slice(0, 2).map((champ) => renderChampTexte(champ, false))}
      {CHAMPS_LONGS.map((champ) => renderChampTexte(champ, true))}
      {CHAMPS_COURTS.slice(2).map((champ) => renderChampTexte(champ, false))}

      <div className={styles.field}>
        <label className={styles.label} htmlFor="game-form-category">
          {t("admin.form.category")}
        </label>
        <select
          className={styles.input}
          id="game-form-category"
          name="category"
          value={category}
          onChange={(event) =>
            setCategory(event.target.value as GameCategory)
          }
        >
          {categories
            .filter((cat) => cat.id !== "tous")
            .map((cat) => (
              <option key={cat.id} value={cat.id}>
                {t(`games.categories.${cat.id}`)}
              </option>
            ))}
        </select>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="game-form-image">
          {t("admin.form.image")}
        </label>
        <input
          className={styles.fileInput}
          id="game-form-image"
          name="image"
          type="file"
          accept={IMAGE_TYPES.join(",")}
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          aria-invalid={Boolean(errors.image)}
          aria-describedby="game-form-image-aide"
        />
        <p className={styles.help} id="game-form-image-aide">
          {t("admin.form.imageHelp")}
        </p>
        {renderErreur("image", "game-form-image-erreur")}
      </div>

      <div className={styles.checkboxField}>
        <input
          id="game-form-eco"
          name="eco"
          type="checkbox"
          checked={eco}
          onChange={(event) => setEco(event.target.checked)}
        />
        <label htmlFor="game-form-eco">{t("admin.form.eco")}</label>
      </div>
      <div className={styles.checkboxField}>
        <input
          id="game-form-published"
          name="published"
          type="checkbox"
          checked={published}
          onChange={(event) => setPublished(event.target.checked)}
        />
        <label htmlFor="game-form-published">{t("admin.form.published")}</label>
      </div>

      {status === "error" && (
        <p className={styles.submitError} role="alert">
          {t("admin.form.errors.save")}
        </p>
      )}

      <div className={styles.actions}>
        <button
          className={styles.submit}
          type="submit"
          disabled={status === "saving"}
        >
          {status === "saving"
            ? t("admin.form.saving")
            : t(edition ? "admin.form.submitEdit" : "admin.form.submitCreate")}
        </button>
        <button className={styles.cancel} type="button" onClick={onCancel}>
          {t("admin.form.cancel")}
        </button>
      </div>
    </form>
  );
}
