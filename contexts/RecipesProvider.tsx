"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import type { Recipe, Book } from "@/lib/types";

type RecipesContextType = {
  // 🍽️ RECETTES
  recipes: Recipe[];
  addRecipe: (recipeData: Omit<Recipe, 'id' | 'createdAt'>) => Promise<void>;
  updateRecipe: (id: string, recipeData: Partial<Recipe>) => Promise<void>;
  deleteRecipe: (id: string) => Promise<void>;
  
  // 📚 CARNETS (collections thématiques)
  notebooks: Book[];
  createNotebook: (title: string, description?: string) => Promise<Book>;
  addRecipeToNotebook: (notebookId: string, recipeId: string) => Promise<void>;
  removeRecipeFromNotebook: (notebookId: string, recipeId: string) => Promise<void>;
  
  // 📖 LIVRES IMPRIMABLES (versions print avec recettes sélectionnées)
  books: any[];
  createBook: (title: string, selectedRecipeIds: string[]) => Promise<any>;
  updateBook: (id: string, bookData: any) => Promise<void>;
  addRecipeToBook: (bookId: string, recipeId: string) => Promise<void>;
  removeRecipeFromBook: (bookId: string, recipeId: string) => Promise<void>;
  
  // État de chargement
  loading: boolean;
  error: string | null;
};

const RecipesContext = createContext<RecipesContextType | undefined>(undefined);

export function RecipesProvider({ children }: { children: React.ReactNode }) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [notebooks, setNotebooks] = useState<Book[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🔄 CHARGEMENT INITIAL
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [recipesRes, notebooksRes, booksRes] = await Promise.all([
        fetch('/api/recipes'),
        fetch('/api/notebooks'),
        fetch('/api/books') // 🆕 Charger aussi les livres
      ]);
      
      const recipesData = await recipesRes.json();
      const notebooksData = await notebooksRes.json();
      const booksData = await booksRes.json(); // 🆕
      
      setRecipes(recipesData);
      setNotebooks(notebooksData);
      setBooks(booksData); // 🆕
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des données');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 🍽️ GESTION DES RECETTES
  const addRecipe = async (recipeData: Omit<Recipe, 'id' | 'createdAt'>) => {
    try {
      const response = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recipeData)
      });
      
      if (!response.ok) throw new Error('Erreur lors de la création');
      
      const newRecipe = await response.json();
      setRecipes(prev => [newRecipe, ...prev]);
    } catch (err) {
      setError('Erreur lors de l\'ajout de la recette');
      throw err;
    }
  };

  const updateRecipe = async (id: string, recipeData: Partial<Recipe>) => {
    try {
      const response = await fetch(`/api/recipes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recipeData)
      });
      
      if (!response.ok) throw new Error('Erreur lors de la modification');
      
      const updatedRecipe = await response.json();
      setRecipes(prev => 
        prev.map(recipe => recipe.id === id ? updatedRecipe : recipe)
      );
    } catch (err) {
      setError('Erreur lors de la modification de la recette');
      throw err;
    }
  };

  const deleteRecipe = async (id: string) => {
    try {
      const response = await fetch(`/api/recipes/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Erreur lors de la suppression');
      
      setRecipes(prev => prev.filter(recipe => recipe.id !== id));
    } catch (err) {
      setError('Erreur lors de la suppression de la recette');
      throw err;
    }
  };

  // 📚 GESTION DES CARNETS
  const createNotebook = async (title: string, description?: string): Promise<Book> => {
    try {
      const response = await fetch('/api/notebooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description })
      });
      
      if (!response.ok) throw new Error('Erreur lors de la création du carnet');
      
      const newNotebook = await response.json();
      setNotebooks(prev => [newNotebook, ...prev]);
      return newNotebook;
    } catch (err) {
      setError('Erreur lors de la création du carnet');
      throw err;
    }
  };

  const addRecipeToNotebook = async (notebookId: string, recipeId: string) => {
    try {
      // Pour l'instant, on garde la logique simple en attendant l'API complète
      setNotebooks(prev =>
        prev.map(notebook => {
          if (notebook.id === notebookId && !notebook.recipeIds.includes(recipeId)) {
            return {
              ...notebook,
              recipeIds: [...notebook.recipeIds, recipeId],
              updatedAt: Date.now()
            };
          }
          return notebook;
        })
      );
    } catch (err) {
      setError('Erreur lors de l\'ajout de la recette au carnet');
    }
  };

  const removeRecipeFromNotebook = async (notebookId: string, recipeId: string) => {
    try {
      setNotebooks(prev =>
        prev.map(notebook =>
          notebook.id === notebookId
            ? { 
                ...notebook, 
                recipeIds: notebook.recipeIds.filter((id: string) => id !== recipeId),
                updatedAt: Date.now()
              }
            : notebook
        )
      );
    } catch (err) {
      setError('Erreur lors de la suppression de la recette du carnet');
    }
  };

  // 📖 GESTION DES LIVRES (version simplifiée pour l'instant)
  const createBook = async (title: string, selectedRecipeIds: string[]) => {
    const newBook = {
      id: `book-${Date.now()}`,
      title,
      recipeIds: [...selectedRecipeIds],
      status: 'draft',
      createdAt: Date.now()
    };
    setBooks(prev => [newBook, ...prev]);
    return newBook;
  };

  const updateBook = async (id: string, bookData: any) => {
    setBooks(prev =>
      prev.map(book => book.id === id ? { ...book, ...bookData } : book)
    );
  };

  const addRecipeToBook = async (bookId: string, recipeId: string) => {
    setBooks(prev =>
      prev.map(book => {
        if (book.id === bookId && !book.recipeIds.includes(recipeId)) {
          return { ...book, recipeIds: [...book.recipeIds, recipeId] };
        }
        return book;
      })
    );
  };

  const removeRecipeFromBook = async (bookId: string, recipeId: string) => {
    setBooks(prev =>
      prev.map(book =>
        book.id === bookId
          ? { ...book, recipeIds: book.recipeIds.filter((id: string) => id !== recipeId) }
          : book
      )
    );
  };

  return (
    <RecipesContext.Provider
      value={{
        // Recettes
        recipes,
        addRecipe,
        updateRecipe,
        deleteRecipe,
        
        // Carnets
        notebooks,
        createNotebook,
        addRecipeToNotebook,
        removeRecipeFromNotebook,
        
        // Livres
        books,
        createBook,
        updateBook,
        addRecipeToBook,
        removeRecipeFromBook,
        
        // État
        loading,
        error
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
