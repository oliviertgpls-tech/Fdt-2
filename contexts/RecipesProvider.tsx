"use client";

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Trash2, Plus, Eye, Upload, GripVertical, Edit3 } from 'lucide-react';
import { useRecipes } from "@/contexts/RecipesProvider";

export default function LivreEditorPage() {
  const { id } = useParams();
  const router = useRouter();
  const { recipes, books, addRecipeToBook, removeRecipeFromBook, updateBook } = useRecipes();

  const book = books.find(b => b.id === id);
  const [currentPage, setCurrentPage] = useState(0);
  const [showPreview, setShowPreview] = useState(true);
  const [editingDescription, setEditingDescription] = useState(false);
  const [bookDescription, setBookDescription] = useState(book?.description || "");

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

  // Structure des pages : Couv, Vide, Description, puis doubles pages recettes, puis 4e de couv
  const recipePages = bookRecipes.flatMap((recipe, index) => [
    `photo-${recipe.id}`,
    `recipe-${recipe.id}`
  ]);

  const allPages = [
    'cover',           // Page 1
    'blank',          // Page 2  
    'description',    // Page 3
    ...recipePages,   // Pages 4-5, 6-7, etc.
    'back-cover'      // Dernière page
  ];

  const pageCount = allPages.length;
  const estimatedPrice = Math.max(8, bookRecipes.length * 1.5 + 6);

  // Fonction pour sauvegarder la description
  const saveDescription = () => {
    if (updateBook) {
      updateBook(book.id, { description: bookDescription });
    }
    setEditingDescription(false);
  };

  const renderCoverPage = () => {
    const randomRecipe = bookRecipes[0];
    const heroImage = randomRecipe?.imageUrl || "https://images.unsplash.com/photo-1546548970-71785318a17b?q=80&w=600";
    
    return (
      <div className="cookbook-page bg-cream relative overflow-hidden h-full">
        <div className="relative z-20 h-2/5 flex flex-col justify-center p-12">
          <div className="text-center">
            <p className="text-sm tracking-widest uppercase text-brown-600 font-medium mb-6">
              Patrimoine Culinaire
            </p>
            <h1 className="font-serif text-6xl leading-tight text-brown-900 mb-4">
              {book.title}
            </h1>
            <h2 className="font-serif text-2xl text-brown-700 italic font-light mb-6">
              Carnet de transmission culinaire
            </h2>
            <div className="flex items-center justify-center gap-6 mb-4">
              <div className="w-8 h-px bg-brown-400"></div>
              <div className="w-2 h-2 border border-brown-400 rotate-45"></div>
              <div className="w-8 h-px bg-brown-400"></div>
            </div>
            <p className="text-brown-600 font-light text-lg">
              {bookRecipes.length} recettes de famille
            </p>
          </div>
        </div>
        
        <div className="relative h-3/5">
          <img 
            src={heroImage}
            alt="Photo de couverture"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-brown-900 opacity-15"></div>
          <div className="absolute bottom-12 right-12 text-right">
            <p className="text-cream text-lg font-medium tracking-wide drop-shadow-lg">
              Famille
            </p>
            <div className="w-16 h-px bg-cream mt-3 ml-auto opacity-80"></div>
          </div>
        </div>
      </div>
    );
  };

  const renderBlankPage = () => (
    <div className="cookbook-page bg-cream h-full"></div>
  );

  const renderDescriptionPage = () => (
    <div className="cookbook-page bg-cream p-16 h-full">
      <div className="h-full flex flex-col justify-center">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="font-serif text-4xl text-brown-900 mb-8">À propos de ce livre</h2>
          <div className="text-brown-700 text-lg leading-relaxed space-y-6">
            <p>{bookDescription || "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris."}</p>
            <p>{"Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."}</p>
          </div>
          <div className="mt-12 pt-8 border-t border-brown-200">
            <p className="text-brown-600 italic">
              "Les recettes de famille sont bien plus que des instructions : elles sont les gardiens de nos souvenirs et les messagers de notre amour."
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBackCover = () => (
    <div className="cookbook-page bg-cream p-16 h-full">
      <div className="h-full flex flex-col justify-between">
        <div></div>
        <div className="text-center">
          <h3 className="font-serif text-3xl text-brown-900 mb-6">Un héritage culinaire</h3>
          <p className="text-brown-700 text-lg max-w-lg mx-auto leading-relaxed">
            Ce livre rassemble {bookRecipes.length} recettes précieusement conservées et transmises de génération en génération.
          </p>
        </div>
        <div className="text-center text-brown-600 text-sm">
          <p>Créé avec amour sur Carnets Familiaux</p>
        </div>
      </div>
    </div>
  );

  const renderPhotoPage = (recipe: any) => (
    <div className="cookbook-page bg-cream relative overflow-hidden h-full">
      <img 
        src={recipe.imageUrl} 
        alt={recipe.title}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-brown-900 opacity-5"></div>
      <div className="absolute bottom-8 left-8">
        <h2 className="font-serif text-4xl text-white drop-shadow-2xl">
          {recipe.title}
        </h2>
      </div>
    </div>
  );

  const renderRecipeFullPage = (recipe: any) => (
    <div className="cookbook-page bg-cream p-12 h-full">
      <div className="h-full flex flex-col">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-brown-200">
          <div className="text-xs uppercase tracking-widest text-brown-500 font-medium">
            {recipe.author || 'Recette de famille'}
          </div>
          <div className="text-xs text-brown-500">
            {recipe.prepMinutes || 30} min • {recipe.servings || '4'} pers.
          </div>
        </div>

        <div className="mb-8">
          <h1 className="font-serif text-4xl text-brown-900 mb-4 leading-tight">
            {recipe.title}
          </h1>
          <p className="text-brown-600 italic text-base leading-relaxed">
            {recipe.description || `Une délicieuse recette de ${recipe.author || 'famille'}.`}
          </p>
        </div>

        <div className="flex-1 grid grid-cols-2 gap-8">
          <div>
            <h3 className="font-serif text-xl text-brown-900 mb-4 pb-2 border-b border-brown-300">
              Ingrédients
            </h3>
            <div className="space-y-2">
              {(recipe.ingredients || []).map((ingredient: string, index: number) => (
                <div key={index} className="flex items-start gap-3 text-sm">
                  <span className="w-1.5 h-1.5 bg-brown-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-brown-700 leading-relaxed">{ingredient}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="font-serif text-xl text-brown-900 mb-4 pb-2 border-b border-brown-300">
              Préparation
            </h3>
            <div className="space-y-3">
              {(recipe.steps ? recipe.steps.split('\n\n').filter((step: string) => step.trim()) : []).map((step: string, index: number) => (
                <div key={index} className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-brown-900 text-cream text-xs font-bold flex items-center justify-center rounded-full">
                    {index + 1}
                  </div>
                  <p className="text-sm text-brown-700 leading-relaxed flex-1 pt-0.5">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPageByIndex = (pageIndex: number) => {
    const page = allPages[pageIndex];
    
    if (page === 'cover') return renderCoverPage();
    if (page === 'blank') return renderBlankPage();
    if (page === 'description') return renderDescriptionPage();
    if (page === 'back-cover') return renderBackCover();
    
    if (page?.startsWith('photo-')) {
      const recipeId = page.replace('photo-', '');
      const recipe = bookRecipes.find(r => r.id === recipeId);
      if (recipe) return renderPhotoPage(recipe);
    }
    if (page?.startsWith('recipe-')) {
      const recipeId = page.replace('recipe-', '');
      const recipe = bookRecipes.find(r => r.id === recipeId);
      if (recipe) return renderRecipeFullPage(recipe);
    }
    
    return <div className="cookbook-page bg-cream flex items-center justify-center text-brown-600">Page non trouvée</div>;
  };

  // Fonction pour déterminer si on affiche une ou deux pages
  const isDoublePage = (pageIndex: number) => {
    const page = allPages[pageIndex];
    return page?.startsWith('photo-') || page?.startsWith('recipe-');
  };

  const getCurrentDisplayPages = () => {
    if (currentPage === 0) return [0]; // Couverture seule
    if (currentPage === allPages.length - 1) return [allPages.length - 1]; // 4e de couv seule
    
    // Pour les autres pages, on affiche par paires
    const leftPage = currentPage % 2 === 0 ? currentPage : currentPage - 1;
    const rightPage = leftPage + 1;
    
    if (rightPage < allPages.length) {
      return [leftPage, rightPage];
    }
    return [leftPage];
  };

  return (
    <div className="min-h-screen bg-stone-100">
      <style jsx global>{`
        .bg-cream { background-color: #fefcf8; }
        .text-brown-900 { color: #2c1810; }
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
        .font-serif { font-family: 'Crimson Text', 'Times New Roman', serif; }
        .cookbook-page {
          font-family: 'Source Serif Pro', Georgia, serif;
          font-size: 16px;
          line-height: 1.6;
          color: #52341f;
        }
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;1,400&family=Source+Serif+Pro:ital,wght@0,400;0,600;1,400&display=swap');
      `}</style>

      <div className="max-w-7xl mx-auto pt-8 px-8">
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

        <div className="grid gap-8" style={{ gridTemplateColumns: showPreview ? '1fr 1.2fr' : '1fr' }}>
          <div className="space-y-6">
            {/* Description du livre */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
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
                <p className="text-gray-600 text-sm leading-relaxed">
                  {bookDescription || "Cliquez sur l'icône pour ajouter une description qui apparaîtra en page 3 du livre."}
                </p>
              )}
            </div>

            {/* Contenu du livre */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">📖 Contenu du livre</h2>
              
              {bookRecipes.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-3">📖</div>
                  <p>Livre vide - ajoutez des recettes</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-medium">1</span>
                      <div>
                        <h4 className="font-medium text-gray-900">Couverture</h4>
                        <p className="text-sm text-gray-600">{book.title}</p>
                      </div>
                    </div>
                  </div>

                  {bookRecipes.map((recipe, index) => (
                    <div key={recipe.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4 group">
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
                            Pages {(index * 2) + 4}-{(index * 2) + 5} • ⏱️ {recipe.prepMinutes}min
                          </p>
                        </div>
                        
                        <button
                          onClick={() => removeRecipeFromBook(book.id, recipe.id)}
                          className="opacity-50 group-hover:opacity-100 text-red-500 hover:text-red-700 p-1 hover:bg-red-100 rounded transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Ajouter des recettes */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">➕ Ajouter des recettes</h3>
              
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
                          <h5 className="font-medium text-gray-900 text-sm truncate">{recipe.title}</h5>
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

          {/* Preview */}
          {showPreview && (
            <div className="space-y-4">
              {/* Navigation */}
              <div className="bg-white rounded-lg border p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-700">Aperçu Livre</span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    Page {currentPage + 1} / {allPages.length}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    ← Précédente
                  </button>
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(allPages.length - 1, currentPage + 1))}
                    disabled={currentPage === allPages.length - 1}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Suivante →
                  </button>
                </div>
              </div>

              {/* Aperçu livre */}
              <div className="flex justify-center">
                <div className="relative">
                  {/* Ombre du livre */}
                  <div className="absolute inset-0 bg-black opacity-15 blur-xl transform translate-y-6 scale-105"></div>
                  
                  {(() => {
                    const displayPages = getCurrentDisplayPages();
                    const isDouble = displayPages.length === 2;
                    
                    if (isDouble) {
                      // Double page avec reliure
                      return (
                        <div className="relative bg-gray-800 p-2 rounded-lg shadow-2xl" style={{ 
                          width: '800px',
                          height: '580px'
                        }}>
                          {/* Reliure centrale */}
                          <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gray-900 transform -translate-x-0.5 z-10"></div>
                          
                          <div className="flex h-full gap-1">
                            {/* Page de gauche */}
                            <div className="flex-1 bg-white shadow-lg relative overflow-hidden" style={{
                              transform: 'perspective(1200px) rotateY(3deg)',
                              transformOrigin: 'right center'
                            }}>
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-gray-300 opacity-25 pointer-events-none"></div>
                              <div style={{
                                width: '100%',
                                height: '100%',
                                transform: 'scale(1)',
                                overflow: 'hidden'
                              }}>
                                <div style={{
                                  width: '210mm',
                                  height: '297mm',
                                  transform: 'scale(0.19)',
                                  transformOrigin: 'top left'
                                }}>
                                  {renderPageByIndex(displayPages[0])}
                                </div>
                              </div>
                            </div>
                            
                            {/* Page de droite */}
                            <div className="flex-1 bg-white shadow-lg relative overflow-hidden" style={{
                              transform: 'perspective(1200px) rotateY(-3deg)',
                              transformOrigin: 'left center'
                            }}>
                              <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-gray-300 opacity-25 pointer-events-none"></div>
                              <div style={{
                                width: '100%',
                                height: '100%',
                                transform: 'scale(1)',
                                overflow: 'hidden'
                              }}>
                                <div style={{
                                  width: '210mm',
                                  height: '297mm',
                                  transform: 'scale(0.19)',
                                  transformOrigin: 'top left'
                                }}>
                                  {renderPageByIndex(displayPages[1])}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    } else {
                      // Page seule (couverture, 4e de couv)
                      return (
                        <div className="relative bg-gray-800 p-3 rounded-lg shadow-2xl" style={{ 
                          width: '420px',
                          height: '580px'
                        }}>
                          <div className="bg-white shadow-lg h-full overflow-hidden">
                            <div style={{
                              width: '210mm',
                              height: '297mm',
                              transform: 'scale(0.19)',
                              transformOrigin: 'top left'
                            }}>
                              {renderPageByIndex(displayPages[0])}
                            </div>
                          </div>
                        </div>
                      );
                    }
                  })()}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
