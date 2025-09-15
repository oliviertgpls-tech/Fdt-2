"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useRecipes } from "@/contexts/RecipesProvider";
import { ImageSearch } from "@/components/ImageSearch";
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
  const [servings, setServings] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [steps, setSteps] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showHelpModal, setShowHelpModal] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  // Pré-remplir le formulaire avec les données existantes
  useEffect(() => {
    if (recipe) {
      setTitle(recipe.title);
      setAuthor(recipe.author || "");
      setPrepMinutes(recipe.prepMinutes?.toString() || "");
      setServings(recipe.servings || "");
      setIngredients(recipe.ingredients.join("\n"));
      setSteps(recipe.steps || "");
      setImageUrl(recipe.imageUrl || "");
      setIsLoading(false);
    } else if (recipes.length > 0) {
      router.push("/recipes");
    }
  }, [recipe, recipes, router]);

  // Upload d'image personnelle
  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    
    try {
      console.log('🚀 Upload en cours...', file.name);
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erreur HTTP: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ Upload réussi:', result);
      
      if (result.success) {
        setImageUrl(result.imageUrl); // URL permanente : /uploads/filename.jpg
        console.log('📸 Image URL mise à jour:', result.imageUrl);
      } else {
        throw new Error(result.error || 'Erreur upload');
      }
      
    } catch (error: any) {
      console.error('💥 Erreur upload:', error);
      alert("Erreur lors de l'upload : " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

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
        servings: servings.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
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
          className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
        >
          ← Retour aux recettes
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Mini-modale d'explication pour la saisie */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg">
            <div className="text-center space-y-4">
              <div className="text-3xl">✍️</div>
              <h3 className="text-lg font-semibold text-gray-800">
                Saisie des étapes
              </h3>
              <p className="text-gray-600 text-sm">
                Pour créer des étapes séparées, <strong>laissez une ligne vide</strong> entre chaque étape dans le champ instructions.
                <br/><br/>
                Exemple :<br/>
                <code className="bg-gray-100 p-2 rounded text-xs block mt-2">
                  Étape 1 : Préchauffer le four...
                  <br/><br/>
                  Étape 2 : Mélanger les ingrédients...
                </code>
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

          {/* Rangée rapide : Auteur + Temps + Personnes */}
          <div className="grid grid-cols-3 gap-4">
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
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Personnes
              </label>
              <input
                type="text"
                value={servings}
                onChange={(e) => setServings(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none"
                placeholder="4, 6-8..."
              />
            </div>
          </div>

          {/* Photo - AMÉLIORÉE avec Upload + Unsplash */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Photo (optionnel)
            </label>
            
            <div className="space-y-3">
              {/* URL manuelle */}
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none"
                placeholder="Collez un lien d'image..."
              />
              
              {/* Boutons d'actions */}
              <div className="flex flex-wrap gap-3">
                {/* Upload photo personnelle */}
                <label className="flex items-center gap-2 px-4 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file);
                    }}
                    className="hidden"
                    disabled={isUploading}
                  />
                  📷 {isUploading ? "Upload..." : "Ma photo"}
                </label>

                {/* Recherche Unsplash */}
                <ImageSearch 
                  onImageSelect={(url) => setImageUrl(url)}
                  initialQuery={title}
                />
              </div>
              
              {/* Aperçu */}
              {imageUrl && (
                <div className="mt-3 relative">
                  <img 
                    src={imageUrl} 
                    alt="Aperçu" 
                    className="w-full max-w-xs h-32 object-cover rounded-lg border"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <button
                    onClick={() => setImageUrl("")}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
            
            <p className="text-xs text-gray-500 mt-2">
              💡 Prenez une photo, cherchez sur Unsplash ou collez un lien !
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
              💡 Laissez une ligne vide entre chaque étape pour une navigation plus facile !
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
              disabled={isSaving || !title.trim() || isUploading}
              className="flex-1 bg-primary-500 text-white py-3 rounded-lg font-medium hover:bg-primary-600 disabled:opacity-50 transition-colors"
            >
              {isSaving ? "⏳ Sauvegarde..." : isUploading ? "📤 Upload..." : "💾 Sauvegarder"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
