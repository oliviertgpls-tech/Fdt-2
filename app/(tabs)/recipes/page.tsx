"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { useRecipes } from "@/contexts/RecipesProvider";
import { Nut, NutIcon } from 'lucide-react';

// Composant Skeleton pour les cartes de recettes
function RecipeCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
      {/* Image skeleton */}
      <div className="aspect-[4/3] bg-gray-200"></div>
      
      {/* Contenu skeleton */}
      <div className="p-4 space-y-3">
        {/* Titre */}
        <div className="h-5 bg-gray-200 rounded w-3/4"></div>
        
        {/* Auteur */}
        <div className="h-4 bg-gray-150 rounded w-1/2"></div>
        
        {/* Description */}
        <div className="space-y-2">
          <div className="h-3 bg-gray-150 rounded w-full"></div>
          <div className="h-3 bg-gray-150 rounded w-2/3"></div>
        </div>
        
        {/* Métadonnées */}
        <div className="flex items-center gap-4 pt-2">
          <div className="h-3 bg-gray-200 rounded w-16"></div>
          <div className="h-3 bg-gray-200 rounded w-20"></div>
        </div>
        
        {/* Tags */}
        <div className="flex gap-1 pt-2">
          <div className="h-6 bg-gray-150 rounded-full w-12"></div>
          <div className="h-6 bg-gray-150 rounded-full w-16"></div>
          <div className="h-6 bg-gray-150 rounded-full w-10"></div>
        </div>
      </div>
    </div>
  );
}

// Composant Skeleton pour l'état de chargement
function RecipesLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* En-tête skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-5 bg-gray-150 rounded w-64 animate-pulse"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded w-40 animate-pulse"></div>
      </div>

      {/* Barre de recherche skeleton */}
      <div className="relative">
        <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
      </div>

      {/* Grille de cartes skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, index) => (
          <RecipeCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}

export default function RecipesPage() {
  const { recipes, loading } = useRecipes();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRecipes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return recipes;
    
    return recipes.filter((recipe) => {
      const searchText = [
        recipe.title || "",
        ...(recipe.tags || []),
        ...(recipe.ingredients || []),
        recipe.steps || "",
        recipe.author || "",
        recipe.description || "",
      ]
        .join(" ")
        .toLowerCase();
      return searchText.includes(query);
    });
  }, [recipes, searchQuery]);

  // 🆕 AFFICHAGE DU SKELETON PENDANT LE CHARGEMENT
  if (loading) {
    return <RecipesLoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
             Mes Recettes</h1>
          <p className="text-gray-600">
            {recipes.length} recette{recipes.length !== 1 ? 's' : ''} dans votre collection
          </p>
        </div>
        <Link 
          href="/add" 
          className="bg-transparent text-blue-700 px-3 md:px-4 py-2  border border-2 color-primary-800 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm md:text-base self-start"
        >
          <span className="sm:hidden">+ Nouvelle Recette</span>
          <span className="hidden sm:inline">+ Nouvelle recette</span>
        </Link>
      </div>

      {/* Barre de recherche */}
      <div>
        <input
          type="text"
          className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          placeholder="Rechercher (titre, ingrédients, auteur, tags...)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Liste des recettes */}
      {filteredRecipes.length === 0 ? (
        <div className="text-center py-12">
          {recipes.length === 0 ? (
            <div className="space-y-4">
              <div className="text-6xl">🍽️</div>
              <h3 className="text-lg font-medium text-gray-900">
                Aucune recette pour l'instant
              </h3>
              <p className="text-gray-600">
                Commencez par ajouter votre première recette !
              </p>
              <Link 
                href="/add"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                ✨ Ajouter ma première recette
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-6xl">🔍</div>
              <h3 className="text-lg font-medium text-gray-900">
                Aucune recette trouvée
              </h3>
              <p className="text-gray-600">
                Essayez avec d'autres mots-clés
              </p>
              <button 
                onClick={() => setSearchQuery("")}
                className="text-blue-600 hover:text-blue-700 underline"
              >
                Voir toutes les recettes
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRecipes.map((recipe) => (
            <Link
              key={recipe.id}
              href={`/recipes/${recipe.id}`}
              className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200"
            >
              {/* Image */}
              {recipe.imageUrl && (
                <div className="aspect-[4/3] bg-gray-100">
                  <img 
                    src={recipe.imageUrl}
                    alt={recipe.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
              )}
              
              {/* Contenu */}
              <div className="p-4 space-y-2">
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {recipe.title}
                </h3>
                
                {recipe.author && (
                  <p className="text-sm text-gray-600">par {recipe.author}</p>
                )}
                
                {recipe.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {recipe.description}
                  </p>
                )}
                
                {/* Métadonnées */}
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  {recipe.prepMinutes && (
                    <span className="flex items-center gap-1">
                      {recipe.prepMinutes} min
                    </span>
                  )}
                  {recipe.ingredients.length > 0 && (
                    <span className="flex items-center gap-1">
                    {recipe.ingredients.length} ingrédients
                    </span>
                  )}
                </div>
                
                {/* Tags */}
                {recipe.tags && recipe.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {recipe.tags.slice(0, 3).map((tag) => (
                      <span
                        className="bg-green-100 text-green-600 px-2 py-1 rounded text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                    {recipe.tags.length > 3 && (
                      <span className="text-xs text-gray-400">
                        +{recipe.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
