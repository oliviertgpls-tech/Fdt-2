"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useRecipes } from "@/contexts/RecipesProvider";
import Image from "next/image";
import Link from "next/link";

export default function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { recipes, deleteRecipe } = useRecipes();
  const recipe = recipes.find((r) => r.id === id);

  // État pour gérer l'étape courante
  const [currentStep, setCurrentStep] = useState(0);
  const [showHelpModal, setShowHelpModal] = useState(true); // Modale d'explication

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

  return (
    <div>
      {/* Mini-modale d'explication */}
      {showHelpModal && hasMultipleSteps && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg">
            <div className="text-center space-y-4">
              <div className="text-3xl">💡</div>
              <h3 className="text-lg font-semibold text-gray-800">
                Navigation par étapes
              </h3>
              <p className="text-gray-600 text-sm">
                Cette recette est divisée en étapes pour être plus facile à suivre. 
                Un <strong>saut de ligne</strong> dans le texte = une nouvelle étape.
              </p>
              <button
                onClick={() => setShowHelpModal(false)}
                className="bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600 transition-colors font-medium"
              >
                J'ai compris
              </button>
            </div>
          </div>
        </div>
      )}

      <article className="space-y-6 max-w-4xl">
        {/* Image principale */}
        {recipe.imageUrl && (
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl border">
            <Image 
              src={recipe.imageUrl} 
              alt={recipe.title} 
              fill 
              className="object-cover" 
            />
          </div>
        )}

        {/* Titre et infos */}
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold">{recipe.title}</h1>
          
          <div className="flex flex-wrap items-center gap-4 text-gray-600">
            {recipe.author && <span>par {recipe.author}</span>}
            {recipe.prepMinutes && <span>⏱ {recipe.prepMinutes} min</span>}
            <div className="flex items-center gap-2">
              <span>👥</span>
              <span>pour {recipe.servings || '4'} personnes</span>
            </div>
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
                className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Ingrédients */}
        <div>
          <h2 className="text-xl font-medium mb-3">🥄 Ingrédients</h2>
          {recipe.ingredients.length > 0 ? (
            <div className="bg-gray-50 rounded-lg p-4">
              <ul className="space-y-2">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="flex-shrink-0 mt-2 w-2 h-2 bg-primary-400 rounded-full"></span>
                    <span className="text-gray-700">{ingredient}</span>
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
            <h2 className="text-xl font-medium">📋 Instructions</h2>
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

                  {/* Indicateur de progression */}
                  <div className="flex gap-1">
                    {steps.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentStep(index)}
                        className={`w-3 h-3 rounded-full transition-colors ${
                          index === currentStep 
                            ? 'bg-primary-500' 
                            : index < currentStep 
                              ? 'bg-secondary-500' 
                              : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>

                  {currentStep < steps.length - 1 ? (
                    <button
                      onClick={nextStep}
                      className="bg-primary-100 text-primary-700 px-4 py-2 rounded-lg hover:bg-primary-200 transition-colors text-sm"
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
                  <summary className="px-4 py-2 cursor-pointer text-gray-600 hover:bg-gray-50 font-medium">
                    👁️ Voir toutes les étapes
                  </summary>
                  <div className="px-4 pb-4 pt-2 border-t border-gray-100">
                    <ol className="space-y-3">
                      {steps.map((step, index) => (
                        <li 
                          key={index} 
                          className={`flex items-start gap-3 p-2 rounded ${
                            index === currentStep ? 'bg-primary-50 border border-primary-200' : ''
                          }`}
                        >
                          <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                            index < currentStep 
                              ? 'bg-secondary-100 text-secondary-600' 
                              : index === currentStep 
                                ? 'bg-primary-100 text-primary-600'
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
        <div className="pt-6 border-t space-y-4">
          <div className="flex gap-3">
            <Link
              href={`/recipes/edit/${recipe.id}`}
              className="flex-1 bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors font-medium text-center"
            >
              ✏️ Modifier cette recette
            </Link>
            <button
              onClick={() => {
                if (window.confirm(`Êtes-vous sûr de vouloir supprimer "${recipe.title}" ?\n\nCette action est irréversible.`)) {
                  deleteRecipe(recipe.id);
                  router.push("/recipes");
                }
              }}
              className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors font-medium"
            >
              🗑️ Supprimer
            </button>
          </div>
          
          <Link 
            href="/recipes" 
            className="block text-center text-primary-600 underline hover:text-primary-700"
          >
            ← Retour à la liste des recettes
          </Link>
        </div>
      </article>
    </div>
  );
}
