import { useLanguage } from "../../../i18n/useLanguage";
import styles from "./Games.module.css";
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
    <div className={styles.filterContainer}>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelectCategory(cat.id)}
          className={`${styles.filterButton} ${
            selectedCategory === cat.id ? styles.filterButtonActive : ""
          }`}
        >
          {t(`games.categories.${cat.id}`)}
        </button>
      ))}
    </div>
  );
}
