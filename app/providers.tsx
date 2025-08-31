"use client";
import { createContext, useContext, useMemo, useState } from "react";
import type { Recipe, Book } from "@/lib/types";
import { initialRecipes } from "@/lib/recipes"; // conserve ton fichier actuel

type Ctx = {
  recipes: Recipe[];
  addRecipe: (r: Omit<Recipe, "id">) => void;

  books: Book[];
  createBook: (title: string, coverUrl?: string) => string; // retourne l'id
  addRecipeToBook: (bookId: string, recipeId: string) => void;
  removeRecipeFromBook: (bookId: string, recipeId: string) => void;
};

const RecipesContext = createContext<Ctx | null>(null);

export function RecipesProvider({ children }: { children: React.ReactNode }) {
  const [recipes, setRecipes] = useState<Recipe[]>(initialRecipes);
  const [books, setBooks] = useState<Book[]>([
    { id: "b1", title: "Livre familial", coverUrl: undefined, recipeIds: [], createdAt: Date.now() }
  ]);

  const addRecipe: Ctx["addRecipe"] = (r) => {
    setRecipes((prev) => [{ ...r, id: `r-${Date.now()}` }, ...prev]);
  };

  const createBook: Ctx["createBook"] = (title, coverUrl) => {
    const id = `b-${Date.now()}`;
    setBooks((prev) => [{ id, title: title.trim(), coverUrl, recipeIds: [], createdAt: Date.now() }, ...prev]);
    return id;
  };

  const addRecipeToBook: Ctx["addRecipeToBook"] = (bookId, recipeId) => {
    setBooks((prev) =>
      prev.map((b) => (b.id === bookId && !b.recipeIds.includes(recipeId) ? { ...b, recipeIds: [recipeId, ...b.recipeIds] } : b))
    );
  };

  const removeRecipeFromBook: Ctx["removeRecipeFromBook"] = (bookId, recipeId) => {
    setBooks((prev) => prev.map((b) => (b.id === bookId ? { ...b, recipeIds: b.recipeIds.filter((id) => id !== recipeId) } : b)));
  };

  const value = useMemo(() => ({ recipes, addRecipe, books, createBook, addRecipeToBook, removeRecipeFromBook }), [recipes, books]);
  return <RecipesContext.Provider value={value}>{children}</RecipesContext.Provider>;
}

export function useRecipes() {
  const ctx = useContext(RecipesContext);
  if (!ctx) throw new Error("useRecipes must be used within <RecipesProvider>");
  return ctx;
}
