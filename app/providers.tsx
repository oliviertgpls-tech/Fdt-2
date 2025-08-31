"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { Recipe } from "@/lib/recipes";
import { initialRecipes } from "@/lib/recipes";

type RecipesContextType = {
  recipes: Recipe[];
  addRecipe: (r: Omit<Recipe, "id">) => void;
};

const RecipesContext = createContext<RecipesContextType | null>(null);

export function RecipesProvider({ children }: { children: React.ReactNode }) {
  const [recipes, setRecipes] = useState<Recipe[]>(initialRecipes);

  const addRecipe: RecipesContextType["addRecipe"] = (r) => {
    setRecipes((prev) => [
      { ...r, id: `r-${Date.now()}` },
      ...prev,
    ]);
  };

  const value = useMemo(() => ({ recipes, addRecipe }), [recipes]);
  return <RecipesContext.Provider value={value}>{children}</RecipesContext.Provider>;
}

export function useRecipes() {
  const ctx = useContext(RecipesContext);
  if (!ctx) throw new Error("useRecipes must be used within <RecipesProvider>");
  return ctx;
}
