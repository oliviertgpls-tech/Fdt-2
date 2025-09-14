"use client";

import React, { useState } from 'react';
import { Plus, Eye, Edit3, X, Trash2 } from 'lucide-react';
import { useRecipes } from "@/contexts/RecipesProvider";
import Link from 'next/link';

export default function CarnetsPage() {
  const { notebooks, createNotebook, recipes } = useRecipes();
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // ✅ CORRECTION - États séparés pour éviter les conflits
  const [newNotebookTitle, setNewNotebookTitle] = useState('');
  const [newNotebookDescription, setNewNotebookDescription] = useState('');

  const handleCreateCarnet = async () => {
    if (!newNotebookTitle.trim()) return;
    
    try {
      await createNotebook(newNotebookTitle.trim(), newNotebookDescription.trim());
      // Reset des champs après création
      setNewNotebookTitle('');
      setNewNotebookDescription('');
      setShowCreateModal(false);
    } catch (error) {
      console.error('Erreur lors de la création du carnet:', error);
    }
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
                className="flex-1 bg-orange-600 text-white py-3 rounded-lg font-medium hover:bg-orange-700 disabled:opacity-50 transition-colors"
              >
                ✨ Créer le carnet
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <section className="space-y-8">
      {/* 🚀 EN-TÊTE AVEC BOUTON NOUVEAU CARNET */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📚 Mes Carnets</h1>
          <p className="text-gray-600 mt-1">
            Organisez vos recettes par thème et créez vos livres
          </p>
        </div>
        
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-orange-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg hover:bg-orange-700 transition-colors font-medium flex items-center gap-2 text-sm md:text-base self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 md:w-5 md:h-5" />
          <span className="sm:hidden">Nouveau</span>
          <span className="hidden sm:inline">Nouveau carnet</span>
        </button>
      </div>

      {notebooks.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Aucun carnet pour l'instant
          </h3>
          <p className="text-gray-600 mb-6">
            Les carnets permettent d'organiser vos recettes par thème
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors font-medium inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Créer mon premier carnet
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {notebooks.map((carnet) => {
            const carnetRecipeCount = carnet.recipeIds?.length || 0;
            
            return (
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
                    <span>{carnetRecipeCount} recettes</span>
                    {carnetRecipeCount > 0 && (
                      <span className="text-green-600">Prêt à imprimer</span>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Link
                      href={`/carnets/${carnet.id}`}
                      className="flex-1 bg-blue-100 text-blue-700 py-2 rounded-lg hover:bg-blue-200 transition-colors font-medium text-sm text-center"
                    >
                      Voir
                    </Link>
                    <Link
                      href={`/carnets/${carnet.id}/edit`}
                      className="px-3 py-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showCreateModal && <CreateCarnetModal />}
    </section>
  );
}
