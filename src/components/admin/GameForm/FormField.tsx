// Champ texte réutilisable du formulaire de jeu : label + input/textarea +
// message d'erreur i18n accessible (aria-invalid/aria-describedby). N'est
// utilisé que pour les champs à valeur chaîne (les booléens ont leurs cases).
import type { GameFormErrors, GameFormValues } from "./gameFormTypes";

// Clés dont la valeur est une chaîne (exclut les booléens eco/published/…).
type StringFieldName = {
  [K in keyof GameFormValues]: GameFormValues[K] extends string ? K : never;
}[keyof GameFormValues];

const inputBase =
  "rounded-lg border border-charcoal bg-white px-3 py-2.5 text-charcoal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest";

export default function FormField({
  name,
  values,
  errors,
  onText,
  t,
  type = "text",
  multiline = false,
  optional = false,
}: {
  name: StringFieldName;
  values: GameFormValues;
  errors: GameFormErrors;
  onText: (name: keyof GameFormValues, value: string) => void;
  t: (key: string) => string;
  type?: "text" | "number" | "url";
  multiline?: boolean;
  optional?: boolean;
}) {
  const id = `game-form-${name}`;
  const idErreur = `${id}-erreur`;
  const error = errors[name];
  const shared = {
    id,
    name,
    value: values[name],
    onChange: (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => onText(name, event.target.value),
    "aria-invalid": Boolean(error),
    "aria-describedby": error ? idErreur : undefined,
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-semibold" htmlFor={id}>
        {t(`admin.form.${name}`)}
        {optional && (
          <span className="ml-1 font-normal text-charcoal/60">
            {t("admin.form.optional")}
          </span>
        )}
      </label>
      {multiline ? (
        <textarea className={`${inputBase} resize-y`} rows={4} {...shared} />
      ) : (
        <input className={inputBase} type={type} {...shared} />
      )}
      {error && (
        <p className="font-semibold text-error" id={idErreur}>
          {t(error)}
        </p>
      )}
    </div>
  );
}
