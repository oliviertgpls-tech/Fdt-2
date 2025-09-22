"use client";

import React, { useState, useMemo } from 'react';
import { Plus, Eye, X} from 'lucide-react';
import { useRecipes } from "@/contexts/RecipesProvider";
import Link from 'next/link';

// Composant Skeleton pour les cartes de carnets
function NotebookCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
      {/* Image skeleton */}
      <div className="aspect-[4/3] bg-gray-200"></div>
      
      {/* Contenu skeleton */}
      <div className="p-4 md:p-6 space-y-3">
        {/* Titre */}
        <div className="h-5 bg-gray-200 rounded w-3/4"></div>
        
        {/* Description */}
        <div className="space-y-2">
          <div className="h-3 bg-gray-150 rounded w-full"></div>
          <div className="h-3 bg-gray-150 rounded w-2/3"></div>
        </div>
        
        {/* Métadonnées */}
        <div className="flex items-center justify-between pt-2">
          <div className="h-3 bg-gray-200 rounded w-20"></div>
          <div className="h-3 bg-gray-200 rounded w-24"></div>
        </div>
        
        {/* Boutons */}
        <div className="flex gap-2 pt-2">
          <div className="flex-1 h-8 bg-gray-150 rounded-lg"></div>
          <div className="w-8 h-8 bg-gray-150 rounded-lg"></div>
          <div className="w-8 h-8 bg-gray-150 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
}

// Composant Skeleton pour l'état de chargement
function NotebooksLoadingSkeleton() {
  return (
    <section className="space-y-6 md:space-y-8">
      {/* En-tête skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-5 bg-gray-150 rounded w-64 animate-pulse"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded w-40 animate-pulse"></div>
      </div>

      {/* Grille de cartes skeleton */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, index) => (
          <NotebookCardSkeleton key={index} />
        ))}
      </div>
    </section>
  );
}

export default function CarnetsPage() {
  const { notebooks, createNotebook, recipes, deleteNotebook, loading } = useRecipes();
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // ✅ ÉTATS COMPLÈTEMENT SÉPARÉS - CHACUN SA VARIABLE
  const [carnetTitle, setCarnetTitle] = useState('');
  const [carnetDescription, setCarnetDescription] = useState('');

  // Recettes du carnet
  const carnetRecipes = recipes;

  // ✅ TOUTES LES FONCTIONS DANS LE COMPOSANT
  const handleCreateCarnet = async () => {
    if (!carnetTitle.trim()) return;
    
    try {
      await createNotebook(carnetTitle.trim(), carnetDescription.trim());
      setCarnetTitle('');
      setCarnetDescription('');
    } catch (error) {
      console.error('Erreur lors de la création du carnet:', error);
    }
  };

  const resetForm = () => {
    setCarnetTitle('');
    setCarnetDescription('');
    setShowCreateModal(false);
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
              onClick={resetForm}
              className="text-gray-400 hover:text-gray-600 p-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            {/* ✅ CHAMP TITRE - VARIABLE DÉDIÉE */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nom du carnet *
              </label>
              <input
                type="text"
                value={carnetTitle}
                onChange={(e) => setCarnetTitle(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none"
                placeholder="Ex: Desserts de Mamie, Plats du dimanche, Recettes végé..."
                autoFocus
              />
            </div>

            {/* ✅ CHAMP DESCRIPTION - VARIABLE SÉPARÉE */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description (optionnel)
              </label>
              <textarea
                rows={3}
                value={carnetDescription}
                onChange={(e) => setCarnetDescription(e.target.value)}
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

            <div className="inline-flex gap-3 pt-4">
              <button
                onClick={resetForm}
                className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateCarnet}
                disabled={!carnetTitle.trim()}
                className="flex-1 bg-orange-600 text-white px-3 py-2 rounded-lg font-medium hover:bg-orange-700 disabled:opacity-50 transition-colors"
              >
                ✨ Créer le carnet
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Composant pour afficher les vignettes des recettes du carnet
  function CarnetThumbnails({ carnetId, recipes }: { carnetId: string, recipes: any[] }) {
    // Récupérer les recettes du carnet avec des images
    const carnetRecipes = recipes.filter(recipe => 
      recipe.imageUrl
    ).slice(0, 4);

    if (carnetRecipes.length === 0) {
      // Fallback vers l'icône si aucune image
      return (
        <div className="aspect-[4/3] bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center text-6xl">
          📋
        </div>
      );
    }

    // Affichage en mosaïque selon le nombre d'images
    if (carnetRecipes.length === 1) {
      return (
        <div className="aspect-[4/3] bg-gray-100 rounded-t-xl overflow-hidden">
          <img 
            src={carnetRecipes[0].imageUrl} 
            alt={carnetRecipes[0].title}
            className="w-full h-full object-cover"
          />
        </div>
      );
    }

    if (carnetRecipes.length === 2) {
      return (
        <div className="aspect-[4/3] bg-gray-100 rounded-t-xl overflow-hidden grid grid-cols-2 gap-0.5">
          {carnetRecipes.map((recipe, index) => (
            <img 
              key={recipe.id}
              src={recipe.imageUrl} 
              alt={recipe.title}
              className="w-full h-full object-cover"
            />
          ))}
        </div>
      );
    }

    if (carnetRecipes.length === 3) {
      return (
        <div className="aspect-[4/3] bg-gray-100 rounded-t-xl overflow-hidden grid grid-cols-2 gap-0.5">
          <img 
            src={carnetRecipes[0].imageUrl} 
            alt={carnetRecipes[0].title}
            className="w-full h-full object-cover"
          />
          <div className="grid grid-rows-2 gap-0.5">
            <img 
              src={carnetRecipes[1].imageUrl} 
              alt={carnetRecipes[1].title}
              className="w-full h-full object-cover"
            />
            <img 
              src={carnetRecipes[2].imageUrl} 
              alt={carnetRecipes[2].title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      );
    }

    // 4 images ou plus
    return (
      <div className="aspect-[4/3] bg-gray-100 rounded-t-xl overflow-hidden grid grid-cols-2 grid-rows-2 gap-0.5">
        {carnetRecipes.slice(0, 4).map((recipe, index) => (
          <div key={recipe.id} className="relative">
            <img 
              src={recipe.imageUrl} 
              alt={recipe.title}
              className="w-full h-full object-cover"
            />
            {/* Badge "+X" si plus de 4 recettes */}
            {index === 3 && carnetRecipes.length > 4 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  +{carnetRecipes.length - 3}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <section className="space-y-8">
      {/* 🚀 EN-TÊTE AVEC BOUTON NOUVEAU CARNET */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📚 Mes Carnets</h1>
          <p className="text-gray-600 mt-1">
            Organisez vos recettes par thèmatique
          </p>
        </div>
        
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-3 md:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm md:text-base self-start"
        >
          <span className="sm:hidden">✨ Nouveau Carnet</span>
          <span className="hidden sm:inline">✨ Nouveau carnet</span>
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
            const carnetRecipes = recipes.filter(recipe => 
              carnet.recipeIds?.includes(recipe.id)
            );
            
            return (
              <div key={carnet.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                <Link href={`/carnets/${carnet.id}`}>
                  {/* 🆕 VIGNETTES AU LIEU D'ICÔNE */}
                  <CarnetThumbnails carnetId={carnet.id} recipes={carnetRecipes} />
                  
                  <div className="p-6">
                    <h3 className="font-semibold text-gray-900 text-lg mb-2">
                      {carnet.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                      {carnet.description || "Aucune description"}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>{carnetRecipeCount} recettes</span>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}

      {showCreateModal && <CreateCarnetModal />}
    </section>
  );
}
