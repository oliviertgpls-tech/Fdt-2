'use client'

import { useSession, signOut } from "next-auth/react"
import { redirect } from "next/navigation"
import { User, Mail, Calendar, LogOut, Share2 } from "lucide-react"
import { useRecipes } from "@/contexts/RecipesProvider"

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const { recipes, notebooks, loading } = useRecipes()

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    redirect("/auth/signin")
  }

  const handleSignOut = async () => {
    await signOut({ 
      callbackUrl: "/auth/signin",
      redirect: true 
    })
  }

  // Calcul des vraies statistiques
  const recipeCount = recipes.length
  const notebookCount = notebooks.length

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Mon Profil</h1>
          <p className="text-gray-600">Gérez vos informations personnelles</p>
        </div>

        {/* Card Profile */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-2 mb-6">
            <User className="w-5 h-5" />
            <h2 className="text-xl font-semibold">Informations personnelles</h2>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                {session?.user?.image ? (
                  <img 
                    src={session.user.image} 
                    alt={session.user.name || "Avatar"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xl font-semibold text-gray-600">
                    {session?.user?.name?.[0]?.toUpperCase() || "U"}
                  </span>
                )}
              </div>
              
              <div>
                <h3 className="text-xl font-semibold">{session?.user?.name}</h3>
                <p className="text-gray-600 flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  {session?.user?.email}
                </p>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Compte créé</h4>
              <p className="text-gray-600 flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Récemment
              </p>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-4">Statistiques</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Recettes créées</p>
                  <p className="text-2xl font-bold text-blue-600">{recipeCount}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Carnets</p>
                  <p className="text-2xl font-bold text-green-600">{notebookCount}</p>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg opacity-60 cursor-not-allowed">
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Share2 className="w-3 h-3" />
                    Partagées
                  </p>
                  <p className="text-2xl font-bold text-gray-400">0</p>
                  <p className="text-xs text-gray-400 mt-1">Bientôt disponible</p>
                </div>
              </div>
            </div>

            <div className="border-t pt-4 flex justify-end">
              <button 
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
