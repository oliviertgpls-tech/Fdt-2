export default function AddPage() {
  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">✨ Ajouter une recette</h1>
      
      <div className="bg-white border rounded-lg p-6">
        <p className="text-lg text-gray-700 mb-4">
          🎉 Ça marche ! La page add fonctionne.
        </p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom de la recette
            </label>
            <input 
              type="text" 
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Ex: Gâteau au chocolat"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ingrédients
            </label>
            <textarea 
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="200g de farine&#10;3 œufs&#10;100ml de lait"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Instructions
            </label>
            <textarea 
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Mélanger tous les ingrédients..."
            />
          </div>
          
          <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700">
            Sauvegarder (bientôt fonctionnel)
          </button>
        </div>
      </div>
      
      <div className="mt-6 text-center">
        <a href="/" className="text-blue-600 hover:text-blue-800 underline">
          ← Retour à l'accueil
        </a>
      </div>
    </div>
  );
}
