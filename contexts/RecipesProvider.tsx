"use client";

import React, { createContext, useContext, useState } from "react";

export type Recipe = {
  id: string;
  title: string;
  description?: string;
  tags?: string[];
  ingredients?: string[];
  steps?: string[];
  author?: string;
};

export type Book = { id: string; title: string; recipeIds: string[] };

type RecipesContextType = {
  // Recettes
  recipes: Recipe[];
  addRecipe: (title: string) => void;

  // Carnets (books)
  books: Book[];
  createBook: (title: string) => void;
  addRecipeToBook: (bookId: string, recipeId: string) => void;
  removeRecipeFromBook: (bookId: string, recipeId: string) => void;
};

const RecipesContext = createContext<RecipesContextType | undefined>(undefined);

export function RecipesProvider({ children }: { children: React.ReactNode }) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [books, setBooks] = useState<Book[]>([]);

  // ==== Recettes ====
  function addRecipe(title: string) {
    const t = title.trim();
    if (!t) return;
    setRecipes((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        title: t,
        description: "",
        tags: [],
        ingredients: [],
        steps: [],
        author: "",
      },
    ]);
  }

  // ==== Carnets ====
  function createBook(title: string) {
    const t = title.trim();
    if (!t) return;
    setBooks((prev) => [
      { id: crypto.randomUUID(), title: t, recipeIds: [] },
      ...prev,
    ]);
  }

  function addRecipeToBook(bookId: string, recipeId: string) {
    setBooks((prev) =>
      prev.map((b) =>
        b.id === bookId && !b.recipeIds.includes(recipeId)
          ? { ...b, recipeIds: [...b.recipeIds, recipeId] }
          : b
      )
    );
  }

  function removeRecipeFromBook(bookId: string, recipeId: string) {
    setBooks((prev) =>
      prev.map((b) =>
        b.id === bookId
          ? { ...b, recipeIds: b.recipeIds.filter((id) => id !== recipeId) }
          : b
      )
    );
  }

  return (
    <RecipesContext.Provider
      value={{
        recipes,
        addRecipe,
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
  const ctx = useContext(RecipesContext);
  if (!ctx) throw new Error("useRecipes must be used within <RecipesProvider>");
  return ctx;
}
