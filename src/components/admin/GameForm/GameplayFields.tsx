// Gameplay : plages joueurs/durée, âge minimum, complexité, mécaniques,
// langues du matériel, caractère écoresponsable.
import FormField from "./FormField";
import type { FieldGroupProps } from "./gameFormTypes";

export default function GameplayFields({
  values,
  errors,
  onText,
  onBool,
  t,
}: FieldGroupProps) {
  const num = (name: Parameters<typeof FormField>[0]["name"]) => (
    <FormField
      name={name}
      values={values}
      errors={errors}
      onText={onText}
      t={t}
      type="number"
    />
  );

  return (
    <fieldset className="flex flex-col gap-4 border-0 p-0">
      <legend className="mb-1 text-lg font-bold text-roux">
        {t("admin.form.sections.gameplay")}
      </legend>

      <div className="grid grid-cols-[1fr_1fr] gap-4">
        {num("players_min")}
        <FormField
          name="players_max"
          values={values}
          errors={errors}
          onText={onText}
          t={t}
          type="number"
          optional
        />
      </div>
      <div className="grid grid-cols-[1fr_1fr] gap-4">
        {num("duration_min")}
        <FormField
          name="duration_max"
          values={values}
          errors={errors}
          onText={onText}
          t={t}
          type="number"
          optional
        />
      </div>
      {num("minimum_age")}
      <FormField
        name="complexity"
        values={values}
        errors={errors}
        onText={onText}
        t={t}
        optional
      />
      <FormField
        name="mechanics"
        values={values}
        errors={errors}
        onText={onText}
        t={t}
        optional
      />
      <FormField
        name="game_languages"
        values={values}
        errors={errors}
        onText={onText}
        t={t}
        optional
      />

      <div className="flex items-center gap-2">
        <input
          id="game-form-eco"
          name="eco"
          type="checkbox"
          checked={values.eco}
          onChange={(event) => onBool("eco", event.target.checked)}
        />
        <label htmlFor="game-form-eco">{t("admin.form.eco")}</label>
      </div>
    </fieldset>
  );
}
