"use client";

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Move, Trash2, Plus, Eye, Upload, GripVertical } from 'lucide-react';
import { useRecipes } from "@/contexts/RecipesProvider";

export default function LivreEditorPage() {
  const { id } = useParams();
  const router = useRouter();
  const { recipes } = useRecipes();

  // Livre simulé (en attendant la vraie structure)
  const [book, setBook] = useState({
    id: id,
    title: 'Le Grand Livre de Famille',
    description: 'Toutes nos recettes préférées dans un beau livre',
    recipeIds: ['r1', 'r2', 'r3'],
    createdAt: Date.now(),
    status: 'draft'
  });

  const bookRecipes = recipes.filter(recipe => book.recipeIds.includes(recipe.id))
    .sort((a, b) => book.recipeIds.indexOf(a.id) - book.recipeIds.indexOf(b.id));

  const availableRecipes = recipes.filter(recipe => !book.recipeIds.includes(recipe.id));

  const moveRecipe = (fromIndex: number, toIndex: number) => {
    const newRecipeIds = [...book.recipeIds];
    const [movedId] = newRecipeIds.splice(fromIndex, 1);
    newRecipeIds.splice(toIndex, 0, movedId);
    setBook(prev => ({ ...prev, recipeIds: newRecipeIds }));
  };

  const addRecipe = (recipeId: string) => {
    setBook(prev => ({
      ...prev,
      recipeIds: [...prev.recipeIds, recipeId]
    }));
  };

  const removeRecipe = (recipeId: string) => {
    setBook(prev => ({
      ...prev,
      recipeIds: prev.recipeIds.filter(id => id !== recipeId)
    }));
  };

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-800 transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{book.title}</h1>
            <p className="text-gray-600">
              {book.recipeIds.length} recettes • {(book.recipeIds.length * 2) + 2} pages
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Aperçu
          </button>
          <button className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors font-medium flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Commander
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Colonne principale - Recettes du livre avec drag & drop */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              📖 Contenu du livre
            </h2>
            
            {bookRecipes.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <div className="text-4xl mb-3">📖</div>
                <p>Livre vide - ajoutez des recettes</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* En-tête fixe */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-medium">
                      📖
                    </span>
                    <div>
                      <h4 className="font-medium text-gray-900">Couverture</h4>
                      <p className="text-sm text-gray-600">{book.title}</p>
                    </div>
                  </div>
                </div>

                {/* Recettes drag & drop */}
                {bookRecipes.map((recipe, index) => (
                  <div
                    key={recipe.id}
                    className="bg-orange-50 border border-orange-200 rounded-lg p-4 group"
                  >
                    <div className="flex gap-4">
                      {/* Handle de drag */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="w-8 h-8 bg-orange-500 text-white text-sm rounded-full flex items-center justify-center font-medium">
                          {index + 1}
                        </span>
                        <button 
                          className="opacity-50 group-hover:opacity-100 cursor-move p-1 hover:bg-orange-200 rounded transition-all"
                          title="Glisser pour réorganiser"
                        >
                          <GripVertical className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                      
                      <img 
                        src={recipe.imageUrl} 
                        alt={recipe.title}
                        className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900">{recipe.title}</h4>
                        <p className="text-sm text-gray-600">par {recipe.author}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Pages {((index + 1) * 2) + 1}-{((index + 1) * 2) + 2} • ⏱️ {recipe.prepMinutes}min
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {/* Boutons de réorganisation */}
                        <button
                          onClick={() => index > 0 && moveRecipe(index, index - 1)}
                          disabled={index === 0}
                          className="opacity-50 group-hover:opacity-100 p-1 hover:bg-orange-200 rounded transition-all disabled:opacity-25 disabled:cursor-not-allowed"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => index < bookRecipes.length - 1 && moveRecipe(index, index + 1)}
                          disabled={index === bookRecipes.length - 1}
                          className="opacity-50 group-hover:opacity-100 p-1 hover:bg-orange-200 rounded transition-all disabled:opacity-25 disabled:cursor-not-allowed"
                        >
                          ↓
                        </button>
                        <button
                          onClick={() => removeRecipe(recipe.id)}
                          className="opacity-50 group-hover:opacity-100 text-red-500 hover:text-red-700 p-1 hover:bg-red-100 rounded transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Estimation finale */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                  <div className="text-blue-600 text-sm">
                    <strong>Total :</strong> {(book.recipeIds.length * 2) + 2} pages
                  </div>
                  <div className="text-blue-500 text-xs mt-1">
                    Prix estimé : {((book.recipeIds.length * 2) + 2) * 0.25}€
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Colonne droite - Recettes disponibles */}
        <div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              ➕ Ajouter des recettes
            </h3>
            
            {availableRecipes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-3xl mb-2">🎉</div>
                <p className="text-sm">Toutes vos recettes sont dans ce livre !</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {availableRecipes.map((recipe) => (
                  <div 
                    key={recipe.id} 
                    className="border border-gray-200 rounded-lg p-3 hover:border-orange-300 hover:bg-orange-50 transition-colors cursor-pointer"
                    onClick={() => addRecipe(recipe.id)}
                  >
                    <div className="flex gap-3">
                      <img 
                        src={recipe.imageUrl} 
                        alt={recipe.title}
                        className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h5 className="font-medium text-gray-900 text-sm truncate">
                          {recipe.title}
                        </h5>
                        <p className="text-xs text-gray-600">{recipe.author}</p>
                      </div>
                      <Plus className="w-4 h-4 text-gray-400 self-center" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
