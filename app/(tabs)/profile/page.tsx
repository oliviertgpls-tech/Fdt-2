'use client'

import { useSession, signOut } from "next-auth/react"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Mail, Calendar, LogOut } from "lucide-react"

export default function ProfilePage() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    redirect("/auth/signin")
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Mon Profil</h1>
          <p className="text-gray-600">Gérez vos informations personnelles</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Informations personnelles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20">
                <AvatarImage 
                  src={session?.user?.image || ""} 
                  alt={session?.user?.name || "Avatar"}
                />
                <AvatarFallback className="text-xl">
                  {session?.user?.name?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
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
                {/* Vous pouvez ajouter la date de création depuis votre base de données */}
                Récemment
              </p>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-4">Statistiques</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Recettes créées</p>
                  <p className="text-2xl font-bold text-blue-600">0</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Carnets</p>
                  <p className="text-2xl font-bold text-green-600">0</p>
                </div>
              </div>
            </div>

            <div className="border-t pt-4 flex justify-end">
              <Button 
                onClick={handleSignOut}
                variant="outline"
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Se déconnecter
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
