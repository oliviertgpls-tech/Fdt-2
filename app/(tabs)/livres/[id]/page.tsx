"use client";

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Trash2, Plus, Eye, Upload, GripVertical, Edit3, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { useRecipes } from "@/contexts/RecipesProvider";

export default function LivreEditorPage() {
  const { id } = useParams();
  const router = useRouter();
  const { recipes, books, addRecipeToBook, removeRecipeFromBook, updateBook } = useRecipes();

  const book = books.find(b => b.id === id);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'preview' | 'edit'>('preview');
  const [editingDescription, setEditingDescription] = useState(false);
  const [bookDescription, setBookDescription] = useState(book?.description || "Un recueil précieux de recettes familiales, transmises avec amour de génération en génération.");

  if (!book) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <div className="text-6xl mb-4">📖</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Livre introuvable</h1>
        <p className="text-gray-600 mb-6">Ce livre n'existe pas ou a été supprimé.</p>
        <button
          onClick={() => router.push("/livres")}
          className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors"
        >
          ← Retour aux livres
        </button>
      </div>
    );
  }

  const bookRecipes = book.recipeIds
    .map(id => recipes.find(r => r.id === id))
    .filter((recipe): recipe is NonNullable<typeof recipe> => recipe !== undefined);

  const availableRecipes = recipes.filter(recipe => !book.recipeIds.includes(recipe.id));

  // Structure des pages du livre
  const createBookPages = () => {
    const pages = [];
    
    // Page 1: Couverture
    pages.push({
      type: 'cover',
      title: 'Couverture',
      content: renderCoverPage()
    });
    
    // Page 2: Description
    pages.push({
      type: 'description',
      title: 'À propos',
      content: renderDescriptionPage()
    });
    
    // Page 3: Sommaire
    pages.push({
      type: 'sommaire',
      title: 'Sommaire',
      content: renderSommairePage()
    });
    
    // Pages recettes (2 pages par recette)
    bookRecipes.forEach((recipe, index) => {
      pages.push({
        type: 'recipe-photo',
        title: `${recipe.title} - Photo`,
        content: renderRecipePhotoPage(recipe, index)
      });
      pages.push({
        type: 'recipe-content',
        title: `${recipe.title} - Recette`,
        content: renderRecipeContentPage(recipe, index)
      });
    });
    
    // Dernière page: 4e de couverture
    pages.push({
      type: 'back-cover',
      title: '4e de couverture',
      content: renderBackCoverPage()
    });
    
    return pages;
  };

  const allPages = createBookPages();
  const estimatedPrice = Math.max(8, bookRecipes.length * 1.5 + 6);

  // Renderers optimisés pour l'aperçu
  const renderCoverPage = () => (
    <div className="h-full bg-gradient-to-br from-orange-100 to-orange-50 p-6 flex flex-col justify-center items-center text-center relative overflow-hidden">
      {/* Pattern décoratif */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 left-4 w-16 h-16 border-2 border-orange-300 rounded-full"></div>
        <div className="absolute top-8 right-8 w-8 h-8 border border-orange-300 rotate-45"></div>
        <div className="absolute bottom-8 left-8 w-12 h-12 border border-orange-300"></div>
      </div>
      
      <div className="relative z-10 space-y-4">
        <div className="text-4xl mb-4">📚</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">
          {book.title}
        </h1>
        <p className="text-orange-700 text-sm font-medium">
          Carnet de transmission culinaire
        </p>
        <div className="flex items-center justify-center gap-2 my-4">
          <div className="w-8 h-px bg-orange-400"></div>
          <div className="w-1 h-1 bg-orange-400 rotate-45"></div>
          <div className="w-8 h-px bg-orange-400"></div>
        </div>
        <p className="text-gray-600 text-sm">
          {bookRecipes.length} recettes de famille
        </p>
      </div>
    </div>
  );

  const renderDescriptionPage = () => (
    <div className="h-full bg-cream p-6 flex flex-col justify-center">
      <div className="text-center space-y-4">
        <h2 className="text-xl font-bold text-gray-900 mb-4">À propos de ce livre</h2>
        <div className="text-gray-700 text-sm leading-relaxed space-y-3">
          {bookDescription.split('\n\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-gray-600 italic text-xs">
            "Les recettes de famille sont les gardiens de nos souvenirs"
          </p>
        </div>
      </div>
    </div>
  );

  const renderSommairePage = () => (
    <div className="h-full bg-cream p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">Nos Recettes</h2>
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {bookRecipes.map((recipe, index) => (
          <div key={recipe.id} className="flex items-center gap-3 p-2 bg-orange-50 rounded-lg">
            <span className="w-6 h-6 bg-orange-500 text-white text-xs font-bold flex items-center justify-center rounded-full flex-shrink-0">
              {index + 1}
            </span>
            <img 
              src={recipe.imageUrl || 'https://images.unsplash.com/photo-1546548970-71785318a17b?q=80&w=60'} 
              alt={recipe.title}
              className="w-8 h-8 object-cover rounded flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 text-sm truncate">{recipe.title}</h4>
              <p className="text-xs text-gray-600">par {recipe.author || 'Famille'}</p>
            </div>
            <span className="text-xs text-gray-500">p.{4 + (index * 2)}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderRecipePhotoPage = (recipe: any, index: number) => (
    <div className="h-full relative overflow-hidden bg-gray-100">
      <img 
        src={recipe.imageUrl || 'https://images.unsplash.com/photo-1546548970-71785318a17b?q=80&w=400'} 
        alt={recipe.title}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
      <div className="absolute bottom-4 left-4 right-4">
        <h2 className="text-white text-xl font-bold drop-shadow-lg">{recipe.title}</h2>
        <p className="text-white/90 text-sm drop-shadow">par {recipe.author || 'Famille'}</p>
      </div>
    </div>
  );

  const renderRecipeContentPage = (recipe: any, index: number) => (
    <div className="h-full bg-cream p-4 overflow-y-auto">
      <div className="mb-4">
        <h1 className="text-lg font-bold text-gray-900 mb-2">{recipe.title}</h1>
        <div className="flex gap-4 text-xs text-gray-600 mb-3">
          <span>⏱️ {recipe.prepMinutes || 30} min</span>
          <span>👥 {recipe.servings || '4'}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 h-80">
        <div>
          <h3 className="font-bold text-gray-900 mb-2 text-sm">Ingrédients</h3>
          <div className="space-y-1">
            {(recipe.ingredients || []).slice(0, 8).map((ingredient: string, i: number) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                <span className="w-1 h-1 bg-orange-500 rounded-full mt-1.5 flex-shrink-0"></span>
                <span className="text-gray-700">{ingredient}</span>
              </div>
            ))}
            {(recipe.ingredients || []).length > 8 && (
              <p className="text-xs text-gray-500 italic">+ {(recipe.ingredients || []).length - 8} autres...</p>
            )}
          </div>
        </div>
        
        <div>
          <h3 className="font-bold text-gray-900 mb-2 text-sm">Préparation</h3>
          <div className="space-y-2">
            {(recipe.steps ? recipe.steps.split('\n\n').filter((step: string) => step.trim()) : []).slice(0, 4).map((step: string, i: number) => (
              <div key={i} className="flex gap-2">
                <div className="w-4 h-4 bg-orange-500 text-white text-xs font-bold flex items-center justify-center rounded-full flex-shrink-0">
                  {i + 1}
                </div>
                <p className="text-xs text-gray-700 leading-relaxed">
                  {step.length > 120 ? step.substring(0, 120) + '...' : step}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderBackCoverPage = () => (
    <div className="h-full bg-gradient-to-br from-orange-50 to-orange-100 p-6 flex flex-col justify-between">
      <div></div>
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-3">Un héritage culinaire</h3>
        <p className="text-gray-700 text-sm leading-relaxed mb-4">
          Ce livre rassemble {bookRecipes.length} recettes précieusement conservées et transmises de génération en génération.
        </p>
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-6 h-px bg-orange-400"></div>
          <div className="w-1 h-1 bg-orange-400 rotate-45"></div>
          <div className="w-6 h-px bg-orange-400"></div>
        </div>
        <p className="text-orange-700 text-xs">
          "Que chaque plat continue à rassembler et à nourrir l'amour familial"
        </p>
      </div>
      <div className="text-center text-gray-600 text-xs">
        <p>Créé avec amour sur Carnets Familiaux</p>
      </div>
    </div>
  );

  const saveDescription = () => {
    if (updateBook) {
      updateBook(book.id, { description: bookDescription });
    }
    setEditingDescription(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <style jsx global>{`
        .bg-cream { background-color: #fefcf8; }
      `}</style>

      <div className="max-w-7xl mx-auto p-4">
        {/* En-tête */}
        <div className="bg-white rounded-lg shadow-sm border p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-800 transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Retour</span>
            </button>
            
            <div>
              <h1 className="text-xl font-semibold text-gray-800">{book.title}</h1>
              <p className="text-sm text-gray-600">
                {bookRecipes.length} recettes • {allPages.length} pages • ≈ {estimatedPrice.toFixed(2)}€
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setViewMode(viewMode === 'preview' ? 'edit' : 'preview')}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              {viewMode === 'preview' ? 'Éditer' : 'Aperçu'}
            </button>
            
            <button className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors font-medium flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Commander ({estimatedPrice.toFixed(2)}€)
            </button>
          </div>
        </div>

        {viewMode === 'preview' ? (
          /* MODE APERÇU - Navigation livre */
          <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
            {/* Navigation pages */}
            <div className="bg-white rounded-lg border p-4">
              <h3 className="font-semibold text-gray-800 mb-4">Pages du livre</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {allPages.map((page, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPageIndex(index)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      currentPageIndex === index 
                        ? 'border-orange-500 bg-orange-50' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{page.title}</p>
                        <p className="text-xs text-gray-500">{page.type}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Aperçu page */}
            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-gray-800">
                  Page {currentPageIndex + 1} : {allPages[currentPageIndex]?.title}
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPageIndex(Math.max(0, currentPageIndex - 1))}
                    disabled={currentPageIndex === 0}
                    className="p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentPageIndex(Math.min(allPages.length - 1, currentPageIndex + 1))}
                    disabled={currentPageIndex === allPages.length - 1}
                    className="p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentPageIndex(0)}
                    className="p-2 text-gray-600 hover:text-gray-800"
                    title="Retour au début"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Page en taille réelle */}
              <div className="flex justify-center">
                <div className="bg-white shadow-lg rounded-lg overflow-hidden" style={{ width: '400px', height: '560px' }}>
                  {allPages[currentPageIndex]?.content}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* MODE ÉDITION - Interface d'édition */
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
            {/* Contenu du livre */}
            <div className="space-y-6">
              {/* Description */}
              <div className="bg-white rounded-xl border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">📝 Description du livre</h2>
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
                      value={bookDescription}
                      onChange={(e) => setBookDescription(e.target.value)}
                      className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none resize-none"
                      placeholder="Décrivez ce livre de recettes..."
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={saveDescription}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        Sauvegarder
                      </button>
                      <button
                        onClick={() => setEditingDescription(false)}
                        className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-600 text-sm leading-relaxed">{bookDescription}</p>
                )}
              </div>

              {/* Recettes du livre */}
              <div className="bg-white rounded-xl border p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-6">📖 Recettes du livre</h2>
                
                {bookRecipes.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <div className="text-4xl mb-3">📖</div>
                    <p>Livre vide - ajoutez des recettes</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {bookRecipes.map((recipe, index) => (
                      <div key={recipe.id} className="bg-purple-50 border border-purple-200 rounded-lg p-4 group">
                        <div className="flex gap-4">
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="w-8 h-8 bg-purple-500 text-white text-sm rounded-full flex items-center justify-center font-medium">
                              {index + 1}
                            </span>
                            <button className="opacity-50 group-hover:opacity-100 cursor-move p-1 hover:bg-purple-200 rounded transition-all">
                              <GripVertical className="w-4 h-4 text-gray-500" />
                            </button>
                          </div>
                          
                          <img 
                            src={recipe.imageUrl || 'https://images.unsplash.com/photo-1546548970-71785318a17b?q=80&w=100'} 
                            alt={recipe.title}
                            className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                          />
                          
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 text-base">{recipe.title}</h4>
                            <p className="text-sm text-gray-600">par {recipe.author || 'Famille'}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              Double page • ⏱️ {recipe.prepMinutes || 30}min
                            </p>
                          </div>
                          
                          <button
                            onClick={() => removeRecipeFromBook(book.id, recipe.id)}
                            className="opacity-50 group-hover:opacity-100 text-red-500 hover:text-red-700 p-1 hover:bg-red-100 rounded transition-all flex-shrink-0"
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

            {/* Sidebar - Ajouter recettes */}
            <div className="bg-white rounded-xl border p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">➕ Ajouter des recettes</h3>
              
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
                      onClick={() => addRecipeToBook(book.id, recipe.id)}
                    >
                      <div className="flex gap-3">
                        <img 
                          src={recipe.imageUrl || 'https://images.unsplash.com/photo-1546548970-71785318a17b?q=80&w=100'}
                          alt={recipe.title}
                          className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium text-gray-900 text-sm">{recipe.title}</h5>
                          <p className="text-xs text-gray-600">{recipe.author || 'Famille'}</p>
                        </div>
                        <Plus className="w-4 h-4 text-gray-400 self-center flex-shrink-0" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
