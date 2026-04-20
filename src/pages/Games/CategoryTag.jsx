import { Users, Brain, Zap, Gamepad2 } from "lucide-react";

export default function CategoryTag({ styles, game, categories }) {
  const iconMap = {
    Users: Users,
    Brain: Brain,
    Zap: Zap,
    Gamepad2: Gamepad2,
  };

  const getCategoryData = (categoryId) => {
    return categories.find((cat) => cat.id === categoryId);
  };

  // Fonction pour obtenir l'icône
  const getCategoryIcon = (categoryId) => {
    const categoryData = getCategoryData(categoryId);
    if (!categoryData || !categoryData.icon) return null;

    const IconComponent = iconMap[categoryData.icon];
    return IconComponent ? <IconComponent size={14} /> : null;
  };

  // Fonction pour obtenir les couleurs
  const getCategoryColors = (categoryId) => {
    const categoryData = getCategoryData(categoryId);
    return (
      categoryData?.colors || {
        bg: "rgba(155, 88, 36, 0.15)",
        border: "#9b5824",
        text: "#9b5824",
      }
    );
  };

  return (
    <div className={styles.categories}>
      {game.category.map((cat, index) => {
        const colors = getCategoryColors(cat);
        const icon = getCategoryIcon(cat);
        const categoryData = getCategoryData(cat);

        return (
          <span
            key={index}
            className={styles.categoryTag}
            style={{
              backgroundColor: colors.bg,
              borderColor: colors.border,
              color: colors.text,
            }}
          >
            {icon}
            <span>
              {categoryData?.label ||
                cat.charAt(0).toUpperCase() + cat.slice(1)}
            </span>
          </span>
        );
      })}
    </div>
  );
}
