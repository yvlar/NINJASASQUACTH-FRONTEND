// Les textes des jeux (title, shortDesc, fullDesc) et les libellés de
// catégories vivent dans src/data/translations/{fr,en}.json sous
// games.items.<id> et games.categories.<id>.
// Les ids de catégories (accents compris) servent de clés de filtrage :
// ils doivent correspondre byte-for-byte entre `categories` et `games`.
export const games = [
  {
    id: 1,
    category: "famille",
    image:
      "https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=800&h=600&fit=crop",
    players: "2-6",
    duration: "30-45 min",
    age: "8+",
    eco: true,
  },
  {
    id: 2,
    category: "stratégie",
    image:
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&h=600&fit=crop",
    players: "2-4",
    duration: "45-60 min",
    age: "10+",
    eco: true,
  },
  {
    id: 3,
    category: "party",
    image:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=600&fit=crop",
    players: "4-8",
    duration: "20-30 min",
    age: "12+",
    eco: true,
  },
  {
    id: 4,
    category: "famille",
    image:
      "https://images.unsplash.com/photo-1511884642898-4c92249e20b6?w=800&h=600&fit=crop",
    players: "2-5",
    duration: "40-50 min",
    age: "7+",
    eco: true,
  },
  {
    id: 5,
    category: "stratégie",
    image:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
    players: "3-6",
    duration: "50-70 min",
    age: "10+",
    eco: true,
  },
  {
    id: 6,
    category: "party",
    image:
      "https://images.unsplash.com/photo-1574169208507-84376144848b?w=800&h=600&fit=crop",
    players: "4-10",
    duration: "60-90 min",
    age: "14+",
    eco: true,
  },
];

export const categories = [
  { id: "tous" },
  { id: "famille" },
  { id: "stratégie" },
  { id: "party" },
];
