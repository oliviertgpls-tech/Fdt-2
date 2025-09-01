export type Recipe = {
  id: string;
  title: string;
  imageUrl?: string;
  ingredients: string[]; // 1 ingrédient par ligne
  steps: string;         // texte libre
  author?: string;       // ex: "Mamie Jeanne"
  prepMinutes?: number;  // temps de préparation total
  tags?: string[];       // ex: ["famille", "dessert"]
};

export const initialRecipes: Recipe[] = [
  {
    id: "r1",
    title: "Pâtes au pesto maison",
    imageUrl: "https://images.unsplash.com/photo-1521389508051-d7ffb5dc8bbf?q=80&w=1200",
    ingredients: ["Pâtes (200g)", "Basilic", "Pignons", "Parmesan", "Huile d'olive", "Sel"],
    steps: "Mixer basilic, pignons, parmesan, huile. Cuire pâtes. Mélanger, servir.",
    author: "Mamie Jeanne",
    prepMinutes: 20,
    tags: ["plat", "italien"]
  },
  {
    id: "r2",
    title: "Salade tomates-mozza",
    imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1200",
    ingredients: ["Tomates", "Mozzarella", "Basilic", "Huile d'olive", "Sel, poivre"],
    steps: "Trancher, assaisonner, basilic par-dessus.",
    author: "Papa",
    prepMinutes: 10,
    tags: ["entrée", "rapide"]
  },
  {
    id: "r3",
    title: "Cookies chocolat",
    imageUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=1200",
    ingredients: ["Farine", "Beurre", "Sucre", "Oeuf", "Pépites chocolat"],
    steps: "Mélanger, former des boules, four 180°C ~12min.",
    author: "Tata Léa",
    prepMinutes: 25,
    tags: ["dessert", "goûter"]
  }
];
