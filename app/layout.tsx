"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, X } from "lucide-react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [showCreateMenu, setShowCreateMenu] = useState(false);

  return (
    <html lang="fr">
      <body className="min-h-dvh bg-white text-gray-900">
        <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
            <Link href="/" className="font-semibold text-lg">
              🍽️ Carnets Familiaux
            </Link>
            <div className="flex items-center gap-6 text-sm">
              <Link 
                href="/carnets" 
                className="hover:text-blue-600 transition-colors"
              >
                📚 Mes Carnets
              </Link>
              <Link 
                href="/livres" 
                className="hover:text-orange-600 transition-colors"
              >
                📖 Mes Livres
              </Link>
              <Link 
                href="/recipes" 
                className="hover:text-blue-600 transition-colors"
              >
                📝 Mes Recettes
              </Link>
              
              {/* CTA Principal intelligent */}
              <div className="relative">
                <button
                  onClick={() => setShowCreateMenu(!showCreateMenu)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Créer
                </button>

                {/* Menu déroulant */}
                {showCreateMenu && (
                  <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg py-2 w-48 z-50">
                    <Link
                      href="/add"
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setShowCreateMenu(false)}
                    >
                      <span className="text-lg">📝</span>
                      <div>
                        <div className="font-medium">Nouvelle recette</div>
                        <div className="text-xs text-gray-500">Ajouter une recette</div>
                      </div>
                    </Link>
                    
                    <Link
                      href="/carnets"
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setShowCreateMenu(false)}
                    >
                      <span className="text-lg">📚</span>
                      <div>
                        <div className="font-medium">Nouveau carnet</div>
                        <div className="text-xs text-gray-500">Organiser par thème</div>
                      </div>
                    </Link>
                    
                    <Link
                      href="/livres/nouveau"
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setShowCreateMenu(false)}
                    >
                      <span className="text-lg">📖</span>
                      <div>
                        <div className="font-medium">Nouveau livre</div>
                        <div className="text-xs text-gray-500">Prêt à imprimer</div>
                      </div>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </nav>
          
          {/* Overlay pour fermer le menu */}
          {showCreateMenu && (
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowCreateMenu(false)}
            />
          )}
        </header>
        <main className="mx-auto max-w-6xl px-6 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
