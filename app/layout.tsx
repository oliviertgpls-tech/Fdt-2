"use client";

import "./globals.css";
import Link from "next/link";
import { useState } from "react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <html lang="fr">
      <body className="min-h-dvh bg-white text-gray-900">
        <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 md:px-6 py-3">
            <Link href="/" className="font-semibold text-base md:text-lg">
              FOOD MEMORIES
            </Link>
            
            {/* Menu desktop */}
            <div className="hidden md:flex items-center gap-6 text-sm">
              <Link 
                href="/carnets" 
                className="hover:text-orange-600 transition-colors"
              >
                Mes Carnets
              </Link>
              <Link 
                href="/livres" 
                className="hover:text-orange-600 transition-colors"
              >
                Mes Livres
              </Link>
              <Link 
                href="/recipes" 
                className="hover:text-orange-600 transition-colors"
              >
                Mes Recettes
              </Link>
            </div>

            {/* Burger button mobile */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden flex flex-col gap-1 p-2"
              aria-label="Menu"
            >
              <span className={`w-5 h-0.5 bg-gray-600 transition-all ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
              <span className={`w-5 h-0.5 bg-gray-600 transition-all ${isMenuOpen ? 'opacity-0' : ''}`}></span>
              <span className={`w-5 h-0.5 bg-gray-600 transition-all ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
            </button>
          </nav>

          {/* Menu mobile dropdown */}
          {isMenuOpen && (
            <div className="md:hidden border-t bg-white/95 backdrop-blur">
              <div className="px-4 py-3 space-y-3">
                <Link 
                  href="/carnets"
                  className="block py-2 text-gray-700 hover:text-orange-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Mes Carnets
                </Link>
                <Link 
                  href="/livres"
                  className="block py-2 text-gray-700 hover:text-orange-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Mes Livres
                </Link>
                <Link 
                  href="/recipes"
                  className="block py-2 text-gray-700 hover:text-orange-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Mes Recettes
                </Link>
                <Link 
                  href="/add"
                  className="block py-2 text-orange-600 font-medium hover:text-orange-700 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  + Ajouter une recette
                </Link>
              </div>
            </div>
          )}
        </header>
        <main className="mx-auto max-w-6xl px-4 md:px-6 py-4 md:py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
