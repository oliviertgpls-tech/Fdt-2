"use client";

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Move, Trash2, Plus, Eye, Upload, GripVertical, ArrowRight, ArrowDownLeft } from 'lucide-react';
import { useRecipes } from "@/contexts/RecipesProvider";

export default function LivreEditorPage() {
  const { id } = useParams();
  const router = useRouter();
  const { recipes, books, addRecipeToBook, removeRecipeFromBook } = useRecipes();

  // Trouver le livre
  const book = books.find(b => b.id === id);
  
  // État pour l'aperçu
  const [currentPage, setCurrentPage] = useState(0);
  const [showPreview, setShowPreview] = useState(true);

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

  // Récupérer les recettes du livre dans l'ordre
  const bookRecipes = book.recipeIds
    .map(id => recipes.find(r => r.id === id))
    .filter((recipe): recipe is NonNullable<typeof recipe> => recipe !== undefined);

  const availableRecipes = recipes.filter(recipe => !book.recipeIds.includes(recipe.id));

  // Données pour l'aperçu PDF
  const previewBook = {
    title: book.title,
    subtitle: "Carnet de transmission culinaire",
    author: "Famille",
    recipes: bookRecipes.map(recipe => ({
      id: recipe.id,
      title: recipe.title,
      subtitle: "",
      description: recipe.description || `Une délicieuse recette de ${recipe.author || 'famille'}.`,
      author: recipe.author || "Famille",
      prepMinutes: recipe.prepMinutes || 30,
      servings: recipe.servings || "4 personnes",
      imageUrl: recipe.imageUrl || "https://images.unsplash.com/photo-1546548970-71785318a17b?q=80&w=600",
      ingredients: recipe.ingredients || [],
      steps: recipe.steps ? recipe.steps.split('\n\n').filter(step => step.trim()) : [],
      chef_note: `Conseil de ${recipe.author || 'famille'} : Cette recette fait partie de notre patrimoine culinaire familial.`
    }))
  };

  const pages = ['cover', ...bookRecipes.map(recipe => `recipe-${recipe.id}`)];
  const pageCount = pages.length;
  const estimatedPrice = Math.max(8, bookRecipes.length * 0.75 + 6);

  // Composants d'aperçu PDF (adapté de ton code)
  const renderCoverPage = () => (
    <div className="cookbook-page bg-cream relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-32 h-32 border border-brown-300 rotate-12"></div>
        <div className="absolute bottom-40 right-16 w-24 h-24 border border-brown-300 -rotate-12"></div>
        <div className="absolute top-1/2 left-1/3 w-16 h-16 border border-brown-300 rotate-45"></div>
      </div>
      
      <div className="relative z-10 h-full flex flex-col justify-between p-20">
        <div className="text-center">
          <div className="w-16 h-0.5 bg-brown-600 mx-auto mb-6"></div>
          <p className="text-xs tracking-widest uppercase text-brown-600 font-medium">
            Patrimoine Culinaire
          </p>
        </div>
        
        <div className="flex-1 flex flex-col justify-center text-center -mt-16">
          <h1 className="font-serif text-7xl leading-none text-brown-900 mb-4">
            {previewBook.title}
          </h1>
          <h2 className="font-serif text-4xl text-brown-700 mb-8 italic font-light">
            {previewBook.subtitle}
          </h2>
          
          <div className="flex items-center justify-center gap-8 my-12">
            <div className="w-12 h-px bg-brown-400"></div>
            <div className="w-3 h-3 border-2 border-brown-400 rotate-45"></div>
            <div className="w-12 h-px bg-brown-400"></div>
          </div>
          
          <p className="text-lg text-brown-600 font-light tracking-wide">
            {bookRecipes.length} recettes de famille
          </p>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-brown-600 font-medium tracking-wide">
            {previewBook.author}
          </p>
          <div className="w-8 h-0.5 bg-brown-400 mx-auto mt-4"></div>
        </div>
      </div>
    </div>
  );

  const renderRecipePage = (recipe: any) => (
    <div className="cookbook-page bg-cream p-16">
      <div className="h-full flex flex-col">
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-brown-200">
          <div className="text-xs uppercase tracking-widest text-brown-500 font-medium">
            Recettes de Famille
          </div>
          <div className="text-xs text-brown-500">
            {pages.indexOf(`recipe-${recipe.id}`) + 1}
          </div>
        </div>

        <div className="mb-10">
          <h1 className="font-serif text-5xl text-brown-900 mb-2 leading-tight">
            {recipe.title}
          </h1>
          
          <div className="flex items-center gap-8 text-sm text-brown-600 mt-6">
            <div className="flex items-center gap-2">
              <span className="font-medium">Préparation</span>
              <span>{recipe.prepMinutes} min</span>
            </div>
            <div className="w-px h-4 bg-brown-300"></div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Pour</span>
              <span>{recipe.servings}</span>
            </div>
            <div className="w-px h-4 bg-brown-300"></div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Par</span>
              <span className="italic">{recipe.author}</span>
            </div>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-5 gap-12">
          <div className="col-span-2">
            <h3 className="font-serif text-xl text-brown-900 mb-6 pb-2 border-b border-brown-200">
              Ingrédients
            </h3>
            <div className="space-y-3">
              {recipe.ingredients.map((ingredient: string, index: number) => (
                <div key={index} className="flex items-start gap-3 text-sm leading-relaxed">
                  <span className="w-1 h-1 bg-brown-400 rounded-full mt-2.5 flex-shrink-0"></span>
                  <span className="text-brown-700">{ingredient}</span>
                </div>
              ))}
            </div>

            {recipe.chef_note && (
              <div className="mt-10 p-4 bg-brown-50 border-l-2 border-brown-300">
                <h4 className="font-serif text-sm text-brown-900 mb-2 font-medium">
                  Conseil de {recipe.author}
                </h4>
                <p className="text-xs text-brown-600 leading-relaxed italic">
                  {recipe.chef_note}
                </p>
              </div>
            )}
          </div>
          
          <div className="col-span-3">
            <h3 className="font-serif text-xl text-brown-900 mb-6 pb-2 border-b border-brown-200">
              Préparation
            </h3>
            
            <p className="text-sm text-brown-600 leading-relaxed mb-8 italic">
              {recipe.description}
            </p>
            
            <div className="space-y-6">
              {recipe.steps.map((step: string, index: number) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0 w-6 h-6 bg-brown-900 text-cream text-xs font-medium flex items-center justify-center">
                    {index + 1}
                  </div>
                  <p className="text-sm text-brown-700 leading-relaxed">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-brown-200">
          <div className="relative h-32 rounded overflow-hidden">
            <img 
              src={recipe.imageUrl} 
              alt={recipe.title}
              className="w-full h-full object-cover sepia-[0.3] contrast-110 saturate-90"
            />
            <div className="absolute inset-0 bg-brown-900 opacity-10"></div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCurrentPage = () => {
    const page = pages[currentPage];
    
    if (page === 'cover') return renderCoverPage();
    if (page?.startsWith('recipe-')) {
      const recipeId = page.replace('recipe-', '');
      const recipe = previewBook.recipes.find(r => r.id === recipeId);
      if (recipe) return renderRecipePage(recipe);
    }
    
    return <div className="cookbook-page bg-cream flex items-center justify-center text-brown-600">Page non trouvée</div>;
  };

  return (
    <div className="min-h-screen bg-stone-100">
      
      {/* Style CSS pour les couleurs print */}
      <style jsx global>{`
        .bg-cream { background-color: #fefcf8; }
        .text-brown-900 { color: #2c1810; }
        .text-brown-800 { color: #3d2317; }
        .text-brown-700 { color: #52341f; }
        .text-brown-600 { color: #6b4423; }
        .text-brown-500 { color: #8b5a2b; }
        .text-brown-400 { color: #a67c52; }
        .text-brown-300 { color: #c4a484; }
        .text-brown-200 { color: #e2d5c7; }
        .text-cream { color: #fefcf8; }
        
        .bg-brown-900 { background-color: #2c1810; }
        .bg-brown-50 { background-color: #f9f6f2; }
        .border-brown-600 { border-color: #6b4423; }
        .border-brown-400 { border-color: #a67c52; }
        .border-brown-300 { border-color: #c4a484; }
        .border-brown-200 { border-color: #e2d5c7; }
        
        .font-serif { 
          font-family: 'Crimson Text', 'Times New Roman', serif;
          font-weight: 400;
        }
        
        .cookbook-page {
          font-family: 'Source Serif Pro', Georgia, serif;
          font-size: 14px;
          line-height: 1.5;
          color: #52341f;
        }
        
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;1,400&family=Source+Serif+Pro:ital,wght@0,400;0,600;1,400&display=swap');
      `}</style>

      <div className="max-w-7xl mx-auto pt-8 px-8">
        
        {/* En-tête */}
        <div className="bg-white rounded-lg shadow-sm border p-4 flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-800 transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour
            </button>
            
            <div>
              <h1 className="text-xl font-semibold text-gray-800">{book.title}</h1>
              <p className="text-sm text-gray-600">
                {bookRecipes.length} recettes • {pageCount} pages • ≈ {estimatedPrice.toFixed(2)}€
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowPreview(!showPreview)}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              {showPreview ? 'Masquer aperçu' : 'Voir aperçu'}
            </button>
            
            <button className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors font-medium flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Commander ({estimatedPrice.toFixed(2)}€)
            </button>
          </div>
        </div>

        <div className="grid gap-8" style={{ gridTemplateColumns: showPreview ? '1fr 1fr' : '1fr' }}>
          
          {/* Colonne gauche - Gestion du contenu */}
          <div className="space-y-6">
            
            {/* Recettes du livre */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                📖 Contenu du livre
              </h2>
              
              {bookRecipes.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-3">📖</div>
                  <p>Livre vide - ajoutez des recettes</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Couverture */}
                  <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        1
                      </span>
                      <div>
                        <h4 className="font-medium text-gray-900">Couverture</h4>
                        <p className="text-sm text-gray-600">{book.title}</p>
                      </div>
                    </div>
                  </div>

                  {/* Recettes */}
                  {bookRecipes.map((recipe, index) => (
                    <div
                      key={recipe.id}
                      className="bg-blue-50 border border-blue-200 rounded-lg p-4 group"
                    >
                      <div className="flex gap-4">
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="w-8 h-8 bg-blue-500 text-white text-sm rounded-full flex items-center justify-center font-medium">
                            {index + 2}
                          </span>
                          <button className="opacity-50 group-hover:opacity-100 cursor-move p-1 hover:bg-blue-200 rounded transition-all">
                            <GripVertical className="w-4 h-4 text-gray-500" />
                          </button>
                        </div>
                        
                        <img 
                          src={recipe.imageUrl || 'https://images.unsplash.com/photo-1546548970-71785318a17b?q=80&w=100'} 
                          alt={recipe.title}
                          className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                        />
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900">{recipe.title}</h4>
                          <p className="text-sm text-gray-600">par {recipe.author}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Page {index + 2} • ⏱️ {recipe.prepMinutes}min
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              if (showPreview) {
                                setCurrentPage(index + 1); // +1 car index 0 = couverture
                              }
                            }}
                            className="opacity-50 group-hover:opacity-100 p-1 hover:bg-blue-200 rounded transition-all text-blue-600"
                            title="Voir dans l'aperçu"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeRecipeFromBook(book.id, recipe.id)}
                            className="opacity-50 group-hover:opacity-100 text-red-500 hover:text-red-700 p-1 hover:bg-red-100 rounded transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Ajouter des recettes */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                ➕ Ajouter des recettes
              </h3>
              
              {availableRecipes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-3xl mb-2">🎉</div>
                  <p className="text-sm">Toutes vos recettes sont dans ce livre !</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto">
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
                          <h5 className="font-medium text-gray-900 text-sm truncate">
                            {recipe.title}
                          </h5>
                          <p className="text-xs text-gray-600">{recipe.author}</p>
                        </div>
                        <Plus className="w-4 h-4 text-gray-400 self-center" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Colonne droite - Aperçu PDF */}
          {showPreview && bookRecipes.length > 0 && (
            <div className="space-y-4">
              
              {/* Contrôles aperçu */}
              <div className="bg-white rounded-lg shadow-sm border p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-700">Aperçu PDF</span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    Page {currentPage + 1} / {pages.length}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                    className="p-1 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ArrowDownLeft className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(pages.length - 1, currentPage + 1))}
                    disabled={currentPage === pages.length - 1}
                    className="p-1 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Aperçu A4 */}
              <div className="bg-white shadow-xl mx-auto" style={{ 
                width: '420px',
                height: '594px',
                transformOrigin: 'top center'
              }}>
                <div style={{
                  width: '210mm',
                  height: '297mm',
                  transform: 'scale(0.5)',
                  transformOrigin: 'top left'
                }}>
                  {renderCurrentPage()}
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Message encouragement */}
        {bookRecipes.length > 0 && (
          <div className="mt-8 bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-6 text-center">
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-orange-800 mb-2">
                📚 Votre livre est prêt !
              </h3>
              <p className="text-sm text-orange-700 mb-4">
                {bookRecipes.length} recettes • {pageCount} pages • Prix estimé : {estimatedPrice.toFixed(2)}€
              </p>
              <button className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors font-medium inline-flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Commander maintenant
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
