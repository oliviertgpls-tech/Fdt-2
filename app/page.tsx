import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 pt-20 pb-32 text-center">
          <div className="space-y-10">
            {/* Badge */}
            <div className="inline-block bg-orange-100 text-orange-700 px-6 py-3 rounded-full text-sm font-medium">
              ✨ Préservez votre patrimoine culinaire familial
            </div>
            
            {/* Titre principal */}
            <div className="space-y-6">
              <h1 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight">
                Votre 
                <span className="text-orange-600">patrimoine culinaire</span>
              </h1>
              
              {/* Sous-titre */}
              <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                Transformez vos <strong className="text-orange-600">recettes familiales</strong> en magnifiques livres de cuisine. 
                Un héritage précieux à transmettre aux générations futures.
              </p>
            </div>

            {/* CTA */}
            <div className="space-y-4 pt-6">
              <Link
                href="/auth/signin"
                className="inline-block bg-orange-600 text-white px-10 py-5 rounded-2xl text-xl font-bold hover:bg-orange-700 transition-all transform hover:scale-105 shadow-xl hover:shadow-2xl"
              >
                🚀 Commencer gratuitement
              </Link>
              
              <p className="text-gray-500 text-lg">
                Connexion avec Google • Gratuit • Sécurisé
              </p>
            </div>
          </div>
        </div>

        {/* Image illustrative */}
        <div className="max-w-4xl mx-auto px-4 pb-16">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl">
            <img 
              src="/famille-cuisine.jpg" 
              alt="Trois générations cuisinent ensemble - grand-mère, mère et enfant regardent un livre de recettes dans une cuisine chaleureuse"
              className="w-full h-auto"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Comment ça marche ?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Trois étapes simples pour créer vos livres de famille
          </p>
        </div>

        {/* Étapes */}
        <div className="grid gap-8 md:grid-cols-3">
          {/* Étape 1 */}
          <div className="text-center group">
            <div className="w-20 h-20 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-orange-200 transition-colors">
              <span className="text-4xl">📝</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              1. Ajoutez vos recettes
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Saisissez manuellement ou utilisez notre <strong>IA OpenAI</strong> pour analyser des photos de plats ou recettes manuscrites
            </p>
          </div>

          {/* Étape 2 */}
          <div className="text-center group">
            <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 transition-colors">
              <span className="text-4xl">📚</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              2. Organisez en carnets
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Créez des carnets thématiques et organisez vos recettes par famille, occasion ou type de plat
            </p>
          </div>

          {/* Étape 3 */}
          <div className="text-center group">
            <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-green-200 transition-colors">
              <span className="text-4xl">📖</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              3. Imprimez vos livres
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Générez de beaux livres PDF optimisés pour l'impression et partagez votre patrimoine culinaire
            </p>
          </div>
        </div>
      </div>

      {/* Fonctionnalités avancées */}
      <div className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Fonctionnalités avancées
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {/* IA OpenAI */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
              <div className="w-12 h-12 bg-green-200 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">IA OpenAI</h3>
              <p className="text-sm text-gray-600">
                Analysez des photos de plats ou recettes manuscrites automatiquement
              </p>
            </div>

            {/* Optimisation d'images */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
              <div className="w-12 h-12 bg-blue-200 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">🎨</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Images optimisées</h3>
              <p className="text-sm text-gray-600">
                Redimensionnement automatique pour différents usages et impression
              </p>
            </div>

            {/* Organisation */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
              <div className="w-12 h-12 bg-purple-200 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">📋</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Organisation</h3>
              <p className="text-sm text-gray-600">
                Carnets thématiques, tags, temps de préparation, nombre de personnes
              </p>
            </div>

            {/* Export PDF */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
              <div className="w-12 h-12 bg-orange-200 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">📄</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Export PDF</h3>
              <p className="text-sm text-gray-600">
                Livres optimisés pour l'impression avec mise en page professionnelle
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA final */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-700 py-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Prêt à préserver vos recettes familiales ?
          </h2>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Rejoignez les familles qui ont déjà commencé à créer leur patrimoine culinaire numérique
          </p>
          
          <Link
            href="/auth/signin"
            className="inline-block bg-white text-orange-600 px-10 py-5 rounded-2xl text-xl font-bold hover:bg-gray-50 transition-all transform hover:scale-105 shadow-xl"
          >
            ✨ Créer mon premier carnet
          </Link>
        </div>
      </div>

      {/* Footer simple */}
      <div className="bg-gray-900 py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2024 Food Memories - Préservez votre patrimoine culinaire familial
          </p>
        </div>
      </div>
    </div>
  );
}
