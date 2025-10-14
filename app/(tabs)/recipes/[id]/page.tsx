"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useRecipes } from "@/contexts/RecipesProvider";
import { OptimizedImage } from "@/components/OptimizedImage"; // 🆕 IMPORT
import { Plus, Eye, Trash2, ArrowLeft, Edit3, Clock4, Utensils, Share, Check} from 'lucide-react';
import Link from "next/link";


export default function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { recipes, deleteRecipe, books, addRecipeToBook } = useRecipes();
  const recipe = recipes.find((r) => r.id === id);

  // État pour gérer l'étape courante
  const [currentStep, setCurrentStep] = useState(0);

  // États pour l'ajout au livre
  const [showBookModal, setShowBookModal] = useState(false);

  if (!recipe) {
    return (
      <div className="space-y-4">
        <p className="text-gray-600">Recette introuvable.</p>
        <Link 
          href="/recipes" 
          className="text-primary-600 underline hover:text-primary-700"
        >
          ← Retour à la liste des recettes
        </Link>
      </div>
    );
  }

  // Fonction pour ajouter au livre
  const handleAddToBook = () => {
    if (books.length === 0) {
      alert("Créez d'abord un livre pour ajouter cette recette !");
      router.push("/livres");
      return;
    }
    
    if (books.length === 1) {
      const book = books[0];
      if (book.recipeIds.includes(recipe.id)) {
        alert("Cette recette est déjà dans votre livre !");
        return;
      }
      addRecipeToBook(book.id, recipe.id);
      alert("Recette ajoutée au livre !");
    } else {
      setShowBookModal(true);
    }
  };

  // Transformer les étapes par saut de ligne
  const processSteps = (stepsText: string) => {
    if (!stepsText) return [];
    
    // Découper par saut de ligne (ligne vide = nouvelle étape)
    const paragraphs = stepsText.split('\n\n').map(p => p.trim()).filter(p => p);
    
    return paragraphs.map((step, index) => {
      // Si déjà numérotées, on garde tel quel, sinon on numérote
      if (/^\d+\.?\s/.test(step)) {
        return step;
      }
      return `${index + 1}. ${step}`;
    });
  };

  const steps = processSteps(recipe.steps || "");
  const hasMultipleSteps = steps.length > 1;

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const resetSteps = () => {
    setCurrentStep(0);
  };

  // Modale de sélection de livre
  const BookSelectionModal = () => {
    const availableBooks = books.filter(book => !book.recipeIds.includes(recipe.id));
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Ajouter à un livre
              </h3>
              <button 
                onClick={() => setShowBookModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                ×
              </button>
            </div>
            
            <div className="mb-6">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                {/* 🚀 IMAGE OPTIMISÉE - Version THUMBNAIL pour la modale (200px) */}
                <OptimizedImage
                  src={recipe.imageVersions || recipe.imageUrl}
                  alt={recipe.title}
                  size="thumbnail" // 🎯 200px pour les vignettes - parfait !
                  className="w-12 h-12 object-cover rounded-lg"
                />
                <div>
                  <h4 className="font-medium text-gray-900">{recipe.title}</h4>
                  <p className="text-sm text-gray-600">par {recipe.author}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {availableBooks.map((book) => (
                <button
                  key={book.id}
                  onClick={() => {
                    addRecipeToBook(book.id, recipe.id);
                    setShowBookModal(false);
                    alert("Recette ajoutée au livre !");
                  }}
                  className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-orange-50 hover:border-orange-300 transition-colors"
                >
                  <h4 className="font-medium text-gray-900">{book.title}</h4>
                  <p className="text-sm text-gray-600">{book.recipeIds.length} recettes</p>
                </button>
              ))}
            </div>

            {availableBooks.length === 0 && (
              <div className="text-center py-6">
                <p className="text-gray-600 mb-4">Cette recette est déjà dans tous vos livres !</p>
                <Link
                  href="/livres"
                  className="text-orange-600 hover:text-orange-700 font-medium"
                  onClick={() => setShowBookModal(false)}
                >
                  Créer un nouveau livre
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
    <Link 
    href="/recipes" 
    className="block text. pb-4 text-primary-400 underline hover:text-primary-700"
    >
      ← Retour à la liste des recettes
    </Link>
      <article className="space-y-6 max-w-4xl">
        
        {/* 🚀 IMAGE PRINCIPALE OPTIMISÉE - Version LARGE pour le détail (2400px) */}
        {(recipe.imageVersions || recipe.imageUrl) && (
          <div className="aspect-[4/3] overflow-hidden rounded-xl border">
            <OptimizedImage
              src={recipe.imageVersions || recipe.imageUrl}
              alt={recipe.title}
              size="large" // 🎯 2400px pour l'affichage principal - haute qualité !
              className="w-full h-full object-cover"
              loading="eager" // Pas lazy pour l'image principale
            />
          </div>
        )}

        {/* Titre et infos avec CTA */}
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-semibold">{recipe.title}</h1>
            </div>
          </div>
          
          <div className="inline-flex items-center gap-1 text-gray-600">
            {recipe.author && <span>par {recipe.author}</span>}
             <Clock4 className="ml-3 w-4 h-4"/>
            {recipe.prepMinutes && <span> {recipe.prepMinutes} min</span>}
             <Utensils className="ml-3 w-4 h-4"/>
              <span>{recipe.servings || '4'} personnes</span>
          </div>
          
          {recipe.description && (
            <p className="text-gray-700">{recipe.description}</p>
          )}
        </div>

        {/* Tags */}
        {recipe.tags && recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {recipe.tags.map((tag) => (
              <span 
                key={tag}
                className="bg-secondary-100 text-gray-700 px-3 py-1 rounded-lg text-sm"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Ingrédients */}
        <div>
          <h2 className="text-xl font-medium mb-3">Ingrédients</h2>
          {recipe.ingredients.length > 0 ? (
            <div className="bg-accent-0 border border-accente-100 rounded-lg p-4">
              <ul className="capitalize space-y-2">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-start gap-2">
                   <div className="items-center inline-flex">
                   <Check className="w-3 h-3 mr-2"/> 
                    <span className="text-gray-700">
                      {ingredient}</span>
                      </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-gray-500 italic">Aucun ingrédient renseigné</p>
          )}
        </div>

        {/* Instructions - Version étapes */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-medium">Instructions</h2>
            {hasMultipleSteps && (
              <div className="text-sm text-gray-500">
                Étape {currentStep + 1} sur {steps.length}
              </div>
            )}
          </div>

          {steps.length > 0 ? (
            <div className="space-y-4">
              {/* Étape courante */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="text-gray-700 text-lg leading-relaxed">
                  {steps[currentStep]}
                </div>
              </div>

              {/* Navigation des étapes */}
              {hasMultipleSteps && (
                <div className="flex items-center justify-between gap-4">
                  <button
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    className="text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    ← Précédente
                  </button>

                  {/* Indicateur de progression avec fenêtre glissante */}
                  <div className="flex gap-1 items-center">
                    {/* Calcul de la fenêtre visible */}
                    {(() => {
                      const MAX_DOTS = 9; // Nombre max de points affichés
                      const totalSteps = steps.length;
                      
                      // Si on a moins de MAX_DOTS étapes, on affiche tout
                      if (totalSteps <= MAX_DOTS) {
                        return steps.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentStep(index)}
                            className={`w-3 h-3 rounded-full transition-colors ${
                              index === currentStep 
                                ? 'bg-secondary-600' 
                                : index < currentStep 
                                  ? 'bg-secondary-400' 
                                  : 'bg-gray-300'
                            }`}
                          />
                        ));
                      }
                      
                      // Sinon, on affiche une fenêtre glissante
                      const halfWindow = Math.floor(MAX_DOTS / 2); // 4 de chaque côté
                      let startIndex = Math.max(0, currentStep - halfWindow);
                      let endIndex = Math.min(totalSteps - 1, startIndex + MAX_DOTS - 1);
                      
                      // Ajustement si on est vers la fin
                      if (endIndex === totalSteps - 1) {
                        startIndex = Math.max(0, endIndex - MAX_DOTS + 1);
                      }
                      
                      const visibleSteps = [];
                      
                      // Indicateur "..." au début si nécessaire
                      if (startIndex > 0) {
                        visibleSteps.push(
                          <span key="start-dots" className="text-gray-400 text-xs px-1">...</span>
                        );
                      }
                      
                      // Points visibles
                      for (let i = startIndex; i <= endIndex; i++) {
                        visibleSteps.push(
                          <button
                            key={i}
                            onClick={() => setCurrentStep(i)}
                            className={`w-3 h-3 rounded-full transition-colors ${
                              i === currentStep 
                                ? 'bg-secondary-600' 
                                : i < currentStep 
                                  ? 'bg-secondary-400' 
                                  : 'bg-gray-200'
                            }`}
                          />
                        );
                      }
                      
                      // Indicateur "..." à la fin si nécessaire
                      if (endIndex < totalSteps - 1) {
                        visibleSteps.push(
                          <span key="end-dots" className="text-gray-400 text-xs px-1">...</span>
                        );
                      }
                      
                      return visibleSteps;
                    })()}
                  </div>

                  {currentStep < steps.length - 1 ? (
                    <button
                      onClick={nextStep}
                      className="bg-secondary-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200 transition-colors text-sm"
                    >
                      Suivante →
                    </button>
                  ) : (
                    <button
                      onClick={resetSteps}
                      className="bg-secondary-100 text-secondary-700 px-4 py-2 rounded-lg hover:bg-secondary-200 transition-colors text-sm"
                    >
                      ↻ Recommencer
                    </button>
                  )}
                </div>
              )}

              {/* Résumé de toutes les étapes (replié par défaut) */}
              {hasMultipleSteps && (
                <details className="border border-gray-200 rounded-lg">
                  <summary className="px-4 py-2 cursor-pointer mr-2 text-gray-600 hover:bg-gray-50 font-medium">
                    Voir toutes les étapes
                  </summary>
                  <div className="px-4 pb-4 pt-2 border-t border-gray-100">
                    <ol className="space-y-3">
                      {steps.map((step, index) => (
                        <li 
                          key={index} 
                          className={`flex items-start gap-3 p-2 rounded ${
                            index === currentStep ? 'bg-primary-50 border border-secondary-200' : ''
                          }`}
                        >
                          <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                            index < currentStep 
                              ? 'bg-secondary-100 text-secondary-600' 
                              : index === currentStep 
                                ? 'bg-primary-500 text-white'
                                : 'bg-gray-100 text-gray-600'
                          }`}>
                            {index < currentStep ? '✓' : index + 1}
                          </span>
                          <span className="text-gray-700 text-sm">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </details>
              )}
            </div>
          ) : (
            <p className="text-gray-500 italic">Aucune instruction renseignée</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end pt-6 border-t space-y-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (window.confirm(`Êtes-vous sûr de vouloir supprimer "${recipe.title}" ?\n\nCette action est irréversible.`)) {
                  deleteRecipe(recipe.id);
                  router.push("/recipes");
                }
              }}
              className="flex items-center justify-between text-red-700 px-2 py-2 rounded-lg hover:bg-red-200 transition-colors font-medium"
            >
              <div className="inline-flex items-center text-sm">
              <Trash2 className="w-4 h-4 mr-2"/> Supprimer
               </div>
            </button>
             <button className="bg-transparent over:bg-blue-100">
               <div className="inline-flex items-center gap-2  mr-3 over:bg-blue-100">
               
                <Share className="w-4 h-4 ml-4 text-blue-700 ml-2 mb-1 over:text-blue-800"/> <span className="text-sm text-blue-800"
                >Partager</span>
                  </div>
                </button>
            <Link
              href={`/recipes/edit/${recipe.id}`}
              className="inline-flex bg-accent-300 text-accent-800 items-center px-4 py-2 text-base rounded-lg hover:bg-accent-400 transition-colors font-medium text-center"
            >
              <div className="inline-flex text-sm items-center">
              <Edit3 className="mr-2 w-4 h-4"/>
              Modifier
              </div>
            </Link>

            
            
          </div>
        </div>
      </article>

      {/* Modale sélection livre */}
      {showBookModal && <BookSelectionModal />}
    </div>
  );
}
