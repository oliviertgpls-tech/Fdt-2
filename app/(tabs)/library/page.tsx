"use client";

import { useState } from "react";
import { useRecipes } from "@/contexts/RecipesProvider";

export default function LibraryPage() {
  const { books, createBook, recipes, addRecipeToBook, removeRecipeFromBook } = useRecipes();
  const [title, setTitle] = useState("");

  return (
    <section className="space-y-8">
      {/* En-tête */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">📚 Mes Carnets</h1>
        <p className="text-gray-600">
          Organisez vos recettes en beaux livres à imprimer et partager
        </p>
      </div>

      {/* Formulaire de création */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Créer un nouveau carnet
        </h2>
        <form
          className="flex gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!title.trim()) return;
            createBook(title.trim());
            setTitle("");
          }}
        >
          <input
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            placeholder="Ex: Recettes de famille, Desserts de Mamie..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <button 
            type="submit"
            className="rounded-lg bg-blue-600 px-6 py-2 text-white font-medium hover:bg-blue-700 transition-colors"
            disabled={!title.trim()}
          >
            Créer
          </button>
        </form>
      </div>

      {/* Liste des carnets */}
      {books.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <div className="text-6xl mb-4">📖</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun carnet pour l'instant
          </h3>
          <p className="text-gray-600">
            Créez votre premier carnet pour organiser vos recettes
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {books.map((book) => (
            <div key={book.id} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{book.title}</h2>
                  <p className="text-gray-600">
                    {book.recipeIds.length} recette{book.recipeIds.length !== 1 ? 's' : ''}
                  </p>
                  {book.description && (
                    <p className="text-gray-600 mt-1">{book.description}</p>
                  )}
                </div>
                <button className="text-gray-400 hover:text-gray-600 p-1">
                  🖨️
                </button>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Recettes disponibles */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">
                    Ajouter des recettes
                  </h3>
                  <div className="max-h-60 overflow-auto rounded-lg border border-gray-200">
                    {recipes
                      .filter((r) => !book.recipeIds.includes(r.id))
                      .map((recipe) => (
                        <div 
                          key={recipe.id} 
                          className="flex items-center justify-between gap-3 p-3 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-900 truncate">
                              {recipe.title}
                            </p>
                            {recipe.author && (
                              <p className="text-sm text-gray-600">par {recipe.author}</p>
                            )}
                          </div>
                          <button
                            onClick={() => addRecipeToBook(book.id, recipe.id)}
                            className="flex-shrink-0 text-sm bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 transition-colors"
                          >
                            + Ajouter
                          </button>
                        </div>
                      ))}
                    {recipes.filter((r) => !book.recipeIds.includes(r.id)).length === 0 && (
                      <p className="p-4 text-gray-500 text-center italic">
                        Toutes vos recettes sont déjà dans ce carnet
                      </p>
                    )}
                  </div>
                </div>

                {/* Recettes dans le carnet */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">
                    Dans ce carnet
                  </h3>
                  <div className="max-h-60 overflow-auto rounded-lg border border-gray-200">
                    {book.recipeIds.map((recipeId) => {
                      const recipe = recipes.find((r) => r.id === recipeId);
                      if (!recipe) return null;
                      return (
                        <div 
                          key={recipeId} 
                          className="flex items-center justify-between gap-3 p-3 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-900 truncate">
                              {recipe.title}
                            </p>
                            {recipe.author && (
                              <p className="text-sm text-gray-600">par {recipe.author}</p>
                            )}
                          </div>
                          <button
                            onClick={() => removeRecipeFromBook(book.id, recipeId)}
                            className="flex-shrink-0 text-sm bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 transition-colors"
                          >
                            Retirer
                          </button>
                        </div>
                      );
                    })}
                    {book.recipeIds.length === 0 && (
                      <p className="p-4 text-gray-500 text-center italic">
                        Aucune recette pour l'instant
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
