"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useRecipes } from "@/contexts/RecipesProvider";
import type { Recipe } from "@/lib/types";

export default function EditRecipePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { recipes, updateRecipe } = useRecipes();
  
  // Trouver la recette à éditer
  const recipe = recipes.find(r => r.id === id);
  
  // État du formulaire
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [prepMinutes, setPrepMinutes] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [steps, setSteps] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Pré-remplir le formulaire avec les données existantes
  useEffect(() => {
    if (recipe) {
      setTitle(recipe.title);
      setAuthor(recipe.author || "");
      setPrepMinutes(recipe.prepMinutes?.toString() || "");
      setIngredients(recipe.ingredients.join("\n"));
      setSteps(recipe.steps || "");
      setImageUrl(recipe.imageUrl || "");
      setIsLoading(false);
    } else if (recipes.length > 0) {
      // Si les recettes sont chargées mais la recette n'existe pas
      router.push("/recipes");
    }
  }, [recipe, recipes, router]);

  const handleSave = async () => {
    if (!title.trim()) {
      alert("Le titre est obligatoire !");
      return;
    }

    if (!recipe) return;

    setIsSaving(true);

    try {
      const recipeData: Partial<Recipe> = {
        title: title.trim(),
        author: author.trim() || undefined,
        prepMinutes: prepMinutes ? parseInt(prepMinutes) : undefined,
        imageUrl: imageUrl.trim() || undefined,
        // Transformer le textarea en array (1 ligne = 1 ingrédient)
        ingredients: ingredients
          .split('\n')
          .map(line => line.trim())
          .filter(line => line !== ""),
        steps: steps.trim(),
        updatedAt: Date.now()
      };

      updateRecipe(recipe.id, recipeData);
      router.push(`/recipes/${recipe.id}`);
    } catch (error) {
      alert("Erreur lors de la sauvegarde !");
    } finally {
      setIsSaving(false);
    }
  };

  // Affichage pendant le chargement
  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="text-4xl mb-4">⏳</div>
        <p className="text-gray-600">Chargement de la recette...</p>
      </div>
    );
  }

  // Si la recette n'existe pas
  if (!recipe) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="text-6xl mb-4">😕</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Recette introuvable</h1>
        <p className="text-gray-600 mb-6">Cette recette n'existe pas ou a été supprimée.</p>
        <button
          onClick={() => router.push("/recipes")}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          ← Retour aux recettes
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* En-tête */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">
          ✏️ Modifier "{recipe.title}"
        </h1>
        <p className="text-gray-600 text-sm">
          Modifiez votre recette et sauvegardez les changements
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        
        {/* Titre - OBLIGATOIRE */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Nom de la recette *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
            placeholder="Ex: Gâteau de Mamie"
            required
          />
        </div>

        {/* Rangée rapide : Auteur + Temps */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Par qui ?
            </label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none"
              placeholder="Mamie, Papa..."
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Temps (min)
            </label>
            <input
              type="number"
              min="1"
              max="999"
              value={prepMinutes}
              onChange={(e) => setPrepMinutes(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none"
              placeholder="30"
            />
          </div>
        </div>

        {/* Photo (optionnel) */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Photo (optionnel)
          </label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none"
            placeholder="Collez un lien d'image..."
          />
          <p className="text-xs text-gray-500 mt-1">
            💡 Bientôt : photo depuis votre téléphone !
          </p>
        </div>

        {/* Ingrédients - SIMPLE textarea */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            🥄 Ingrédients
          </label>
          <textarea
            rows={6}
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none resize-none"
            placeholder="Tapez chaque ingrédient sur une nouvelle ligne :

200g de farine
3 œufs
100ml de lait
1 pincée de sel"
          />
          <p className="text-xs text-gray-500 mt-1">
            💡 Un ingrédient par ligne, c'est tout !
          </p>
        </div>

        {/* Étapes - SIMPLE textarea */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            📋 Instructions
          </label>
          <textarea
            rows={8}
            value={steps}
            onChange={(e) => setSteps(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none resize-none"
            placeholder="Écrivez les étapes comme vous le feriez naturellement :

Préchauffer le four à 180°C.
Mélanger la farine et le sucre dans un saladier.
Ajouter les œufs un par un...
Enfourner 25 minutes.

Simple et naturel !"
          />
          <p className="text-xs text-gray-500 mt-1">
            💡 Écrivez naturellement, chaque ligne vide ajoute une étape !
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => router.push(`/recipes/${recipe.id}`)}
            className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !title.trim()}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isSaving ? "⏳ Sauvegarde..." : "💾 Sauvegarder"}
          </button>
        </div>
      </div>
    </>
  );
}
