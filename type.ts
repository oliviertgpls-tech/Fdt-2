export type Recipe = {
  id: string;
  title: string;
  slug: string;
  description?: string;
  ingredients: string[];       // 1 ingrédient par ligne
  steps: string[];             // 1 étape par ligne
  prepMinutes?: number;
  cookMinutes?: number;
  images?: string[];           // URLs
  author?: string;             // pour attribution (familial/amical)
  tags?: string[];
  createdAt: string;
  updatedAt: string;
};

export type Notebook = {
  id: string;
  name: string;                // “Carnet de Mamie”
  description?: string;
  recipeIds: string[];         // ordre = ordre d’impression
  coverImage?: string;
  createdAt: string;
  updatedAt: string;
};
