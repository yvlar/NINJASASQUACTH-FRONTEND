import { Users, Clock, Star, Leaf } from "lucide-react";
import { useLanguage } from "../../../i18n/useLanguage";
import { localizeGame } from "../../../utils/localizeGame";
import type { GameRow } from "../../../types/database";

export default function GameDetail({
  game,
  onBack,
}: {
  game: GameRow;
  onBack: () => void;
}) {
  const { t, lang } = useLanguage();
  const { title, fullDesc } = localizeGame(game, lang);

  return (
    <div className="min-h-screen bg-cream pt-16">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <button
          onClick={onBack}
          className="mb-6 cursor-pointer font-medium text-dark-green transition-opacity duration-300 hover:opacity-80 motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-eco-green"
        >
          ← {t("games.backToGames")}
        </button>

        <div className="grid grid-cols-[1fr] gap-8 md:grid-cols-[repeat(2,1fr)]">
          <div>
            {game.image_url && (
              <img
                src={game.image_url}
                alt={title}
                className="h-96 w-full rounded-lg object-cover shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)]"
              />
            )}
            {game.eco && (
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-eco-green px-4 py-2 font-medium text-cream">
                <Leaf size={20} />
                <span>{t("games.eco")}</span>
              </div>
            )}
          </div>

          <div>
            {/* h2 (pas h1) : le h1 unique de la page est celui du hero (D9) */}
            <h2 className="mb-4 text-4xl/[1.6] font-extrabold tracking-[-0.01em] text-brown">
              {title}
            </h2>

            <div className="mb-6 flex gap-6 text-dark-green">
              <div className="flex items-center gap-2">
                <Users size={20} />
                <span>
                  {game.players} {t("games.players")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={20} />
                <span>{game.duration}</span>
              </div>
              <div className="flex items-center gap-2">
                <Star size={20} />
                <span>{game.age}</span>
              </div>
            </div>

            <p className="mb-6 text-lg/[1.6] text-dark-green">{fullDesc}</p>

            {/* bg-eco-green/10 = rgba(7, 126, 22, 0.1), le vert éco à 10 %. */}
            <div className="rounded-lg border-l-4 border-l-eco-green bg-eco-green/10 p-6">
              <h3 className="mb-3 font-semibold text-dark-green">
                {t("games.characteristics")}
              </h3>
              <ul className="flex list-none flex-col gap-2 text-dark-green">
                <li>
                  • {t("games.category")}:{" "}
                  {t(`games.categories.${game.category}`)}
                </li>
                <li>• {t("games.materials")}</li>
                <li>• {t("games.madeIn")}</li>
                <li>• {t("games.rules")}</li>
                <li>• {t("games.commitment")}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
