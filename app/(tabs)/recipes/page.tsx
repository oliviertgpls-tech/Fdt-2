"use client";
import { useMemo, useState } from "react";
import { useRecipes } from "@/app/providers";
import { RecipeCard } from "../../../components/RecipeCard";
import { FilterBar } from "@/components/FilterBar";

export default function RecipesPage() {
  const { recipes } = useRecipes();
  const [q, setQ] = useState("");

  const visible = useMemo(() => {
    if (!q) return recipes;
    return recipes.filter((r) => {
      const hay = [
        r.title,
        ...(r.tags || []),
        ...r.ingredients,
        r.author || "",
        (r.steps || "").slice(0, 120),
      ].join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [recipes, q]);

  return (
    <section className="space-y-6">
      <header className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Recettes v2</h1>
          <p className="text-gray-600">{visible.length} / {recipes.length}</p>
        </div>
        <FilterBar onChange={setQ} />
      </header>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((r) => <RecipeCard key={r.id} r={r} />)}
      </ul>
    </section>
  );
}
function SkeletonCard() {
  return <div className="h-56 animate-pulse rounded-2xl bg-gray-100" />;
}
