export function RecipeCard({ r }: { r: Recipe }) {
  return (
    <li className="overflow-hidden rounded-2xl border bg-white shadow-sm hover:shadow-md transition">
      {r.imageUrl && (
        <div className="relative aspect-[4/3]">
          <Image src={r.imageUrl} alt={r.title} fill className="object-cover" sizes="(max-width:768px) 100vw, 33vw"/>
        </div>
      )}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium">{r.title}</h3>
          {r.prepMinutes && (
            <span className="rounded-full bg-gray-100 px-2 py-1 text-xs">{r.prepMinutes} min</span>
          )}
        </div>
        <p className="mt-1 text-sm text-gray-600">
          {(r.tags?.slice(0,2).join(" · ")) || r.ingredients.slice(0,2).join(" · ")}
        </p>
      </div>
    </li>
  );
}
