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
  deleteNotebook: (id: string) => Promise<void>;
  updateNotebook: (id: string, updates: { title?: string; description?: string }) => Promise<void>;
  
  // 📖 LIVRES IMPRIMABLES (versions print avec recettes sélectionnées)
  books: any[];
  createBook: (title: string, selectedRecipeIds: string[]) => Promise<any>;
  updateBook: (id: string, bookData: any) => Promise<void>;
  addRecipeToBook: (bookId: string, recipeId: string) => Promise<void>;
  removeRecipeFromBook: (bookId: string, recipeId: string) => Promise<void>;
  deleteBook: (id: string) => Promise<void>; // 🆕
  
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
        fetch('/api/books')
      ]);
      
      // ✅ Vérifier les réponses avant de parser
      const recipesData = recipesRes.ok ? await recipesRes.json() : [];
      const notebooksData = notebooksRes.ok ? await notebooksRes.json() : [];
      const booksData = booksRes.ok ? await booksRes.json() : [];
    
      
      // ✅ S'assurer que ce sont des arrays
      setRecipes(Array.isArray(recipesData) ? recipesData : []);
      setNotebooks(Array.isArray(notebooksData) ? notebooksData : []);
      setBooks(Array.isArray(booksData) ? booksData : []);
      
      setError(null);
    } catch (err) {
      console.error('Erreur loadData:', err);
      setError('Erreur lors du chargement des données');
      // ✅ En cas d'erreur, initialiser avec des arrays vides
      setRecipes([]);
      setNotebooks([]);
      setBooks([]);
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
    const response = await fetch(`/api/notebooks/${notebookId}/recipes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipeId })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erreur lors de l\'ajout');
    }
    
    // Mettre à jour le state local après succès de l'API
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
  } catch (err: any) {
    console.error('Erreur addRecipeToNotebook:', err);
    setError('Erreur lors de l\'ajout de la recette au carnet');
    throw err;
  }
};

const removeRecipeFromNotebook = async (notebookId: string, recipeId: string) => {
  try {
    const response = await fetch(`/api/notebooks/${notebookId}/recipes?recipeId=${recipeId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erreur lors de la suppression');
    }
    
    // Mettre à jour le state local après succès de l'API
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
  } catch (err: any) {
    console.error('Erreur removeRecipeFromNotebook:', err);
    setError('Erreur lors de la suppression de la recette du carnet');
    throw err;
  }
};

  const updateNotebook = async (id: string, updates: { title?: string; description?: string }) => {
  try {
    const response = await fetch(`/api/notebooks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erreur lors de la mise à jour');
    }
    
    const updatedNotebook = await response.json();
    setNotebooks(prev => 
      prev.map(notebook => notebook.id === id ? updatedNotebook : notebook)
    );
  } catch (err: any) {
    console.error('Erreur updateNotebook:', err);
    setError('Erreur lors de la mise à jour du carnet');
    throw err;
  }
};


  // SUPPRIMER UN CARNET
 const deleteNotebook = async (id: string) => {
    try {
      const response = await fetch(`/api/notebooks/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la suppression du carnet');
      }
      
      setNotebooks(prev => prev.filter(notebook => notebook.id !== id));
    } catch (err: any) {
      console.error('Erreur deleteNotebook:', err);
      setError('Erreur lors de la suppression du carnet');
      throw err;
    }
  };

  // 📖 GESTION DES LIVRES 

  const createBook = async (title: string, selectedRecipeIds: string[]) => {
    try {
    // DEBUG
    console.log('🔍 createBook appelé avec:', { title, selectedRecipeIds });
    console.log('🔍 Type selectedRecipeIds:', typeof selectedRecipeIds, Array.isArray(selectedRecipeIds));
    
      const response = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title, 
          recipeIds: selectedRecipeIds,
          description: undefined,
          coverImageUrl: undefined
        })
      });
      
      if (!response.ok) throw new Error('Erreur lors de la création du livre');
      
      const newBook = await response.json();
      setBooks(prev => [newBook, ...prev]);
      return newBook;
    } catch (err) {
      setError('Erreur lors de la création du livre');
      throw err;
    }
  };
  
  const updateBook = async (id: string, bookData: any) => {
    try {
      const response = await fetch(`/api/books/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la mise à jour');
      }
      
      const updatedBook = await response.json();
      setBooks(prev =>
        prev.map(book => book.id === id ? updatedBook : book)
      );
    } catch (err: any) {
      console.error('Erreur updateBook:', err);
      setError('Erreur lors de la mise à jour du livre');
      throw err;
    }
  };
  
  const addRecipeToBook = async (bookId: string, recipeId: string) => {
    try {
      const response = await fetch(`/api/books/${bookId}/recipes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipeId })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de l\'ajout');
      }
      
      // Mettre à jour le state local après succès de l'API
      setBooks(prev =>
        prev.map(book => {
          if (book.id === bookId && !book.recipeIds.includes(recipeId)) {
            return { ...book, recipeIds: [...book.recipeIds, recipeId] };
          }
          return book;
        })
      );
    } catch (err: any) {
      console.error('Erreur addRecipeToBook:', err);
      setError('Erreur lors de l\'ajout de la recette au livre');
      throw err;
    }
  };
  
  const removeRecipeFromBook = async (bookId: string, recipeId: string) => {
    try {
      const response = await fetch(`/api/books/${bookId}/recipes?recipeId=${recipeId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la suppression');
      }
      
      // Mettre à jour le state local après succès de l'API
      setBooks(prev =>
        prev.map(book =>
          book.id === bookId
            ? { ...book, recipeIds: book.recipeIds.filter((id: string) => id !== recipeId) }
            : book
        )
      );
    } catch (err: any) {
      console.error('Erreur removeRecipeFromBook:', err);
      setError('Erreur lors de la suppression de la recette du livre');
      throw err;
    }
  };

  // 🆕 NOUVELLE FONCTION : Supprimer un livre
  const deleteBook = async (id: string) => {
    try {
      const response = await fetch(`/api/books/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Erreur lors de la suppression du livre');
      
      setBooks(prev => prev.filter(book => book.id !== id));
    } catch (err) {
      setError('Erreur lors de la suppression du livre');
      throw err;
    }
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
        deleteNotebook, 
        updateNotebook,
        
        // Livres
        books,
        createBook,
        updateBook,
        addRecipeToBook,
        removeRecipeFromBook,
        deleteBook, 
        
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
