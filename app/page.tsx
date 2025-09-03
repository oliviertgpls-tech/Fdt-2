import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">
          🍽️ Carnets de Recettes Familiaux
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Préservez et transmettez votre patrimoine culinaire familial. 
          Créez de beaux livres de recettes à imprimer et à offrir.
        </p>
      </div>

      {/* Actions principales */}
      <div className="grid gap-6 sm:grid-cols-2 max-w-4xl mx-auto">
        <Link 
          href="/library" 
          className="group p-8 rounded-2xl border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
        >
          <div className="space-y-3">
            <div className="text-4xl">📚</div>
            <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-700">
              Mes Carnets
            </h3>
            <p className="text-gray-600">
              Organisez vos recettes en beaux livres à imprimer et partager avec la famille
            </p>
          </div>
        </Link>

        <Link 
          href="/recipes" 
          className="group p-8 rounded-2xl border-2 border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all"
        >
          <div className="space-y-3">
            <div className="text-4xl">📝</div>
            <h3 className="text-xl font-semibold text-gray-900 group-hover:text-green-700">
              Mes Recettes
            </h3>
            <p className="text-gray-600">
              Consultez, modifiez et ajoutez de nouvelles recettes à votre collection
            </p>
          </div>
        </Link>

        <Link 
          href="/add" 
          className="group p-8 rounded-2xl border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all"
        >
          <div className="space-y-3">
            <div className="text-4xl">✨</div>
            <h3 className="text-xl font-semibold text-gray-900 group-hover:text-purple-700">
              Nouvelle Recette
            </h3>
            <p className="text-gray-600">
              Ajoutez rapidement une nouvelle recette à votre collection
            </p>
          </div>
        </Link>

        <div className="group p-8 rounded-2xl border-2 border-gray-200 bg-gray-50">
          <div className="space-y-3">
            <div className="text-4xl">🖨️</div>
            <h3 className="text-xl font-semibold text-gray-500">
              Impression PDF
            </h3>
            <p className="text-gray-500">
              Fonctionnalité à venir - Créez de beaux livres imprimables
            </p>
          </div>
        </div>
      </div>

      {/* Proposition de valeur */}
      <div className="text-center space-y-4 max-w-3xl mx-auto pt-8 border-t">
        <h2 className="text-2xl font-semibold text-gray-800">
          Plus qu'un carnet de recettes
        </h2>
        <p className="text-gray-600 leading-relaxed">
          Créez un héritage culinaire unique pour votre famille. Transformez vos recettes 
          préférées en beaux livres imprimables, avec photos, histoires et dédicaces. 
          Un cadeau inoubliable qui traverse les générations.
        </p>
      </div>
    </div>
  );
}
