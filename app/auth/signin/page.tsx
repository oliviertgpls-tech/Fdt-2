'use client'

import { signIn, getProviders } from "next-auth/react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Github, Chrome } from "lucide-react"

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
      case 'github':
        return <Github className="w-5 h-5" />
      default:
        return null
    }
  }

  const getProviderColor = (providerId: string) => {
    switch (providerId) {
      case 'google':
        return 'bg-red-600 hover:bg-red-700 text-white'
      case 'github':
        return 'bg-gray-900 hover:bg-gray-800 text-white'
      default:
        return 'bg-blue-600 hover:bg-blue-700 text-white'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Connexion</CardTitle>
          <CardDescription>
            Connectez-vous pour accéder à vos carnets de recettes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {providers && Object.values(providers).map((provider) => (
            <Button
              key={provider.name}
              onClick={() => signIn(provider.id, { callbackUrl: '/recipes' })}
              className={`w-full flex items-center justify-center gap-2 ${getProviderColor(provider.id)}`}
            >
              {getProviderIcon(provider.id)}
              Se connecter avec {provider.name}
            </Button>
          ))}
          
          <div className="text-center text-sm text-gray-600 mt-6">
            <p>En vous connectant, vous acceptez nos conditions d'utilisation.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
