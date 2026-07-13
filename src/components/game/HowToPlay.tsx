// Comment jouer : mécaniques et langues du matériel. Masqué si aucune donnée.
import { useLanguage } from "../../i18n/useLanguage";
import type { GameRow } from "../../types/database";

export default function HowToPlay({ game }: { game: GameRow }) {
  const { t } = useLanguage();
  const mechanics = game.mechanics ?? [];
  const languages = game.game_languages ?? [];
  if (mechanics.length === 0 && languages.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-6">
      <h2 className="mb-3 text-2xl text-roux">
        {t("games.detail.howToPlay")}
      </h2>
      <div className="flex flex-col gap-4">
        {mechanics.length > 0 && (
          <div>
            <h3 className="mb-2 font-semibold text-charcoal">
              {t("games.detail.mechanics")}
            </h3>
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
          </div>
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
