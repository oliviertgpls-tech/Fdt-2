import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-3xl font-semibold">FDT #2 — Carnets de recettes</h1>
      <p className="mt-3 text-gray-600">
        Bienvenue ! Choisis une action pour démarrer.
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Link
          href="/notebooks"
          className="rounded-xl border p-4 hover:bg-gray-50"
        >
          Gérer mes carnets
        </Link>
        <Link
          href="/recipes"
          className="rounded-xl border p-4 hover:bg-gray-50"
        >
          Voir toutes les recettes
        </Link>
      </div>
    </main>
  );
}
