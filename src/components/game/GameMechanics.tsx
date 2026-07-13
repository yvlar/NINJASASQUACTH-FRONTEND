// Mécaniques & langues du matériel — section DISTINCTE de « Comment jouer »
// (qui, lui, décrit les étapes réelles de jeu). Reçoit la donnée Supabase ;
// masqué si aucune mécanique ni langue.
import { useLanguage } from "../../i18n/useLanguage";
import type { GameRow } from "../../types/database";

export default function GameMechanics({ game }: { game: GameRow }) {
  const { t } = useLanguage();
  const mechanics = game.mechanics ?? [];
  const languages = game.game_languages ?? [];
  if (mechanics.length === 0 && languages.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-6">
      <h2 className="mb-3 text-2xl text-roux">{t("games.detail.mechanics")}</h2>
      <div className="flex flex-col gap-4">
        {mechanics.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {mechanics.map((mechanic) => (
              <li
                key={mechanic}
                className="rounded-full bg-forest/10 px-3 py-1 text-sm text-charcoal"
              >
                {mechanic}
              </li>
            ))}
          </ul>
        )}
        {languages.length > 0 && (
          <div>
            <h3 className="mb-2 font-semibold text-charcoal">
              {t("games.detail.languages")}
            </h3>
            <p className="text-charcoal">{languages.join(" · ")}</p>
          </div>
        )}
      </div>
    </section>
  );
}
