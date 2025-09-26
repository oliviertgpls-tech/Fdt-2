"use client";

import React, { useState } from 'react';
import { Plus, Eye, Move, Trash2, ArrowLeft, Edit3, X } from 'lucide-react';
import { useRecipes } from "@/contexts/RecipesProvider";
import { useParams, useRouter } from "next/navigation";
import Link from 'next/link';
import { useToast } from '@/components/Toast';

export default function CarnetEditPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { notebooks, recipes, addRecipeToNotebook, removeRecipeFromNotebook, createBook, updateNotebook } = useRecipes();
  
  // États pour l'édition du carnet
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [carnetTitle, setCarnetTitle] = useState('');
  const [carnetDescription, setCarnetDescription] = useState('');
  
  // Trouver le carnet actuel
  const currentCarnet = notebooks.find(n => n.id === id);

  // Initialiser les états avec les valeurs actuelles
  React.useEffect(() => {
    if (currentCarnet) {
      setCarnetTitle(currentCarnet.title);
      setCarnetDescription(currentCarnet.description || '');
    }
  }, [currentCarnet]);

  // Gestion du cas où le carnet n'existe pas
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

  // Fonctions pour les actions
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
      showToast('Erreur lors de la création du livre', 'error');
    }
  };

  // Fonctions pour sauvegarder les modifications
  const saveTitle = async () => {
    if (!carnetTitle.trim()) return;
    
    try {
      await updateNotebook(actualCarnet.id, { title: carnetTitle.trim() });
      setEditingTitle(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du titre:', error);
      showToast('Erreur lors de la sauvegarde du titre', 'error');
    }
  };

  const saveDescription = async () => {
    try {
      await updateNotebook(actualCarnet.id, { description: carnetDescription.trim() });
      setEditingDescription(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la description:', error);
      showToast('Erreur lors de la sauvegarde de la description', 'error');
    }
  };

  const cancelTitleEdit = () => {
    setCarnetTitle(actualCarnet.title);
    setEditingTitle(false);
  };

  const cancelDescriptionEdit = () => {
    setCarnetDescription(actualCarnet.description || '');
    setEditingDescription(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 space-y-6 md:space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(`/carnets/${id}`)}
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">✏️ Edition </h1>
            <p className="text-gray-600">
              {actualCarnet.recipeIds ? actualCarnet.recipeIds.length : 0} recettes actuellement
            </p>
          </div>
        </div>
        
        <Link
          href={`/carnets/${id}`}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
        >
          <Eye className="w-4 h-4" />
          Voir
        </Link>
      </div>

      {/* SECTION ÉDITION DU CARNET */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        <h2 className="text-xl font-semibold text-gray-800">📝 Informations du carnet</h2>
        
        {/* Titre du carnet */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-gray-700">Nom du carnet</label>
            <button
              onClick={() => setEditingTitle(!editingTitle)}
              className="text-gray-500 hover:text-gray-700 p-1"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>
          
          {editingTitle ? (
            <div className="space-y-3">
              <input
                type="text"
                value={carnetTitle}
                onChange={(e) => setCarnetTitle(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                placeholder="Nom du carnet..."
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={saveTitle}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  Sauvegarder
                </button>
                <button
                  onClick={cancelTitleEdit}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                >
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <div className="text-lg font-semibold text-gray-900 py-2 px-3 bg-gray-50 rounded-lg">
              {actualCarnet.title}
            </div>
          )}
        </div>

        {/* Description du carnet */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-gray-700">Description</label>
            <button
              onClick={() => setEditingDescription(!editingDescription)}
              className="text-gray-500 hover:text-gray-700 p-1"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>
          
          {editingDescription ? (
            <div className="space-y-3">
              <textarea
                value={carnetDescription}
                onChange={(e) => setCarnetDescription(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                placeholder="Description du carnet..."
                rows={3}
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={saveDescription}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  Sauvegarder
                </button>
                <button
                  onClick={cancelDescriptionEdit}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                >
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <div className="text-gray-700 py-2 px-3 bg-gray-50 rounded-lg min-h-[50px]">
              {actualCarnet.description || 'Aucune description'}
            </div>
          )}
        </div>
      </div>

      {/* SECTION GESTION DES RECETTES */}
      <div className="space-y-4">
        
        {/* Recettes dans le carnet */}
        <div className="bg-white rounded-xl border border-gray-200 p-3 md:p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-3 md:mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              📚 Recettes dans ce carnet ({carnetRecipes.length})
            </h3>
          </div>

          {carnetRecipes.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-4">📝</div>
              <p>Aucune recette dans ce carnet</p>
              <p className="text-sm">Ajoutez-en depuis la liste à droite</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 md:max-h-96 overflow-y-auto">
              {carnetRecipes.map((recipe) => (
                <div key={recipe.id} className="group bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">
                        {recipe.title}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {recipe.description || 'Aucune description'}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>⏱ {recipe.prepMinutes || '?'} min</span>
                        <span>👥 {recipe.servings || '?'} pers</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleRemoveRecipe(actualCarnet.id, recipe.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors w-8 h-8 rounded-full hover:bg-red-50 flex items-center justify-center flex-shrink-0"
                      title="Retirer du carnet"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recettes disponibles à ajouter */}
        <div className="bg-white rounded-xl border border-gray-200 p-3 md:p-4">
          <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4">
            ➕ Ajouter des recettes ({availableRecipes.length})
          </h3>

          {availableRecipes.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-4">✅</div>
              <p>Toutes vos recettes sont déjà dans ce carnet !</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 md:max-h-80 overflow-y-auto">
              {availableRecipes.map((recipe) => (
                <div key={recipe.id} className="group bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">
                        {recipe.title}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {recipe.description || 'Aucune description'}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>⏱ {recipe.prepMinutes || '?'} min</span>
                        <span>👥 {recipe.servings || '?'} pers</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleAddRecipe(actualCarnet.id, recipe.id)}
                      className="bg-green-50 text-green-600 border-2 border-green-200 hover:bg-green-100 hover:border-green-300 hover:text-green-700 transition-all duration-200 w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 font-medium"
                      title="Ajouter au carnet"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}