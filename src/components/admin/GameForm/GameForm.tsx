import { useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { ExternalLink, Save } from "lucide-react";
import { useLanguage } from "../../../i18n/useLanguage";
import { supabase } from "../../../lib/supabase";
import { gamePath } from "../../../utils/routes";
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
type FormSection = "basic" | "gameplay" | "media" | "campaign" | "publishing";

const FORM_SECTIONS: FormSection[] = [
  "basic",
  "gameplay",
  "media",
  "campaign",
  "publishing",
];

const SECTION_FIELDS: Record<FormSection, readonly string[]> = {
  basic: [
    "slug",
    "title_fr",
    "title_en",
    "tagline_fr",
    "tagline_en",
    "short_desc_fr",
    "short_desc_en",
    "full_desc_fr",
    "full_desc_en",
    "category",
  ],
  gameplay: [
    "players_min",
    "players_max",
    "duration_min",
    "duration_max",
    "minimum_age",
    "complexity",
    "mechanics",
    "game_languages",
    "how_to_play_fr",
    "how_to_play_en",
    "rules_summary_fr",
    "rules_summary_en",
    "eco",
  ],
  media: ["image", "rules_pdf_fr", "rules_pdf_en"],
  campaign: ["campaign_status", "kickstarter_url", "coming_soon"],
  publishing: ["theme_key", "featured_order", "published"],
};

const sectionCard =
  "scroll-mt-6 rounded-xl border border-charcoal/10 bg-white p-5 shadow-[0_8px_24px_-18px_rgba(43,36,32,0.35)] sm:p-6";

export default function GameForm({
  game = null,
  mediaManager,
  onSaved,
  onCancel,
}: {
  game?: GameRow | null;
  mediaManager?: ReactNode;
  onSaved: (warning?: "oldImageCleanup") => void;
  onCancel: () => void;
}) {
  const { t, lang } = useLanguage();
  const edition = game !== null;
  const initialValues = game ? valuesFromGame(game) : INITIAL_VALUES;
  const [values, setValues] = useState<GameFormValues>(() => initialValues);
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<GameFormErrors>({});
  const [status, setStatus] = useState<FormStatus>("idle");

  const dirty =
    file !== null || JSON.stringify(values) !== JSON.stringify(initialValues);

  useEffect(() => {
    if (!dirty) return;

    const warnBeforeLeaving = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", warnBeforeLeaving);
    return () => window.removeEventListener("beforeunload", warnBeforeLeaving);
  }, [dirty]);

  const onText = (name: keyof GameFormValues, value: string) => {
    setValues((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => ({ ...previous, [name]: undefined }));
  };

  const onBool = (name: keyof GameFormValues, checked: boolean) => {
    setValues((previous) => ({ ...previous, [name]: checked }));
    setErrors((previous) => ({ ...previous, [name]: undefined }));
  };

  const bucket = () => supabase.storage.from(GAME_IMAGES_BUCKET);

  const scrollToSection = (section: FormSection) => {
    const target = document.getElementById(`admin-form-${section}`);
    if (!target) return;

    target.scrollIntoView?.({ behavior: "smooth", block: "start" });
    target.focus({ preventScroll: true });
  };

  const focusFirstErrorSection = (nextErrors: GameFormErrors) => {
    const firstError = Object.keys(nextErrors)[0];
    if (!firstError) return;
    const section =
      FORM_SECTIONS.find((key) => SECTION_FIELDS[key].includes(firstError)) ??
      "basic";
    window.setTimeout(() => scrollToSection(section), 0);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next = validateGameForm(values, file);
    setErrors(next);
    if (Object.keys(next).length > 0) {
      focusFirstErrorSection(next);
      return;
    }

    setStatus("saving");
    const oldImageUrl = game?.image_url ?? null;
    let imageUrl = oldImageUrl;
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

    let oldImageOrphaned = false;
    if (uploadedPath && oldImageUrl) {
      const oldPath = imagePathFromPublicUrl(oldImageUrl);
      if (oldPath) {
        const { error: removeOldError } = await bucket().remove([oldPath]);
        if (removeOldError) {
          console.error(
            "Ancienne image non supprimée (orphelin Storage) :",
            oldPath,
          );
          oldImageOrphaned = true;
        }
      }
    }

    setStatus("idle");
    onSaved(oldImageOrphaned ? "oldImageCleanup" : undefined);
  };

  const groupProps = { values, errors, onText, onBool, t };
  const formTitle = t(edition ? "admin.form.editTitle" : "admin.form.createTitle");
  const displayTitle =
    values.title_fr.trim() || values.title_en.trim() || formTitle;
  const previewPath =
    game?.published && game.slug ? gamePath(lang, game.slug) : null;

  return (
    <form className="mx-auto max-w-[72rem]" onSubmit={handleSubmit} noValidate>
      <div className="mb-6 flex flex-col gap-4 rounded-xl border border-charcoal/10 bg-white p-5 shadow-[0_8px_24px_-18px_rgba(43,36,32,0.35)] sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                values.published
                  ? "bg-forest text-cream"
                  : "bg-roux/15 text-roux"
              }`}
            >
              {values.published
                ? t("admin.form.published")
                : t("admin.manager.draft")}
            </span>
            {values.coming_soon && (
              <span className="rounded-full bg-charcoal px-3 py-1 text-xs font-bold text-cream">
                {t("games.detail.comingSoon")}
              </span>
            )}
          </div>
          <p className="text-sm font-semibold text-forest">{formTitle}</p>
          <h2 className="mt-1 text-3xl text-roux">{displayTitle}</h2>
        </div>

        {previewPath && (
          <a
            href={previewPath}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-charcoal/25 bg-white px-4 py-2.5 font-semibold text-charcoal transition-colors duration-200 hover:border-roux hover:text-roux motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
          >
            {t("games.viewGame")}
            <ExternalLink size={17} aria-hidden />
          </a>
        )}
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[14rem_minmax(0,1fr)]">
        <aside className="rounded-xl border border-charcoal/10 bg-white p-3 shadow-[0_8px_24px_-18px_rgba(43,36,32,0.35)] lg:sticky lg:top-6">
          <nav
            aria-label={`${t("admin.title")} — ${formTitle}`}
            className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible"
          >
            {FORM_SECTIONS.map((section, index) => (
              <button
                key={section}
                type="button"
                onClick={() => scrollToSection(section)}
                className="flex min-w-max cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-charcoal transition-colors duration-200 hover:bg-roux/10 hover:text-roux motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-forest text-xs text-cream">
                  {index + 1}
                </span>
                {t(`admin.form.sections.${section}`)}
              </button>
            ))}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-col gap-6">
          <section id="admin-form-basic" className={sectionCard} tabIndex={-1}>
            <BasicInformationFields {...groupProps} />
          </section>

          <section id="admin-form-gameplay" className={sectionCard} tabIndex={-1}>
            <GameplayFields {...groupProps} />
          </section>

          <section id="admin-form-media" className={sectionCard} tabIndex={-1}>
            <MediaFields
              {...groupProps}
              onFile={(nextFile) => {
                setFile(nextFile);
                setErrors((previous) => ({ ...previous, image: undefined }));
              }}
            />
            {mediaManager && (
              <div className="mt-6 border-t border-charcoal/10 pt-6">
                {mediaManager}
              </div>
            )}
          </section>

          <section id="admin-form-campaign" className={sectionCard} tabIndex={-1}>
            <CampaignFields {...groupProps} />
          </section>

          <section id="admin-form-publishing" className={sectionCard} tabIndex={-1}>
            <PublishingFields {...groupProps} />
          </section>

          {status === "error" && (
            <p
              className="rounded-xl border border-error/25 bg-white p-5 font-semibold text-error"
              role="alert"
            >
              {t("admin.form.errors.save")}
            </p>
          )}
          {status === "cleanup-error" && (
            <p
              className="rounded-xl border border-error/25 bg-white p-5 font-semibold text-error"
              role="alert"
            >
              {t("admin.form.errors.cleanup")}
            </p>
          )}

          <div className="sticky bottom-4 z-20 flex flex-wrap items-center gap-3 rounded-xl border border-charcoal/15 bg-cream/95 p-4 shadow-[0_16px_40px_-18px_rgba(43,36,32,0.55)] backdrop-blur-[10px]">
            <button
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-forest px-5 py-3 font-semibold text-white shadow-[0_8px_18px_-10px_rgba(31,58,31,0.75)] transition-transform duration-200 hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-70 motion-reduce:transition-none motion-reduce:hover:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-charcoal"
              type="submit"
              disabled={status === "saving"}
            >
              <Save size={18} aria-hidden />
              {status === "saving"
                ? t("admin.form.saving")
                : t(edition
                    ? "admin.form.submitEdit"
                    : "admin.form.submitCreate")}
            </button>
            <button
              className="cursor-pointer rounded-lg border border-charcoal/30 bg-white px-5 py-3 font-semibold text-charcoal transition-colors duration-200 hover:border-roux hover:text-roux motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-charcoal"
              type="button"
              disabled={status === "saving"}
              onClick={onCancel}
            >
              {t("admin.form.cancel")}
            </button>
            {dirty && status !== "saving" && (
              <span
                className="ml-auto h-2.5 w-2.5 rounded-full bg-roux"
                aria-hidden
              />
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
