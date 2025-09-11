// app/livres/[id]/pdf/page.tsx
"use client";

import React from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useRecipes } from "@/contexts/RecipesProvider";

export default function BookPDFPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const isPDFMode = searchParams.get('pdf') === 'true';
  const { recipes, books } = useRecipes();

  const book = books.find(b => b.id === id);
  
  if (!book) {
    return <div>Livre introuvable</div>;
  }

  const bookRecipes = book.recipeIds
    .map(id => recipes.find(r => r.id === id))
    .filter((recipe): recipe is NonNullable<typeof recipe> => recipe !== undefined);

  // Structure des pages identique à ton système actuel
  const createPageStructure = () => {
    const pages = [];
    
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

  const allPages = createPageStructure();

  // Renderers identiques à ton code actuel
  const renderCoverPage = () => {
    const heroImage = bookRecipes[0]?.imageUrl || "https://images.unsplash.com/photo-1546548970-71785318a17b?q=80&w=600";
    
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
    <div className="cookbook-page bg-cream h-full flex items-center justify-center">
      <p className="text-brown-300 text-xs italic">Page technique pour l'impression</p>
    </div>
  );

  const renderDescriptionPage = () => (
    <div className="cookbook-page bg-cream p-16 h-full">
      <div className="h-full flex flex-col justify-center">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="font-serif text-4xl text-brown-900 mb-8">À propos de ce livre</h2>
          <div className="text-brown-700 text-lg leading-relaxed space-y-6">
            <p>Un recueil précieux de recettes familiales, transmises avec amour de génération en génération. Chaque plat raconte une histoire, chaque saveur évoque des souvenirs partagés autour de la table familiale.</p>
          </div>
          <div className="mt-12 pt-8 border-t border-brown-200">
            <p className="text-brown-600 italic text-base">
              "Les recettes de famille sont bien plus que des instructions : elles sont les gardiens de nos souvenirs et les messagers de notre amour."
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSommaireLeft = () => (
    <div className="cookbook-page bg-cream p-12 h-full">
      <div className="h-full">
        <h2 className="font-serif text-3xl text-brown-900 mb-8 text-center">
          Nos Recettes
        </h2>
        
        <div className="space-y-4 max-h-[80%] overflow-y-auto">
          {bookRecipes.map((recipe, index) => (
            <div key={recipe.id} className="flex items-center gap-4 p-4 bg-brown-50 rounded-lg">
              <span className="w-8 h-8 bg-brown-500 text-cream text-sm font-bold flex items-center justify-center rounded-full flex-shrink-0">
                {index + 1}
              </span>
              
              <img 
                src={recipe.imageUrl || 'https://images.unsplash.com/photo-1546548970-71785318a17b?q=80&w=100'} 
                alt={recipe.title}
                className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
              />
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-brown-900 text-base truncate">{recipe.title}</h4>
                <p className="text-sm text-brown-600">par {recipe.author || 'Famille'}</p>
                <p className="text-xs text-brown-500">Page {6 + (index * 2)}</p>
              </div>
              
              <div className="text-right text-sm text-brown-600">
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
      <div className="cookbook-page bg-cream p-12 h-full">
        <div className="h-full">
          <h2 className="font-serif text-3xl text-brown-900 mb-8 text-center">
            Index & Conseils
          </h2>
          
          <div className="space-y-8">
            <div>
              <h3 className="font-serif text-xl text-brown-800 mb-4 border-b border-brown-300 pb-2">
                Par contributeur
              </h3>
              <div className="space-y-3">
                {Object.entries(recipesByAuthor).map(([author, authorRecipes]) => (
                  <div key={author} className="flex justify-between items-center">
                    <span className="text-base text-brown-700 font-medium">{author}</span>
                    <span className="text-sm text-brown-500">{authorRecipes.length} recettes</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-serif text-xl text-brown-800 mb-4 border-b border-brown-300 pb-2">
                Conseils pratiques
              </h3>
              <div className="text-sm text-brown-700 space-y-3">
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

            <div className="mt-auto pt-6 border-t border-brown-200">
              <p className="text-sm text-brown-500 text-center italic">
                Livre créé avec Carnets Familiaux<br />
                {bookRecipes.length} recettes • {allPages.length} pages
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderBackCover = () => (
    <div className="cookbook-page bg-cream p-16 h-full">
      <div className="h-full flex flex-col justify-between">
        <div></div>
        <div className="text-center">
          <h3 className="font-serif text-3xl text-brown-900 mb-6">Un héritage culinaire</h3>
          <p className="text-brown-700 text-lg max-w-lg mx-auto leading-relaxed mb-8">
            Ce livre rassemble {bookRecipes.length} recettes précieusement conservées et transmises de génération en génération.
          </p>
          <div className="flex items-center justify-center gap-6 mb-6">
            <div className="w-8 h-px bg-brown-400"></div>
            <div className="w-2 h-2 border border-brown-400 rotate-45"></div>
            <div className="w-8 h-px bg-brown-400"></div>
          </div>
          <p className="text-brown-600 text-sm">
            "Que chaque plat continue à rassembler et à nourrir l'amour familial"
          </p>
        </div>
        <div className="text-center text-brown-600 text-sm">
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
      <div className="absolute bottom-8 left-8">
        <h2 className="font-serif text-4xl text-white drop-shadow-2xl">
          {recipe.title}
        </h2>
        <p className="text-white/80 text-base mt-2 drop-shadow-lg">
          par {recipe.author || 'Famille'}
        </p>
      </div>
    </div>
  );

  const renderRecipeContent = (recipe: any) => (
    <div className="cookbook-page bg-cream p-12 h-full">
      <div className="h-full flex flex-col">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-brown-200">
          <div className="text-sm uppercase tracking-widest text-brown-500 font-medium">
            {recipe.author || 'Recette de famille'}
          </div>
          <div className="text-sm text-brown-500">
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

  const renderPageByType = (page: any) => {
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

  if (!isPDFMode) {
    return <div>Cette page est destinée à la génération PDF</div>;
  }

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;1,400&family=Source+Serif+Pro:ital,wght@0,400;0,600;1,400&display=swap');
        
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
          width: 210mm;
          height: 297mm;
          page-break-after: always;
          overflow: hidden;
        }
        
        .cookbook-page:last-child {
          page-break-after: auto;
        }
        
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          body {
            margin: 0;
            padding: 0;
          }
        }
      `}</style>
      
      <div>
        {allPages.map((page, index) => (
          <div key={index}>
            {renderPageByType(page)}
          </div>
        ))}
      </div>
    </>
  );
}
