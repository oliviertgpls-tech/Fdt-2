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

  if (!recipe) {
    return (
      <div className="space-y-4">
        <p className="text-gray-600">Recette introuvable.</p>
        <Link 
          href="/recipes" 
          className="text-blue-600 underline hover:text-blue-800"
        >
          ← Retour à la liste des recettes
        </Link>
      </div>
    );
  }

  // Transformer les étapes en array (séparer par lignes vides ou numéros)
  const processSteps = (stepsText: string) => {
    if (!stepsText) return [];
    
    // Découper par lignes et nettoyer
    const lines = stepsText.split('\n').map(line => line.trim()).filter(line => line);
    
    // Si déjà numérotées, on garde tel quel, sinon on numérote
    return lines.map((step, index) => {
      // Si la ligne commence déjà par un numéro, on la garde
      if (/^\d+\.?\s/.test(step)) {
        return step;
      }
      // Sinon on ajoute le numéro
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
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">{recipe.title}</h1>
        {recipe.author && (
          <p className="text-gray-600">par {recipe.author}</p>
        )}
        {recipe.prepMinutes && (
          <p className="text-gray-600">⏱ {recipe.prepMinutes} min de préparation</p>
        )}
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
                <li key={index} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </span>
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
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Étape précédente
                </button>

                {/* Indicateur de progression */}
                <div className="flex gap-1">
                  {steps.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentStep(index)}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        index === currentStep 
                          ? 'bg-blue-500' 
                          : index < currentStep 
                            ? 'bg-green-500' 
                            : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>

                {currentStep < steps.length - 1 ? (
                  <button
                    onClick={nextStep}
                    className="flex items-center gap-2 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium"
                  >
                    Étape suivante →
                  </button>
                ) : (
                  <button
                    onClick={resetSteps}
                    className="flex items-center gap-2 bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors font-medium"
                  >
                    ✅ Recommencer
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
                          index === currentStep ? 'bg-blue-50 border border-blue-200' : ''
                        }`}
                      >
                        <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                          index < currentStep 
                            ? 'bg-green-100 text-green-600' 
                            : index === currentStep 
                              ? 'bg-blue-100 text-blue-600'
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
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-center"
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
    </>
  );
}
