export type Recipe = {
  id: string;
  title: string;
  imageUrl?: string;
  ingredients: string[];
  steps: string;
  author?: string;       // ex: "Mamie Jeanne"
  prepMinutes?: number;  // temps
  tags?: string[];       // ex: ["famille", "dessert"]
};

export type Book = {
  id: string;
  title: string;         // ex: "Les recettes de la famille Tangopoulos"
  coverUrl?: string;
  recipeIds: string[];   // références aux recettes
  createdAt: number;
};
