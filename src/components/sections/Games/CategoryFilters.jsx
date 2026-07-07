import { useLanguage } from "../../../i18n/useLanguage";
import styles from "./Games.module.css";

export default function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
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
