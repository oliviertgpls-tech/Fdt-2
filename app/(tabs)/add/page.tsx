export default function AddPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Ajouter une recette</h1>
      <form className="space-y-3">
        <input className="w-full rounded-md border p-2" placeholder="Titre" />
        <textarea
          className="w-full rounded-md border p-2"
          placeholder="Ingrédients"
          rows={5}
        />
        <textarea
          className="w-full rounded-md border p-2"
          placeholder="Étapes"
          rows={5}
        />
        <button className="rounded-md bg-black px-4 py-2 text-white">
          Enregistrer (mock)
        </button>
      </form>
    </section>
  );
}
