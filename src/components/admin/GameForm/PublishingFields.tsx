// Présentation & publication : thème (clé contrôlée), ordre de mise en avant,
// publication sur le site.
import FormField from "./FormField";
import type { FieldGroupProps } from "./gameFormTypes";
import type { GameThemeKey } from "../../../types/database";

const selectBase =
  "rounded-lg border border-charcoal bg-white px-3 py-2.5 text-charcoal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest";

const THEME_KEYS: GameThemeKey[] = [
  "brand",
  "heroes-rising",
  "burgle-jack",
  "flickle-mania",
];

export default function PublishingFields({
  values,
  errors,
  onText,
  onBool,
  t,
}: FieldGroupProps) {
  return (
    <fieldset className="flex flex-col gap-4 border-0 p-0">
      <legend className="mb-1 text-lg font-bold text-roux">
        {t("admin.form.sections.publishing")}
      </legend>

      <div className="flex flex-col gap-1.5">
        <label className="font-semibold" htmlFor="game-form-theme_key">
          {t("admin.form.theme_key")}
        </label>
        <select
          className={selectBase}
          id="game-form-theme_key"
          name="theme_key"
          value={values.theme_key}
          onChange={(event) => onText("theme_key", event.target.value)}
        >
          <option value="">{t("admin.form.themeKeys.default")}</option>
          {THEME_KEYS.map((key) => (
            <option key={key} value={key}>
              {t(`admin.form.themeKeys.${key}`)}
            </option>
          ))}
        </select>
      </div>

      <FormField
        name="featured_order"
        values={values}
        errors={errors}
        onText={onText}
        t={t}
        type="number"
        optional
      />

      <div className="flex items-center gap-2">
        <input
          id="game-form-published"
          name="published"
          type="checkbox"
          checked={values.published}
          onChange={(event) => onBool("published", event.target.checked)}
        />
        <label htmlFor="game-form-published">
          {t("admin.form.published")}
        </label>
      </div>
    </fieldset>
  );
}
