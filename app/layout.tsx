import './globals.css'
import { Providers } from './providers'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ricipiz - Votre patrimoine culinaire familial',
  description: 'Transformez vos recettes familiales en magnifiques livres de cuisine. Un héritage précieux à transmettre aux générations futures.',
  
  // 🌐 Open Graph (Facebook, WhatsApp, LinkedIn)
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://www.ricipiz.com', 
    siteName: 'Ricipiz',
    title: 'RiCiPiZ - Préservez votre patrimoine culinaire',
    description: 'Créez et partagez vos recettes familiales. Transformez-les en magnifiques livres de cuisine à transmettre.',
    images: [
      {
        url: 'https://res.cloudinary.com/dkqxlm9sv/image/upload/v1758549610/famille-cuisine_zluiks.jpg', // ← CHANGE par ton URL
        width: 1200,
        height: 630,
        alt: 'Ricipiz - Recettes familiales',
      },
    ],
  },

  // 🐦 Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'Ricipiz - Votre patrimoine culinaire',
    description: 'Transformez vos recettes familiales en livres de cuisine magnifiques',
    images: ['https://res.cloudinary.com/dkqxlm9sv/image/upload/v1758549610/famille-cuisine_zluiks.jpg'], // ← CHANGE par ton URL
  },

  // 📱 Mobile & PWA
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  
  // 🎨 Thème
  themeColor: '#ea580c', // Orange de ton site
  
  // 🔍 SEO supplémentaire
  keywords: ['recettes', 'cuisine', 'famille', 'livre de recettes', 'patrimoine culinaire', 'recettes familiales'],
  authors: [{ name: 'Ricipiz' }],
  creator: 'Ricipiz',
  publisher: 'Ricipiz',
  
  // 🤖 Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
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
