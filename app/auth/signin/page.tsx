'use client'

import { signIn } from "next-auth/react"
import Link from "next/link"
import { Chrome, ArrowLeft } from "lucide-react"

export default function SignInPage() {
  const handleSignIn = () => {
    // Connexion avec redirection explicite
    signIn('google', { 
      callbackUrl: '/recipes',
      redirect: true 
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
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

      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-br from-orange-400 to-orange-600 px-8 py-8 text-center text-white">
              <h1 className="text-3xl font-bold mb-2">Bienvenue !</h1>
              <p className="text-orange-100 text-lg">
                Connectez-vous pour accéder à vos recettes
              </p>
            </div>

            <div className="px-8 py-8">
              <button
                onClick={handleSignIn}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg hover:shadow-xl bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              >
                <Chrome className="w-5 h-5" />
                Se connecter avec Google
              </button>

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
            </div>
          </div>

          <div className="text-center mt-8">
            <p className="text-gray-400">
              Food Memories - 2025
            </p>
          </div>
        </div>
      </div>  
    </div>
  )
}