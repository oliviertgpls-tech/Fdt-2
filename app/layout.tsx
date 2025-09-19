import './globals.css'
import { SessionProvider } from "next-auth/react"

export const metadata = {
  title: 'Food Memories',
  description: 'Préservez votre patrimoine culinaire',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-white text-gray-900">
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
