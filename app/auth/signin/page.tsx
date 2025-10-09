'use client'

import { signIn } from "next-auth/react"
import { useState } from "react"
import Link from "next/link"
import { Chrome, ArrowLeft, Mail, Loader2, AlertCircle } from "lucide-react"

export default function SignInPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [error, setError] = useState("")

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
    setError("")
    
    try {
      // 1️⃣ Vérifier si l'email existe déjà avec Google
      const checkResponse = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase() })
      })

      const checkData = await checkResponse.json()

      // 2️⃣ Si l'utilisateur doit utiliser Google, on bloque
      if (checkData.hasGoogleAccount) {
        setError(checkData.message)
        setIsLoading(false)
        return
      }

      // 3️⃣ Sinon, on envoie le magic link
      const result = await signIn('email', { 
        email: email.toLowerCase(),
        callbackUrl: '/recipes',
        redirect: false
      })
      
      if (result?.ok) {
        setEmailSent(true)
      } else {
        setError("Erreur lors de l'envoi de l'email. Réessayez.")
      }
    } catch (error) {
      console.error("Erreur connexion email:", error)
      setError("Une erreur est survenue. Réessayez.")
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
            <div className="bg-gradient-to-br from-orange-400 to-orange-500 px-8 py-8 text-center text-white">
              <h1 className="text-3xl font-bold mb-2">Bienvenue !</h1>
              <p className="text-orange-100 text-lg">
                Connectez-vous pour accéder à vos recettes
              </p>
            </div>

            {/* Bouton Google */}
            <div className="px-8 py-8 space-y-6">
              <button
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg hover:shadow-xl bg-gray-100 text-gray-700 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              >
                <Chrome className="w-5 h-5" />
                Se connecter avec Google
              </button>

            {/* Séparateur */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">ou</span>
                </div>
              </div>
            
              {/* Formulaire Email */}
              <form onSubmit={handleEmailSignIn} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Connexion par email (magic link)
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setError("") // Reset error quand on tape
                    }}
                    placeholder="votre@email.com"
                    required
                    disabled={isLoading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Message d'erreur */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-red-900 font-medium mb-2">
                        {error}
                      </p>
                      <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        className="text-sm text-red-700 underline hover:text-red-800 font-medium"
                      >
                        → Cliquez ici pour vous connecter avec Google
                      </button>
                    </div>
                  </div>
                )}
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold transition-all bg-gray-200 text-gray-700 text-sm hover:bg-gray-300 disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 md:w-5 h-5 animate-spin" />
                      Vérification...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 md:w-5 h-5" />
                      Recevoir un lien par email
                    </>
                  )}
                </button>
              </form>

        

              
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
              Ricipiz - 2025
            </p>
          </div>
        </div>
      </div>  
    </div>
  )
}