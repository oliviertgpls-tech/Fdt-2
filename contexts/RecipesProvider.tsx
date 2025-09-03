"use client";

import React, { createContext, useContext, useState } from "react";
import type { Recipe, Book } from "@/lib/types";

// 🎯 Quelques recettes d'exemple pour commencer
const initialRecipes: Recipe[] = [
  {
    id: "r1",
    title: "Pâtes au pesto maison",
    description: "Un classique simple et savoureux",
    imageUrl: "https://images.unsplash.com/photo-1621389508051-d7ffb5dc8bbf?q=80&w=1200",
    ingredients: [
      "200g de pâtes",
      "50g de basilic frais",
      "50g de pignons de pin",
      "100g de parmesan râpé",
      "100ml d'huile d'olive",
      "2 gousses d'ail",
      "Sel et poivre"
    ],
    steps: `1. Faire cuire les pâtes dans une grande casserole d'eau salée selon les instructions du paquet.

2. Pendant ce temps, mixer le basilic, les pignons, l'ail et le parmesan avec l'huile d'olive jusqu'à obtenir une pâte lisse.

3. Égoutter les pâtes en gardant un peu d'eau de cuisson.

4. Mélanger les pâtes avec le pesto, ajouter un peu d'eau de cuisson si nécessaire.

5. Servir immédiatement avec du parmesan supplémentaire.`,
    author: "Mamie Jeanne",
    prepMinutes: 20,
    tags: ["italien", "végétarien", "rapide"],
    createdAt: Date.now() - 86400000 // Il y a 1 jour
  },
  {
    id: "r2",
    title: "Salade tomates-mozza",
    description: "Fraîcheur et simplicité pour l'été",
    imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1200",
    ingredients: [
      "4 belles tomates mûres",
      "200g de mozzarella di bufala",
      "Quelques feuilles de basilic frais",
      "Huile d'olive extra vierge",
      "Sel de mer, poivre du moulin"
    ],
    steps: `1. Laver et trancher les tomates en rondelles épaisses.

2. Égoutter et trancher la mozzarella.

3. Alterner tomates et mozzarella sur une assiette.

4. Parsemer de feuilles de basilic ciselées.

5. Arroser d'huile d'olive, saler et poivrer.

6. Laisser reposer 10 minutes avant de servir.`,
    author: "Papa",
    prepMinutes: 10,
    tags: ["entrée", "été", "italien"],
    createdAt: Date.now() - 172800000 // Il y a 2 jours
  }
];

// 📚 Un carnet d'exemple
const initialBooks: Book[] = [
  {
    id: "b1",
    title: "Recettes de famille",
    description: "Les meilleures recettes transmises de génération en génération",
    recipeIds: ["r1"], // Contient déjà le pesto
    createdAt: Date.now() - 86400000
  }
];

type RecipesContextType = {
  // Recettes
  recipes: Recipe[];
  addRecipe: (recipeData: Omit<Recipe, 'id' | 'createdAt'>) => void;
  updateRecipe: (id: string, recipeData: Partial<Recipe>) => void;
  deleteRecipe: (id: string) => void;

  // Carnets
  books: Book[];
  createBook: (title: string) => void;
  addRecipeToBook: (bookId: string, recipeId: string) => void;
  removeRecipeFromBook: (bookId: string, recipeId: string) => void;
};

const RecipesContext = createContext<RecipesContextType | undefined>(undefined);

export function RecipesProvider({ children }: { children: React.ReactNode }) {
  const [recipes, setRecipes] = useState<Recipe[]>(initialRecipes);
  const [books, setBooks] = useState<Book[]>(initialBooks);

  // ➕ Ajouter une nouvelle recette (version complète)
  function addRecipe(recipeData: Omit<Recipe, 'id' | 'createdAt'>) {
    const newRecipe: Recipe = {
      ...recipeData,
      id: `r-${Date.now()}`,
      createdAt: Date.now()
    };

    setRecipes(prev => [newRecipe, ...prev]);
  }

  // ✏️ Mettre à jour une recette existante
  function updateRecipe(id: string, recipeData: Partial<Recipe>) {
    setRecipes(prev =>
      prev.map(recipe =>
        recipe.id === id
          ? { ...recipe, ...recipeData, updatedAt: Date.now() }
          : recipe
      )
    );
  }

  // 🗑️ Supprimer une recette
  function deleteRecipe(id: string) {
    // Supprimer la recette
    setRecipes(prev => prev.filter(recipe => recipe.id !== id));
    
    // La retirer de tous les carnets
    setBooks(prev =>
      prev.map(book => ({
        ...book,
        recipeIds: book.recipeIds.filter(recipeId => recipeId !== id),
        updatedAt: Date.now()
      }))
    );
  }

  // 📚 Créer un nouveau carnet
  function createBook(title: string) {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    const newBook: Book = {
      id: `b-${Date.now()}`,
      title: trimmedTitle,
      recipeIds: [],
      createdAt: Date.now()
    };

    setBooks(prev => [newBook, ...prev]);
  }

  // ➕ Ajouter une recette à un carnet
  function addRecipeToBook(bookId: string, recipeId: string) {
    setBooks(prev =>
      prev.map(book =>
        book.id === bookId && !book.recipeIds.includes(recipeId)
          ? { ...book, recipeIds: [...book.recipeIds, recipeId], updatedAt: Date.now() }
          : book
      )
    );
  }

  // ➖ Retirer une recette d'un carnet
  function removeRecipeFromBook(bookId: string, recipeId: string) {
    setBooks(prev =>
      prev.map(book =>
        book.id === bookId
          ? { 
              ...book, 
              recipeIds: book.recipeIds.filter(id => id !== recipeId),
              updatedAt: Date.now()
            }
          : book
      )
    );
  }

  return (
    <RecipesContext.Provider
      value={{
        recipes,
        addRecipe,
        updateRecipe,
        deleteRecipe,
        books,
        createBook,
        addRecipeToBook,
        removeRecipeFromBook,
      }}
    >
      {children}
    </RecipesContext.Provider>
  );
}

export function useRecipes() {
  const context = useContext(RecipesContext);
  if (!context) {
    throw new Error("useRecipes doit être utilisé dans un RecipesProvider");
  }
  return context;
}
