"use client";

import React from 'react';
import { Plus, Eye, Move, Trash2, ArrowRight, ArrowLeft } from 'lucide-react';
import { useRecipes } from "@/contexts/RecipesProvider";
import { useParams, useRouter } from "next/navigation";
import Link from 'next/link';

export default function CarnetEditPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { notebooks, recipes, addRecipeToNotebook, removeRecipeFromNotebook, createBook } = useRecipes();
  
  // Trouver le carnet actuel
  const currentCarnet = notebooks.find(n => n.id === id);

  if (!currentCarnet) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Carnet introuvable</h2>
          <p className="text-gray-600 mb-6">Ce carnet n'existe pas ou a été supprimé.</p>
          <button
            onClick={() => router.push('/carnets')}
            className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors"
          >
            ← Retour aux carnets
          </button>
        </div>
      </div>
    );
  }

  // Rechercher le carnet mis à jour dans le state
  const actualCarnet = notebooks.find(n => n.id === currentCarnet.id) || currentCarnet;
  
  const carnetRecipes = recipes.filter(recipe => 
    actualCarnet.recipeIds && actualCarnet.recipeIds.includes(recipe.id)
  );
  const availableRecipes = recipes.filter(recipe => 
    !actualCarnet.recipeIds || !actualCarnet.recipeIds.includes(recipe.id)
  );

  const handleAddRecipe = (carnetId: string, recipeId: string) => {
    addRecipeToNotebook(carnetId, recipeId);
  };

  const handleRemoveRecipe = (carnetId: string, recipeId: string) => {
    removeRecipeFromNotebook(carnetId, recipeId);
  };

  const handleCreateBookFromCarnet = async () => {
    if (!actualCarnet || !carnetRecipes.length) return;
    
    try {
      const bookTitle = `Livre - ${actualCarnet.title}`;
      const recipeIds = carnetRecipes.map(r => r.id);
      
      const newBook = await createBook(bookTitle, recipeIds);
      
      // Rediriger vers la page du livre créé
      router.push(`/livres/${newBook.id}`);
    } catch (error) {
      console.error('Erreur lors de la création du livre:', error);
      alert('Erreur lors de la création du livre');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(`/carnets/${id}`)}
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">✏️ Modifier - {actualCarnet.title}</h1>
            <p className="text-gray-600">
              {actualCarnet.recipeIds ? actualCarnet.recipeIds.length : 0} recettes dans ce carnet
            </p>
          </div>
        </div>
        
        <Link
          href={`/carnets/${id}`}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
        >
          <Eye className="w-4 h-4" />
          Voir le carnet
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            📝 Recettes disponibles ({availableRecipes.length})
          </h2>
          
          {availableRecipes.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <div className="text-4xl mb-3">🎉</div>
              <p className="text-gray-600">Toutes vos recettes sont dans ce carnet !</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {availableRecipes.map((recipe) => (
                <div key={recipe.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex gap-4">
                    <img 
                      src={recipe.imageUrl || 'https://images.unsplash.com/photo-1546548970-71785318a17b?q=80&w=100'} 
                      alt={recipe.title}
                      className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">{recipe.title}</h4>
                      <p className="text-sm text-gray-600">par {recipe.author || 'Anonyme'}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        ⏱️ {recipe.prepMinutes || '?'}min
                      </p>
                    </div>
                    <button
                      onClick={() => handleAddRecipe(actualCarnet.id, recipe.id)}
                      className="bg-green-100 text-green-700 px-3 py-2 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium self-start flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Ajouter
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            📋 Dans le carnet ({carnetRecipes.length})
          </h2>
          
          {carnetRecipes.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <div className="text-4xl mb-3">📋</div>
              <h4 className="font-medium text-gray-800 mb-2">Carnet vide</h4>
              <p className="text-gray-600">Ajoutez vos premières recettes</p>
            </div>
          ) : (
            <div className="space-y-4">
              {carnetRecipes.map((recipe, index) => (
                <div key={recipe.id} className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="w-6 h-6 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                        {index + 1}
                      </span>
                      <Move className="w-4 h-4 text-gray-400 cursor-move" />
                    </div>
                    
                    <img 
                      src={recipe.imageUrl || 'https://images.unsplash.com/photo-1546548970-71785318a17b?q=80&w=100'} 
                      alt={recipe.title}
                      className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">{recipe.title}</h4>
                      <p className="text-sm text-gray-600">par {recipe.author || 'Anonyme'}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        ⏱️ {recipe.prepMinutes || '?'}min
                      </p>
                    </div>
                    
                    <button
                      onClick={() => handleRemoveRecipe(actualCarnet.id, recipe.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors self-start p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* BOUTON CRÉER UN LIVRE */}
      {carnetRecipes.length > 0 && (
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-6 text-center">
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-orange-800 mb-2">
              📖 Créer un livre avec ces recettes
            </h3>
            <p className="text-sm text-orange-700 mb-4">
              Transformez ce carnet en un beau livre à imprimer avec toutes ses recettes
            </p>
            <button
              onClick={handleCreateBookFromCarnet}
              className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors font-medium inline-flex items-center gap-2"
            >
              Créer un livre avec {carnetRecipes.length} recettes
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
