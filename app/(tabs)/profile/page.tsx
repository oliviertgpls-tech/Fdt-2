'use client'

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { User, Mail, LogOut } from "lucide-react"
import { useRecipes } from "@/contexts/RecipesProvider"

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const { recipes, notebooks, loading } = useRecipes()

  if (status === "loading" || loading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>
  }

  if (status === "unauthenticated") {
    redirect("/auth/signin")
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">Mon Profil</h1>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
              {session?.user?.image ? (
                <img src={session.user.image} alt="Avatar" className="w-full h-full rounded-full" />
              ) : (
                <User className="w-10 h-10" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold">{session?.user?.name}</h2>
              <p className="text-gray-600">{session?.user?.email}</p>
            </div>
          </div>

          <div className="border-t pt-4 mb-6">
            <p>Recettes: {recipes.length}</p>
            <p>Carnets: {notebooks.length}</p>
          </div>

          
            href="/api/force-logout"
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </a>
        </div>
      </div>
    </div>
  )
}