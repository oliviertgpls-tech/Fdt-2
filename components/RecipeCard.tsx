"use client";
import Image from "next/image";
import type { Recipe } from "@/lib/types";

export function RecipeCard({ r }: { r: Recipe }) {
  return (
    <li className="overflow-hidden rounded-xl border bg-white shadow-sm">
      {r.imageUrl ? (
        <div className="relative aspect-[4/3]">
          <Image src={r.imageUrl} alt={r.title} fill className="object-cover" sizes="(max-width:768px) 100vw, 33vw" />
        </div>
      ) : null}
      <div className="p-3">
        <h3 className="font-medium">{r.title}</h3>
        <p className="mt-1 text-sm text-gray-600">
          {r.tags?.slice(0, 3).join(" · ") || r.ingredients.slice(0, 3).join(" · ")}
          {(r.tags && r.tags.length > 3) || r.ingredients.length > 3 ? "…" : ""}
        </p>
      </div>
    </li>
  );
}
