'use client'

import { SessionProvider } from "next-auth/react"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Pas de header/menu ici, juste le contenu */}
        {children}
      </div>
    </SessionProvider>
  )
}
