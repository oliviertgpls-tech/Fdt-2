"use client";

export const dynamic = "force-dynamic";

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
    router.push("/(tabs)/recipes"); // adapte si ton routeur n'a pas ce segment visible
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold">Ajouter une recette</h1>
      <form onSubmit={onSubmit} className="mt-4 flex gap-2">
        <input
          className="w-full rounded border px-3 py-2"
          placeholder="Titre de la recette"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button className="rounded bg-black px-4 py-2 text-white">Créer</button>
      </form>
    </div>
  );
}
