"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useRecipes } from "@/contexts/RecipesProvider";
import { ArrowLeft, Edit3, Plus, Search } from "lucide-react";

export default function CarnetPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { notebooks, recipes, createBook } = useRecipes();
  const [searchQuery, setSearchQuery] = useState("");

  // Trouver le carnet
  const carnet = notebooks.find(n => n.id === id);
  
  // Recettes du carnet
  const carnetRecipes = useMemo(() => {
    if (!carnet) return [];
    return recipes.filter(recipe => carnet.recipeIds.includes(recipe.id));
  }, [carnet, recipes]);

  // Filtrage par recherche
  const filteredRecipes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return carnetRecipes;
    
    return carnetRecipes.filter((recipe) => {
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
  }, [carnetRecipes, searchQuery]);

  const handleCreateBookFromCarnet = async () => {
    if (!carnet || !carnetRecipes.length) return;
    
    try {
      const bookTitle = `Livre - ${carnet.title}`;
      const recipeIds = carnetRecipes.map(r => r.id);
      
      const newBook = await createBook(bookTitle, recipeIds);
      
      // Rediriger vers la page du livre créé
      router.push(`/livres/${newBook.id}`);
    } catch (error) {
      console.error('Erreur lors de la création du livre:', error);
      alert('Erreur lors de la création du livre');
    }
  };

  if (!carnet) {
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

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/carnets')}
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📚 {carnet.title}</h1>
            <p className="text-gray-600">
              {carnetRecipes.length} recette{carnetRecipes.length !== 1 ? 's' : ''} dans ce carnet
            </p>
            {carnet.description && (
              <p className="text-gray-500 text-sm mt-1">{carnet.description}</p>
            )}
          </div>
        </div>
        
        <div className="flex gap-3">
          <Link
            href={`/carnets/${id}/edit`}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
          >
            <Edit3 className="w-4 h-4" />
            Modifier
          </Link>
          
          {carnetRecipes.length > 0 && (
            <button
              onClick={handleCreateBookFromCarnet}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors font-medium flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Créer un livre
            </button>
          )}
        </div>
      </div>

      {/* Barre de recherche */}
      {carnetRecipes.length > 0 && (
        <div className="relative">
          <input
            type="text"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 pl-10 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            placeholder="Rechercher dans ce carnet..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      )}

      {/* Liste des recettes */}
      {filteredRecipes.length === 0 ? (
        <div className="text-center py-12">
          {carnetRecipes.length === 0 ? (
            <div className="space-y-4">
              <div className="text-6xl">📋</div>
              <h3 className="text-lg font-medium text-gray-900">
                Carnet vide
              </h3>
              <p className="text-gray-600">
                Ce carnet ne contient aucune recette pour l'instant.
              </p>
              <Link 
                href={`/carnets/${id}/edit`}
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Ajouter des recettes
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
                Voir toutes les recettes du carnet
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
                      ⏱️ {recipe.prepMinutes}min
                    </span>
                  )}
                  {recipe.ingredients && recipe.ingredients.length > 0 && (
                    <span className="flex items-center gap-1">
                      🥄 {recipe.ingredients.length} ingrédients
                    </span>
                  )}
                </div>
                
                {/* Tags */}
                {recipe.tags && recipe.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {recipe.tags.slice(0, 3).map((tag) => (
                      <span 
                        key={tag}
                        className="bg-orange-100 text-orange-600 px-2 py-1 rounded text-xs"
                      >
                        {tag}
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
