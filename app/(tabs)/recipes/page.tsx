"use client";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import Link from "next/link";
import { useState, useMemo } from "react";
import { useRecipes } from "@/contexts/RecipesProvider";

export default function RecipesPage() {
  const { recipes } = useRecipes();
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return recipes;
    return recipes.filter((r) => {
      const haystack = [
        r.title || "",
        ...(r.tags || []),
        ...(r.ingredients || []),
        ...(r.steps || []),
        r.author || "",
        r.description || "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [recipes, q]);

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Toutes les recettes</h1>
        <Link href="/(tabs)/add" className="text-sm hover:underline">Ajouter</Link>
      </div>

      <div className="mt-4">
        <input
          className="w-full rounded border px-3 py-2"
          placeholder="Rechercher (titre, tags, ingrédients...)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <p className="mt-6 text-gray-500">Aucune recette ne correspond.</p>
      ) : (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {filtered.map((r) => (
            <li key={r.id} className="rounded border p-4 hover:bg-gray-50">
              <span className="font-medium">{r.title}</span>
              {r.tags && r.tags.length > 0 && (
                <div className="mt-2 text-xs text-gray-500">
                  {r.tags.join(" · ")}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
