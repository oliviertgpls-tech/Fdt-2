"use client";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useRecipes } from "@/app/providers";

export default function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { recipes } = useRecipes();
  const r = recipes.find((x) => x.id === id);

  if (!r) {
    return (
      <div className="space-y-3">
        <p>Recette introuvable.</p>
        <Link href="/recipes" className="text-blue-600 underline">Retour</Link>
      </div>
    );
  }

  return (
    <article className="grid gap-6 md:grid-cols-3">
      <div className="md:col-span-2">
        {r.imageUrl ? (
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl border">
            <Image src={r.imageUrl} alt={r.title} fill className="object-cover" sizes="100vw" />
          </div>
        ) : null}
        <h1 className="mt-4 text-3xl font-semibold">{r.title}</h1>
        {r.author ? <p className="text-sm text-gray-600">de {r.author}</p> : null}
        <section className="mt-6 space-y-2">
          <h2 className="text-xl font-medium">Étapes</h2>
          <p className="whitespace-pre-line text-gray-800">{r.steps}</p>
        </section>
      </div>
      <aside className="space-y-3">
        <h2 className="text-xl font-medium">Ingrédients</h2>
        <ul className="list-disc pl-5 text-gray-800">
          {r.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
        </ul>
        {r.tags?.length ? (
          <div className="pt-4">
            <h3 className="font-medium">Tags</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {r.tags.map((t) => <span key={t} className="rounded-full bg-gray-100 px-3 py-1 text-sm">{t}</span>)}
            </div>
          </div>
        ) : null}
        <Link href="/recipes" className="text-blue-600 underline">← Retour à la liste</Link>
      </aside>
    </article>
  );
}
