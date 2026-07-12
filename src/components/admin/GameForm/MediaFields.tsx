// Documents & média : photo principale (upload) et chemins des PDF de règles
// FR/EN (aucun lien mort — un chemin vide reste null).
import FormField from "./FormField";
import { IMAGE_TYPES } from "./gameFormValidation";
import type { FieldGroupProps } from "./gameFormTypes";

export default function MediaFields({
  values,
  errors,
  onText,
  onFile,
  t,
}: FieldGroupProps & { onFile: (file: File | null) => void }) {
  return (
    <fieldset className="flex flex-col gap-4 border-0 p-0">
      <legend className="mb-1 text-lg font-bold text-brown">
        {t("admin.form.sections.media")}
      </legend>

      <div className="flex flex-col gap-1.5">
        <label className="font-semibold" htmlFor="game-form-image">
          {t("admin.form.image")}
        </label>
        <input
          className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-eco-green"
          id="game-form-image"
          name="image"
          type="file"
          accept={IMAGE_TYPES.join(",")}
          onChange={(event) => onFile(event.target.files?.[0] ?? null)}
          aria-invalid={Boolean(errors.image)}
          aria-describedby="game-form-image-aide"
        />
        <p className="text-sm" id="game-form-image-aide">
          {t("admin.form.imageHelp")}
        </p>
        {errors.image && (
          <p className="font-semibold text-error" id="game-form-image-erreur">
            {t(errors.image)}
          </p>
        )}
      </div>

      <FormField
        name="rules_pdf_fr"
        values={values}
        errors={errors}
        onText={onText}
        t={t}
        optional
      />
      <FormField
        name="rules_pdf_en"
        values={values}
        errors={errors}
        onText={onText}
        t={t}
        optional
      />
    </fieldset>
  );
}
