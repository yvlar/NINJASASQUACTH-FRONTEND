import { useLanguage } from "../../../i18n/useLanguage";
import type { CatalogCategoryId } from "../../../types/database";

export default function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
}: {
  categories: ReadonlyArray<{ id: CatalogCategoryId }>;
  selectedCategory: CatalogCategoryId;
  onSelectCategory: (id: CatalogCategoryId) => void;
}) {
  const { t } = useLanguage();

  return (
    <div className="mb-12 flex flex-wrap justify-center gap-4">
      {categories.map((cat) => (
        // bg-brown/20 = rgba(155, 88, 36, 0.2) ; l'état actif porte ses
        // propres couleurs dans le ternaire pour éviter tout conflit d'ordre.
        <button
          key={cat.id}
          onClick={() => onSelectCategory(cat.id)}
          className={`cursor-pointer rounded-full px-6 py-2 font-medium transition-all duration-300 hover:opacity-80 motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-eco-green ${
            selectedCategory === cat.id
              ? "bg-dark-green text-white shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)]"
              : "bg-brown/20 text-dark-green"
          }`}
        >
          {t(`games.categories.${cat.id}`)}
        </button>
      ))}
    </div>
  );
}
