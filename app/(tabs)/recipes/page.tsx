"use client";

import Image from "next/image";
import { useRecipes } from "@/app/providers";

export default function RecipesPage() {
  const { recipes } = useRecipes();

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Liste de recettes</h1>
        <p className="text-gray-600">({recipes.length}) recettes</p>
      </header>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {recipes.map((r) => (
          <li key={r.id} className="overflow-hidden rounded-xl border bg-white shadow-sm">
            {r.imageUrl ? (
              <div className="relative aspect-[4/3]">
                <Image
                  src={r.imageUrl}
                  alt={r.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
            ) : null}
            <div className="p-3">
              <h2 className="font-medium">{r.title}</h2>
              <p className="mt-1 text-sm text-gray-600">
                {r.ingredients.slice(0, 3).join(" · ")}
                {r.ingredients.length > 3 ? "…" : ""}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
