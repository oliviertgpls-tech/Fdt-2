"use client";

export const dynamic = 'force-dynamic';

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useRecipes } from "@/app/providers";

export default function AddPage() {
  const router = useRouter();
  const { addRecipe } = useRecipes();

  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [ingredientsText, setIngredientsText] = useState("");
  const [steps, setSteps] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const ingredients = ingredientsText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    if (!title.trim()) {
      alert("Titre requis");
      return;
    }

    addRecipe({ title: title.trim(), imageUrl: imageUrl.trim() || undefined, ingredients, steps });
    router.push("/recipes");
  }

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Ajouter une recette</h1>

      {/* 🔥 Bouton de test pour vérifier Tailwind + palette brand */}
      <div className="flex gap-2">
        <button className="bg-brand text-white px-4 py-2 rounded-2xl hover:bg-brand/90">
          Bouton test violet
        </button>
        <button className="border px-4 py-2 rounded-2xl">
          Bouton neutre
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-3 max-w-xl">
        <input
          className="w-full rounded-md border p-2"
          placeholder="Titre"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          className="w-full rounded-md border p-2"
          placeholder="Image URL (optionnel)"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />

        <textarea
          className="w-full rounded-md border p-2"
          placeholder={"Ingrédients (un par ligne)\nex:\nPâtes (200g)\nBasilic\nParmesan"}
          rows={5}
          value={ingredientsText}
          onChange={(e) => setIngredientsText(e.target.value)}
        />

        <textarea
          className="w-full rounded-md border p-2"
          placeholder="Étapes"
          rows={5}
          value={steps}
          onChange={(e) => setSteps(e.target.value)}
        />

        <div className="flex gap-2">
          <button type="submit" className="rounded-md bg-black px-4 py-2 text-white">
            Enregistrer
          </button>
          <button
            type="button"
            onClick={() => {
              setTitle("");
              setImageUrl("");
              setIngredientsText("");
              setSteps("");
            }}
            className="rounded-md border px-4 py-2"
          >
            Reset
          </button>
        </div>
      </form>
    </section>
  );
}
