"use client";

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Trash2, Plus, Eye, Upload, GripVertical, ArrowRight, ArrowDownLeft } from 'lucide-react';
import { useRecipes } from "@/contexts/RecipesProvider";

export default function LivreEditorPage() {
  const { id } = useParams();
  const router = useRouter();
  const { recipes, books, addRecipeToBook, removeRecipeFromBook } = useRecipes();

  const book = books.find(b => b.id === id);
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

  const bookRecipes = book.recipeIds
    .map(id => recipes.find(r => r.id === id))
    .filter((recipe): recipe is NonNullable<typeof recipe> => recipe !== undefined);

  const availableRecipes = recipes.filter(recipe => !book.recipeIds.includes(recipe.id));

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
      chef_note: `Conseil de ${recipe.author || 'famille'} : Cette recette fait partie de notre patrimoine culinaire familial.`,
      photoQuality: Math.random() > 0.7 ? 'low' : 'good'
    }))
  };

  const pages = [
    'cover', 
    ...bookRecipes.flatMap(recipe => [`photo-${recipe.id}`, `recipe-${recipe.id}`])
  ];
  const pageCount = pages.length;
  const estimatedPrice = Math.max(8, bookRecipes.length * 1.5 + 6);

  const renderCoverPage = () => {
    const randomRecipe = previewBook.recipes[Math.floor(Math.random() * previewBook.recipes.length)];
    const heroImage = randomRecipe?.imageUrl || "https://images.unsplash.com/photo-1546548970-71785318a17b?q=80&w=600";
    
    return (
      <div className="cookbook-page bg-cream relative overflow-hidden h-full">
        <div className="relative z-20 h-1/5 flex flex-col justify-center p-8">
          <div className="text-center">
            <p className="text-xs tracking-widest uppercase text-brown-600 font-medium mb-4">
              Patrimoine Culinaire
            </p>
            <h1 className="font-serif text-5xl leading-tight text-brown-900 mb-3">
              {previewBook.title}
            </h1>
            <h2 className="font-serif text-xl text-brown-700 italic font-light mb-3">
              {previewBook.subtitle}
            </h2>
            <div className="flex items-center justify-center gap-4 mb-2">
              <div className="w-6 h-px bg-brown-400"></div>
              <div className="w-1.5 h-1.5 border border-brown-400 rotate-45"></div>
              <div className="w-6 h-px bg-brown-400"></div>
            </div>
            <p className="text-brown-600 font-light text-sm">
              {bookRecipes.length} recettes de famille
            </p>
          </div>
        </div>
        
        <div className="relative h-4/5">
          <img 
            src={heroImage}
            alt="Photo de couverture"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-brown-900 opacity-15"></div>
          <div className="absolute bottom-8 right-8 text-right">
            <p className="text-cream text-sm font-medium tracking-wide drop-shadow-lg">
              {previewBook.author}
            </p>
            <div className="w-12 h-px bg-cream mt-2 ml-auto opacity-80"></div>
          </div>
        </div>
      </div>
    );
  };

  const renderPhotoPage = (recipe: any) => (
    <div className="cookbook-page bg-cream relative overflow-hidden h-full">
      <img 
        src={recipe.imageUrl} 
        alt={recipe.title}
        className="w-full h-full object-cover"
      />
      
      <div className="absolute inset-0 bg-brown-900 opacity-5"></div>
      
      {recipe.photoQuality === 'low' && (
        <div className="absolute bottom-8 right-8 bg-orange-500 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg">
          ⚠️ Photo à améliorer
        </div>
      )}
    </div>
  );

  const renderRecipeFullPage = (recipe: any) => (
    <div className="cookbook-page bg-cream p-16 h-full">
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
          <h1 className="font-serif text-5xl text-brown-900 mb-6 leading-tight">
            {recipe.title}
          </h1>
          
          <div className="flex items-center gap-8 text-base text-brown-600 mb-6">
            <div className="flex items-center gap-2">
              <span className="font-medium">Par</span>
              <span className="italic text-brown-700">{recipe.author}</span>
            </div>
            <div className="w-px h-5 bg-brown-300"></div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Préparation</span>
              <span>{recipe.prepMinutes} min</span>
            </div>
            <div className="w-px h-5 bg-brown-300"></div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Pour</span>
              <span>{recipe.servings}</span>
            </div>
          </div>

          <p className="text-brown-600 italic text-lg leading-relaxed border-l-4 border-brown-200 pl-4">
            {recipe.description}
          </p>
        </div>

        <div className="flex-1 grid grid-cols-5 gap-12">
          <div className="col-span-2">
            <h3 className="font-serif text-2xl text-brown-900 mb-6 pb-3 border-b-2 border-brown-300">
              Ingrédients
            </h3>
            <div className="space-y-3">
              {recipe.ingredients.map((ingredient: string, index: number) => (
                <div key={index} className="flex items-start gap-4 text-base">
                  <span className="w-2 h-2 bg-brown-500 rounded-full mt-3 flex-shrink-0"></span>
                  <span className="text-brown-700 leading-relaxed">{ingredient}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="col-span-3">
            <h3 className="font-serif text-2xl text-brown-900 mb-6 pb-3 border-b-2 border-brown-300">
              Préparation
            </h3>
            
            <div className="space-y-5">
              {recipe.steps.map((step: string, index: number) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-brown-900 text-cream text-sm font-bold flex items-center justify-center rounded-full">
                    {index + 1}
                  </div>
                  <p className="text-base text-brown-700 leading-relaxed flex-1 pt-1">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {recipe.chef_note && (
          <div className="mt-8 pt-6 border-t-2 border-brown-200">
            <div className="bg-brown-50 border-l-4 border-brown-400 p-6 rounded-r-lg">
              <h4 className="font-serif text-lg text-brown-900 mb-3 font-medium flex items-center gap-2">
                <span className="text-2xl">💡</span>
                Conseil de {recipe.author}
              </h4>
              <p className="text-base text-brown-600 leading-relaxed italic">
                {recipe.chef_note}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderPageByIndex = (pageIndex: number) => {
    const page = pages[pageIndex];
    
    if (page === 'cover') return renderCoverPage();
    if (page?.startsWith('photo-')) {
      const recipeId = page.replace('photo-', '');
      const recipe = previewBook.recipes.find(r => r.id === recipeId);
      if (recipe) return renderPhotoPage(recipe);
    }
    if (page?.startsWith('recipe-')) {
      const recipeId = page.replace('recipe-', '');
      const recipe = previewBook.recipes.find(r => r.id === recipeId);
      if (recipe) return renderRecipeFullPage(recipe);
    }
    
    return <div className="cookbook-page bg-cream flex items-center justify-center text-brown-600">Page non trouvée</div>;
  };

  return (
    <div className="min-h-screen bg-stone-100">
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
          <div className="space-y-6">
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
                            Pages {(index * 2) + 2}-{(index * 2) + 3} • ⏱️ {recipe.prepMinutes}min
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              if (showPreview) {
                                const photoPageIndex = pages.findIndex(p => p === `photo-${recipe.id}`);
                                if (photoPageIndex !== -1) {
                                  setCurrentPage(photoPageIndex);
                                }
                              }
                            }}
                            className="opacity-50 group-hover:opacity-100 p-1 hover:bg-blue-200 rounded transition-all text-blue-600"
                            title="Voir la photo dans l'aperçu"
                          >
                            📸
                          </button>
                          <button
                            onClick={() => {
                              if (showPreview) {
                                const recipePageIndex = pages.findIndex(p => p === `recipe-${recipe.id}`);
                                if (recipePageIndex !== -1) {
                                  setCurrentPage(recipePageIndex);
                                }
                              }
                            }}
                            className="opacity-50 group-hover:opacity-100 p-1 hover:bg-blue-200 rounded transition-all text-green-600"
                            title="Voir la recette dans l'aperçu"
                          >
                            📄
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

          {showPreview && bookRecipes.length > 0 && (
            <div className="space-y-6">
              {/* Contrôles navigation */}
              <div className="bg-white rounded-lg shadow-sm border p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-700">Aperçu Livre</span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    Pages {Math.floor(currentPage / 2) * 2 + 1}-{Math.floor(currentPage / 2) * 2 + 2} / {pages.length}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(0, currentPage - 2))}
                    disabled={currentPage <= 1}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    ← Double page précédente
                  </button>
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(pages.length - 1, currentPage + 2))}
                    disabled={currentPage >= pages.length - 2}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Double page suivante →
                  </button>
                </div>
              </div>

              {/* Aperçu livre ouvert - Double page avec effet d'ombre */}
              <div className="flex justify-center">
                <div className="relative">
                  {/* Ombre du livre */}
                  <div className="absolute inset-0 bg-black opacity-20 blur-xl transform translate-y-8 scale-105"></div>
                  
                  {/* Livre ouvert */}
                  <div className="relative bg-gray-800 p-2 rounded-lg shadow-2xl" style={{ 
                    width: '840px',
                    height: '600px'
                  }}>
                    {/* Reliure centrale */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gray-900 transform -translate-x-0.5 z-10"></div>
                    
                    <div className="flex h-full gap-1">
                      {/* Page de gauche */}
                      <div className="flex-1 bg-white shadow-lg relative overflow-hidden" style={{
                        transform: 'perspective(1000px) rotateY(2deg)',
                        transformOrigin: 'right center'
                      }}>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-gray-200 opacity-30 pointer-events-none"></div>
                        <div style={{
                          width: '210mm',
                          height: '297mm',
                          transform: 'scale(0.25)',
                          transformOrigin: 'top left'
                        }}>
                          {renderPageByIndex(Math.floor(currentPage / 2) * 2)}
                        </div>
                      </div>
                      
                      {/* Page de droite */}
                      <div className="flex-1 bg-white shadow-lg relative overflow-hidden" style={{
                        transform: 'perspective(1000px) rotateY(-2deg)',
                        transformOrigin: 'left center'
                      }}>
                        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-gray-200 opacity-30 pointer-events-none"></div>
                        <div style={{
                          width: '210mm',
                          height: '297mm',
                          transform: 'scale(0.25)',
                          transformOrigin: 'top left'
                        }}>
                          {Math.floor(currentPage / 2) * 2 + 1 < pages.length 
                            ? renderPageByIndex(Math.floor(currentPage / 2) * 2 + 1)
                            : <div className="cookbook-page bg-cream"></div>
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Effet de brillance subtil */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white via-transparent to-transparent opacity-10 pointer-events-none rounded-lg"></div>
                </div>
              </div>

              {/* Navigation par miniatures */}
              <div className="bg-white rounded-lg border p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Navigation rapide</h4>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {Array.from({ length: Math.ceil(pages.length / 2) }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i * 2)}
                      className={`flex-shrink-0 w-16 h-20 border-2 rounded text-xs p-1 transition-colors ${
                        Math.floor(currentPage / 2) === i 
                          ? 'border-orange-500 bg-orange-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-gray-600">
                        {i * 2 + 1}-{Math.min(i * 2 + 2, pages.length)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        
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
