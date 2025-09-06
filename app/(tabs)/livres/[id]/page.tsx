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
  const [bookDescription, setBookDescription] = useState(book?.description || "Un recueil précieux de recettes familiales, transmises avec amour de génération en génération. Chaque plat raconte une histoire, chaque saveur évoque des souvenirs partagés autour de la table familiale.");

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

  // Types pour les pages
  type PageType = {
    type: string;
    title: string;
    recipe?: any;
    recipeIndex?: number;
  };

  // Structure des pages optimisée pour l'impression
  const createPageStructure = (): PageType[] => {
    const pages: PageType[] = [];
    
    pages.push({ type: 'cover', title: 'Couverture' });
    pages.push({ type: 'blank', title: 'Page technique' });
    pages.push({ type: 'description', title: 'À propos de ce livre' });
    pages.push({ type: 'sommaire-left', title: 'Sommaire - Recettes' });
    pages.push({ type: 'sommaire-right', title: 'Sommaire - Index' });
    
    bookRecipes.forEach((recipe, index) => {
      pages.push({ 
        type: 'recipe-photo', 
        title: `${recipe.title} - Photo`,
        recipe,
        recipeIndex: index 
      });
      pages.push({ 
        type: 'recipe-content', 
        title: `${recipe.title} - Recette`,
        recipe,
        recipeIndex: index 
      });
    });
    
    pages.push({ type: 'back-cover', title: '4e de couverture' });
    
    return pages;
  };

  const allPages: PageType[] = createPageStructure();
  const pageCount = allPages.length;
  const estimatedPrice = Math.max(8, bookRecipes.length * 1.5 + 6);

  // Navigation intelligente
  const getNavigationStep = (currentPageIndex: number) => {
    const page = allPages[currentPageIndex];
    if (page?.type === 'cover' || page?.type === 'back-cover') {
      return 1;
    }
    return 2;
  };

  const navigatePages = (direction: 'prev' | 'next') => {
    const step = getNavigationStep(currentPage);
    
    if (direction === 'next') {
      const nextPage = Math.min(pageCount - 1, currentPage + step);
      setCurrentPage(nextPage);
    } else {
      const prevPage = Math.max(0, currentPage - step);
      setCurrentPage(prevPage);
    }
  };

  // Fonction pour sauvegarder la description
  const saveDescription = () => {
    if (updateBook) {
      updateBook(book.id, { description: bookDescription });
    }
    setEditingDescription(false);
  };

  // Renderers des pages
  const renderCoverPage = () => {
    const heroImage = bookRecipes[0]?.imageUrl || "https://images.unsplash.com/photo-1546548970-71785318a17b?q=80&w=600";
    
    return (
      <div className="cookbook-page bg-cream relative overflow-hidden h-full">
        <div className="relative z-20 h-2/5 flex flex-col justify-center p-8 md:p-12">
          <div className="text-center">
            <p className="text-xs md:text-sm tracking-widest uppercase text-brown-600 font-medium mb-4 md:mb-6">
              Patrimoine Culinaire
            </p>
            <h1 className="font-serif text-3xl md:text-6xl leading-tight text-brown-900 mb-3 md:mb-4">
              {book.title}
            </h1>
            <h2 className="font-serif text-lg md:text-2xl text-brown-700 italic font-light mb-4 md:mb-6">
              Carnet de transmission culinaire
            </h2>
            <div className="flex items-center justify-center gap-4 md:gap-6 mb-3 md:mb-4">
              <div className="w-6 md:w-8 h-px bg-brown-400"></div>
              <div className="w-2 h-2 border border-brown-400 rotate-45"></div>
              <div className="w-6 md:w-8 h-px bg-brown-400"></div>
            </div>
            <p className="text-brown-600 font-light text-sm md:text-lg">
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
          <div className="absolute bottom-6 md:bottom-12 right-6 md:right-12 text-right">
            <p className="text-cream text-sm md:text-lg font-medium tracking-wide drop-shadow-lg">
              Famille
            </p>
            <div className="w-12 md:w-16 h-px bg-cream mt-2 md:mt-3 ml-auto opacity-80"></div>
          </div>
        </div>
      </div>
    );
  };

  const renderBlankPage = () => (
    <div className="cookbook-page bg-cream h-full flex items-center justify-center">
      <p className="text-brown-300 text-xs italic">Page technique pour l'impression</p>
    </div>
  );

  const renderDescriptionPage = () => (
    <div className="cookbook-page bg-cream p-8 md:p-16 h-full">
      <div className="h-full flex flex-col justify-center">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="font-serif text-2xl md:text-4xl text-brown-900 mb-6 md:mb-8">À propos de ce livre</h2>
          <div className="text-brown-700 text-sm md:text-lg leading-relaxed space-y-4 md:space-y-6">
            {bookDescription.split('\n\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
          <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-brown-200">
            <p className="text-brown-600 italic text-sm md:text-base">
              "Les recettes de famille sont bien plus que des instructions : elles sont les gardiens de nos souvenirs et les messagers de notre amour."
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSommaireLeft = () => (
    <div className="cookbook-page bg-cream p-8 md:p-12 h-full">
      <div className="h-full">
        <h2 className="font-serif text-2xl md:text-3xl text-brown-900 mb-6 md:mb-8 text-center">
          Nos Recettes
        </h2>
        
        <div className="space-y-3 md:space-y-4 max-h-[80%] overflow-y-auto">
          {bookRecipes.map((recipe, index) => (
            <div key={recipe.id} className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-brown-50 rounded-lg">
              <span className="w-6 h-6 md:w-8 md:h-8 bg-brown-500 text-cream text-xs md:text-sm font-bold flex items-center justify-center rounded-full flex-shrink-0">
                {index + 1}
              </span>
              
              <img 
                src={recipe.imageUrl || 'https://images.unsplash.com/photo-1546548970-71785318a17b?q=80&w=100'} 
                alt={recipe.title}
                className="w-10 h-10 md:w-12 md:h-12 object-cover rounded-lg flex-shrink-0"
              />
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-brown-900 text-sm md:text-base truncate">{recipe.title}</h4>
                <p className="text-xs md:text-sm text-brown-600">par {recipe.author || 'Famille'}</p>
                <p className="text-xs text-brown-500">Page {6 + (index * 2)}</p>
              </div>
              
              <div className="text-right text-xs md:text-sm text-brown-600">
                <p>⏱️ {recipe.prepMinutes || 30}min</p>
                <p>👥 {recipe.servings || '4'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSommaireRight = () => {
    const recipesByAuthor = bookRecipes.reduce((acc, recipe) => {
      const author = recipe.author || 'Recettes familiales';
      if (!acc[author]) acc[author] = [];
      acc[author].push(recipe);
      return acc;
    }, {} as Record<string, typeof bookRecipes>);

    return (
      <div className="cookbook-page bg-cream p-8 md:p-12 h-full">
        <div className="h-full">
          <h2 className="font-serif text-2xl md:text-3xl text-brown-900 mb-6 md:mb-8 text-center">
            Index & Conseils
          </h2>
          
          <div className="space-y-6 md:space-y-8">
            <div>
              <h3 className="font-serif text-lg md:text-xl text-brown-800 mb-3 md:mb-4 border-b border-brown-300 pb-2">
                Par contributeur
              </h3>
              <div className="space-y-2 md:space-y-3">
                {Object.entries(recipesByAuthor).map(([author, authorRecipes]) => (
                  <div key={author} className="flex justify-between items-center">
                    <span className="text-sm md:text-base text-brown-700 font-medium">{author}</span>
                    <span className="text-xs md:text-sm text-brown-500">{authorRecipes.length} recettes</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-serif text-lg md:text-xl text-brown-800 mb-3 md:mb-4 border-b border-brown-300 pb-2">
                Conseils pratiques
              </h3>
              <div className="text-xs md:text-sm text-brown-700 space-y-2 md:space-y-3">
                <div>
                  <strong>Conversions utiles :</strong>
                  <p>1 tasse = 250ml • 1 c. à soupe = 15ml • 1 c. à café = 5ml</p>
                </div>
                <div>
                  <strong>Températures four :</strong>
                  <p>Doux 150°C • Moyen 180°C • Chaud 210°C • Très chaud 240°C</p>
                </div>
                <div>
                  <strong>Conservation :</strong>
                  <p>Notez vos modifications et ajustements dans les marges</p>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-4 md:pt-6 border-t border-brown-200">
              <p className="text-xs md:text-sm text-brown-500 text-center italic">
                Livre créé avec Carnets Familiaux<br />
                {bookRecipes.length} recettes • {pageCount} pages
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderBackCover = () => (
    <div className="cookbook-page bg-cream p-8 md:p-16 h-full">
      <div className="h-full flex flex-col justify-between">
        <div></div>
        <div className="text-center">
          <h3 className="font-serif text-2xl md:text-3xl text-brown-900 mb-4 md:mb-6">Un héritage culinaire</h3>
          <p className="text-brown-700 text-sm md:text-lg max-w-lg mx-auto leading-relaxed mb-6 md:mb-8">
            Ce livre rassemble {bookRecipes.length} recettes précieusement conservées et transmises de génération en génération.
          </p>
          <div className="flex items-center justify-center gap-4 md:gap-6 mb-4 md:mb-6">
            <div className="w-6 md:w-8 h-px bg-brown-400"></div>
            <div className="w-2 h-2 border border-brown-400 rotate-45"></div>
            <div className="w-6 md:w-8 h-px bg-brown-400"></div>
          </div>
          <p className="text-brown-600 text-xs md:text-sm">
            "Que chaque plat continue à rassembler et à nourrir l'amour familial"
          </p>
        </div>
        <div className="text-center text-brown-600 text-xs md:text-sm">
          <p>Créé avec amour sur Carnets Familiaux</p>
        </div>
      </div>
    </div>
  );

  const renderRecipePhoto = (recipe: any) => (
    <div className="cookbook-page bg-cream relative overflow-hidden h-full">
      <img 
        src={recipe.imageUrl || 'https://images.unsplash.com/photo-1546548970-71785318a17b?q=80&w=600'} 
        alt={recipe.title}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-brown-900 opacity-5"></div>
      <div className="absolute bottom-4 md:bottom-8 left-4 md:left-8">
        <h2 className="font-serif text-2xl md:text-4xl text-white drop-shadow-2xl">
          {recipe.title}
        </h2>
        <p className="text-white/80 text-sm md:text-base mt-1 md:mt-2 drop-shadow-lg">
          par {recipe.author || 'Famille'}
        </p>
      </div>
    </div>
  );

  const renderRecipeContent = (recipe: any) => (
    <div className="cookbook-page bg-cream p-6 md:p-12 h-full">
      <div className="h-full flex flex-col">
        <div className="flex justify-between items-center mb-4 md:mb-6 pb-3 md:pb-4 border-b border-brown-200">
          <div className="text-xs md:text-sm uppercase tracking-widest text-brown-500 font-medium">
            {recipe.author || 'Recette de famille'}
          </div>
          <div className="text-xs md:text-sm text-brown-500">
            {recipe.prepMinutes || 30} min • {recipe.servings || '4'} pers.
          </div>
        </div>

        <div className="mb-6 md:mb-8">
          <h1 className="font-serif text-2xl md:text-4xl text-brown-900 mb-3 md:mb-4 leading-tight">
            {recipe.title}
          </h1>
          <p className="text-brown-600 italic text-sm md:text-base leading-relaxed">
            {recipe.description || `Une délicieuse recette de ${recipe.author || 'famille'}.`}
          </p>
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <div>
            <h3 className="font-serif text-lg md:text-xl text-brown-900 mb-3 md:mb-4 pb-2 border-b border-brown-300">
              Ingrédients
            </h3>
            <div className="space-y-2">
              {(recipe.ingredients || []).map((ingredient: string, index: number) => (
                <div key={index} className="flex items-start gap-3 text-xs md:text-sm">
                  <span className="w-1.5 h-1.5 bg-brown-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-brown-700 leading-relaxed">{ingredient}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="font-serif text-lg md:text-xl text-brown-900 mb-3 md:mb-4 pb-2 border-b border-brown-300">
              Préparation
            </h3>
            <div className="space-y-3">
              {(recipe.steps ? recipe.steps.split('\n\n').filter((step: string) => step.trim()) : []).map((step: string, index: number) => (
                <div key={index} className="flex gap-3">
                  <div className="flex-shrink-0 w-5 h-5 md:w-6 md:h-6 bg-brown-900 text-cream text-xs font-bold flex items-center justify-center rounded-full">
                    {index + 1}
                  </div>
                  <p className="text-xs md:text-sm text-brown-700 leading-relaxed flex-1 pt-0.5">
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
    if (!page) return <div className="cookbook-page bg-cream">Page non trouvée</div>;
    
    switch (page.type) {
      case 'cover':
        return renderCoverPage();
      case 'blank':
        return renderBlankPage();
      case 'description':
        return renderDescriptionPage();
      case 'sommaire-left':
        return renderSommaireLeft();
      case 'sommaire-right':
        return renderSommaireRight();
      case 'back-cover':
        return renderBackCover();
      case 'recipe-photo':
        return page.recipe ? renderRecipePhoto(page.recipe) : <div className="cookbook-page bg-cream">Recette manquante</div>;
      case 'recipe-content':
        return page.recipe ? renderRecipeContent(page.recipe) : <div className="cookbook-page bg-cream">Recette manquante</div>;
      default:
        return <div className="cookbook-page bg-cream">Type de page inconnu</div>;
    }
  };

  // Détermine si on affiche une ou deux pages
  const getCurrentDisplayPages = () => {
    const page = allPages[currentPage];
    
    // Pages seules : SEULEMENT couverture et 4e de couverture
    if (page?.type === 'cover' || page?.type === 'back-cover') {
      return [currentPage];
    }
    
    // TOUTES les autres pages sont en doubles pages avec page paire à gauche
    if (currentPage % 2 === 0) {
      const nextPageExists = currentPage + 1 < allPages.length;
      return nextPageExists ? [currentPage, currentPage + 1] : [currentPage];
    } else {
      return [currentPage - 1, currentPage];
    }
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
        .bg-brown-500 { background-color: #8b5a2b; }
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

      <div className="max-w-7xl mx-auto pt-4 md:pt-8 px-4 md:px-8">
        {/* En-tête responsive */}
        <div className="bg-white rounded-lg shadow-sm border p-3 md:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 md:gap-4 mb-6 md:mb-8">
          <div className="flex items-center gap-3 md:gap-4">
            <button
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-800 transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Retour</span>
            </button>
            
            <div>
              <h1 className="text-lg md:text-xl font-semibold text-gray-800">{book.title}</h1>
              <p className="text-xs md:text-sm text-gray-600">
                {bookRecipes.length} recettes • {pageCount} pages • ≈ {estimatedPrice.toFixed(2)}€
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-3">
            <button 
              onClick={() => setShowPreview(!showPreview)}
              className="bg-gray-100 text-gray-700 px-3 md:px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center gap-2 text-xs md:text-sm"
            >
              <Eye className="w-4 h-4" />
              {showPreview ? 'Masquer' : 'Voir'} aperçu
            </button>
            
            <button className="bg-orange-600 text-white px-3 md:px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors font-medium flex items-center gap-2 text-xs md:text-sm">
              <Upload className="w-4 h-4" />
              Commander ({estimatedPrice.toFixed(2)}€)
            </button>
          </div>
        </div>

        <div className={`grid gap-6 md:gap-8 ${showPreview ? 'grid-cols-1 lg:grid-cols-[1fr_1.2fr]' : 'grid-cols-1'}`}>
          <div className="space-y-4 md:space-y-6 min-w-0 overflow-hidden order-2 lg:order-1">
            {/* Description du livre */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base md:text-lg font-semibold text-gray-800">📝 Description du livre</h2>
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
                    className="w-full h-24 md:h-32 p-3 border border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none resize-none text-sm md:text-base"
                    placeholder="Décrivez ce livre de recettes..."
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={saveDescription}
                      className="bg-blue-600 text-white px-3 md:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-xs md:text-sm"
                    >
                      Sauvegarder
                    </button>
                    <button
                      onClick={() => setEditingDescription(false)}
                      className="bg-gray-100 text-gray-700 px-3 md:px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-xs md:text-sm"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600 text-xs md:text-sm leading-relaxed break-words">
                  {bookDescription}
                </p>
              )}
            </div>

            {/* Contenu du livre */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 min-w-0">
              <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4 md:mb-6">📖 Contenu du livre</h2>
              
              {bookRecipes.length === 0 ? (
                <div className="text-center py-8 md:py-12 text-gray-500">
                  <div className="text-3xl md:text-4xl mb-3">📖</div>
                  <p className="text-sm md:text-base">Livre vide - ajoutez des recettes</p>
                </div>
              ) : (
                <div className="space-y-2 md:space-y-3 overflow-hidden">
                  <div className="bg-orange-50 rounded-lg p-3 md:p-4 border border-orange-200">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-6 h-6 md:w-8 md:h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs md:text-sm font-medium flex-shrink-0">1</span>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-gray-900 text-sm md:text-base truncate">Couverture</h4>
                        <p className="text-xs md:text-sm text-gray-600 truncate">{book.title}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-3 md:p-4 border border-blue-200">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-6 h-6 md:w-8 md:h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs md:text-sm font-medium flex-shrink-0">3</span>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-gray-900 text-sm md:text-base truncate">Description</h4>
                        <p className="text-xs md:text-sm text-gray-600 truncate">À propos de ce livre</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-3 md:p-4 border border-green-200">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-6 h-6 md:w-8 md:h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-xs md:text-sm font-medium flex-shrink-0">4-5</span>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-gray-900 text-sm md:text-base truncate">Sommaire</h4>
                        <p className="text-xs md:text-sm text-gray-600 truncate">Liste des recettes + index</p>
                      </div>
                    </div>
                  </div>

                  {bookRecipes.map((recipe, index) => (
                    <div key={recipe.id} className="bg-purple-50 border border-purple-200 rounded-lg p-3 md:p-4 group min-w-0 overflow-hidden">
                      <div className="flex gap-3 md:gap-4 min-w-0">
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="w-6 h-6 md:w-8 md:h-8 bg-purple-500 text-white text-xs md:text-sm rounded-full flex items-center justify-center font-medium">
                            {6 + (index * 2)}-{7 + (index * 2)}
                          </span>
                          <button className="opacity-50 group-hover:opacity-100 cursor-move p-1 hover:bg-purple-200 rounded transition-all hidden md:block">
                            <GripVertical className="w-3 h-3 md:w-4 md:h-4 text-gray-500" />
                          </button>
                        </div>
                        
                        <img 
                          src={recipe.imageUrl || 'https://images.unsplash.com/photo-1546548970-71785318a17b?q=80&w=100'} 
                          alt={recipe.title}
                          className="w-12 h-12 md:w-16 md:h-16 object-cover rounded-lg flex-shrink-0"
                        />
                        
                        <div className="flex-1 min-w-0 overflow-hidden">
                          <h4 className="font-medium text-gray-900 text-sm md:text-base truncate">{recipe.title}</h4>
                          <p className="text-xs md:text-sm text-gray-600 truncate">par {recipe.author || 'Famille'}</p>
                          <p className="text-xs text-gray-500 mt-1 truncate">
                            Double page • ⏱️ {recipe.prepMinutes || 30}min
                          </p>
                        </div>
                        
                        <button
                          onClick={() => removeRecipeFromBook(book.id, recipe.id)}
                          className="opacity-50 group-hover:opacity-100 text-red-500 hover:text-red-700 p-1 hover:bg-red-100 rounded transition-all flex-shrink-0"
                        >
                          <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Ajouter des recettes */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 min-w-0">
              <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4">➕ Ajouter des recettes</h3>
              
              {availableRecipes.length === 0 ? (
                <div className="text-center py-6 md:py-8 text-gray-500">
                  <div className="text-2xl md:text-3xl mb-2">🎉</div>
                  <p className="text-xs md:text-sm">Toutes vos recettes sont dans ce livre !</p>
                </div>
              ) : (
                <div className="space-y-2 md:space-y-3 max-h-60 md:max-h-80 overflow-y-auto">
                  {availableRecipes.map((recipe) => (
                    <div 
                      key={recipe.id} 
                      className="border border-gray-200 rounded-lg p-3 hover:border-orange-300 hover:bg-orange-50 transition-colors cursor-pointer min-w-0 overflow-hidden"
                      onClick={() => addRecipeToBook(book.id, recipe.id)}
                    >
                      <div className="flex gap-3 min-w-0">
                        <img 
                          src={recipe.imageUrl || 'https://images.unsplash.com/photo-1546548970-71785318a17b?q=80&w=100'}
                          alt={recipe.title}
                          className="w-10 h-10 md:w-12 md:h-12 object-cover rounded-lg flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0 overflow-hidden">
                          <h5 className="font-medium text-gray-900 text-xs md:text-sm truncate">{recipe.title}</h5>
                          <p className="text-xs text-gray-600 truncate">{recipe.author || 'Famille'}</p>
                        </div>
                        <Plus className="w-3 h-3 md:w-4 md:h-4 text-gray-400 self-center flex-shrink-0" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Preview responsive */}
          {showPreview && (
            <div className="space-y-3 md:space-y-4 order-1 lg:order-2 min-w-0">
              {/* Navigation intelligente */}
              <div className="bg-white rounded-lg border p-3 md:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
                <div className="flex items-center gap-3 md:gap-4 min-w-0 overflow-hidden">
                  <span className="text-xs md:text-sm font-medium text-gray-700 flex-shrink-0">Aperçu Livre</span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded flex-shrink-0">
                    {allPages[currentPage]?.title || 'Page inconnue'}
                  </span>
                  <span className="text-xs text-gray-500 flex-shrink-0">
                    {currentPage + 1} / {allPages.length}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => navigatePages('prev')}
                    disabled={currentPage === 0}
                    className="px-2 md:px-3 py-1 text-xs md:text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    ← <span className="hidden sm:inline">
                      {getNavigationStep(Math.max(0, currentPage - getNavigationStep(currentPage))) === 1 ? 'Page' : 'Double'}
                    </span>
                  </button>
                  
                  <button
                    onClick={() => navigatePages('next')}
                    disabled={currentPage >= allPages.length - 1}
                    className="px-2 md:px-3 py-1 text-xs md:text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <span className="hidden sm:inline">
                      {getNavigationStep(currentPage) === 1 ? 'Page' : 'Double'}
                    </span> →
                  </button>
                </div>
              </div>

              {/* Aperçu livre */}
              <div className="flex justify-center overflow-x-auto">
                {(() => {
                  const displayPages = getCurrentDisplayPages();
                  const isDouble = displayPages.length === 2;
                  
                  if (isDouble) {
                    return (
                      <div className="flex gap-1 md:gap-4 p-2 md:p-4 bg-gray-50 rounded-xl shadow-lg min-w-fit">
                        <div className="bg-white shadow-md rounded-lg overflow-hidden w-[140px] h-[190px] md:w-[180px] md:h-[250px]">
                          <div 
                            className="origin-top-left"
                            style={{
                              width: '210mm',
                              height: '297mm',
                              transform: 'scale(0.165)',
                              transformOrigin: 'top left'
                            }}
                          >
                            {renderPageByIndex(displayPages[0])}
                          </div>
                        </div>
                        
                        <div className="bg-white shadow-md rounded-lg overflow-hidden w-[140px] h-[190px] md:w-[180px] md:h-[250px]">
                          <div 
                            className="origin-top-left"
                            style={{
                              width: '210mm',
                              height: '297mm',
                              transform: 'scale(0.165)',
                              transformOrigin: 'top left'
                            }}
                          >
                            {renderPageByIndex(displayPages[1])}
                          </div>
                        </div>
                      </div>
                    );
                  } else {
                    return (
                      <div className="p-2 md:p-4 bg-gray-50 rounded-xl shadow-lg">
                        <div className="bg-white shadow-md rounded-lg overflow-hidden w-[140px] h-[190px] md:w-[180px] md:h-[250px]">
                          <div 
                            className="origin-top-left"
                            style={{
                              width: '210mm',
                              height: '297mm',
                              transform: 'scale(0.165)',
                              transformOrigin: 'top left'
                            }}
                          >
                            {renderPageByIndex(displayPages[0])}
                          </div>
                        </div>
                      </div>
                    );
                  }
                })()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
