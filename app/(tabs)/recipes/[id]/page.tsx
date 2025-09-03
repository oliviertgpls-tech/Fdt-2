"use client";

import { useParams, useRouter } from "next/navigation";
import { useRecipes } from "@/contexts/RecipesProvider";
import Image from "next/image";
import Link from "next/link";

export default function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { recipes, deleteRecipe } = useRecipes();
  const recipe = recipes.find((r) => r.id === id);

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
        <h2 className="text-xl font-medium mb-3">Ingrédients</h2>
        {recipe.ingredients.length > 0 ? (
          <ul className="list-disc pl-6 space-y-1">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index} className="text-gray-700">{ingredient}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 italic">Aucun ingrédient renseigné</p>
        )}
      </div>

      {/* Instructions */}
      <div>
        <h2 className="text-xl font-medium mb-3">Instructions</h2>
        {recipe.steps ? (
          <div className="prose prose-gray">
            <p className="whitespace-pre-line text-gray-700">{recipe.steps}</p>
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
          className="block text-center text-blue-600 underline hover:text-blue-800"
        >
          ← Retour à la liste des recettes
        </Link>
      </div>
    </article>
  );
}
