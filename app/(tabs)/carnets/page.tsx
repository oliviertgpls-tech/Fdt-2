"use client";

import React, { useState } from 'react';
import { Plus, Eye, Move, Trash2, X, ArrowRight } from 'lucide-react';
import { useRecipes } from "@/contexts/RecipesProvider";
import Link from 'next/link';

export default function CarnetsPage() {
  const { notebooks, createNotebook, recipes, addRecipeToNotebook, removeRecipeFromNotebook } = useRecipes();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentCarnet, setCurrentCarnet] = useState<any>(null);
  
  // ✅ CORRECTION - États séparés pour éviter les conflits
  const [newNotebookTitle, setNewNotebookTitle] = useState('');
  const [newNotebookDescription, setNewNotebookDescription] = useState('');

  const handleCreateCarnet = () => {
    if (!newNotebookTitle.trim()) return;
    createNotebook(newNotebookTitle.trim(), newNotebookDescription.trim());
    // Reset des champs après création
    setNewNotebookTitle('');
    setNewNotebookDescription('');
    setShowCreateModal(false);
  };

  const handleAddRecipe = (carnetId: string, recipeId: string) => {
    addRecipeToNotebook(carnetId, recipeId);
  };

  const handleRemoveRecipe = (carnetId: string, recipeId: string) => {
    removeRecipeFromNotebook(carnetId, recipeId);
  };

  const CreateCarnetModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full shadow-2xl">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Créer un nouveau carnet</h2>
              <p className="text-gray-600 mt-1">Organisez vos recettes par thème</p>
            </div>
            <button 
              onClick={() => {
                setShowCreateModal(false);
                // Reset des champs à la fermeture
                setNewNotebookTitle('');
                setNewNotebookDescription('');
              }}
              className="text-gray-400 hover:text-gray-600 p-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nom du carnet *
              </label>
              <input
                type="text"
                value={newNotebookTitle}
                onChange={(e) => setNewNotebookTitle(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none"
                placeholder="Ex: Desserts de Mamie, Plats du dimanche, Recettes végé..."
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description (optionnel)
              </label>
              <textarea
                rows={3}
                value={newNotebookDescription}
                onChange={(e) => setNewNotebookDescription(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none resize-none"
                placeholder="Décrivez le thème de ce carnet..."
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="text-blue-500 text-xl">💡</div>
                <div>
                  <h4 className="font-medium text-blue-800 mb-1">Astuce</h4>
                  <p className="text-sm text-blue-700">
                    Les carnets vous aident à organiser vos recettes. Plus tard, vous pourrez créer des livres à imprimer à partir de vos carnets !
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewNotebookTitle('');
                  setNewNotebookDescription('');
                }}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateCarnet}
                disabled={!newNotebookTitle.trim()}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                ✨ Créer le carnet
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const CarnetsLibrary = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📚 Mes Carnets</h1>
          <p className="text-gray-600 mt-1">
            Organisez vos recettes par thème et créez vos livres
          </p>
        </div>
        
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nouveau carnet
        </button>
      </div>

      {notebooks.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Aucun carnet pour l'instant
          </h3>
          <p className="text-gray-600 mb-6">
            Créez votre premier carnet pour organiser vos recettes
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Créer mon premier carnet
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {notebooks.map((carnet) => (
            <div key={carnet.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-[4/3] bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center text-6xl">
                📋
              </div>
              
              <div className="p-6">
                <h3 className="font-semibold text-gray-900 text-lg mb-2">
                  {carnet.title}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                  {carnet.description || "Aucune description"}
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>{carnet.recipeIds?.length || 0} recettes</span>
                  {(carnet.recipeIds?.length || 0) > 0 && (
                    <span className="text-green-600">Prêt à imprimer</span>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentCarnet(carnet)}
                    className="flex-1 bg-blue-100 text-blue-700 py-2 rounded-lg hover:bg-blue-200 transition-colors font-medium text-sm"
                  >
                    Gérer
                  </button>
                  <button className="px-3 py-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const CarnetEditor = () => {
    if (!currentCarnet) return null;
    
    // Rechercher le carnet mis à jour dans le state
    const actualCarnet = notebooks.find(n => n.id === currentCarnet.id) || currentCarnet;
    
    const carnetRecipes = recipes.filter(recipe => 
      actualCarnet.recipeIds && actualCarnet.recipeIds.includes(recipe.id)
    );
    const availableRecipes = recipes.filter(recipe => 
      !actualCarnet.recipeIds || !actualCarnet.recipeIds.includes(recipe.id)
    );

    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentCarnet(null)}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              ← Retour aux carnets
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{actualCarnet.title}</h1>
              <p className="text-gray-600">
                {actualCarnet.recipeIds ? actualCarnet.recipeIds.length : 0} recettes dans ce carnet
              </p>
            </div>
          </div>
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
              <Link
                href={`/livres/nouveau?carnet=${actualCarnet.id}`}
                className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors font-medium inline-flex items-center gap-2"
              >
                Créer un livre avec {carnetRecipes.length} recettes
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <section className="space-y-8">
      {currentCarnet ? <CarnetEditor /> : <CarnetsLibrary />}
      {showCreateModal && <CreateCarnetModal />}
    </section>
  );
}
