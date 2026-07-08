// Jeux au format de la table Supabase `games` (colonnes bilingues à plat),
// pour les tests qui rendent l'UI sans réseau. Le copy reprend celui des
// anciens jeux statiques 1-3 (rien d'inventé côté contenu de marque).
export const JEUX_FIXTURES = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    category: "famille",
    title_fr: "Origines Mystérieuses",
    title_en: "Mysterious Origins",
    short_desc_fr:
      "Plongez dans les légendes du Sasquatch et découvrez ses secrets",
    short_desc_en:
      "Dive into the legends of the Sasquatch and uncover its secrets",
    full_desc_fr:
      "Un jeu de découverte familial où les joueurs explorent les origines du Sasquatch.",
    full_desc_en:
      "A family discovery game where players explore the origins of the Sasquatch.",
    image_url: "https://exemple.supabase.co/public/game-images/origines.webp",
    players: "2-6",
    duration: "30-45 min",
    age: "8+",
    eco: true,
    published: true,
    created_at: "2026-07-08T00:00:00Z",
    updated_at: "2026-07-08T00:00:00Z",
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    category: "stratégie",
    title_fr: "Mission Ninja",
    title_en: "Ninja Mission",
    short_desc_fr:
      "Infiltration, discrétion et tactiques pour devenir le meilleur ninja",
    short_desc_en:
      "Infiltration, stealth, and tactics to become the ultimate ninja",
    full_desc_fr:
      "Un jeu de stratégie où chaque décision compte pour accomplir la mission.",
    full_desc_en:
      "A strategy game where every decision counts to complete the mission.",
    image_url: null,
    players: "2-4",
    duration: "45-60 min",
    age: "10+",
    eco: true,
    published: true,
    created_at: "2026-07-08T00:00:01Z",
    updated_at: "2026-07-08T00:00:01Z",
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    category: "party",
    title_fr: "Festin Forestier",
    title_en: "Forest Feast",
    short_desc_fr:
      "Des rires garantis autour d'un festin sauvage et déjanté",
    short_desc_en: "Guaranteed laughs around a wild and wacky feast",
    full_desc_fr:
      "Un jeu d'ambiance rapide où l'on compose le festin le plus fou de la forêt.",
    full_desc_en:
      "A fast party game about building the wildest feast in the forest.",
    image_url: "https://exemple.supabase.co/public/game-images/festin.webp",
    players: "3-8",
    duration: "20-30 min",
    age: "8+",
    eco: true,
    published: true,
    created_at: "2026-07-08T00:00:02Z",
    updated_at: "2026-07-08T00:00:02Z",
  },
];
