import Link from "next/link";

export default function HomePage() {
  return (
    <div className="container-content space-section animate-in">
      {/* Hero Section */}
      <div className="text-center space-content">
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="text-5xl">🍽️</div>
          <h1 className="text-display text-responsive-xl text-primary-600">
            Carnets de Recettes Familiaux
          </h1>
        </div>
        <p className="text-responsive-base text-neutral-600 max-w-3xl mx-auto leading-relaxed">
          Préservez et transmettez votre <span className="text-emphasis">patrimoine culinaire familial</span>. 
          Créez de beaux livres de recettes à imprimer et partager avec ceux que vous aimez.
        </p>
        <div className="flex flex-wrap justify-center gap-2 mt-6">
          <span className="tag tag-primary">👨‍👩‍👧‍👦 Familial</span>
          <span className="tag tag-secondary">🌿 Naturel</span>
          <span className="tag tag-accent">✨ Magique</span>
        </div>
      </div>

      {/* Actions principales */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Link 
          href="/library" 
          className="card-hover group p-8 bg-gradient-warm"
        >
          <div className="space-content text-center">
            <div className="text-5xl mb-4 group-hover:animate-bounce-gentle">📚</div>
            <h3 className="text-display text-xl font-semibold text-primary-700 group-hover:text-primary-800">
              Mes Carnets
            </h3>
            <p className="text-neutral-600 leading-relaxed">
              Organisez vos recettes en <strong>beaux livres</strong> à imprimer et partager avec la famille
            </p>
          </div>
        </Link>

        <Link 
          href="/recipes" 
          className="card-hover group p-8 bg-gradient-fresh"
        >
          <div className="space-content text-center">
            <div className="text-5xl mb-4 group-hover:animate-bounce-gentle">📝</div>
            <h3 className="text-display text-xl font-semibold text-secondary-700 group-hover:text-secondary-800">
              Mes Recettes
            </h3>
            <p className="text-neutral-600 leading-relaxed">
              Consultez, modifiez et ajoutez de <strong>nouvelles recettes</strong> à votre collection précieuse
            </p>
          </div>
        </Link>

        <Link 
          href="/add" 
          className="card-hover group p-8 bg-gradient-sunset sm:col-span-2 lg:col-span-1"
        >
          <div className="space-content text-center">
            <div className="text-5xl mb-4 group-hover:animate-bounce-gentle">✨</div>
            <h3 className="text-display text-xl font-semibold text-accent-700 group-hover:text-accent-800">
              Nouvelle Recette
            </h3>
            <p className="text-neutral-600 leading-relaxed">
              Ajoutez rapidement une <strong>nouvelle recette</strong> à votre collection
            </p>
          </div>
        </Link>
      </div>

      {/* Prochainement - Section teaser */}
      <div className="card p-8 bg-gradient-warm text-center">
        <div className="space-content max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="text-4xl">🚀</div>
            <h2 className="text-display text-responsive-lg text-neutral-800">
              Bientôt disponible
            </h2>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-3 text-sm">
            <div className="space-tight">
              <div className="text-2xl mb-2">📸</div>
              <p className="font-medium text-primary-600">Photo → Recette</p>
              <p className="text-neutral-500">IA magique</p>
            </div>
            <div className="space-tight">
              <div className="text-2xl mb-2">🖨️</div>
              <p className="font-medium text-secondary-600">Impression PDF</p>
              <p className="text-neutral-500">Livres magnifiques</p>
            </div>
            <div className="space-tight">
              <div className="text-2xl mb-2">🎥</div>
              <p className="font-medium text-accent-600">QR vidéos</p>
              <p className="text-neutral-500">Tours de main</p>
            </div>
          </div>
        </div>
      </div>

      {/* Proposition de valeur */}
      <div className="text-center space-content">
        <h2 className="text-display text-responsive-lg text-neutral-700 mb-6">
          Plus qu'un carnet de recettes
        </h2>
        <div className="card p-8 max-w-4xl mx-auto">
          <p className="text-responsive-base text-neutral-600 leading-relaxed mb-6">
            Créez un <span className="text-emphasis">héritage culinaire unique</span> pour votre famille. 
            Transformez vos recettes préférées en beaux livres imprimables, avec photos, histoires et dédicaces. 
          </p>
          <div className="inline-flex items-center gap-2 text-accent-600 font-medium">
            <span>✨</span>
            <span>Un cadeau inoubliable qui traverse les générations</span>
            <span>✨</span>
          </div>
        </div>
      </div>

      {/* CTA final subtil */}
      <div className="text-center">
        <Link 
          href="/add"
          className="btn btn-primary text-lg px-8 py-4"
        >
          🌟 Commencer mon premier carnet
        </Link>
        <p className="text-sm text-neutral-500 mt-3">
          Gratuit • Simple • Familial
        </p>
      </div>
    </div>
  );
}
