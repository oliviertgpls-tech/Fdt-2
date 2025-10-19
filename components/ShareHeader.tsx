import Link from 'next/link'
import { ChefHat } from 'lucide-react'

interface ShareHeaderProps {
  ownerName?: string
}

export function ShareHeader({ ownerName }: ShareHeaderProps) {
  return (
    <header className="border-b bg-white px-6 py-4">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Logo + baseline */}
        <div>
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <span className="font-bold text-xl">RiCiPiZ</span>
          </Link>
          {ownerName && (
            <p className="text-sm text-gray-600 mt-1">
              {ownerName} vous partage sa recette
            </p>
          )}
        </div>

        {/* CTA inscription */}
        <Link 
          href="/auth/signin"
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-medium"
        >
          S'inscrire
        </Link>
      </div>
    </header>
  )
}