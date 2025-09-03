"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRecipes } from "@/app/providers";

export default function LibraryPage() {
  const { books, createBook, recipes, addRecipeToBook, removeRecipeFromBook } = useRecipes();
  const [title, setTitle] = useState("");

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold">Livre</h1>

      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!title.trim()) return;
          createBook(title.trim());
          setTitle("");
        }}
      >
        <input
          className="w-full max-w-md rounded-md border p-2"
          placeholder="Titre du livre (ex: Recettes de famille)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button className="rounded-md bg-black px-4 py-2 text-white">Créer</button>
      </form>

      {books.map((b) => (
        <div key={b.id} className="rounded-xl border bg-white p-4 shadow-sm">
          <h2 className="text-xl font-medium">{b.title}</h2>
          <p className="text-sm text-gray-600">{b.recipeIds.length} recette(s)</p>

          <div className="mt-3 grid gap-2 md:grid-cols-2">
            <div>
              <h3 className="font-medium">Ajouter au livre</h3>
              <ul className="mt-2 max-h-60 overflow-auto rounded-md border p-2 text-sm">
                {recipes
                  .filter((r) => !b.recipeIds.includes(r.id))
                  .map((r) => (
                    <li key={r.id} className="flex items-center justify-between gap-2 py-1">
                      <span className="truncate">{r.title}</span>
                      <button
                        onClick={() => addRecipeToBook(b.id, r.id)}
                        className="rounded-md border px-2 py-1"
                      >
                        + Ajouter
                      </button>
                    </li>
                  ))}
              </ul>
            </div>

            <div>
              <h3 className="font-medium">Dans le livre</h3>
              <ul className="mt-2 max-h-60 overflow-auto rounded-md border p-2 text-sm">
                {b.recipeIds.map((rid) => {
                  const r = recipes.find((x) => x.id === rid);
                  if (!r) return null;
                  return (
                    <li key={rid} className="flex items-center justify-between gap-2 py-1">
                      <span className="truncate">{r.title}</span>
                      <button
                        onClick={() => removeRecipeFromBook(b.id, rid)}
                        className="rounded-md border px-2 py-1"
                      >
                        Retirer
                      </button>
                    </li>
                  );
                })}
                {!b.recipeIds.length && <li className="text-gray-500">Aucune recette pour l’instant.</li>}
              </ul>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
