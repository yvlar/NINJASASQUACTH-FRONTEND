import React from "react";
import styles from "./Games.module.css";

export default function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
}) {
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
          {cat.label}
        </button>
      ))}
    </div>
  );
}
