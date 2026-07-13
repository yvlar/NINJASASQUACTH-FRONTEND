// Visuel d'un jeu : la vraie photo si elle existe, sinon un repli de MARQUE
// thématisé (monogramme + signature Ninja Sasquatch) — jamais une fausse boîte
// ni une illustration inventée. Réutilisable (fiche, carte, accueil). La
// sous-palette du jeu (theme_key) ne sert que d'accent local (barre + pastille).
//
// Accessibilité : `decorative` → aria-hidden (le titre est déjà annoncé à côté,
// ex. le <h1> de la fiche) ; sinon le panneau porte un nom accessible (le titre).
import { themeForKey } from "../../data/gameThemes";
import type { GameThemeKey } from "../../types/database";

// Monogramme : initiales des deux premiers mots, sinon deux premières lettres.
// Repli « NS » (marque) si le titre est vide. charAt garantit toujours une
// chaîne (compatible noUncheckedIndexedAccess).
function monogram(title: string): string {
  const words = title.trim().split(/\s+/).filter(Boolean);
  const first = words[0];
  if (!first) return "NS";
  const second = words[1];
  if (second) return (first.charAt(0) + second.charAt(0)).toUpperCase();
  return first.slice(0, 2).toUpperCase();
}

interface GameArtworkProps {
  imageUrl: string | null;
  title: string;
  themeKey: GameThemeKey | null;
  // Classes de dimensionnement/arrondi/ombre fournies par l'appelant.
  className?: string;
  // true → visuel décoratif (aria-hidden) car le titre est déjà adjacent.
  decorative?: boolean;
}

export default function GameArtwork({
  imageUrl,
  title,
  themeKey,
  className = "",
  decorative = false,
}: GameArtworkProps) {
  const theme = themeForKey(themeKey);

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={decorative ? "" : title}
        className={`border-t-4 object-cover ${theme.accentBar} ${className}`}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={decorative ? undefined : title}
      aria-hidden={decorative || undefined}
      className={`flex flex-col items-center justify-center gap-2 border-t-4 ${theme.accentBar} ${theme.accentBadge} ${className}`}
    >
      <span className="font-brand text-5xl leading-none" aria-hidden="true">
        {monogram(title)}
      </span>
      <span className="text-xs font-semibold uppercase tracking-wide opacity-80" aria-hidden="true">
        Ninja Sasquatch Games
      </span>
    </div>
  );
}
