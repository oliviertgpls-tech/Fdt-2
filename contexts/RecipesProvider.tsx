'use client';

import React, { createContext, useContext, useState } from "react";

// 👇 Type simple pour stocker tes recettes
type Recipe = { id: string; title: string };

type RecipesContextType = {
  recipes: Recipe[];
  addRecipe: (title: string) => void;
};

const RecipesContext = createContext<RecipesContextType | undefined>(undefined);

export function RecipesProvider({ children }: { children: React.ReactNode }) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  function addRecipe(title: string) {
    setRecipes((prev) => [...prev, { id: crypto.randomUUID(), title }]);
  }

  return (
    <RecipesContext.Provider value={{ recipes, addRecipe }}>
      {children}
    </RecipesContext.Provider>
  );
}

export function useRecipes() {
  const ctx = useContext(RecipesContext);
  if (!ctx) throw new Error("useRecipes must be used within <RecipesProvider>");
  return ctx;
}
