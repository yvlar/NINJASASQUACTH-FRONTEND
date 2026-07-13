// Comment jouer : les ÉTAPES RÉELLES de déroulement (how_to_play_*), une par
// ligne, présentées comme une liste ordonnée. Masqué si aucune étape réelle —
// on n'y met JAMAIS les mécaniques à la place (celles-ci ont leur propre
// section GameMechanics). Aucune règle inventée.
import { useLanguage } from "../../i18n/useLanguage";
import type { GameRow } from "../../types/database";

export default function HowToPlay({ game }: { game: GameRow }) {
  const { t, lang } = useLanguage();
  const raw = (lang === "en" ? game.how_to_play_en : game.how_to_play_fr) ?? "";
  const steps = raw
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  if (steps.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-6">
      <h2 className="mb-3 text-2xl text-roux">{t("games.detail.howToPlay")}</h2>
      <ol className="flex list-decimal flex-col gap-2 pl-6 text-charcoal">
        {steps.map((step, index) => (
          <li key={index}>{step}</li>
        ))}
      </ol>
    </section>
  );
}
