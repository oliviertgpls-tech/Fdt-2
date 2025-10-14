"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useRecipes } from "@/contexts/RecipesProvider";
import { ArrowLeft, Edit3, Plus, Trash2 } from "lucide-react";
import { useToast } from '@/components/Toast';
import { ConfirmModal } from '@/components/ConfirmModal';

export default function CarnetPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { notebooks, recipes, createBook, deleteNotebook } = useRecipes();
  const [searchQuery, setSearchQuery] = useState("");
  const { showToast } = useToast();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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
      showToast('Erreur lors de la création du livre', 'error');
    }
  };

    const handleDeleteCarnet = async () => {
      try {
        await deleteNotebook(id);
        showToast('Carnet supprimé', 'success');
        router.push('/carnets');
      } catch (error) {
        console.error('Erreur suppression carnet:', error);
        showToast('Erreur lors de la suppression', 'error');
      }
    };

  // Gestion du carnet introuvable
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

  // Rendu principal - UN SEUL return
  return (
    <div className="space-y-6">
      {/* En-tête amélioré pour mobile */}
      <div className="space-y-4">
        <button
            onClick={() => router.push('/carnets')}
            className="text-orange-600 hover:text-gray-800 underline transition-colors mt-1 flex-shrink-0"
          >
            ← Retour aux carnets
          </button>
        {/* Ligne 1: Bouton retour + Titre */}
        <div className="flex items-start gap-3">
          
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
              📚 {carnet.title}
            </h1>
            {carnet.description && (
        
              <p className="text-gray-600 pt-2 text-sm md:text-base mt-1d">
                {carnet.description}
              </p>
            )}
            
          </div>
        </div>
      </div>

      {/* Barre de recherche */}
      {carnetRecipes.length > 0 && (
        <input
          type="text"
          className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 text-base"
          placeholder="Rechercher dans ce carnet..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      )}

       <p className="text-gray-500 text-sm mt-2 leading-relaxed">
              {carnetRecipes.length} recette{carnetRecipes.length !== 1 ? 's' : ''} dans ce carnet
            </p>

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
            <div>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="text-red-600 mt-3 p-3 rounded-lg hover:bg-red-200 transition-colors items-center gap-1 text-sm font-medium"
                >
                  <span className="sm:inline">Supprimer ce carnet</span>
                </button>
              </div>
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
        <>
          {/* Grille des recettes */}
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
                    <div className="flex flex-wrap gap-2 mt-2">
                      {recipe.tags.slice(0, 3).map((tag) => (
                        <span 
                          key={tag}
                          className="bg-secondary-100 text-secondary-600 px-2 py-1 rounded text-xs"
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

            {/* Ligne 2: Boutons d'actions - Responsive */}
        <div className="flex justify-center flex-wrap gap-2 p-6">
            <button
            onClick={() => setShowDeleteModal(true)} 
            className="text-red-600 px-3 py-2.5 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-1 text-sm font-medium"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Supprimer</span>
          </button>
          <Link
            href={`/carnets/${id}/edit`}
            className="bg-accent-200 text-accent-800 px-4 py-2.5 rounded-lg hover:bg-accent-300 transition-colors font-medium flex items-center gap-2 text-sm"
          >
            <Edit3 className="w-4 h-4" />
            Modifier ce carnet
          </Link>
    
        
          {/* Modale de confirmation */}
                <ConfirmModal
                  isOpen={showDeleteModal}
                  onClose={() => setShowDeleteModal(false)}
                  onConfirm={handleDeleteCarnet}
                  title="Supprimer ce carnet ?"
                  message={`Êtes-vous sûr de vouloir supprimer le carnet "${carnet.title}" ? Cette action est irréversible.`}
                  confirmText="Supprimer"
                  cancelText="Annuler"
                  isDangerous={true}
                />
        </div>

          {/* Section "Créer un livre" en bas - Nouveau design */}
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-6 text-center">
            <div className="max-w-md mx-auto space-y-4">
              <div className="text-4xl">📖</div>
              <h3 className="text-lg md:text-xl font-semibold text-orange-900">
                Créer un livre avec ce carnet
              </h3>
              <p className="text-sm md:text-base text-orange-700 leading-relaxed">
                Transformez ce carnet en un beau livre à imprimer avec toutes ou certaines de ses {carnetRecipes.length} recettes
              </p>
              <button
                onClick={handleCreateBookFromCarnet}
                className="w-full sm:w-auto bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors font-medium inline-flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Créer le livre ({carnetRecipes.length} recettes)
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
