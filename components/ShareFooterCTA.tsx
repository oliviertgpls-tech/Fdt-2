import Link from 'next/link'
import { BookOpen, Printer } from 'lucide-react'

export function ShareFooterCTA() {
  return (
    <div className="mt-12 border-t pt-8 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg p-8 text-center">
      <h3 className="text-xl font-semibold mb-3">
        Cette recette vous plaît ?
      </h3>
      
      <p className="text-gray-600 mb-6 max-w-lg mx-auto">
        Créez votre compte RiCiPiZ pour sauvegarder vos recettes familiales, 
        organiser vos carnets et imprimer vos livres personnalisés
      </p>

      <Link
        href="/auth/signin"
        className="inline-block px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-medium"
      >
        Créer mon compte gratuitement
      </Link>
      
      <p className="text-xs text-gray-500 mt-4">
        Déjà membre ? <Link href="/auth/signin" className="underline hover:text-gray-700">Se connecter</Link>
      </p>
    </div>
  )
}