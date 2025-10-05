import './globals.css'
import { Providers } from './providers'

export const metadata = {
  title: 'Ricipiz',
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
        {children}
      </body>
    </html>
  )
}
