// Chemin Storage d'une image de jeu. On ne stocke que l'URL publique dans
// `games.image_url` ; le chemin bucket-relatif (nécessaire pour supprimer le
// fichier) en est déductible de façon déterministe — la suppression n'exige
// donc pas de colonne supplémentaire. Fonction pure, testable sans réseau.
export const GAME_IMAGES_BUCKET = "game-images";

export function imagePathFromPublicUrl(url: string | null): string | null {
  if (!url) return null;
  const marker = `/${GAME_IMAGES_BUCKET}/`;
  const index = url.indexOf(marker);
  if (index === -1) return null;
  const path = url.slice(index + marker.length);
  return path.length > 0 ? path : null;
}
