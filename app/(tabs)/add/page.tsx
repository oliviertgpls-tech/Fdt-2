"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useRecipes } from "@/contexts/RecipesProvider";

export default function AddPage() {
  const router = useRouter();
  const { addRecipe } = useRecipes();
  const [title, setTitle] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    
    addRecipe(t);
    setTitle("");
    router.push("/(tabs)/recipes");
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">✨ Nouvelle Recette</h1>
        <p className="text-gray-600 mt-2">
          Commencez par donner un nom à votre recette
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Titre de la recette
          </label>
          <input
            id="title"
            type="text"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            placeholder="Ex: Gâteau au chocolat de Mamie"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        
        <button 
          type="submit"
          className="w-full rounded-lg bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          disabled={!title.trim()}
        >
          Créer la recette
        </button>
      </form>

      <div className="text-sm text-gray-500">
        💡 <strong>Astuce</strong> : Vous pourrez ajouter les ingrédients, instructions et photos après avoir créé la recette.
      </div>
    </div>
  );
}
