"use client";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import { useMemo, useState } from "react";
import { useRecipes } from "@/contexts/RecipesProvider";
import { RecipeCard } from "../../../components/RecipeCard";

export default function RecipesPage() {
  const { recipes } = useRecipes();
  const [q, setQ] = useState("");

  const visible = useMemo(() => {
    if (!q) return recipes;
    return recipes.filter((r) =>
      [r.title, ...(r.tags || []), ...r.ingredients, r.author || "", r.steps || ""]
        .join(" ")
        .toLowerCase()
        .includes(q.toLowerCase())
    );
  }, [recipes, q]);

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Recettes</h1>
        <input
          className="mt-2 w-full max-w-md rounded-md border p-2"
          placeholder="Rechercher…"
          onChange={(e) => setQ(e.target.value)}
        />
        <p className="text-gray-600">{visible.length} / {recipes.length} résultats</p>
      </header>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((r) => <RecipeCard key={r.id} r={r} />)}
      </ul>
    </section>
  );
}
