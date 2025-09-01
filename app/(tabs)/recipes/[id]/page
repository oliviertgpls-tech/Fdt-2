"use client";

import { useParams } from "next/navigation";
import { useRecipes } from "../../providers";
import Image from "next/image";
import Link from "next/link";

export default function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { recipes } = useRecipes();
  const r = recipes.find((x) => x.id === id);

  if (!r) {
    return (
      <div className="space-y-3">
        <p>Recette introuvable.</p>
        <Link href="/recipes" className="text-brand underline">Retour</Link>
      </div>
    );
  }

  return (
    <article className="space-y-4">
      {r.imageUrl && (
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl border">
          <Image src={r.imageUrl} alt={r.title} fill className="object-cover" />
        </div>
      )}
      <h1 className="text-3xl font-semibold">{r.title}</h1>
      {r.author && <p className="text-gray-600">par {r.author}</p>}
      {r.prepMinutes && <p className="text-gray-600">⏱ {r.prepMinutes} min</p>}

      <h2 className="text-xl font-medium">Ingrédients</h2>
      <ul className="list-disc pl-6">
        {r.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
      </ul>

      <h2 className="text-xl font-medium mt-4">Étapes</h2>
      <p className="whitespace-pre-line">{r.steps}</p>

      <Link href="/recipes" className="text-brand underline block mt-6">← Retour à la liste</Link>
    </article>
  );
}
