// Campagne : statut Kickstarter, URL Kickstarter, état « à venir ».
import FormField from "./FormField";
import type { FieldGroupProps } from "./gameFormTypes";
import type { CampaignStatus } from "../../../types/database";

const selectBase =
  "rounded-lg border border-dark-green bg-white px-3 py-2.5 text-dark-green focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-eco-green";

const CAMPAIGN_STATUSES: CampaignStatus[] = [
  "none",
  "coming-soon",
  "live",
  "completed",
];

export default function CampaignFields({
  values,
  errors,
  onText,
  onBool,
  t,
}: FieldGroupProps) {
  return (
    <fieldset className="flex flex-col gap-4 border-0 p-0">
      <legend className="mb-1 text-lg font-bold text-brown">
        {t("admin.form.sections.campaign")}
      </legend>

      <div className="flex flex-col gap-1.5">
        <label className="font-semibold" htmlFor="game-form-campaign_status">
          {t("admin.form.campaign_status")}
        </label>
        <select
          className={selectBase}
          id="game-form-campaign_status"
          name="campaign_status"
          value={values.campaign_status}
          onChange={(event) => onText("campaign_status", event.target.value)}
        >
          {CAMPAIGN_STATUSES.map((status) => (
            <option key={status} value={status}>
              {t(`admin.form.campaignStatuses.${status}`)}
            </option>
          ))}
        </select>
      </div>

      <FormField
        name="kickstarter_url"
        values={values}
        errors={errors}
        onText={onText}
        t={t}
        type="url"
        optional
      />

      <div className="flex items-center gap-2">
        <input
          id="game-form-coming_soon"
          name="coming_soon"
          type="checkbox"
          checked={values.coming_soon}
          onChange={(event) => onBool("coming_soon", event.target.checked)}
        />
        <label htmlFor="game-form-coming_soon">
          {t("admin.form.coming_soon")}
        </label>
      </div>
    </fieldset>
  );
}
