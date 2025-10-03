'use client'

import { signIn } from "next-auth/react"
import { useState } from "react"
import Link from "next/link"
import { Chrome, ArrowLeft, Mail, Loader2 } from "lucide-react"

export default function SignInPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const handleGoogleSignIn = () => {
    signIn('google', { 
      callbackUrl: '/recipes',
      redirect: true,
      prompt: "select_account"
    })
  }

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const result = await signIn('email', { 
        email,
        callbackUrl: '/recipes',
        redirect: false
      })
      
      if (result?.ok) {
        setEmailSent(true)
      }
    } catch (error) {
      console.error("Erreur connexion email:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (emailSent) {
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
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="w-8 h-8 text-green-600" />
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-3">
                Email envoyé ! 📧
              </h1>
              
              <p className="text-gray-600 mb-6">
                Nous avons envoyé un lien de connexion à :
              </p>
              
              <p className="font-semibold text-gray-900 mb-6 bg-gray-50 px-4 py-3 rounded-lg">
                {email}
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-900">
                  💡 <strong>Astuce :</strong> Vérifiez vos spams si vous ne voyez pas l'email dans 1 minute
                </p>
              </div>
              
              <button
                onClick={() => {
                  setEmailSent(false)
                  setEmail("")
                }}
                className="text-orange-600 hover:text-orange-700 font-medium"
              >
                ← Retour à la connexion
              </button>
            </div>
          </div>
        </div>
      </div>
    )
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

            <div className="px-8 py-8 space-y-6">
              {/* Formulaire Email */}
              <form onSubmit={handleEmailSignIn} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    required
                    disabled={isLoading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold transition-all bg-orange-600 text-white hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Mail className="w-5 h-5" />
                      Recevoir un lien de connexion
                    </>
                  )}
                </button>
              </form>

              {/* Séparateur */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">ou</span>
                </div>
              </div>

              {/* Bouton Google */}
              <button
                onClick={handleGoogleSignIn}
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