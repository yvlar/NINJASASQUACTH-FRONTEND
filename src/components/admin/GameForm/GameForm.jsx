import { useState } from "react";
import { categories } from "../../../data/games";
import { useLanguage } from "../../../i18n/useLanguage";
import { supabase } from "../../../lib/supabase";
import styles from "./GameForm.module.css";

// Le bucket est l'autorité sur ces limites (voir la migration Storage) ;
// on les vérifie aussi ici pour une erreur immédiate, avant tout upload.
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const IMAGE_MAX_OCTETS = 5 * 1024 * 1024;
const EXTENSIONS = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

// Champs texte de la table games : la parité FR/EN est obligatoire à la
// saisie (miroir des contraintes NOT NULL de la base).
const CHAMPS_COURTS = ["title_fr", "title_en", "players", "duration", "age"];
const CHAMPS_LONGS = [
  "short_desc_fr",
  "short_desc_en",
  "full_desc_fr",
  "full_desc_en",
];
const CHAMPS_TEXTE = [...CHAMPS_COURTS, ...CHAMPS_LONGS];

const VALEURS_INITIALES = Object.fromEntries(
  CHAMPS_TEXTE.map((champ) => [champ, ""]),
);

export default function GameForm({ onSaved, onCancel }) {
  const { t } = useLanguage();
  const [values, setValues] = useState(VALEURS_INITIALES);
  const [category, setCategory] = useState("famille");
  const [eco, setEco] = useState(true);
  const [published, setPublished] = useState(true);
  const [file, setFile] = useState(null);
  // erreurs = clés i18n (jamais du texte) : re-traduites au changement de langue
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | saving | error

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((previous) => ({ ...previous, [name]: value }));
  };

  const validate = () => {
    const next = {};
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setStatus("saving");
    let imageUrl = null;
    if (file) {
      const chemin = `${crypto.randomUUID()}.${EXTENSIONS[file.type]}`;
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

    const payload = Object.fromEntries(
      CHAMPS_TEXTE.map((champ) => [champ, values[champ].trim()]),
    );
    const { error } = await supabase.from("games").insert({
      ...payload,
      category,
      eco,
      published,
      image_url: imageUrl,
    });
    if (error) {
      setStatus("error");
      return;
    }
    setStatus("idle");
    onSaved();
  };

  const renderErreur = (champ, id) =>
    errors[champ] ? (
      <p className={styles.fieldError} id={id}>
        {t(errors[champ])}
      </p>
    ) : null;

  const renderChampTexte = (champ, multiline) => {
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
      <h2 className={styles.formTitle}>{t("admin.form.createTitle")}</h2>

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
          onChange={(event) => setCategory(event.target.value)}
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
          onChange={(event) => setFile(event.target.files[0] ?? null)}
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
            : t("admin.form.submitCreate")}
        </button>
        <button className={styles.cancel} type="button" onClick={onCancel}>
          {t("admin.form.cancel")}
        </button>
      </div>
    </form>
  );
}
