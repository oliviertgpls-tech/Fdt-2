'use client'

import { SessionProvider } from "next-auth/react"
import { RecipesProvider } from "@/contexts/RecipesProvider"

export function Providers({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider 
      refetchInterval={0}
      refetchOnWindowFocus={false}
    >
      <RecipesProvider>
        {children}
      </RecipesProvider>
    </SessionProvider>
  )
}