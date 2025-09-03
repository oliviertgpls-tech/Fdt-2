"use client";

import Link from "next/link";
import Image from "next/image";
import type { Recipe } from "../lib/recipes";

export function RecipeCard({ r }: { r: Recipe }) {
  const href = `/recipes/${r.id}`;

  return (
    <li className="overflow-hidden rounded-2xl border bg-white shadow-sm hover:shadow-md transition">
      <Link href={href} className="block" aria-label={`Voir la recette ${r.title}`}>
        {r.imageUrl && (
          <div className="relative aspect-[4/3]">
            <Image
              src={r.imageUrl}
              alt={r.title}
              fill
              className="object-cover"
              sizes="(max-width:768px) 100vw, 33vw"
            />
          </div>
        )}
        <div className="p-3">
          <h3 className="font-medium">{r.title}</h3>
          <p className="mt-1 text-sm text-gray-600">
            {(r.tags?.slice(0, 2).join(" · ")) || r.ingredients.slice(0, 2).join(" · ")}
            {(r.tags && r.tags.length > 2) || r.ingredients.length > 2 ? "…" : ""}
          </p>
        </div>
      </Link>
    </li>
  );
}
