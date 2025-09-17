export type Recipe = {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;        // URL de l'image principale (ancien format)
  // 🆕 NOUVEAU : Versions optimisées d'images
  imageVersions?: {
    thumbnail: string;      // 200px - pour listes/vignettes
    medium: string;         // 800px - pour cartes/aperçus  
    large: string;          // 2400px - pour affichage plein
  };
  ingredients: string[];    // Liste des ingrédients (1 par ligne)
  steps: string;           // Instructions (texte libre pour commencer)
  author?: string;         // "Mamie Jeanne", "Papa", etc.
  prepMinutes?: number;    // Temps de préparation
  servings?: string;       // "4", "6 personnes", "8-10"
  tags?: string[];         // ["dessert", "rapide", "famille"]
  createdAt?: number;      // Timestamp de création
  updatedAt?: number;      // Timestamp de dernière modification
};

export type Book = {
  id: string;
  title: string;           // "Les recettes de famille", "Carnet de Mamie"
  description?: string;    // Description du livre
  coverUrl?: string;       // Image de couverture
  coverImageUrl?: string;  // 🆕 NOUVELLE : Photo de couverture dédiée
  recipeIds: string[];     // IDs des recettes dans l'ordre souhaité
  createdAt: number;       // Timestamp de création
  updatedAt?: number;      // Timestamp de dernière modification
};
