'use client'

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link";

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    // Si connecté, rediriger vers les recettes
    if (status === "authenticated") {
      router.push("/recipes")
    }
  }, [status, router])

  // Pendant le chargement
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  // Si pas connecté, afficher la landing page
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 pt-16 pb-24 text-center">
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-block bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium">
              ✨ Préservez votre patrimoine culinaire
            </div>
            
            {/* Titre principal */}
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 leading-tight">
              Food <span className="text-orange-600">Memories</span>
            </h1>
            
            {/* Sous-titre */}
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Transformez vos <strong>recettes familiales</strong> en magnifiques livres de cuisine. 
              Un héritage précieux à transmettre aux générations futures.
            </p>

            {/* CTA */}
            <div className="space-y-4 pt-4">
              <Link
                href="/auth/signin"
                className="inline-block bg-orange-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-orange-700 transition-all transform hover:scale-105 shadow-lg"
              >
                🚀 Commencer gratuitement
              </Link>
              
              <p className="text-gray-500">
                Connexion avec Google • Gratuit • Sécurisé
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Comment ça marche ?
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            En 3 étapes simples, créez des livres de recettes dignes d'un chef
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Étape 1 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <div className="text-3xl">📝</div>
            </div>
            <div className="text-center space-y-3">
              <div className="bg-blue-500 text-white text-xs px-3 py-1 rounded-full font-medium inline-block">
                ÉTAPE 1
              </div>
              <h3 className="text-xl font-bold text-gray-900">Ajoutez vos recettes</h3>
              <p className="text-gray-600">
                Saisissez vos recettes manuellement ou photographiez vos carnets manuscrits. 
                Notre IA peut même analyser vos photos de plats !
              </p>
            </div>
          </div>

          {/* Étape 2 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <div className="text-3xl">📚</div>
            </div>
            <div className="text-center space-y-3">
              <div className="bg-green-500 text-white text-xs px-3 py-1 rounded-full font-medium inline-block">
                ÉTAPE 2
              </div>
              <h3 className="text-xl font-bold text-gray-900">Organisez en carnets</h3>
              <p className="text-gray-600">
                Classez vos recettes par thème : "Desserts de Mamie", "Plats du dimanche", 
                "Recettes végétariennes"...
              </p>
            </div>
          </div>

          {/* Étape 3 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
            <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <div className="text-3xl">📖</div>
            </div>
            <div className="text-center space-y-3">
              <div className="bg-orange-500 text-white text-xs px-3 py-1 rounded-full font-medium inline-block">
                ÉTAPE 3
              </div>
              <h3 className="text-xl font-bold text-gray-900">Créez votre livre</h3>
              <p className="text-gray-600">
                Générez un magnifique PDF avec mise en page professionnelle. 
                Parfait pour l'impression ou le partage !
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Social Proof */}
      <div className="bg-white border-y border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">
            Pourquoi Food Memories ?
          </h3>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="text-4xl">🔒</div>
              <h4 className="font-semibold text-gray-900">Sécurisé et privé</h4>
              <p className="text-gray-600">
                Vos recettes familiales restent <strong>privées</strong>. 
                Seul vous avez accès à votre patrimoine culinaire.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="text-4xl">🎁</div>
              <h4 className="font-semibold text-gray-900">Le cadeau parfait</h4>
              <p className="text-gray-600">
                Créez un <strong>héritage unique</strong> à offrir à vos enfants et petits-enfants. 
                Un cadeau qui traverse les générations.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Final */}
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl p-12 text-white">
          <h3 className="text-3xl md:text-4xl font-bold mb-4">
            Prêt à préserver vos recettes ?
          </h3>
          <p className="text-xl mb-8 opacity-90">
            Rejoignez les familles qui préservent déjà leur patrimoine culinaire
          </p>
          
          <Link
            href="/auth/signin"
            className="inline-block bg-white text-orange-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-50 transition-colors shadow-lg"
          >
            Commencer mon premier carnet →
          </Link>
        </div>
      </div>
    </div>
  );
}
