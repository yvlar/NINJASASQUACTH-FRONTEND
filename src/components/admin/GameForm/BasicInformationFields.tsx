// Informations principales : slug partageable, titres/taglines/résumés/
// descriptions bilingues et catégorie.
import { categories } from "../../../data/games";
import FormField from "./FormField";
import type { FieldGroupProps } from "./gameFormTypes";
import type { GameCategory } from "../../../types/database";

const selectBase =
  "rounded-lg border border-dark-green bg-white px-3 py-2.5 text-dark-green focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-eco-green";

export default function BasicInformationFields({
  values,
  errors,
  onText,
  t,
}: FieldGroupProps) {
  const field = (
    name: Parameters<typeof FormField>[0]["name"],
    opts: { multiline?: boolean; optional?: boolean } = {},
  ) => (
    <FormField
      name={name}
      values={values}
      errors={errors}
      onText={onText}
      t={t}
      {...opts}
    />
  );

  return (
    <fieldset className="flex flex-col gap-4 border-0 p-0">
      <legend className="mb-1 text-lg font-bold text-brown">
        {t("admin.form.sections.basic")}
      </legend>

      {field("slug")}
      {field("title_fr")}
      {field("title_en")}
      {field("tagline_fr", { optional: true })}
      {field("tagline_en", { optional: true })}
      {field("short_desc_fr", { multiline: true })}
      {field("short_desc_en", { multiline: true })}
      {field("full_desc_fr", { multiline: true })}
      {field("full_desc_en", { multiline: true })}

      <div className="flex flex-col gap-1.5">
        <label className="font-semibold" htmlFor="game-form-category">
          {t("admin.form.category")}
        </label>
        <select
          className={selectBase}
          id="game-form-category"
          name="category"
          value={values.category}
          onChange={(event) => onText("category", event.target.value)}
        >
          {categories
            .filter((cat) => cat.id !== "tous")
            .map((cat) => (
              <option key={cat.id} value={cat.id as GameCategory}>
                {t(`games.categories.${cat.id}`)}
              </option>
            ))}
        </select>
      </div>
    </fieldset>
  );
}
