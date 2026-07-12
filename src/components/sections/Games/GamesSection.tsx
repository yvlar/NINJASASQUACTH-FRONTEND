import { useState } from "react";
import { categories } from "../../../data/games";
import { useGames } from "../../../hooks/useGames";
import { useLanguage } from "../../../i18n/useLanguage";
import GameCard from "./GameCard";
import CategoryFilter from "./CategoryFilters";
import type { CatalogCategoryId } from "../../../types/database";

export default function GamesSection() {
  const [selectedCategory, setSelectedCategory] =
    useState<CatalogCategoryId>("tous");
  const { t } = useLanguage();
  // Les jeux viennent de Supabase (la RLS ne sert que les jeux publiés aux
  // visiteurs anonymes) ; la base peut être vide tant que l'admin n'a rien créé.
  // Plus d'état selectedGame : chaque carte est un lien vers sa fiche.
  const { games, loading, error } = useGames();

  const filteredGames =
    selectedCategory === "tous"
      ? games
      : games.filter((game) => game.category === selectedCategory);

  return (
    <section id="jeux" className="bg-cream py-20">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <h2 className="mb-4 text-center text-[2.5rem] font-extrabold tracking-[-0.01em] text-brown md:text-[3rem]">
          {t("games.title")}
        </h2>
        <p className="mx-auto mb-12 max-w-2xl text-center text-lg/[1.6] text-dark-green">
          {t("games.description")}
        </p>

        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* États de la lecture Supabase : chargement, base vide, erreur */}
        {loading && <p className="my-8 text-center">{t("games.loading")}</p>}
        {!loading && error != null && (
          <p className="my-8 text-center font-semibold text-error" role="alert">
            {t("games.error")}
          </p>
        )}
        {!loading && error == null && filteredGames.length === 0 && (
          <p className="my-8 text-center">{t("games.empty")}</p>
        )}
        {!loading && error == null && filteredGames.length > 0 && (
          <div className="grid grid-cols-[1fr] gap-8 sm:grid-cols-[repeat(2,1fr)] lg:grid-cols-[repeat(3,1fr)]">
            {filteredGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
