'use client'

import { signIn, getProviders } from "next-auth/react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Chrome, ArrowLeft, Mail } from "lucide-react"

interface Provider {
  id: string
  name: string
  type: string
  signinUrl: string
  callbackUrl: string
}

export default function SignInPage() {
  const [providers, setProviders] = useState<Record<string, Provider> | null>(null)

  useEffect(() => {
    const fetchProviders = async () => {
      const res = await getProviders()
      setProviders(res)
    }
    fetchProviders()
  }, [])

  const getProviderIcon = (providerId: string) => {
    switch (providerId) {
      case 'google':
        return <Chrome className="w-5 h-5" />
      default:
        return null
    }
  }

  const getProviderStyle = (providerId: string) => {
    switch (providerId) {
      case 'google':
        return 'bg-blue-600 text-white border-2 border-gray-200 hover:border-gray-300 hover:bg-blue-70'
      default:
        return 'bg-orange-600 text-white border-2 border-orange-600 hover:bg-orange-700'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      {/* Header simple avec retour */}
      <header className="relative z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à l'accueil
          </Link>
        </div>
      </header>

      {/* Contenu principal */}
      <div className="flex items-center justify-center px-4 py-4">
        <div className="w-full max-w-md">
          {/* Card principale */}
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
            {/* En-tête avec style */}
            <div className="bg-gradient-to-br from-orange-400 to-orange-600 px-8 py-8 text-center text-white">
              <h1 className="text-2xl font-bold mb-2">Food Memories</h1>
              <p className="text-orange-100 text-lg">
                Inscrivez-vous ou connectez-vous pour accéder à vos recettes. 
              </p>
            </div>

            {/* Contenu */}
            <div className="px-8 py-8 space-y-6">
              {/* Message d'accueil */}
              <div className="text-center mb-8">
                <p className="text-gray-600">
                </p>
              </div>

              {/* Boutons de connexion */}
              <div className="space-y-4">
                {/* Google */}
                {providers && providers.google && (
                  <button
                    onClick={() => signIn('google', { callbackUrl: '/recipes' })}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg hover:shadow-xl bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  >
                    <Chrome className="w-5 h-5" />
                    Se connecter avec Google
                  </button>
                )}

                {/* Email (à venir) */}
                <button
                  disabled
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold bg-gray-100 text-gray-400 border-2 border-gray-100 cursor-not-allowed"
                >
                  <Mail className="w-5 h-5" />
                  Se connecter avec Email  (bientôt disponible)
                </button>
              </div>

              {/* Avantages */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl mb-2">🔒</div>
                    <p className="text-sm text-gray-600 font-medium">
                      100% sécurisé
                    </p>
                  </div>
                  <div>
                    <div className="text-2xl mb-2">🆓</div>
                    <p className="text-sm text-gray-600 font-medium">
                      Totalement gratuit
                    </p>
                  </div>
                </div>
              </div>

              {/* Note légale */}
              <div className="text-center text-xs text-gray-500 leading-relaxed">
                En vous connectant, vous acceptez nos conditions d'utilisation et notre politique de confidentialité. 
                Vos données restent privées et sécurisées.
              </div>
            </div>
          </div>

          {/* Message sous la card */}
          <div className="text-center mt-8">
            <p className="text-gray-300">
             Food  Memories - Tous droits Réservés - 2025
            </p>
          </div>
        </div>
      </div>  
    </div>
  )
}
