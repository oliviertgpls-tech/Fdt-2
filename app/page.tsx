import Link from "next/link";

export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="text-6xl"></div>
          <h1 style={{ color: '#292524' }}>
            Les recettes sont votre patrimoine !
          </h1>
        </div>
        
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Préservez et transmettez votre <strong className="text-orange-600">patrimoine culinaire familial</strong>. 
          Créez de beaux livres de recettes à imprimer et partager avec ceux que vous aimez.
        </p>
      </div>

      {/* Actions principales */}
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <Link 
          href="/carnets" 
          className="card group p-8 hover:-translate-y-1 transition-all duration-200"
        >
          <div className="text-center space-y-4">
            <div className="text-5xl group-hover:scale-110 transition-transform">📚</div>
            <h3 className="text-2xl font-bold" style={{ color: '#44403c' }}>
              Mes Carnets
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Organisez vos recettes en <strong>beaux livres</strong> à imprimer et partager avec la famille
            </p>
          </div>
        </Link>

        <Link 
          href="/recipes" 
          className="card group p-8 hover:-translate-y-1 transition-all duration-200"
        >
          <div className="text-center space-y-4">
            <div className="text-5xl group-hover:scale-110 transition-transform">📝</div>
            <h3 className="text-2xl font-bold" style={{ color: '#44403c' }}>
              Mes Recettes
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Consultez, modifiez et ajoutez de <strong>nouvelles recettes</strong> à votre collection précieuse
            </p>
          </div>
        </Link>

        <Link 
          href="/add" 
          className="card group p-8 hover:-translate-y-1 transition-all duration-200 sm:col-span-2 lg:col-span-1"
        >
          <div className="text-center space-y-4">
            <div className="text-5xl group-hover:scale-110 transition-transform">✨</div>
            <h3 className="text-2xl font-bold" style={{ color: '#44403c' }}>
              Nouvelle Recette
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Ajoutez rapidement une <strong>nouvelle recette</strong> à votre collection
            </p>
          </div>
        </Link>
      </div>

      {/* CTA final */}
      <div className="text-center space-y-6">
        <h2 className="text-3xl font-bold" style={{ color: '#44403c' }}>
          Plus qu'un carnet de recettes
        </h2>
        <div className="card p-8">
          <p className="text-lg text-gray-600 leading-relaxed mb-6">
            Créez un <span className="font-semibold text-orange-600">héritage culinaire unique</span> pour votre famille. 
            Un cadeau inoubliable qui traverse les générations.
          </p>
          <Link 
            href="/add"
            className="btn btn-primary text-lg px-8 py-4"
          >
            🌟 Créer mon premier carnet
          </Link>
        </div>
      </div>
    </div>
  );
}
