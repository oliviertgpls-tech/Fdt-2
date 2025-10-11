"use client";

import React, { useState } from 'react';
import { Plus, Eye, Download, X, Loader } from 'lucide-react';
import { useRecipes } from "@/contexts/RecipesProvider";
import Link from 'next/link';
import { CreateBookModal } from '@/components/CreateBookModal';
import { useToast } from '@/components/Toast';
import { useRef } from 'react';


export default function LivresPage() {
  const { notebooks, recipes, books, createBook, deleteBook, loading } = useRecipes();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNotebook, setSelectedNotebook] = useState<string>('all');
  const [selectedRecipes, setSelectedRecipes] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { showToast } = useToast();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [tags, setTags] = useState('');

// 🔧 AJOUTÉ : Composants Skeleton manquants
function BookCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden animate-pulse">
      <div className="aspect-[2/1] bg-gray-200"></div>
      <div className="p-3 md:p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="space-y-1">
          <div className="h-3 bg-gray-150 rounded w-full"></div>
          <div className="h-3 bg-gray-150 rounded w-1/2"></div>
        </div>
        <div className="flex gap-2 pt-2">
          <div className="flex-1 h-7 bg-gray-150 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
}

function BooksLoadingSkeleton() {
  return (
    <div className="space-y-6 md:space-y-8 max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="h-5 bg-gray-150 rounded w-80 animate-pulse"></div>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(4)].map((_, index) => (
            <BookCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}


  const toggleRecipeSelection = (recipeId: string) => {
    setSelectedRecipes(prev => 
      prev.includes(recipeId) 
        ? prev.filter(id => id !== recipeId)
        : [...prev, recipeId]
    );
  };

  const selectAllFromNotebook = (notebookId: string) => {
    const notebook = notebooks.find(n => n.id === notebookId);
    if (notebook) {
      setSelectedRecipes(prev => [...new Set([...prev, ...notebook.recipeIds])]);
    }
  };

  const handleCreateBook = (title: string) => {
    if (!title.trim() || selectedRecipes.length === 0) {
      showToast('Veuillez saisir un titre et sélectionner au moins une recette !', 'error');
      return;
    }
    
    // 🆕 AJOUTÉ : Debug avant l'envoi
    console.log('🔍 Debug selectedRecipes:', selectedRecipes);
    console.log('🔍 Type:', typeof selectedRecipes, Array.isArray(selectedRecipes));
    
    createBook(title.trim(), selectedRecipes);
    setSelectedRecipes([]);
    setShowCreateModal(false);
    showToast(`Livre "${title}" créé avec ${selectedRecipes.length} recettes !`, 'success');
  };

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         recipe.author?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesNotebook = selectedNotebook === 'all' || 
                         notebooks.find(n => n.id === selectedNotebook)?.recipeIds.includes(recipe.id);
    return matchesSearch && matchesNotebook;
  });

  <CreateBookModal
    isOpen={showCreateModal}
    onClose={() => setShowCreateModal(false)}
    onSubmit={(title) => {
      createBook(title, selectedRecipes);
      setSelectedRecipes([]);
      setShowCreateModal(false);
      showToast(`Livre "${title}" créé avec ${selectedRecipes.length} recettes !`, 'error');
    }}
    selectedCount={selectedRecipes.length}
  />

  // UN SEUL return principal
  return (
    <div className="space-y-6 md:space-y-8 max-w-full overflow-y-hidden ">
      {/* Section En-tête */}  
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Mes Livres</h1>
          <p className="text-gray-600 mt-1 text-sm md:text-base">
            Créez de beaux livres à imprimer et transmettez votre patrimoine
          </p>
          <button
          onClick={() => {
          sectionRef.current?.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start' 
          });
          setTimeout(() => {
            window.scrollBy(0, -20);
          }, 300);
        }}
          className="mt-3 bg-blue-600 text-white px-3 md:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm md:text-base self-start"
        >
          <span className="sm:hidden">✨ Nouveau Livre </span>
          <span className="hidden sm:inline">✨ Nouveau Livre</span>
          </button>
        </div>
      </div>

      {/* Livres existants */}
      {books.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg md:text-xl font-semibold text-gray-800">Mes livres en cours</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {books.map((book) => {
              const bookRecipes = recipes.filter(r => book.recipeIds.includes(r.id));
              const pageCount = 1 + (book.recipeIds.length * 2);
              //const estimatedPrice = Math.max(8, book.recipeIds.length * 1.5 + 6); supprimée je garde la formule au cas où
              
              return (
                <div key={book.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  
                  {/* Couverture avec image ou icône */}
                  <div className="aspect-[2/1] relative overflow-hidden">
                    {book.coverImageUrl ? (
                      // Photo de couverture personnalisée
                      <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-50 p-4">
                        <img 
                          src={book.coverImageUrl} 
                          alt={`Couverture - ${book.title}`}
                          className="w-full/3 h-full/2 object-cover rounded-lg shadow-sm"
                        />
                      </div>
                    ) : (
                      // Icône livre par défaut
                      <div className="w-full h-full bg-gradient-to-br from-orange-200 to-orange-50 flex items-center justify-center text-3xl md:text-4xl">
                        📖
                      </div>
                    )}
                  </div>
                  
                  <div className="p-3 md:p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 text-m md:text-base truncate">{book.title}</h3>
                    <div className="text-xs md:text-sm text-gray-600 space-y-1 mb-3">
                      <p>{book.recipeIds.length} recettes • {pageCount} pages</p>
                      <p className="text-xs text-gray-500">
                        {book.status === 'draft' && '📝 Brouillon'}
                        {book.status === 'ready' && '✅ Prêt'}
                        {book.status === 'ordered' && '🚚 Commandé'}
                        {book.status === 'printed' && '📚 Imprimé'}
                      </p>
                    </div>
                    
                    <div className="justify-end flex gap-2">
                      <Link
                        href={`/livres/${book.id}`}
                        className="inline-flex-1 bg-secondary-100 text-secondary-700 py-2 px-3 rounded-lg hover:bg-secondary-200 hover:text-secondary-800 transition-colors text-xs md:text-sm text-center"
                      >
                        Voir le livre
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sélection de recettes */}
      <div ref={sectionRef} className="overflow-x-visible div bg-white rounded-xl border border-gray-200 p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-lg md:text-xl font-semibold text-gray-800">
            Nouveau Livre : Sélectionnez au moins une recette
          </h2>
          {selectedRecipes.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                {selectedRecipes.length} sélectionnées
              </span>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-lg hover:bg-blue-700 transition-colors text-xs md:text-sm"
              >
                Créer le livre
              </button>
            </div>
          )}
        </div>

        {/* Filtres responsive */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 text-sm md:text-base"
              placeholder="Rechercher une recette par nom"
            />
          </div>
          
          <select
            value={selectedNotebook}
            onChange={(e) => setSelectedNotebook(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 text-sm md:text-base"
          >
            <option value="all">Filtrer par carnets (tous)</option>
            {notebooks.map((notebook) => (
              <option key={notebook.id} value={notebook.id}>
                {notebook.title} ({notebook.recipeIds.length})
              </option>
            ))}
          </select>

          {selectedNotebook !== 'all' && (
            <button
              onClick={() => selectAllFromNotebook(selectedNotebook)}
              className="bg-blue-100 text-blue-700 px-3 md:px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors text-xs md:text-sm whitespace-nowrap"
            >
              Tout sélectionner
            </button>
          )}
          
          {selectedRecipes.length > 0 && (
            <button
              onClick={() => setSelectedRecipes([])}
              className="bg-gray-100 text-gray-700 px-3 md:px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-xs md:text-sm whitespace-nowrap"
            >
              Désélectionner
            </button>
          )}
        </div>

        {/* Liste des recettes responsive */}
        {filteredRecipes.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-gray-600">Aucune recette trouvée</p>
            {filteredRecipes.length === 0 && (
              <div className="mt-4">
                <Link 
                  href="/recipes" 
                  className="text-orange-600 hover:text-orange-700 underline text-sm"
                >
                  Créer votre première recette
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="grid gap-3 md:gap-4">
            {filteredRecipes.map((recipe) => (
              <div 
                key={recipe.id} 
                className={`overflow-x-hidden border rounded-xl p-3 md:p-4 cursor-pointer transition-all ${
                  selectedRecipes.includes(recipe.id)
                    ? 'border-secondary-300 bg-secondary-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
                onClick={() => toggleRecipeSelection(recipe.id)}
              >
                <div className="items-center flex gap-3 md:gap-4">
                  <div className="relative">
                    <img 
                      src={recipe.imageUrl || 'https://images.unsplash.com/photo-1546548970-71785318a17b?q=80&w=100'} 
                      alt={recipe.title}
                      className="w-12 h-12 md:w-16 md:h-16 object-cover rounded-lg"
                    />
                    {selectedRecipes.includes(recipe.id) && (
                      <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2 w-5 h-5 md:w-6 md:h-6 bg-secondary-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        ✓
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate text-sm md:text-base">{recipe.title}</h4>
                    <p className="text-xs md:text-sm text-secondary-900">par {recipe.author || 'Anonyme'}{" / "}⏱️ {recipe.prepMinutes || '?'}min</p>
                   {recipe.tags && recipe.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {recipe.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-secondary-200 text-secondary-600 px-2 py-0.5 rounded-md text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
                    
                    {notebooks.some(n => n.recipeIds.includes(recipe.id)) && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {notebooks
                          .filter(n => n.recipeIds.includes(recipe.id))
                          .slice(0, 2)
                          .map(notebook => (
                          <span 
                            key={notebook.id}
                            className="bg-blue-50 text-blue-800 text-xs px-2 py-0.5 rounded"
                          >
                            {notebook.title}
                          </span>
                        ))}
                        {notebooks.filter(n => n.recipeIds.includes(recipe.id)).length > 2 && (
                          <span className="text-xs text-gray-500">
                            +{notebooks.filter(n => n.recipeIds.includes(recipe.id)).length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modale de création de livre */}
      <CreateBookModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={(title) => {
          createBook(title, selectedRecipes);
          setSelectedRecipes([]);
          setShowCreateModal(false);
          showToast(`Livre "${title}" créé avec ${selectedRecipes.length} recettes !`, 'success');
        }}
        selectedCount={selectedRecipes.length}
      />
    </div>
  );
}